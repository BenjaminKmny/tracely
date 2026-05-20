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
  monthlySpend: { month: string; amount: number }[]
  dayOfWeek: { day: string; count: number }[]
  hourOfDay: { hour: number; count: number }[]
  topRoutes: { route: string; count: number }[]
  cityBreakdown: { city: string; count: number }[]
  rideTypes: { type: string; count: number }[]
  currency: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function useRidesData(year: number) {
  const { user } = useAuth()
  const [stats, setStats] = useState<RidesStats | null>(null)
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
          setLoading(false)
          return
        }

        // Get preferred currency
        const currencyCounts: Record<string, number> = {}
        data.forEach(r => { currencyCounts[r.currency] = (currencyCounts[r.currency] ?? 0) + 1 })
        const currency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0][0]

        // Total spent — use fare_eur for normalised total
        const completed = data.filter(r => r.fare_eur > 0)
        const totalSpent = completed.reduce((s, r) => s + r.fare_eur, 0)
        const avgFare = completed.length > 0 ? totalSpent / completed.length : 0
        const surgeRides = data.filter(r => r.surged).length
        const fares = completed.map(r => r.fare_eur)
        const cheapestRide = fares.length > 0 ? Math.min(...fares) : 0
        const mostExpensiveRide = fares.length > 0 ? Math.max(...fares) : 0

        // Monthly spend
        const monthlyMap: Record<number, number> = {}
        completed.forEach(r => {
          const m = new Date(r.date).getMonth()
          monthlyMap[m] = (monthlyMap[m] ?? 0) + r.fare_eur
        })
        const monthlySpend = MONTHS.map((month, i) => ({
          month,
          amount: Math.round((monthlyMap[i] ?? 0) * 100) / 100,
        }))

        // Day of week
        const dowMap: Record<number, number> = {}
        data.forEach(r => {
          const d = new Date(r.date).getDay() // 0=Sun
          const adjusted = d === 0 ? 6 : d - 1  // 0=Mon
          dowMap[adjusted] = (dowMap[adjusted] ?? 0) + 1
        })
        const dayOfWeek = DAYS.map((day, i) => ({ day, count: dowMap[i] ?? 0 }))

        // Hour of day
        const hourMap: Record<number, number> = {}
        data.forEach(r => {
          const h = new Date(r.date).getHours()
          hourMap[h] = (hourMap[h] ?? 0) + 1
        })
        const hourOfDay = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: hourMap[i] ?? 0,
        }))

        // Top routes
        const routeMap: Record<string, number> = {}
        data.forEach(r => {
          if (!r.pickup || !r.dropoff) return
          const pickup = r.pickup.split(',')[0].trim()
          const dropoff = r.dropoff.split(',')[0].trim()
          if (!pickup || !dropoff) return
          const key = `${pickup} → ${dropoff}`
          routeMap[key] = (routeMap[key] ?? 0) + 1
        })
        const topRoutes = Object.entries(routeMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([route, count]) => ({ route, count }))

        // City breakdown
        const cityMap: Record<string, number> = {}
        data.forEach(r => { if (r.city) cityMap[r.city] = (cityMap[r.city] ?? 0) + 1 })
        const cityBreakdown = Object.entries(cityMap)
          .sort((a, b) => b[1] - a[1])
          .map(([city, count]) => ({ city, count }))

        // Ride types
        const typeMap: Record<string, number> = {}
        data.forEach(r => { if (r.ride_type) typeMap[r.ride_type] = (typeMap[r.ride_type] ?? 0) + 1 })
        const rideTypes = Object.entries(typeMap)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => ({ type, count }))

        setStats({
          totalSpent: Math.round(totalSpent * 100) / 100,
          totalRides: data.length,
          avgFare: Math.round(avgFare * 100) / 100,
          surgeRides,
          cheapestRide: Math.round(cheapestRide * 100) / 100,
          mostExpensiveRide: Math.round(mostExpensiveRide * 100) / 100,
          monthlySpend,
          dayOfWeek,
          hourOfDay,
          topRoutes,
          cityBreakdown,
          rideTypes,
          currency,
        })
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [user, year])

  return { stats, loading, error }
}