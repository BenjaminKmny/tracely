const FALLBACK_RATES: Record<string, number> = {
    EUR: 1,
    GBP: 1.17,
    USD: 0.92,
    MXN: 0.054,
    CLP: 0.00099,
    AUD: 0.60,
    CAD: 0.68,
    CHF: 1.03,
  }
  
  let cachedRates: Record<string, number> | null = null
  let cacheTimestamp: number | null = null
  const CACHE_TTL = 1000 * 60 * 60 // 1 hour
  
  export async function fetchRates(): Promise<Record<string, number>> {
    // Return cache if fresh
    if (cachedRates && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
      return cachedRates
    }
  
    try {
      const res = await fetch('https://api.frankfurter.app/latest?base=EUR')
      if (!res.ok) throw new Error('Rate fetch failed')
      const data = await res.json()
      // data.rates is relative to EUR, so invert to get X -> EUR
      const rates: Record<string, number> = { EUR: 1 }
      for (const [currency, rate] of Object.entries(data.rates as Record<string, number>)) {
        rates[currency] = 1 / rate
      }
      cachedRates = rates
      cacheTimestamp = Date.now()
      return rates
    } catch {
      // Fall back to static rates if API is unavailable
      return FALLBACK_RATES
    }
  }
  
  export function toEURWithRates(amount: number, currency: string, rates: Record<string, number>): number {
    const rate = rates[currency.toUpperCase()] ?? FALLBACK_RATES[currency.toUpperCase()] ?? 1
    return Math.round(amount * rate * 100) / 100
  }
  
  export function detectDominantCurrency(currencies: string[]): string {
    const counts: Record<string, number> = {}
    for (const c of currencies) {
      if (c) counts[c] = (counts[c] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'EUR'
  }