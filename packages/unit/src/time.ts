import type { TimeUnit } from './types';

function fixed(value: number, decimals?: number): string {
  if (decimals !== undefined) return value.toFixed(decimals);
  const d = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2;
  return parseFloat(value.toFixed(d)).toString();
}

const DURATION_SCALES: [number, string][] = [
  [0.001, '\u00b5s'], [1, 'ms'], [1000, 's'], [60_000, 'min'],
  [3_600_000, 'h'], [86_400_000, 'd'],
];

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

  let index = 0;
  for (let candidate = DURATION_SCALES.length - 1; candidate >= 0; candidate -= 1) {
    if (abs >= DURATION_SCALES[candidate][0]) {
      index = candidate;
      break;
    }
  }

  while (index < DURATION_SCALES.length - 1) {
    const [threshold] = DURATION_SCALES[index];
    const [nextThreshold] = DURATION_SCALES[index + 1];
    const rounded = Number(fixed(ms / threshold, decimals));
    if (Math.abs(rounded) < nextThreshold / threshold) break;
    index += 1;
  }

  const [threshold, label] = DURATION_SCALES[index];
  return `${fixed(ms / threshold, decimals)} ${label}`;
}

export function formatTime(value: number, unit: TimeUnit, decimals?: number): string {
  if (unit === 'duration') return autoScaleMs(value, decimals);
  if (unit === 'durationS') return autoScaleMs(value * 1000, decimals);
  return `${fixed(value, decimals)} ${FIXED_UNIT_LABELS[unit]}`;
}
