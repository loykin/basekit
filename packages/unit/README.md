# @loykin/unit

Small TypeScript formatters for bytes, bit rates, time, percentages,
currencies, numbers, throughput, and physical units.

```bash
pnpm add @loykin/unit
```

```ts
import { createFormatter, formatUnit } from '@loykin/unit'

formatUnit(1536, { unit: 'bytes', decimals: 1 }) // "1.5 KB"

const duration = createFormatter({ unit: 'duration' })
duration(3600000) // "1h"
```

See the [BaseKit repository](https://github.com/loykin/basekit) for the full
unit list and playground.
