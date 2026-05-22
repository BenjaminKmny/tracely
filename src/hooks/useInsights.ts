import { RidesStats } from './useRidesData'
import { EatsStats } from './useEatsData'

export interface Insight {
  id: string
  emoji: string
  text: string
  category: 'rides' | 'eats' | 'pattern' | 'record'
  highlight?: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const HOURS = (h: number) => h === 0 ? 'midnight' : h < 12 ? `${h}am` : h === 12 ? 'noon' : `${h - 12}pm`

export function generateRidesInsights(stats: RidesStats, year: number): Insight[] {
  const insights: Insight[] = []

  // Peak day
  const peakDay = stats.dayOfWeek.reduce((best, d) => d.count > best.count ? d : best)
  if (peakDay.count > 0) {
    insights.push({
      id: 'rides-peak-day',
      emoji: '📅',
      text: `${peakDay.day} is your busiest day for rides — you took ${peakDay.count} trips on ${peakDay.day}s in ${year}.`,
      category: 'rides',
      highlight: peakDay.day,
    })
  }

  // Peak hour
  const peakHour = stats.hourOfDay.reduce((best, h) => h.count > best.count ? h : best)
  if (peakHour.count > 0) {
    insights.push({
      id: 'rides-peak-hour',
      emoji: '🕐',
      text: `You most often get in an Uber around ${HOURS(peakHour.hour)} — ${peakHour.count} of your rides started at that time.`,
      category: 'pattern',
      highlight: HOURS(peakHour.hour),
    })
  }

  // Top route
  if (stats.topRoutes.length > 0) {
    const top = stats.topRoutes[0]
    insights.push({
      id: 'rides-top-route',
      emoji: '📍',
      text: `Your most frequent route is ${top.route}, which you've taken ${top.count} times in ${year}.`,
      category: 'rides',
      highlight: `${top.count}x`,
    })
  }

  // Surge rate
  if (stats.totalRides > 0) {
    const surgeRate = Math.round((stats.surgeRides / stats.totalRides) * 100)
    if (surgeRate > 20) {
      insights.push({
        id: 'rides-surge-high',
        emoji: '⚡',
        text: `${surgeRate}% of your rides had surge pricing — that's higher than the typical 10-15%. Try riding slightly earlier or later to avoid peak demand.`,
        category: 'pattern',
        highlight: `${surgeRate}% surge`,
      })
    } else if (surgeRate < 10) {
      insights.push({
        id: 'rides-surge-low',
        emoji: '✅',
        text: `Only ${surgeRate}% of your rides had surge pricing — you're good at avoiding peak demand times.`,
        category: 'pattern',
        highlight: `${surgeRate}% surge`,
      })
    }
  }

  // Best and worst spending month
  const monthsWithData = stats.monthlySpend.filter(m => m.amount > 0)
  if (monthsWithData.length >= 2) {
    const best = monthsWithData.reduce((a, b) => a.amount > b.amount ? a : b)
    const lightest = monthsWithData.reduce((a, b) => a.amount < b.amount ? a : b)
    insights.push({
      id: 'rides-heaviest-month',
      emoji: '📈',
      text: `${best.month} was your biggest spending month for rides at €${best.amount} across ${best.rides} trips.`,
      category: 'rides',
      highlight: `€${best.amount}`,
    })
    if (lightest.month !== best.month) {
      insights.push({
        id: 'rides-lightest-month',
        emoji: '📉',
        text: `${lightest.month} was your lightest month — just €${lightest.amount} on rides.`,
        category: 'rides',
      })
    }
  }

  // Top city
  if (stats.cityBreakdown.length > 1) {
    const top = stats.cityBreakdown[0]
    const pct = Math.round((top.count / stats.totalRides) * 100)
    insights.push({
      id: 'rides-top-city',
      emoji: '🏙️',
      text: `${pct}% of your rides in ${year} were in ${top.city}.`,
      category: 'rides',
      highlight: top.city,
    })
  }

  // Top ride type
  if (stats.rideTypes.length > 0) {
    const top = stats.rideTypes[0]
    const pct = Math.round((top.count / stats.totalRides) * 100)
    insights.push({
      id: 'rides-top-type',
      emoji: '🚗',
      text: `${top.type} is your go-to ride type, making up ${pct}% of your trips.`,
      category: 'rides',
      highlight: top.type,
    })
  }

  // Weekend vs weekday
  const weekendCount = stats.dayOfWeek.filter(d => ['Saturday', 'Sunday'].includes(d.day)).reduce((s, d) => s + d.count, 0)
  const weekdayCount = stats.totalRides - weekendCount
  if (weekendCount > 0 && weekdayCount > 0) {
    const weekendPct = Math.round((weekendCount / stats.totalRides) * 100)
    if (weekendPct > 60) {
      insights.push({
        id: 'rides-weekend-heavy',
        emoji: '🎉',
        text: `${weekendPct}% of your rides are on weekends — you're a weekend Uber user.`,
        category: 'pattern',
        highlight: `${weekendPct}% weekends`,
      })
    } else if (weekendPct < 30) {
      insights.push({
        id: 'rides-weekday-heavy',
        emoji: '💼',
        text: `${100 - weekendPct}% of your rides are on weekdays — you mainly use Uber for getting around during the week.`,
        category: 'pattern',
        highlight: `${100 - weekendPct}% weekdays`,
      })
    }
  }

  return insights
}

export function generateEatsInsights(stats: EatsStats, year: number): Insight[] {
  const insights: Insight[] = []

  // Peak day
  const peakDay = stats.dayOfWeek.reduce((best, d) => d.count > best.count ? d : best)
  if (peakDay.count > 0) {
    insights.push({
      id: 'eats-peak-day',
      emoji: '🗓️',
      text: `${peakDay.day} is your most popular day for food delivery — you ordered ${peakDay.count} times on ${peakDay.day}s in ${year}.`,
      category: 'eats',
      highlight: peakDay.day,
    })
  }

  // Peak hour
  const peakHour = stats.hourOfDay.reduce((best, h) => h.count > best.count ? h : best)
  if (peakHour.count > 0) {
    insights.push({
      id: 'eats-peak-hour',
      emoji: '🕗',
      text: `You tend to order food around ${HOURS(peakHour.hour)} — that's when most of your deliveries land.`,
      category: 'pattern',
      highlight: HOURS(peakHour.hour),
    })
  }

  // Top restaurant
  if (stats.topRestaurants.length > 0) {
    const top = stats.topRestaurants[0]
    insights.push({
      id: 'eats-top-restaurant',
      emoji: '🍽️',
      text: `${top.restaurant} is your favourite — you've ordered from there ${top.count} times, spending €${top.spend} in total.`,
      category: 'eats',
      highlight: top.restaurant,
    })
  }

  // Top item
  if (stats.topItems.length > 0) {
    const top = stats.topItems[0]
    insights.push({
      id: 'eats-top-item',
      emoji: '⭐',
      text: `Your most ordered item is ${top.item} — you've ordered it ${top.count} times in ${year}.`,
      category: 'eats',
      highlight: `${top.count}x ${top.item}`,
    })
  }

  // Avg order vs typical
  if (stats.avgOrder > 50) {
    insights.push({
      id: 'eats-high-avg',
      emoji: '💸',
      text: `Your average order is €${stats.avgOrder} — you tend to order generously.`,
      category: 'eats',
      highlight: `€${stats.avgOrder} avg`,
    })
  } else if (stats.avgOrder < 25) {
    insights.push({
      id: 'eats-low-avg',
      emoji: '🎯',
      text: `Your average order is €${stats.avgOrder} — you're pretty efficient with your food delivery spending.`,
      category: 'eats',
      highlight: `€${stats.avgOrder} avg`,
    })
  }

  // Heaviest month
  const monthsWithData = stats.monthlySpend.filter(m => m.amount > 0)
  if (monthsWithData.length >= 2) {
    const best = monthsWithData.reduce((a, b) => a.amount > b.amount ? a : b)
    insights.push({
      id: 'eats-heaviest-month',
      emoji: '📈',
      text: `${best.month} was your biggest month for food delivery — €${best.amount} across ${best.orders} orders.`,
      category: 'eats',
      highlight: `€${best.amount}`,
    })
  }

  // Items per order
  if (stats.avgItemsPerOrder >= 4) {
    insights.push({
      id: 'eats-items-per-order',
      emoji: '🛍️',
      text: `You average ${stats.avgItemsPerOrder} items per order — you like variety when you order in.`,
      category: 'pattern',
      highlight: `${stats.avgItemsPerOrder} items/order`,
    })
  }

  // Weekend vs weekday
  const weekendCount = stats.dayOfWeek.filter(d => ['Saturday', 'Sunday'].includes(d.day)).reduce((s, d) => s + d.count, 0)
  const weekendPct = stats.totalOrders > 0 ? Math.round((weekendCount / stats.totalOrders) * 100) : 0
  if (weekendPct > 50) {
    insights.push({
      id: 'eats-weekend-heavy',
      emoji: '🛋️',
      text: `${weekendPct}% of your food orders are on weekends — classic weekend treat behaviour.`,
      category: 'pattern',
      highlight: `${weekendPct}% weekends`,
    })
  }

  return insights
}