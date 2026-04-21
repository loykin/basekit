import type { SIByteUnit, IECByteUnit, BitUnit, BitRateUnit, ByteRateUnit } from './types';

function fixed(value: number, decimals?: number): string {
  if (decimals !== undefined) return value.toFixed(decimals);
  // Auto: drop trailing zeros
  const d = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2;
  return parseFloat(value.toFixed(d)).toString();
}

// ─── SI bytes (1000) ─────────────────────────────────────────────────────────

const SI_THRESHOLDS: [number, string][] = [
  [1e15, 'PB'], [1e12, 'TB'], [1e9, 'GB'], [1e6, 'MB'], [1e3, 'KB'],
];

const SI_FIXED_LABELS: Record<SIByteUnit, string> = {
  bytes: 'B', kbytes: 'KB', mbytes: 'MB', gbytes: 'GB', tbytes: 'TB', pbytes: 'PB',
};

const SI_FIXED_FACTORS: Record<SIByteUnit, number> = {
  bytes: 1, kbytes: 1e3, mbytes: 1e6, gbytes: 1e9, tbytes: 1e12, pbytes: 1e15,
};

export function formatSIBytes(value: number, unit: SIByteUnit, decimals?: number): string {
  if (unit === 'bytes') {
    // auto-scale
    for (const [threshold, label] of SI_THRESHOLDS) {
      if (Math.abs(value) >= threshold) return `${fixed(value / threshold, decimals)} ${label}`;
    }
    return `${fixed(value, decimals)} B`;
  }
  return `${fixed(value / SI_FIXED_FACTORS[unit], decimals)} ${SI_FIXED_LABELS[unit]}`;
}

// ─── IEC bytes (1024) ────────────────────────────────────────────────────────

const IEC_THRESHOLDS: [number, string][] = [
  [1024 ** 5, 'PiB'], [1024 ** 4, 'TiB'], [1024 ** 3, 'GiB'], [1024 ** 2, 'MiB'], [1024, 'KiB'],
];

const IEC_FIXED_FACTORS: Record<IECByteUnit, number> = {
  kibytes: 1024, mibytes: 1024 ** 2, gibytes: 1024 ** 3, tibytes: 1024 ** 4, pibytes: 1024 ** 5,
};

export function formatIECBytes(value: number, unit: IECByteUnit, decimals?: number): string {
  // Always auto-scale from bytes for IEC units — unit name just signals IEC preference
  const inputBytes = value * IEC_FIXED_FACTORS[unit];
  for (const [threshold, label] of IEC_THRESHOLDS) {
    if (Math.abs(inputBytes) >= threshold) return `${fixed(inputBytes / threshold, decimals)} ${label}`;
  }
  return `${fixed(inputBytes, decimals)} B`;
}

// ─── Bits ─────────────────────────────────────────────────────────────────────

const BIT_FIXED_FACTORS: Record<BitUnit, number> = {
  bits: 1, kbits: 1e3, mbits: 1e6, gbits: 1e9,
};

function formatBits(value: number, unit: BitUnit, decimals?: number): string {
  const bits = value * BIT_FIXED_FACTORS[unit];
  if (Math.abs(bits) >= 1e9) return `${fixed(bits / 1e9, decimals)} Gb`;
  if (Math.abs(bits) >= 1e6) return `${fixed(bits / 1e6, decimals)} Mb`;
  if (Math.abs(bits) >= 1e3) return `${fixed(bits / 1e3, decimals)} Kb`;
  return `${fixed(bits, decimals)} b`;
}

export default formatBits

// ─── Data rates ───────────────────────────────────────────────────────────────

const BPS_THRESHOLDS: [number, string][] = [
  [1e12, 'Tbps'], [1e9, 'Gbps'], [1e6, 'Mbps'], [1e3, 'Kbps'],
];
const BPS_FIXED_FACTORS: Record<BitRateUnit, number> = {
  bps: 1, Kbps: 1e3, Mbps: 1e6, Gbps: 1e9, Tbps: 1e12,
};

export function formatBitRate(value: number, unit: BitRateUnit, decimals?: number): string {
  const bps = value * BPS_FIXED_FACTORS[unit];
  for (const [threshold, label] of BPS_THRESHOLDS) {
    if (Math.abs(bps) >= threshold) return `${fixed(bps / threshold, decimals)} ${label}`;
  }
  return `${fixed(bps, decimals)} bps`;
}

const BYTE_RATE_THRESHOLDS: [number, string][] = [
  [1e12, 'TBps'], [1e9, 'GBps'], [1e6, 'MBps'], [1e3, 'KBps'],
];
const BYTE_RATE_FIXED_FACTORS: Record<ByteRateUnit, number> = {
  Bps: 1, KBps: 1e3, MBps: 1e6, GBps: 1e9, TBps: 1e12,
};

export function formatByteRate(value: number, unit: ByteRateUnit, decimals?: number): string {
  const bps = value * BYTE_RATE_FIXED_FACTORS[unit];
  for (const [threshold, label] of BYTE_RATE_THRESHOLDS) {
    if (Math.abs(bps) >= threshold) return `${fixed(bps / threshold, decimals)} ${label}`;
  }
  return `${fixed(bps, decimals)} B/s`;
}
