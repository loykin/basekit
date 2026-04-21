import { formatUnit, createFormatter } from '@loykin/unit'
import type { UnitType } from '@loykin/unit'

function Code({ children }: { children: string }) {
  return (
    <pre className="text-[11px] font-mono bg-muted text-muted-foreground px-3 py-2 overflow-x-auto whitespace-pre">
      {children.trim()}
    </pre>
  )
}

function Demo({
  title,
  description,
  code,
  children,
}: {
  title: string
  description?: string
  code: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-border">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-semibold">{title}</h2>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <Code>{code}</Code>
        {children}
      </div>
    </section>
  )
}

function UnitTable({ rows }: { rows: [number, UnitType, number | undefined][] }) {
  return (
    <table className="text-[11px] font-mono w-full border-collapse">
      <thead>
        <tr className="border-b border-border">
          <td className="py-1 pr-4 text-muted-foreground w-32">input</td>
          <td className="py-1 pr-4 text-muted-foreground w-28">unit</td>
          <td className="py-1 text-muted-foreground w-12">decimals</td>
          <td className="py-1 pl-4 text-foreground">output</td>
        </tr>
      </thead>
      <tbody>
        {rows.map(([value, unit, decimals], i) => (
          <tr key={i} className="border-t border-border">
            <td className="py-1 pr-4 text-muted-foreground">{value}</td>
            <td className="py-1 pr-4 text-muted-foreground">{unit}</td>
            <td className="py-1 text-muted-foreground">{decimals ?? '—'}</td>
            <td className="py-1 pl-4 text-foreground font-semibold">
              {formatUnit(value, { unit, decimals })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Suppress unused import warning — createFormatter is referenced in code snippets only
void createFormatter

export function UnitTab() {
  return (
    <div className="flex flex-col gap-4 max-w-3xl">

      <Demo
        title="Data Size — SI (bytes)"
        description="Auto-scales from bytes to KB / MB / GB / TB / PB"
        code={`const fmt = createFormatter({ unit: 'bytes', decimals: 1 })
fmt(512)    // 512 B
fmt(1536)   // 1.5 KB
fmt(1.5e6)  // 1.5 MB
fmt(2.75e9) // 2.75 GB`}
      >
        <UnitTable rows={[
          [512,    'bytes', 1],
          [1536,   'bytes', 1],
          [1.5e6,  'bytes', 1],
          [2.75e9, 'bytes', 1],
          [1.2e12, 'bytes', 1],
        ]} />
      </Demo>

      <Demo
        title="Data Size — IEC (kibytes)"
        description="1024-based: KiB / MiB / GiB / TiB"
        code={`formatUnit(1536,    { unit: 'kibytes', decimals: 2 }) // 1.50 KiB
formatUnit(1048576, { unit: 'kibytes', decimals: 2 }) // 1.00 MiB`}
      >
        <UnitTable rows={[
          [1,         'kibytes', 2],
          [1024,      'kibytes', 2],
          [1024*1024, 'kibytes', 2],
        ]} />
      </Demo>

      <Demo
        title="Data Rate"
        description="Bits/s and Bytes/s — auto-scale"
        code={`formatUnit(125e6, { unit: 'bps' }) // 125 Mbps
formatUnit(125e6, { unit: 'Bps' }) // 125 MBps`}
      >
        <UnitTable rows={[
          [1000,  'bps',  1],
          [125e6, 'bps',  1],
          [10e9,  'bps',  1],
          [125e6, 'Bps',  1],
          [1.5e9, 'GBps', 1],
        ]} />
      </Demo>

      <Demo
        title="Time / Duration"
        description="'duration' auto-scales from ms. 'durationS' auto-scales from seconds."
        code={`const fmt = createFormatter({ unit: 'duration' })
fmt(0.5)        // 500 us
fmt(850)        // 850 ms
fmt(90_000)     // 1.5 min
fmt(7_200_000)  // 2 h`}
      >
        <UnitTable rows={[
          [0.5,         'duration', undefined],
          [850,         'duration', undefined],
          [3_500,       'duration', undefined],
          [90_000,      'duration', undefined],
          [7_200_000,   'duration', undefined],
          [172_800_000, 'duration', undefined],
        ]} />
      </Demo>

      <Demo
        title="Fixed Time Units"
        description="ns, us, ms, s, min, h, d — displayed as-is without scaling"
        code={`formatUnit(42,   { unit: 'ms'  }) // 42 ms
formatUnit(3,    { unit: 'h'   }) // 3 h
formatUnit(1.5,  { unit: 'us'  }) // 1.5 us`}
      >
        <UnitTable rows={[
          [250,  'ns',  undefined],
          [1.5,  'us',  undefined],
          [42,   'ms',  undefined],
          [3.14, 's',   2],
          [90,   'min', undefined],
          [3,    'h',   undefined],
          [7,    'd',   undefined],
        ]} />
      </Demo>

      <Demo
        title="Percentage"
        description="'percent' expects 0-100. 'percentunit' expects 0-1 and multiplies by 100."
        code={`formatUnit(42.5,  { unit: 'percent',     decimals: 1 }) // 42.5%
formatUnit(0.425, { unit: 'percentunit', decimals: 1 }) // 42.5%`}
      >
        <UnitTable rows={[
          [42.5,  'percent',     1],
          [0.425, 'percentunit', 1],
          [100,   'percent',     0],
          [1,     'percentunit', 0],
        ]} />
      </Demo>

      <Demo
        title="Currency"
        description="Uses Intl.NumberFormat — locale-aware symbols and digit grouping."
        code={`formatUnit(1234567.89, { unit: 'usd' }) // $1,234,567.89
formatUnit(1234567.89, { unit: 'krw' }) // KRW 1,234,568`}
      >
        <UnitTable rows={[
          [1234567.89, 'usd', undefined],
          [1234567.89, 'eur', undefined],
          [1234567.89, 'krw', undefined],
          [1234567.89, 'jpy', undefined],
          [1234567.89, 'gbp', undefined],
        ]} />
      </Demo>

      <Demo
        title="Number Formatting"
        description="none / short (compact) / scientific / locale"
        code={`formatUnit(1500000, { unit: 'short'      }) // 1.5M
formatUnit(1500000, { unit: 'scientific' }) // 1.5E6
formatUnit(1500000, { unit: 'locale'     }) // 1,500,000`}
      >
        <UnitTable rows={[
          [1500000, 'none',       undefined],
          [1500000, 'short',      undefined],
          [1500000, 'scientific', undefined],
          [1500000, 'locale',     undefined],
        ]} />
      </Demo>

      <Demo
        title="Throughput"
        description="reqps, rps, wps, iops, ops, rpm, rph"
        code={`formatUnit(12345, { unit: 'reqps' }) // 12345 req/s
formatUnit(8500,  { unit: 'iops'  }) // 8500 IOPS`}
      >
        <UnitTable rows={[
          [12345, 'reqps', undefined],
          [8500,  'iops',  undefined],
          [3200,  'ops',   undefined],
          [1500,  'rpm',   undefined],
        ]} />
      </Demo>

      <Demo
        title="Temperature"
        description="Celsius, Fahrenheit, Kelvin"
        code={`formatUnit(36.6, { unit: 'celsius'    }) // 36.6 degC
formatUnit(98,   { unit: 'fahrenheit' }) // 98 degF
formatUnit(300,  { unit: 'kelvin'     }) // 300 K`}
      >
        <UnitTable rows={[
          [36.6, 'celsius',    1],
          [98.6, 'fahrenheit', 1],
          [300,  'kelvin',     undefined],
        ]} />
      </Demo>

      <Demo
        title="Length / Weight / Angle / Velocity"
        description="Physical units"
        code={`formatUnit(42.5, { unit: 'km'   }) // 42.5 km
formatUnit(75,   { unit: 'kg'   }) // 75 kg
formatUnit(180,  { unit: 'deg'  }) // 180 deg
formatUnit(120,  { unit: 'km/h' }) // 120 km/h`}
      >
        <UnitTable rows={[
          [42.5, 'km',   1],
          [5280, 'ft',   undefined],
          [75,   'kg',   undefined],
          [180,  'deg',  undefined],
          [3.14, 'rad',  2],
          [120,  'km/h', undefined],
          [65,   'mph',  undefined],
        ]} />
      </Demo>

    </div>
  )
}
