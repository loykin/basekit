import type { CurrencyUnit } from './types';

const CURRENCY_CODES: Record<CurrencyUnit, string> = {
  usd: 'USD', eur: 'EUR', krw: 'KRW', jpy: 'JPY', gbp: 'GBP',
  cny: 'CNY', inr: 'INR', brl: 'BRL', aud: 'AUD', cad: 'CAD',
  chf: 'CHF', hkd: 'HKD', sgd: 'SGD',
};

export function formatCurrency(value: number, unit: CurrencyUnit, decimals?: number, locale = 'en-US'): string {
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: CURRENCY_CODES[unit],
  };

  if (decimals !== undefined) {
    opts.minimumFractionDigits = decimals;
    opts.maximumFractionDigits = decimals;
  }

  return new Intl.NumberFormat(locale, opts).format(value);
}
