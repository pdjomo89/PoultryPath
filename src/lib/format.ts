export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'XAF', label: 'CFA Franc BEAC (FCFA)' },
  { code: 'XOF', label: 'CFA Franc BCEAO (CFA)' },
  { code: 'NGN', label: 'Nigerian Naira (₦)' },
  { code: 'GHS', label: 'Ghanaian Cedi (₵)' },
  { code: 'KES', label: 'Kenyan Shilling (KSh)' },
  { code: 'ZAR', label: 'South African Rand (R)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export function money(value: number, currency: CurrencyCode, decimals?: number, locale?: string): string {
  const abs = Math.abs(value);
  const digits = decimals ?? (abs >= 1000 ? 0 : 2);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(digits)}`;
  }
}

export const num = (value: number, digits = 0, locale?: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);

export const pct = (value: number, locale?: string) =>
  new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
