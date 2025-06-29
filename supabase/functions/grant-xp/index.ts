import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-auth',
}

interface XPRequest {
  tg_id: string
  amount: number
  source: string
  description?: string
  metadata?: Record<string, any>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tg_id, amount, source, description, metadata = {} }: XPRequest = await req.json()

    // Validate request
    if (!tg_id || !amount || !source) {
      throw new Error('Missing required fields')
    }

    // Anti-abuse: Check daily XP limit
    const { data: user } = await supabase
      .from('users')
      .select('id, daily_xp, daily_xp_date, xp')
      .eq('tg_id', tg_id)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const today = new Date().toISOString().split('T')[0]
    const currentDailyXP = user.daily_xp_date === today ? user.daily_xp : 0
    
    // Daily cap: 250 XP, soft cap at 150 XP (50% reduction)
    let finalAmount = amount
    if (currentDailyXP >= 250) {
      throw new Error('Daily XP limit reached')
    } else if (currentDailyXP >= 150) {
      finalAmount = Math.floor(amount * 0.5)
    }

    if (currentDailyXP + finalAmount > 250) {
      finalAmount = 250 - currentDailyXP
    }

    // Set request context for RLS
    await supabase.rpc('set_config', {
      setting_name: 'request.tg_id',
      setting_value: tg_id
    })

    // Start transaction
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        xp: user.xp + finalAmount,
        daily_xp: currentDailyXP + finalAmount,
        daily_xp_date: today,
        last_active: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Log XP transaction
    await supabase
      .from('xp_transactions')
      .insert({
        user_id: user.id,
        amount: finalAmount,
        type: 'earned',
        source,
        description,
        metadata
      })

    // Check for level up
    const oldLevel = Math.floor(user.xp / 100) + 1
    const newLevel = Math.floor(updatedUser.xp / 100) + 1
    const leveledUp = newLevel > oldLevel

    // Check for NFT eligibility
    let nftEligible = false
    if (updatedUser.xp >= 500 && user.xp < 500) {
      nftEligible = true
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: updatedUser,
        xp_granted: finalAmount,
        leveled_up: leveledUp,
        new_level: newLevel,
        nft_eligible: nftEligible,
        daily_xp_remaining: 250 - (currentDailyXP + finalAmount)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})