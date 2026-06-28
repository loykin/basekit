import { copyFileSync, mkdirSync } from 'fs'

mkdirSync('dist', { recursive: true })
copyFileSync('src/styles/index.css', 'dist/styles.css')
