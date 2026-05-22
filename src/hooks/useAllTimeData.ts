import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { RideRow } from './useRidesData'
import { EatsOrderRow, EatsItemRow } from './useEatsData'

export interface AllTimeRecords {
  // Rides — all time
  totalRidesAllTime: number
  totalSpentRidesAllTime: number
  mostExpensiveRideAllTime: { fare: number; pickup: string; dropoff: string; date: string } | null
  cheapestRideAllTime: { fare: number; pickup: string; dropoff: string; date: string } | null
  longestRideAllTime: { mins: number; pickup: string; dropoff: string; date: string } | null
  topRouteAllTime: { route: string; count: number } | null
  topCityAllTime: { city: string; count: number } | null
  mostActiveMonthRidesAllTime: { month: string; count: number } | null
  surgeRateAllTime: number

  // Eats — all time
  totalOrdersAllTime: number
  totalSpentEatsAllTime: number
  largestOrderAllTime: { total: number; restaurant: string; date: string } | null
  topRestaurantAllTime: { restaurant: string; count: number } | null
  topItemAllTime: { item: string; count: number } | null
  mostActiveMonthEatsAllTime: { month: string; count: number } | null
  avgOrderAllTime: number

  // Current year
  currentYear: number
  totalRidesThisYear: number
  totalSpentRidesThisYear: number
  totalOrdersThisYear: number
  totalSpentEatsThisYear: number
  topRouteThisYear: { route: string; count: number } | null
  topRestaurantThisYear: { restaurant: string; count: number } | null
  topItemThisYear: { item: string; count: number } | null
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function useAllTimeData() {
  const { user } = useAuth()
  const [records, setRecords] = useState<AllTimeRecords | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetch = async () => {
      try {
        const currentYear = new Date().getFullYear()

        // Fetch all rides
        const { data: ridesData } = await supabase
          .from('uber_rides')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })

        // Fetch all orders
        const { data: ordersData } = await supabase
          .from('uber_eats_orders')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })

        // Fetch all items
        const { data: itemsData } = await supabase
          .from('uber_eats_items')
          .select('*')
          .eq('user_id', user.id)

        const rides = ((ridesData ?? []) as RideRow[]).filter(r => r.fare_eur > 0)
        const orders = (ordersData ?? []) as EatsOrderRow[]
        const items = (itemsData ?? []) as EatsItemRow[]

        const thisYearFrom = `${currentYear}-01-01T00:00:00.000Z`
        const ridesThisYear = rides.filter(r => r.date >= thisYearFrom)
        const ordersThisYear = orders.filter(o => o.date >= thisYearFrom)

        // ── Rides all time ──────────────────────────────────────────
        const mostExpensive = rides.reduce((best, r) => !best || r.fare_eur > best.fare_eur ? r : best, null as any)
        const cheapest = rides.reduce((best, r) => !best || r.fare_eur < best.fare_eur ? r : best, null as any)
        const longest = rides.reduce((best, r) => !best || r.duration_mins > best.duration_mins ? r : best, null as any)

        const routeMap: Record<string, number> = {}
        rides.forEach(r => {
          if (!r.pickup || !r.dropoff) return
          const key = `${r.pickup.split(',')[0].trim()} → ${r.dropoff.split(',')[0].trim()}`
          routeMap[key] = (routeMap[key] ?? 0) + 1
        })
        const topRoute = Object.entries(routeMap).sort((a, b) => b[1] - a[1])[0]

        const cityMap: Record<string, number> = {}
        rides.forEach(r => { if (r.city) cityMap[r.city] = (cityMap[r.city] ?? 0) + 1 })
        const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0]

        const rideMonthMap: Record<string, number> = {}
        rides.forEach(r => {
          const d = new Date(r.date)
          const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
          rideMonthMap[key] = (rideMonthMap[key] ?? 0) + 1
        })
        const mostActiveRideMonth = Object.entries(rideMonthMap).sort((a, b) => b[1] - a[1])[0]

        const surgeRate = rides.length > 0 ? Math.round((rides.filter(r => r.surged).length / rides.length) * 100) : 0

        // ── Eats all time ───────────────────────────────────────────
        const largestOrder = orders.reduce((best, o) => !best || o.order_total_eur > best.order_total_eur ? o : best, null as any)

        const restMap: Record<string, number> = {}
        orders.forEach(o => { if (o.restaurant) restMap[o.restaurant] = (restMap[o.restaurant] ?? 0) + 1 })
        const topRestaurant = Object.entries(restMap).sort((a, b) => b[1] - a[1])[0]

        const itemMap: Record<string, number> = {}
        items.forEach(i => { if (i.item_name) itemMap[i.item_name] = (itemMap[i.item_name] ?? 0) + i.quantity })
        const topItem = Object.entries(itemMap).sort((a, b) => b[1] - a[1])[0]

        const eatsMonthMap: Record<string, number> = {}
        orders.forEach(o => {
          const d = new Date(o.date)
          const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
          eatsMonthMap[key] = (eatsMonthMap[key] ?? 0) + 1
        })
        const mostActiveEatsMonth = Object.entries(eatsMonthMap).sort((a, b) => b[1] - a[1])[0]

        // ── This year ───────────────────────────────────────────────
        const routeMapThisYear: Record<string, number> = {}
        ridesThisYear.forEach(r => {
          if (!r.pickup || !r.dropoff) return
          const key = `${r.pickup.split(',')[0].trim()} → ${r.dropoff.split(',')[0].trim()}`
          routeMapThisYear[key] = (routeMapThisYear[key] ?? 0) + 1
        })
        const topRouteThisYear = Object.entries(routeMapThisYear).sort((a, b) => b[1] - a[1])[0]

        const restMapThisYear: Record<string, number> = {}
        ordersThisYear.forEach(o => { if (o.restaurant) restMapThisYear[o.restaurant] = (restMapThisYear[o.restaurant] ?? 0) + 1 })
        const topRestaurantThisYear = Object.entries(restMapThisYear).sort((a, b) => b[1] - a[1])[0]

        const orderIdsThisYear = new Set(ordersThisYear.map(o => o.id))
        const itemsThisYear = items.filter(i => orderIdsThisYear.has(i.order_id))
        const itemMapThisYear: Record<string, number> = {}
        itemsThisYear.forEach(i => { if (i.item_name) itemMapThisYear[i.item_name] = (itemMapThisYear[i.item_name] ?? 0) + i.quantity })
        const topItemThisYear = Object.entries(itemMapThisYear).sort((a, b) => b[1] - a[1])[0]

        setRecords({
          totalRidesAllTime: rides.length,
          totalSpentRidesAllTime: Math.round(rides.reduce((s, r) => s + r.fare_eur, 0) * 100) / 100,
          mostExpensiveRideAllTime: mostExpensive ? { fare: mostExpensive.fare_eur, pickup: mostExpensive.pickup?.split(',')[0] ?? '', dropoff: mostExpensive.dropoff?.split(',')[0] ?? '', date: mostExpensive.date } : null,
          cheapestRideAllTime: cheapest ? { fare: cheapest.fare_eur, pickup: cheapest.pickup?.split(',')[0] ?? '', dropoff: cheapest.dropoff?.split(',')[0] ?? '', date: cheapest.date } : null,
          longestRideAllTime: longest ? { mins: longest.duration_mins, pickup: longest.pickup?.split(',')[0] ?? '', dropoff: longest.dropoff?.split(',')[0] ?? '', date: longest.date } : null,
          topRouteAllTime: topRoute ? { route: topRoute[0], count: topRoute[1] } : null,
          topCityAllTime: topCity ? { city: topCity[0], count: topCity[1] } : null,
          mostActiveMonthRidesAllTime: mostActiveRideMonth ? { month: mostActiveRideMonth[0], count: mostActiveRideMonth[1] } : null,
          surgeRateAllTime: surgeRate,
          totalOrdersAllTime: orders.length,
          totalSpentEatsAllTime: Math.round(orders.reduce((s, o) => s + o.order_total_eur, 0) * 100) / 100,
          largestOrderAllTime: largestOrder ? { total: largestOrder.order_total_eur, restaurant: largestOrder.restaurant, date: largestOrder.date } : null,
          topRestaurantAllTime: topRestaurant ? { restaurant: topRestaurant[0], count: topRestaurant[1] } : null,
          topItemAllTime: topItem ? { item: topItem[0], count: topItem[1] } : null,
          mostActiveMonthEatsAllTime: mostActiveEatsMonth ? { month: mostActiveEatsMonth[0], count: mostActiveEatsMonth[1] } : null,
          avgOrderAllTime: orders.length > 0 ? Math.round((orders.reduce((s, o) => s + o.order_total_eur, 0) / orders.length) * 100) / 100 : 0,
          currentYear,
          totalRidesThisYear: ridesThisYear.length,
          totalSpentRidesThisYear: Math.round(ridesThisYear.reduce((s, r) => s + r.fare_eur, 0) * 100) / 100,
          totalOrdersThisYear: ordersThisYear.length,
          totalSpentEatsThisYear: Math.round(ordersThisYear.reduce((s, o) => s + o.order_total_eur, 0) * 100) / 100,
          topRouteThisYear: topRouteThisYear ? { route: topRouteThisYear[0], count: topRouteThisYear[1] } : null,
          topRestaurantThisYear: topRestaurantThisYear ? { restaurant: topRestaurantThisYear[0], count: topRestaurantThisYear[1] } : null,
          topItemThisYear: topItemThisYear ? { item: topItemThisYear[0], count: topItemThisYear[1] } : null,
        })
      } catch (e) {
        console.error('useAllTimeData error:', e)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [user])

  return { records, loading }
}