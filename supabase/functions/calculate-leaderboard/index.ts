import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Refresh materialized view
    await supabase.rpc('refresh_leaderboard')

    // Calculate period-specific leaderboards
    const periods = ['daily', 'weekly', 'monthly']
    const categories = ['xp', 'referrals', 'donations', 'pvp_wins']

    for (const period of periods) {
      for (const category of categories) {
        let dateFilter = ''
        let periodStart = ''

        switch (period) {
          case 'daily':
            dateFilter = "created_at >= CURRENT_DATE"
            periodStart = new Date().toISOString().split('T')[0]
            break
          case 'weekly':
            dateFilter = "created_at >= date_trunc('week', CURRENT_DATE)"
            const weekStart = new Date()
            weekStart.setDate(weekStart.getDate() - weekStart.getDay())
            periodStart = weekStart.toISOString().split('T')[0]
            break
          case 'monthly':
            dateFilter = "created_at >= date_trunc('month', CURRENT_DATE)"
            const monthStart = new Date()
            monthStart.setDate(1)
            periodStart = monthStart.toISOString().split('T')[0]
            break
        }

        let query = ''
        switch (category) {
          case 'xp':
            query = `
              SELECT 
                u.id as user_id,
                COALESCE(SUM(xt.amount), 0) as score
              FROM users u
              LEFT JOIN xp_transactions xt ON u.id = xt.user_id 
                AND xt.type = 'earned' 
                AND ${dateFilter}
              GROUP BY u.id
              ORDER BY score DESC
            `
            break
          case 'referrals':
            query = `
              SELECT 
                u.id as user_id,
                COUNT(r.id) as score
              FROM users u
              LEFT JOIN referrals r ON u.id = r.inviter_id 
                AND r.status = 'activated'
                AND ${dateFilter.replace('created_at', 'r.activated_at')}
              GROUP BY u.id
              ORDER BY score DESC
            `
            break
          case 'donations':
            query = `
              SELECT 
                u.id as user_id,
                COALESCE(SUM(p.amount), 0) as score
              FROM users u
              LEFT JOIN payments p ON u.id = p.user_id 
                AND p.type = 'donation' 
                AND p.status = 'completed'
                AND ${dateFilter.replace('created_at', 'p.created_at')}
              GROUP BY u.id
              ORDER BY score DESC
            `
            break
          case 'pvp_wins':
            query = `
              SELECT 
                u.id as user_id,
                COUNT(pm.id) as score
              FROM users u
              LEFT JOIN pvp_matches pm ON u.id = pm.winner_id 
                AND pm.status = 'completed'
                AND ${dateFilter.replace('created_at', 'pm.completed_at')}
              GROUP BY u.id
              ORDER BY score DESC
            `
            break
        }

        // Execute query and update leaderboard entries
        const { data: results } = await supabase.rpc('execute_sql', { sql: query })
        
        if (results) {
          // Clear existing entries for this period/category
          await supabase
            .from('leaderboard_entries')
            .delete()
            .eq('category', category)
            .eq('period', period)
            .eq('period_start', periodStart)

          // Insert new entries
          const entries = results.map((result: any, index: number) => ({
            user_id: result.user_id,
            category,
            period,
            score: result.score,
            rank: index + 1,
            period_start: periodStart
          }))

          if (entries.length > 0) {
            await supabase
              .from('leaderboard_entries')
              .insert(entries)
          }
        }
      }
    }

    // Distribute weekly rewards
    if (new Date().getDay() === 1) { // Monday
      await distributeWeeklyRewards(supabase)
    }

    return new Response(
      JSON.stringify({ success: true, updated_at: new Date().toISOString() }),
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

async function distributeWeeklyRewards(supabase: any) {
  // Get top performers from last week
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  const lastWeekStart = lastWeek.toISOString().split('T')[0]

  const { data: topXP } = await supabase
    .from('leaderboard_entries')
    .select('user_id, rank')
    .eq('category', 'xp')
    .eq('period', 'weekly')
    .eq('period_start', lastWeekStart)
    .lte('rank', 100)
    .order('rank')

  if (topXP) {
    for (const entry of topXP) {
      let reward = 0
      let nftReward = false

      if (entry.rank === 1) {
        reward = 500
        nftReward = true
      } else if (entry.rank <= 10) {
        reward = 200
      } else if (entry.rank <= 100) {
        reward = 50
      }

      if (reward > 0) {
        // Grant XP reward
        await supabase.rpc('grant_xp_internal', {
          user_id: entry.user_id,
          amount: reward,
          source: 'leaderboard_reward',
          description: `Weekly leaderboard rank ${entry.rank} reward`
        })

        // Grant NFT for #1
        if (nftReward) {
          await supabase
            .from('nft_certificates')
            .insert({
              user_id: entry.user_id,
              certificate_type: 'pvp_champion',
              metadata_uri: `https://neuropul.ai/nft/weekly-champion-${lastWeekStart}`
            })
        }
      }
    }
  }
}