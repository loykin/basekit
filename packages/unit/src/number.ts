import type { NumberUnit } from './types';

export function formatNumber(value: number, unit: NumberUnit, decimals?: number, locale = 'en-US'): string {
  const opts: Intl.NumberFormatOptions = {};

  if (decimals !== undefined) {
    opts.minimumFractionDigits = decimals;
    opts.maximumFractionDigits = decimals;
  }

  switch (unit) {
    case 'none':
      return decimals !== undefined
        ? value.toFixed(decimals)
        : String(parseFloat(value.toPrecision(6)));

    case 'locale':
      return new Intl.NumberFormat(locale, opts).format(value);

    case 'short':
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        ...opts,
      }).format(value);

    case 'scientific':
      return new Intl.NumberFormat(locale, {
        notation: 'scientific',
        ...opts,
      }).format(value);
  }
}
