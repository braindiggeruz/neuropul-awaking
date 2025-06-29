import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SocialUser {
  id: string;
  tg_id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  archetype?: string;
  xp: number;
  level: number;
  subscription_status: 'free' | 'trial' | 'premium';
  subscription_tier: 'none' | 'basic' | 'pro' | 'master';
  referral_code: string;
  referral_count: number;
  total_donated: number;
  last_active: string;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  archetype?: string;
  xp: number;
  level: number;
  rank: number;
  score: number;
}

export interface PvPMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  match_type: 'quiz' | 'mindmap' | 'meme_battle';
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  winner_id?: string;
  player1_score: number;
  player2_score: number;
  xp_stake: number;
  started_at?: string;
  completed_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'community' | 'pvp' | 'premium';
  category: 'individual' | 'community' | 'competitive';
  requirement: Record<string, any>;
  reward_xp: number;
  reward_nft: boolean;
  max_participants?: number;
  current_participants: number;
  is_premium: boolean;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export const useSocialEngine = (tgId?: string) => {
  const [user, setUser] = useState<SocialUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [currentMatch, setCurrentMatch] = useState<PvPMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data
  const loadUser = useCallback(async () => {
    if (!tgId) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tg_id', tgId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUser(data);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
    }
  }, [tgId]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async (category = 'xp', period = 'weekly') => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select(`
          user_id,
          score,
          rank,
          users!inner (
            name,
            username,
            avatar_url,
            archetype,
            xp,
            level
          )
        `)
        .eq('category', category)
        .eq('period', period)
        .order('rank')
        .limit(100);

      if (error) throw error;

      const formattedData = data?.map(entry => ({
        user_id: entry.user_id,
        name: entry.users.name,
        username: entry.users.username,
        avatar_url: entry.users.avatar_url,
        archetype: entry.users.archetype,
        xp: entry.users.xp,
        level: entry.users.level,
        rank: entry.rank,
        score: entry.score
      })) || [];

      setLeaderboard(formattedData);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    }
  }, []);

  // Load active challenges
  const loadChallenges = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActiveChallenges(data || []);
    } catch (err) {
      console.error('Error loading challenges:', err);
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    }
  }, []);

  // Grant XP
  const grantXP = useCallback(async (amount: number, source: string, description?: string) => {
    if (!tgId) return;

    try {
      const response = await fetch('/supabase/functions/v1/grant-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          tg_id: tgId,
          amount,
          source,
          description
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      // Update local user state
      if (user) {
        setUser({
          ...user,
          xp: result.user.xp,
          level: result.user.level
        });
      }

      return result;
    } catch (err) {
      console.error('Error granting XP:', err);
      throw err;
    }
  }, [tgId, user]);

  // Join PvP queue
  const joinPvPQueue = useCallback(async (matchType: 'quiz' | 'mindmap' | 'meme_battle', xpStake: number) => {
    if (!tgId) return;

    try {
      const response = await fetch('/supabase/functions/v1/match-pvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          tg_id: tgId,
          match_type: matchType,
          xp_stake: xpStake
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      console.error('Error joining PvP queue:', err);
      throw err;
    }
  }, [tgId]);

  // Leave PvP queue
  const leavePvPQueue = useCallback(async (matchType: string) => {
    if (!tgId) return;

    try {
      const response = await fetch(`/supabase/functions/v1/match-pvp?tg_id=${tgId}&match_type=${matchType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      console.error('Error leaving PvP queue:', err);
      throw err;
    }
  }, [tgId]);

  // Generate referral link
  const generateReferralLink = useCallback(() => {
    if (!user?.referral_code) return '';
    return `https://neuropul.ai/invite/${user.referral_code}`;
  }, [user?.referral_code]);

  // Process referral
  const processReferral = useCallback(async (referralCode: string) => {
    if (!tgId) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          inviter_id: (await supabase.from('users').select('id').eq('referral_code', referralCode).single()).data?.id,
          invited_id: user?.id,
          referral_code: referralCode,
          status: 'activated',
          activated_at: new Date().toISOString()
        });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error processing referral:', err);
      throw err;
    }
  }, [tgId, user?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!tgId) return;

    // Subscribe to leaderboard updates
    const leaderboardChannel = supabase
      .channel('leaderboard_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leaderboard_entries'
      }, () => {
        loadLeaderboard();
      })
      .subscribe();

    // Subscribe to PvP match updates
    const pvpChannel = supabase
      .channel('pvp_matches')
      .on('broadcast', { event: 'match_found' }, (payload) => {
        if (payload.payload.players.includes(user?.id)) {
          // Load match details
          supabase
            .from('pvp_matches')
            .select('*')
            .eq('id', payload.payload.match_id)
            .single()
            .then(({ data }) => {
              if (data) setCurrentMatch(data);
            });
        }
      })
      .subscribe();

    // Subscribe to challenge updates
    const challengeChannel = supabase
      .channel('challenge_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'challenges'
      }, () => {
        loadChallenges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leaderboardChannel);
      supabase.removeChannel(pvpChannel);
      supabase.removeChannel(challengeChannel);
    };
  }, [tgId, user?.id, loadLeaderboard, loadChallenges]);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadUser(),
          loadLeaderboard(),
          loadChallenges()
        ]);
      } catch (err) {
        console.error('Error initializing social engine:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (tgId) {
      initialize();
    }
  }, [tgId, loadUser, loadLeaderboard, loadChallenges]);

  return {
    user,
    leaderboard,
    activeChallenges,
    currentMatch,
    isLoading,
    error,
    grantXP,
    joinPvPQueue,
    leavePvPQueue,
    generateReferralLink,
    processReferral,
    loadLeaderboard,
    loadChallenges,
    clearError: () => setError(null)
  };
};