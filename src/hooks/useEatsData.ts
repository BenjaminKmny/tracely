import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface EatsStats {
  totalSpent: number
  totalOrders: number
  avgOrder: number
  largestOrder: number
  totalItems: number
  avgItemsPerOrder: number
  monthlySpend: { month: string; amount: number; orders: number }[]
  dayOfWeek: { day: string; count: number }[]
  hourOfDay: { hour: number; count: number }[]
  topRestaurants: { restaurant: string; count: number; spend: number }[]
  topItems: { item: string; count: number }[]
  currency: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function useEatsData(year: number) {
  const { user } = useAuth()
  const [stats, setStats] = useState<EatsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)

    const fetch = async () => {
      try {
        const from = `${year}-01-01T00:00:00.000Z`
        const to = `${year}-12-31T23:59:59.999Z`

        // Fetch orders
        const { data: orders, error: ordersError } = await supabase
          .from('uber_eats_orders')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', from)
          .lte('date', to)
          .order('date', { ascending: true })

        if (ordersError) throw ordersError

        // Fetch items for those orders
        const { data: items, error: itemsError } = await supabase
          .from('uber_eats_items')
          .select('*')
          .eq('user_id', user.id)

        if (itemsError) throw itemsError

        if (!orders || orders.length === 0) {
          setStats(null)
          setLoading(false)
          return
        }

        // Currency
        const currencyCounts: Record<string, number> = {}
        orders.forEach(o => { currencyCounts[o.currency] = (currencyCounts[o.currency] ?? 0) + 1 })
        const currency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0][0]

        const totalSpent = orders.reduce((s, o) => s + o.order_total_eur, 0)
        const avgOrder = orders.length > 0 ? totalSpent / orders.length : 0
        const largestOrder = Math.max(...orders.map(o => o.order_total_eur))

        // Items
        const orderIds = new Set(orders.map(o => o.id))
        const relevantItems = (items ?? []).filter(i => orderIds.has(i.order_id))
        const totalItems = relevantItems.reduce((s, i) => s + i.quantity, 0)
        const avgItemsPerOrder = orders.length > 0 ? totalItems / orders.length : 0

        // Monthly
        const monthlyMap: Record<number, { amount: number; orders: number }> = {}
        orders.forEach(o => {
          const m = new Date(o.date).getMonth()
          if (!monthlyMap[m]) monthlyMap[m] = { amount: 0, orders: 0 }
          monthlyMap[m].amount += o.order_total_eur
          monthlyMap[m].orders += 1
        })
        const monthlySpend = MONTHS.map((month, i) => ({
          month,
          amount: Math.round((monthlyMap[i]?.amount ?? 0) * 100) / 100,
          orders: monthlyMap[i]?.orders ?? 0,
        }))

        // Day of week
        const dowMap: Record<number, number> = {}
        orders.forEach(o => {
          const d = new Date(o.date).getDay()
          const adjusted = d === 0 ? 6 : d - 1
          dowMap[adjusted] = (dowMap[adjusted] ?? 0) + 1
        })
        const dayOfWeek = DAYS.map((day, i) => ({ day, count: dowMap[i] ?? 0 }))

        // Hour of day
        const hourMap: Record<number, number> = {}
        orders.forEach(o => {
          const h = new Date(o.date).getHours()
          hourMap[h] = (hourMap[h] ?? 0) + 1
        })
        const hourOfDay = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: hourMap[i] ?? 0,
        }))

        // Top restaurants
        const restMap: Record<string, { count: number; spend: number }> = {}
        orders.forEach(o => {
          if (!o.restaurant) return
          if (!restMap[o.restaurant]) restMap[o.restaurant] = { count: 0, spend: 0 }
          restMap[o.restaurant].count += 1
          restMap[o.restaurant].spend += o.order_total_eur
        })
        const topRestaurants = Object.entries(restMap)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 8)
          .map(([restaurant, { count, spend }]) => ({
            restaurant,
            count,
            spend: Math.round(spend * 100) / 100,
          }))

        // Top items
        const itemMap: Record<string, number> = {}
        relevantItems.forEach(i => {
          if (!i.item_name) return
          itemMap[i.item_name] = (itemMap[i.item_name] ?? 0) + i.quantity
        })
        const topItems = Object.entries(itemMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([item, count]) => ({ item, count }))

        setStats({
          totalSpent: Math.round(totalSpent * 100) / 100,
          totalOrders: orders.length,
          avgOrder: Math.round(avgOrder * 100) / 100,
          largestOrder: Math.round(largestOrder * 100) / 100,
          totalItems,
          avgItemsPerOrder: Math.round(avgItemsPerOrder * 10) / 10,
          monthlySpend,
          dayOfWeek,
          hourOfDay,
          topRestaurants,
          topItems,
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