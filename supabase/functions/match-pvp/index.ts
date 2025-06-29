import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-auth',
}

interface MatchRequest {
  tg_id: string
  match_type: 'quiz' | 'mindmap' | 'meme_battle'
  xp_stake: number
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

    if (req.method === 'POST') {
      // Join PvP queue
      const { tg_id, match_type, xp_stake }: MatchRequest = await req.json()

      // Get user
      const { data: user } = await supabase
        .from('users')
        .select('id, xp, level')
        .eq('tg_id', tg_id)
        .single()

      if (!user) {
        throw new Error('User not found')
      }

      if (user.xp < xp_stake) {
        throw new Error('Insufficient XP for stake')
      }

      // Calculate skill rating (simple: level * 100 + xp % 100)
      const skillRating = user.level * 100 + (user.xp % 100)

      // Check if already in queue
      const { data: existingQueue } = await supabase
        .from('pvp_queue')
        .select('id')
        .eq('user_id', user.id)
        .eq('match_type', match_type)
        .single()

      if (existingQueue) {
        throw new Error('Already in queue for this match type')
      }

      // Look for opponent with similar skill rating (±200)
      const { data: opponents } = await supabase
        .from('pvp_queue')
        .select('user_id, skill_rating')
        .eq('match_type', match_type)
        .eq('xp_stake', xp_stake)
        .gte('skill_rating', skillRating - 200)
        .lte('skill_rating', skillRating + 200)
        .neq('user_id', user.id)
        .limit(1)

      if (opponents && opponents.length > 0) {
        // Create match
        const opponent = opponents[0]
        
        const { data: match } = await supabase
          .from('pvp_matches')
          .insert({
            player1_id: user.id,
            player2_id: opponent.user_id,
            match_type,
            xp_stake,
            status: 'active',
            started_at: new Date().toISOString()
          })
          .select()
          .single()

        // Remove both players from queue
        await supabase
          .from('pvp_queue')
          .delete()
          .in('user_id', [user.id, opponent.user_id])

        // Notify via realtime
        await supabase.channel('pvp_matches').send({
          type: 'broadcast',
          event: 'match_found',
          payload: { match_id: match.id, players: [user.id, opponent.user_id] }
        })

        return new Response(
          JSON.stringify({
            success: true,
            match_found: true,
            match_id: match.id
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } else {
        // Add to queue
        await supabase
          .from('pvp_queue')
          .insert({
            user_id: user.id,
            match_type,
            xp_stake,
            skill_rating: skillRating
          })

        return new Response(
          JSON.stringify({
            success: true,
            match_found: false,
            queue_position: 1 // Simplified
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    } else if (req.method === 'DELETE') {
      // Leave queue
      const url = new URL(req.url)
      const tg_id = url.searchParams.get('tg_id')
      const match_type = url.searchParams.get('match_type')

      if (!tg_id || !match_type) {
        throw new Error('Missing parameters')
      }

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('tg_id', tg_id)
        .single()

      if (!user) {
        throw new Error('User not found')
      }

      await supabase
        .from('pvp_queue')
        .delete()
        .eq('user_id', user.id)
        .eq('match_type', match_type)

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

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