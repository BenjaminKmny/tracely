import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface RidesStats {
  totalSpent: number
  totalRides: number
  avgFare: number
  surgeRides: number
  cheapestRide: number
  mostExpensiveRide: number
  monthlySpend: { month: string; amount: number; rides: number; avgFare: number; surgeCount: number; cheapest: number; mostExpensive: number }[]
  dayOfWeek: { day: string; count: number }[]
  hourOfDay: { hour: number; count: number }[]
  topRoutes: { route: string; count: number }[]
  cityBreakdown: { city: string; count: number }[]
  rideTypes: { type: string; count: number }[]
  currency: string
}

export interface RideRow {
  date: string
  pickup: string
  dropoff: string
  city: string
  ride_type: string
  fare_eur: number
  duration_mins: number
  distance_miles: number
  surged: boolean
  currency: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function computeStats(data: RideRow[]): Omit<RidesStats, 'monthlySpend' | 'dayOfWeek' | 'hourOfDay' | 'currency'> {
  const completed = data.filter(r => r.fare_eur > 0)
  const totalSpent = completed.reduce((s, r) => s + r.fare_eur, 0)
  const avgFare = completed.length > 0 ? totalSpent / completed.length : 0
  const surgeRides = data.filter(r => r.surged).length
  const fares = completed.map(r => r.fare_eur)

  const routeMap: Record<string, number> = {}
  data.forEach(r => {
    if (!r.pickup || !r.dropoff) return
    const pickup = r.pickup.split(',')[0].trim()
    const dropoff = r.dropoff.split(',')[0].trim()
    if (!pickup || !dropoff) return
    const key = `${pickup} → ${dropoff}`
    routeMap[key] = (routeMap[key] ?? 0) + 1
  })
  const topRoutes = Object.entries(routeMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([route, count]) => ({ route, count }))

  const cityMap: Record<string, number> = {}
  data.forEach(r => { if (r.city) cityMap[r.city] = (cityMap[r.city] ?? 0) + 1 })
  const cityBreakdown = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).map(([city, count]) => ({ city, count }))

  const typeMap: Record<string, number> = {}
  data.forEach(r => { if (r.ride_type) typeMap[r.ride_type] = (typeMap[r.ride_type] ?? 0) + 1 })
  const rideTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }))

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalRides: data.length,
    avgFare: Math.round(avgFare * 100) / 100,
    surgeRides,
    cheapestRide: fares.length > 0 ? Math.round(Math.min(...fares) * 100) / 100 : 0,
    mostExpensiveRide: fares.length > 0 ? Math.round(Math.max(...fares) * 100) / 100 : 0,
    topRoutes,
    cityBreakdown,
    rideTypes,
  }
}

export function useRidesData(year: number) {
  const { user } = useAuth()
  const [stats, setStats] = useState<RidesStats | null>(null)
  const [allRides, setAllRides] = useState<RideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)

    const fetch = async () => {
      try {
        const from = `${year}-01-01T00:00:00.000Z`
        const to = `${year}-12-31T23:59:59.999Z`

        const { data, error } = await supabase
          .from('uber_rides')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', from)
          .lte('date', to)
          .order('date', { ascending: true })

        if (error) throw error
        if (!data || data.length === 0) {
          setStats(null)
          setAllRides([])
          setLoading(false)
          return
        }

        setAllRides(data as RideRow[])

        const currencyCounts: Record<string, number> = {}
        data.forEach(r => { currencyCounts[r.currency] = (currencyCounts[r.currency] ?? 0) + 1 })
        const currency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0][0]

        const monthlyMap: Record<number, { amount: number; rides: number; fares: number[]; surge: number }> = {}
        data.forEach(r => {
          const m = new Date(r.date).getMonth()
          if (!monthlyMap[m]) monthlyMap[m] = { amount: 0, rides: 0, fares: [], surge: 0 }
          monthlyMap[m].rides += 1
          if (r.fare_eur > 0) {
            monthlyMap[m].amount += r.fare_eur
            monthlyMap[m].fares.push(r.fare_eur)
          }
          if (r.surged) monthlyMap[m].surge += 1
        })

        const monthlySpend = MONTHS.map((month, i) => {
          const m = monthlyMap[i]
          return {
            month,
            amount: Math.round((m?.amount ?? 0) * 100) / 100,
            rides: m?.rides ?? 0,
            avgFare: m && m.fares.length > 0 ? Math.round((m.amount / m.fares.length) * 100) / 100 : 0,
            surgeCount: m?.surge ?? 0,
            cheapest: m && m.fares.length > 0 ? Math.round(Math.min(...m.fares) * 100) / 100 : 0,
            mostExpensive: m && m.fares.length > 0 ? Math.round(Math.max(...m.fares) * 100) / 100 : 0,
          }
        })

        const dowMap: Record<number, number> = {}
        data.forEach(r => {
          const d = new Date(r.date).getDay()
          const adjusted = d === 0 ? 6 : d - 1
          dowMap[adjusted] = (dowMap[adjusted] ?? 0) + 1
        })
        const dayOfWeek = DAYS.map((day, i) => ({ day, count: dowMap[i] ?? 0 }))

        const hourMap: Record<number, number> = {}
        data.forEach(r => {
          const h = new Date(r.date).getHours()
          hourMap[h] = (hourMap[h] ?? 0) + 1
        })
        const hourOfDay = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hourMap[i] ?? 0 }))

        const base = computeStats(data as RideRow[])

        setStats({ ...base, monthlySpend, dayOfWeek, hourOfDay, currency })
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [user, year])

  // Filter rides by any dimension for dynamic lists
  const filterRides = (type: 'month' | 'dow' | 'hour' | null, index: number | null): RideRow[] => {
    if (type === null || index === null) return allRides
    return allRides.filter(r => {
      const d = new Date(r.date)
      if (type === 'month') return d.getMonth() === index
      if (type === 'dow') {
        const day = d.getDay()
        const adjusted = day === 0 ? 6 : day - 1
        return adjusted === index
      }
      if (type === 'hour') return d.getHours() === index
      return true
    })
  }

  return { stats, allRides, filterRides, loading, error }
}