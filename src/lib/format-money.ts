export function formatMoney(
  value: string | number,
  currency = 'EUR',
  locale = 'de-DE',
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(num);
}
