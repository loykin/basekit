import type { FormatterOptions, Formatter } from './types';
import formatBits, { formatSIBytes, formatIECBytes, formatBitRate, formatByteRate } from './bytes';
import { formatTime } from './time';
import { formatNumber } from './number';
import { formatCurrency } from './currency';
import {
  formatPercent, formatThroughput, formatTemperature,
  formatLength, formatWeight, formatAngle, formatVelocity,
} from './misc';

const SI_BYTE_UNITS   = new Set(['bytes','kbytes','mbytes','gbytes','tbytes','pbytes']);
const IEC_BYTE_UNITS  = new Set(['kibytes','mibytes','gibytes','tibytes','pibytes']);
const BIT_UNITS       = new Set(['bits','kbits','mbits','gbits']);
const BIT_RATE_UNITS  = new Set(['bps','Kbps','Mbps','Gbps','Tbps']);
const BYTE_RATE_UNITS = new Set(['Bps','KBps','MBps','GBps','TBps']);
const TIME_UNITS      = new Set(['ns','µs','ms','s','min','h','d','duration','durationS']);
const PERCENT_UNITS   = new Set(['percent','percentunit']);
const CURRENCY_UNITS  = new Set(['usd','eur','krw','jpy','gbp','cny','inr','brl','aud','cad','chf','hkd','sgd']);
const NUMBER_UNITS    = new Set(['none','short','scientific','locale']);
const THROUGHPUT_UNITS = new Set(['reqps','rps','wps','iops','ops','rpm','rph']);
const TEMP_UNITS      = new Set(['celsius','fahrenheit','kelvin']);
const LENGTH_UNITS    = new Set(['m','km','cm','mm','mi','ft','in']);
const WEIGHT_UNITS    = new Set(['kg','g','mg','lb','oz']);
const ANGLE_UNITS     = new Set(['deg','rad','grad']);
const VELOCITY_UNITS  = new Set(['m/s','km/h','mph','knot']);

export function formatUnit(value: number, options: FormatterOptions): string {
  const { unit, decimals, locale } = options;

  if (SI_BYTE_UNITS.has(unit))    return formatSIBytes(value, unit as any, decimals);
  if (IEC_BYTE_UNITS.has(unit))   return formatIECBytes(value, unit as any, decimals);
  if (BIT_UNITS.has(unit))        return formatBits(value, unit as any, decimals);
  if (BIT_RATE_UNITS.has(unit))   return formatBitRate(value, unit as any, decimals);
  if (BYTE_RATE_UNITS.has(unit))  return formatByteRate(value, unit as any, decimals);
  if (TIME_UNITS.has(unit))       return formatTime(value, unit as any, decimals);
  if (PERCENT_UNITS.has(unit))    return formatPercent(value, unit as any, decimals);
  if (CURRENCY_UNITS.has(unit))   return formatCurrency(value, unit as any, decimals, locale);
  if (NUMBER_UNITS.has(unit))     return formatNumber(value, unit as any, decimals, locale);
  if (THROUGHPUT_UNITS.has(unit)) return formatThroughput(value, unit as any, decimals);
  if (TEMP_UNITS.has(unit))       return formatTemperature(value, unit as any, decimals);
  if (LENGTH_UNITS.has(unit))     return formatLength(value, unit as any, decimals);
  if (WEIGHT_UNITS.has(unit))     return formatWeight(value, unit as any, decimals);
  if (ANGLE_UNITS.has(unit))      return formatAngle(value, unit as any, decimals);
  if (VELOCITY_UNITS.has(unit))   return formatVelocity(value, unit as any, decimals);

  return String(value);
}

/**
 * Creates a reusable formatter function.
 *
 * @example
 * const fmt = createFormatter({ unit: 'bytes', decimals: 1 })
 * fmt(1536)   // "1.5 KB"
 * fmt(1.5e9)  // "1.5 GB"
 */
export function createFormatter(options: FormatterOptions): Formatter {
  return (value: number) => formatUnit(value, options);
}
