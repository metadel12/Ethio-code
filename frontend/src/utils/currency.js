export const CURRENCIES = {
  ETB: { symbol: 'ብር', code: 'ETB', locale: 'am-ET', rate: 1 },
  USD: { symbol: '$',  code: 'USD', locale: 'en-US', rate: 0.0073 },
  EUR: { symbol: '€',  code: 'EUR', locale: 'de-DE', rate: 0.0067 },
  GBP: { symbol: '£',  code: 'GBP', locale: 'en-GB', rate: 0.0057 },
}

const stored = () => localStorage.getItem('currency') || 'ETB'

export const formatCurrency = (amountInETB, currencyCode = stored()) => {
  const c = CURRENCIES[currencyCode] || CURRENCIES.ETB
  const converted = amountInETB * c.rate
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency: c.code,
    minimumFractionDigits: currencyCode === 'ETB' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'ETB' ? 0 : 2,
  }).format(converted)
}

export const setCurrency = (code) => localStorage.setItem('currency', code)
export const getCurrency = stored
