import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseUberZip, ParseResult } from '../lib/parser'
import { useAuth } from '../contexts/AuthContext'

export type UploadStatus = 'idle' | 'parsing' | 'preview' | 'saving' | 'done' | 'error'

export interface UploadPreview {
  totalRides: number
  totalOrders: number
  earliestDate: string | null
  latestDate: string | null
  newRides: number
  newOrders: number
}

export interface UploadState {
  status: UploadStatus
  result: ParseResult | null
  preview: UploadPreview | null
  error: string | null
  lastUploadAt: string | null
  canUpload: boolean
}

export function useUpload() {
  const { user } = useAuth()
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    result: null,
    preview: null,
    error: null,
    lastUploadAt: null,
    canUpload: true,
  })

  const checkUploadEligibility = async (): Promise<{ canUpload: boolean; lastUploadAt: string | null }> => {
    if (!user) return { canUpload: false, lastUploadAt: null }

    if (import.meta.env.VITE_DISABLE_UPLOAD_LIMIT === 'true') {
      return { canUpload: true, lastUploadAt: null }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('last_upload_at, plan')
      .eq('id', user.id)
      .single()

    if (!profile?.last_upload_at) return { canUpload: true, lastUploadAt: null }

    const plan = profile.plan ?? 'free'
    if (plan === 'pro') return { canUpload: true, lastUploadAt: profile.last_upload_at }

    const lastUpload = new Date(profile.last_upload_at)
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    return {
      canUpload: lastUpload < twoMonthsAgo,
      lastUploadAt: profile.last_upload_at,
    }
  }

  // Step 1 — parse only, no saving
  const upload = async (file: File) => {
    if (!user) return

    setState(s => ({ ...s, status: 'parsing', error: null, preview: null, result: null }))

    try {
      const { canUpload, lastUploadAt } = await checkUploadEligibility()
      if (!canUpload) {
        setState(s => ({
          ...s,
          status: 'error',
          error: 'You can upload once every 2 months on the free plan.',
          lastUploadAt,
          canUpload: false,
        }))
        return
      }

      const result = await parseUberZip(file)

      if (result.rides.length === 0 && result.eats_orders.length === 0) {
        setState(s => ({
          ...s,
          status: 'error',
          error: result.errors.join(' ') || 'No data found in this ZIP file.',
          result,
        }))
        return
      }

      // Get existing latest dates from Supabase for merge preview
      const { data: latestRide } = await supabase
        .from('uber_rides')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      const { data: latestOrder } = await supabase
        .from('uber_eats_orders')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      const latestRideDate = latestRide?.date ? new Date(latestRide.date) : null
      const latestOrderDate = latestOrder?.date ? new Date(latestOrder.date) : null

      // Count how many are new
      const newRides = latestRideDate
        ? result.rides.filter(r => r.date && new Date(r.date) > latestRideDate).length
        : result.rides.length

      const newOrders = latestOrderDate
        ? result.eats_orders.filter(o => o.date && new Date(o.date) > latestOrderDate).length
        : result.eats_orders.length

      // Dates in the new file
      const allDates = [
        ...result.rides.map(r => r.date),
        ...result.eats_orders.map(o => o.date),
      ].filter(Boolean).sort()

      const preview: UploadPreview = {
        totalRides: result.rides.length,
        totalOrders: result.eats_orders.length,
        earliestDate: allDates[0] ?? null,
        latestDate: allDates[allDates.length - 1] ?? null,
        newRides,
        newOrders,
      }

      setState(s => ({ ...s, status: 'preview', result, preview }))

    } catch (e: any) {
      setState(s => ({
        ...s,
        status: 'error',
        error: e.message ?? 'Something went wrong. Please try again.',
      }))
    }
  }

  // Step 2 — user confirmed, now save
  const confirmImport = async () => {
    if (!user || !state.result) return

    setState(s => ({ ...s, status: 'saving' }))

    const result = state.result

    try {
      // Rides — merge by date
    if (result.rides.length > 0) {
        const { data: latestRideData } = await supabase
        .from('uber_rides')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
    
        const latestDate = latestRideData && latestRideData.length > 0
        ? new Date(latestRideData[0].date)
        : null
    
        const newRides = latestDate
        ? result.rides.filter(r => r.date && new Date(r.date) > latestDate)
        : result.rides
    
        if (newRides.length > 0) {
        const payload = newRides.map(r => ({ ...r, user_id: user.id }))
        for (let i = 0; i < payload.length; i += 500) {
            const { error } = await supabase.from('uber_rides').insert(payload.slice(i, i + 500))
            if (error) throw new Error(`Rides insert failed: ${error.message}`)
        }
        }
    }

    // Eats orders — merge by date
    if (result.eats_orders.length > 0) {
        const { data: latestOrderData } = await supabase
        .from('uber_eats_orders')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
    
        const latestDate = latestOrderData && latestOrderData.length > 0
        ? new Date(latestOrderData[0].date)
        : null
    
        const newOrders = latestDate
        ? result.eats_orders.filter(o => o.date && new Date(o.date) > latestDate)
        : result.eats_orders
    
        for (const order of newOrders) {
        const { items, ...orderData } = order
        const { data: insertedOrder, error: orderError } = await supabase
            .from('uber_eats_orders')
            .insert({ ...orderData, user_id: user.id })
            .select('id')
            .single()
    
        if (orderError) continue
    
        if (items.length > 0) {
            await supabase.from('uber_eats_items').insert(
            items.map(item => ({
                ...item,
                order_id: insertedOrder.id,
                user_id: user.id,
            }))
            )
        }
        }
    }

      // Update profile
      await supabase
        .from('profiles')
        .update({
          last_upload_at: new Date().toISOString(),
          preferred_currency: result.dominant_currency,
        })
        .eq('id', user.id)

      setState(s => ({
        ...s,
        status: 'done',
        lastUploadAt: new Date().toISOString(),
        canUpload: false,
      }))

    } catch (e: any) {
      setState(s => ({
        ...s,
        status: 'error',
        error: e.message ?? 'Something went wrong while saving.',
      }))
    }
  }

  // Cancel from preview — go back to idle
  const cancelImport = () => {
    setState(s => ({ ...s, status: 'idle', result: null, preview: null }))
  }

  return { state, upload, confirmImport, cancelImport, checkUploadEligibility }
}