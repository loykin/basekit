import type { PercentUnit, ThroughputUnit, TemperatureUnit, LengthUnit, WeightUnit, AngleUnit, VelocityUnit } from './types';

function fixed(value: number, decimals?: number): string {
  if (decimals !== undefined) return value.toFixed(decimals);
  const d = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2;
  return parseFloat(value.toFixed(d)).toString();
}

// ─── Percentage ───────────────────────────────────────────────────────────────

export function formatPercent(value: number, unit: PercentUnit, decimals?: number): string {
  const pct = unit === 'percentunit' ? value * 100 : value;
  return `${fixed(pct, decimals)}%`;
}

// ─── Throughput ───────────────────────────────────────────────────────────────

const THROUGHPUT_LABELS: Record<ThroughputUnit, string> = {
  reqps: 'req/s',
  rps:   'r/s',
  wps:   'w/s',
  iops:  'IOPS',
  ops:   'ops/s',
  rpm:   'rpm',
  rph:   'rph',
};

export function formatThroughput(value: number, unit: ThroughputUnit, decimals?: number): string {
  return `${fixed(value, decimals)} ${THROUGHPUT_LABELS[unit]}`;
}

// ─── Temperature ─────────────────────────────────────────────────────────────

export function formatTemperature(value: number, unit: TemperatureUnit, decimals?: number): string {
  switch (unit) {
    case 'celsius':    return `${fixed(value, decimals)} °C`;
    case 'fahrenheit': return `${fixed(value, decimals)} °F`;
    case 'kelvin':     return `${fixed(value, decimals)} K`;
  }
}

// ─── Length ───────────────────────────────────────────────────────────────────

const LENGTH_LABELS: Record<LengthUnit, string> = {
  m: 'm', km: 'km', cm: 'cm', mm: 'mm', mi: 'mi', ft: 'ft', in: 'in',
};

export function formatLength(value: number, unit: LengthUnit, decimals?: number): string {
  return `${fixed(value, decimals)} ${LENGTH_LABELS[unit]}`;
}

// ─── Weight ───────────────────────────────────────────────────────────────────

const WEIGHT_LABELS: Record<WeightUnit, string> = {
  kg: 'kg', g: 'g', mg: 'mg', lb: 'lb', oz: 'oz',
};

export function formatWeight(value: number, unit: WeightUnit, decimals?: number): string {
  return `${fixed(value, decimals)} ${WEIGHT_LABELS[unit]}`;
}

// ─── Angle ────────────────────────────────────────────────────────────────────

const ANGLE_LABELS: Record<AngleUnit, string> = {
  deg: '°', rad: 'rad', grad: 'grad',
};

export function formatAngle(value: number, unit: AngleUnit, decimals?: number): string {
  return `${fixed(value, decimals)}${ANGLE_LABELS[unit]}`;
}

// ─── Velocity ─────────────────────────────────────────────────────────────────

const VELOCITY_LABELS: Record<VelocityUnit, string> = {
  'm/s': 'm/s', 'km/h': 'km/h', mph: 'mph', knot: 'kn',
};

export function formatVelocity(value: number, unit: VelocityUnit, decimals?: number): string {
  return `${fixed(value, decimals)} ${VELOCITY_LABELS[unit]}`;
}
