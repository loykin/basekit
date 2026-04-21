// ─── Data Size ────────────────────────────────────────────────────────────────

/** SI (1000-based): bytes → KB → MB → GB → TB → PB */
export type SIByteUnit = 'bytes' | 'kbytes' | 'mbytes' | 'gbytes' | 'tbytes' | 'pbytes';

/** IEC (1024-based): bytes → KiB → MiB → GiB → TiB → PiB */
export type IECByteUnit = 'kibytes' | 'mibytes' | 'gibytes' | 'tibytes' | 'pibytes';

/** Bits (auto-scale): b → Kb → Mb → Gb */
export type BitUnit = 'bits' | 'kbits' | 'mbits' | 'gbits';

// ─── Data Rate ────────────────────────────────────────────────────────────────

/** Bits per second (auto-scale) */
export type BitRateUnit = 'bps' | 'Kbps' | 'Mbps' | 'Gbps' | 'Tbps';

/** Bytes per second (auto-scale) */
export type ByteRateUnit = 'Bps' | 'KBps' | 'MBps' | 'GBps' | 'TBps';

// ─── Time ─────────────────────────────────────────────────────────────────────

/**
 * Fixed time units — display value as-is in the given unit.
 * 'duration' auto-scales from the given value (in milliseconds).
 * 'durationS' auto-scales from the given value (in seconds).
 */
export type TimeUnit =
  | 'ns' | 'us' | 'ms' | 's' | 'min' | 'h' | 'd'
  | 'duration'   // input: ms, auto-scale
  | 'durationS'; // input: s,  auto-scale

// ─── Percentage ───────────────────────────────────────────────────────────────

/**
 * 'percent'     — input 0–100, output "42%"
 * 'percentunit' — input 0–1,   output "42%"
 */
export type PercentUnit = 'percent' | 'percentunit';

// ─── Currency ─────────────────────────────────────────────────────────────────

export type CurrencyUnit =
  | 'usd' | 'eur' | 'krw' | 'jpy' | 'gbp' | 'cny'
  | 'inr' | 'brl' | 'aud' | 'cad' | 'chf' | 'hkd' | 'sgd';

// ─── Number ───────────────────────────────────────────────────────────────────

/**
 * 'none'        — raw number, no suffix
 * 'short'       — compact: 1K, 1.5M, 2B
 * 'scientific'  — 1.5e+3
 * 'locale'      — locale thousand-separator: 1,500,000
 */
export type NumberUnit = 'none' | 'short' | 'scientific' | 'locale';

// ─── Throughput ───────────────────────────────────────────────────────────────

export type ThroughputUnit =
  | 'reqps'  // requests/s
  | 'rps'    // reads/s
  | 'wps'    // writes/s
  | 'iops'   // I/O ops/s
  | 'ops'    // operations/s
  | 'rpm'    // per minute
  | 'rph';   // per hour

// ─── Temperature ─────────────────────────────────────────────────────────────

export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';

// ─── Length ───────────────────────────────────────────────────────────────────

export type LengthUnit = 'm' | 'km' | 'cm' | 'mm' | 'mi' | 'ft' | 'in';

// ─── Weight ───────────────────────────────────────────────────────────────────

export type WeightUnit = 'kg' | 'g' | 'mg' | 'lb' | 'oz';

// ─── Angle ────────────────────────────────────────────────────────────────────

export type AngleUnit = 'deg' | 'rad' | 'grad';

// ─── Velocity ─────────────────────────────────────────────────────────────────

export type VelocityUnit = 'm/s' | 'km/h' | 'mph' | 'knot';

// ─── Aggregate ────────────────────────────────────────────────────────────────

export type UnitType =
  | SIByteUnit | IECByteUnit | BitUnit
  | BitRateUnit | ByteRateUnit
  | TimeUnit
  | PercentUnit
  | CurrencyUnit
  | NumberUnit
  | ThroughputUnit
  | TemperatureUnit
  | LengthUnit
  | WeightUnit
  | AngleUnit
  | VelocityUnit;

// ─── Options ─────────────────────────────────────────────────────────────────

export interface FormatterOptions {
  unit: UnitType;
  /**
   * Number of decimal places.
   * If omitted, each formatter picks a sensible default (usually auto).
   */
  decimals?: number;
  /** BCP 47 locale string used for number/currency formatting. @default 'en-US' */
  locale?: string;
}

export type Formatter = (value: number) => string;
