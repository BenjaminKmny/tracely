import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseUberZip, ParseResult } from '../lib/parser'
import { useAuth } from '../contexts/AuthContext'

export type UploadStatus = 'idle' | 'parsing' | 'saving' | 'done' | 'error'

export interface UploadState {
  status: UploadStatus
  result: ParseResult | null
  error: string | null
  lastUploadAt: string | null
  canUpload: boolean
}

export function useUpload() {
  const { user } = useAuth()
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    result: null,
    error: null,
    lastUploadAt: null,
    canUpload: true,
  })

  const checkUploadEligibility = async (): Promise<{ canUpload: boolean; lastUploadAt: string | null }> => {
    if (!user) return { canUpload: false, lastUploadAt: null }

    // Feature flag — disable upload limit for testing
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

    // Free plan: once every 2 months
    const lastUpload = new Date(profile.last_upload_at)
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    return {
      canUpload: lastUpload < twoMonthsAgo,
      lastUploadAt: profile.last_upload_at,
    }
  }

  const upload = async (file: File) => {
    if (!user) return

    setState(s => ({ ...s, status: 'parsing', error: null }))

    try {
      // Check eligibility
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

      // Parse the ZIP
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

      setState(s => ({ ...s, status: 'saving', result }))

      // Save rides — delete existing first, then insert fresh
      if (result.rides.length > 0) {
        await supabase.from('uber_rides').delete().eq('user_id', user.id)
        const ridesPayload = result.rides.map(r => ({ ...r, user_id: user.id }))

        // Insert in batches of 500
        for (let i = 0; i < ridesPayload.length; i += 500) {
          const batch = ridesPayload.slice(i, i + 500)
          const { error } = await supabase.from('uber_rides').insert(batch)
          if (error) throw new Error(`Rides insert failed: ${error.message}`)
        }
      }

      // Save Eats orders + items
      if (result.eats_orders.length > 0) {
        await supabase.from('uber_eats_items').delete().eq('user_id', user.id)
        await supabase.from('uber_eats_orders').delete().eq('user_id', user.id)

        for (const order of result.eats_orders) {
          const { items, ...orderData } = order
          const { data: insertedOrder, error: orderError } = await supabase
            .from('uber_eats_orders')
            .insert({ ...orderData, user_id: user.id })
            .select('id')
            .single()

          if (orderError) continue

          if (items.length > 0) {
            const itemsPayload = items.map(item => ({
              ...item,
              order_id: insertedOrder.id,
              user_id: user.id,
            }))
            await supabase.from('uber_eats_items').insert(itemsPayload)
          }
        }
      }

      // Update last_upload_at on profile
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
        result,
        lastUploadAt: new Date().toISOString(),
        canUpload: false,
      }))

    } catch (e: any) {
      setState(s => ({
        ...s,
        status: 'error',
        error: e.message ?? 'Something went wrong. Please try again.',
      }))
    }
  }

  return { state, upload, checkUploadEligibility }
}