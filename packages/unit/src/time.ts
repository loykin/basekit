import type { TimeUnit } from './types';

function fixed(value: number, decimals?: number): string {
  if (decimals !== undefined) return value.toFixed(decimals);
  const d = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2;
  return parseFloat(value.toFixed(d)).toString();
}

const FIXED_UNIT_LABELS: Record<Exclude<TimeUnit, 'duration' | 'durationS'>, string> = {
  ns: 'ns', us: '\u00b5s', ms: 'ms', s: 's', min: 'min', h: 'h', d: 'd',
};

/**
 * Auto-scale duration.
 * @param ms - value in milliseconds
 * @param decimals
 */
function autoScaleMs(ms: number, decimals?: number): string {
  const abs = Math.abs(ms);
  if (abs === 0) return '0 ms';
  if (abs < 1) return `${fixed(ms * 1e3, decimals)} \u00b5s`;
  if (abs < 1000) return `${fixed(ms, decimals)} ms`;
  if (abs < 60_000) return `${fixed(ms / 1000, decimals)} s`;
  if (abs < 3_600_000) return `${fixed(ms / 60_000, decimals)} min`;
  if (abs < 86_400_000) return `${fixed(ms / 3_600_000, decimals)} h`;
  return `${fixed(ms / 86_400_000, decimals)} d`;
}

export function formatTime(value: number, unit: TimeUnit, decimals?: number): string {
  if (unit === 'duration') return autoScaleMs(value, decimals);
  if (unit === 'durationS') return autoScaleMs(value * 1000, decimals);
  return `${fixed(value, decimals)} ${FIXED_UNIT_LABELS[unit]}`;
}
