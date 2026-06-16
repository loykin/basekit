import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packages = ['datetime-range', 'filter-input', 'side-panel', 'unit', 'control-bar']
const workDir = mkdtempSync(join(tmpdir(), 'basekit-consumer-'))
const appDir = join(workDir, 'app')

function run(command, args, cwd = repoRoot, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_cache: join(workDir, 'npm-cache'),
    },
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
  }

  return result.stdout ?? ''
}

try {
  mkdirSync(appDir, { recursive: true })

  const tarballs = Object.fromEntries(packages.map((name) => {
    const packageDir = join(repoRoot, 'packages', name)
    const output = run('npm', ['pack', '--json', '--pack-destination', workDir], packageDir, true)
    const info = JSON.parse(output)[0]
    return [`@loykin/${name}`, `file:${join(workDir, info.filename)}`]
  }))

  writeFileSync(
    join(appDir, 'package.json'),
    `${JSON.stringify({
      name: 'basekit-consumer-verification',
      private: true,
      type: 'module',
      scripts: {
        'type-check': 'tsc --noEmit',
        build: 'vite build',
      },
      dependencies: {
        ...tarballs,
        '@types/react': '^19.2.0',
        '@types/react-dom': '^19.2.0',
        '@vitejs/plugin-react': '^6.0.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        typescript: '^5.9.0',
        vite: '^8.0.0',
      },
    }, null, 2)}\n`,
  )

  writeFileSync(join(appDir, 'index.html'), '<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n')
  writeFileSync(
    join(appDir, 'tsconfig.json'),
    `${JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: true,
        noEmit: true,
      },
      include: ['src'],
    }, null, 2)}\n`,
  )
  writeFileSync(
    join(appDir, 'vite.config.ts'),
    "import react from '@vitejs/plugin-react'\nimport { defineConfig } from 'vite'\n\nexport default defineConfig({ plugins: [react()] })\n",
  )

  mkdirSync(join(appDir, 'src'), { recursive: true })
  writeFileSync(
    join(appDir, 'src/main.tsx'),
    `import { DatetimeRange } from '@loykin/datetime-range'
import '@loykin/datetime-range/styles'
import { FilterInput } from '@loykin/filter-input'
import '@loykin/filter-input/styles'
import { SidePanelProvider } from '@loykin/side-panel'
import '@loykin/side-panel/styles'
import { ControlBarProvider, ControlBarBody, ControlBar } from '@loykin/control-bar'
import '@loykin/control-bar/styles'
import { formatUnit } from '@loykin/unit'
import { createRoot } from 'react-dom/client'

function App() {
  return (
    <ControlBarProvider>
      <SidePanelProvider>
        <ControlBarBody>
          <div>{formatUnit(1536, { unit: 'bytes' })}</div>
          <FilterInput
            config={{ key: 'query', type: 'text', label: 'Query' }}
            value=""
            onChange={() => undefined}
          />
          <span data-export={DatetimeRange.name} />
        </ControlBarBody>
      </SidePanelProvider>
      <ControlBar />
    </ControlBarProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
`,
  )

  run('pnpm', ['install', '--ignore-scripts'], appDir)
  run('pnpm', ['type-check'], appDir)
  run('pnpm', ['build'], appDir)

  console.log('Consumer package verification passed')
} finally {
  if (process.env.KEEP_BASEKIT_CONSUMER_TEST !== '1') {
    rmSync(workDir, { recursive: true, force: true })
  }
}
