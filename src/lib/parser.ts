import JSZip from 'jszip'
import Papa from 'papaparse'
import { fetchRates, toEURWithRates, detectDominantCurrency } from './currency'

export interface ParsedRide {
  date: string
  pickup: string
  dropoff: string
  city: string
  ride_type: string
  fare_local: number
  currency: string
  fare_eur: number
  duration_mins: number
  distance_miles: number
  surged: boolean
  platform: string
}

export interface ParsedEatsOrder {
  date: string
  restaurant: string
  city: string
  order_total_local: number
  currency: string
  order_total_eur: number
  platform: string
  items: ParsedEatsItem[]
}

export interface ParsedEatsItem {
  item_name: string
  quantity: number
  item_price: number
}

export interface ParseResult {
  rides: ParsedRide[]
  eats_orders: ParsedEatsOrder[]
  dominant_currency: string
  errors: string[]
}

function parseCSV(text: string): any[] {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  })
  return result.data as any[]
}

function safeFloat(val: any): number {
  const n = parseFloat(String(val ?? '0').replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

function safeDate(val: any): string {
  if (!val) return ''
  try {
    return new Date(val).toISOString()
  } catch {
    return String(val)
  }
}

function parseRides(rows: any[], rates: Record<string, number>): ParsedRide[] {
  const rides: ParsedRide[] = []

  for (const row of rows) {
    const status = (row['status'] ?? row['Status'] ?? '').toLowerCase()
    if (status && status !== 'completed') continue

    const currency = (row['currency_code'] ?? row['Currency'] ?? 'EUR').trim()
    const fare_local = safeFloat(row['fare_amount'] ?? row['Fare Amount'] ?? 0)

    rides.push({
      date: safeDate(row['request_timestamp_local'] ?? row['Date/Time'] ?? ''),
      pickup: String(row['begintrip_address'] ?? row['Start Address'] ?? '').trim(),
      dropoff: String(row['dropoff_address'] ?? row['End Address'] ?? '').trim(),
      city: String(row['city_name'] ?? row['City'] ?? '').trim(),
      ride_type: String(row['product_type_name'] ?? row['Product Type'] ?? '').trim(),
      fare_local,
      currency,
      fare_eur: toEURWithRates(fare_local, currency, rates),
      duration_mins: Math.round(safeFloat(row['trip_duration_seconds'] ?? 0) / 60),
      distance_miles: safeFloat(row['trip_distance_miles'] ?? row['Distance (miles)'] ?? 0),
      surged: String(row['is_surged'] ?? 'false').toLowerCase() === 'true',
      platform: 'uber',
    })
  }

  return rides
}

function parseEatsOrders(orderRows: any[], itemRows: any[], rates: Record<string, number>): ParsedEatsOrder[] {
  const orders: ParsedEatsOrder[] = []

  const itemsByKey: Record<string, ParsedEatsItem[]> = {}
  for (const row of itemRows) {
    const key = `${String(row['Restaurant_Name'] ?? '').trim()}__${String(row['Request_Time_Local'] ?? '').trim()}`
    if (!itemsByKey[key]) itemsByKey[key] = []
    itemsByKey[key].push({
      item_name: String(row['Item_Name'] ?? '').trim(),
      quantity: Math.round(safeFloat(row['Quantity'] ?? 1)),
      item_price: safeFloat(row['Item_Price'] ?? 0),
    })
  }

  const seen = new Set<string>()

  for (const row of orderRows) {
    const status = (row['Order_Status'] ?? '').toLowerCase()
    if (status && status !== 'completed') continue

    const restaurant = String(row['Restaurant_Name'] ?? '').trim()
    const dateRaw = String(row['Request_Time_Local'] ?? '').trim()
    const key = `${restaurant}__${dateRaw}`

    if (seen.has(key)) continue
    seen.add(key)

    const currency = String(row['Currency'] ?? 'EUR').trim()
    const order_total_local = safeFloat(row['Order_Price'] ?? 0)

    orders.push({
      date: safeDate(dateRaw),
      restaurant,
      city: String(row['City_Name'] ?? '').trim(),
      order_total_local,
      currency,
      order_total_eur: toEURWithRates(order_total_local, currency, rates),
      platform: 'uber_eats',
      items: itemsByKey[key] ?? [],
    })
  }

  return orders
}

export async function parseUberZip(file: File): Promise<ParseResult> {
  const errors: string[] = []
  let rides: ParsedRide[] = []
  let eats_orders: ParsedEatsOrder[] = []

  try {
    // Fetch live rates once before parsing
    const rates = await fetchRates()
    const zip = await JSZip.loadAsync(file)

    let tripsCSV: string | null = null
    let eatsOrdersCSV: string | null = null
    let eatsItemsCSV: string | null = null

    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue
      const lower = path.toLowerCase()

      if (lower.includes('trips_data') || lower.includes('trip_data')) {
        tripsCSV = await zipEntry.async('text')
      } else if (lower.includes('user_orders') || lower.includes('eats_order')) {
        eatsOrdersCSV = await zipEntry.async('text')
      } else if (lower.includes('user_order_items') || lower.includes('eats_item')) {
        eatsItemsCSV = await zipEntry.async('text')
      }
    }

    if (tripsCSV) {
      try {
        const rows = parseCSV(tripsCSV)
        rides = parseRides(rows, rates)
      } catch (e) {
        errors.push('Could not parse rides data')
      }
    } else {
      errors.push('No trips data file found in ZIP')
    }

    if (eatsOrdersCSV) {
      try {
        const orderRows = parseCSV(eatsOrdersCSV)
        const itemRows = eatsItemsCSV ? parseCSV(eatsItemsCSV) : []
        eats_orders = parseEatsOrders(orderRows, itemRows, rates)
      } catch (e) {
        errors.push('Could not parse Eats data')
      }
    } else {
      errors.push('No Eats orders file found in ZIP')
    }

  } catch (e) {
    errors.push('Could not open ZIP file — make sure it is a valid Uber data export')
  }

  const allCurrencies = [
    ...rides.map(r => r.currency),
    ...eats_orders.map(o => o.currency),
  ]
  const dominant_currency = detectDominantCurrency(allCurrencies)

  return { rides, eats_orders, dominant_currency, errors }
}