/*
  # NeuropulAI Phase III: Social & Monetization Schema
  
  1. Core Tables
    - users (enhanced with social features)
    - referrals (invitation system)
    - payments (subscriptions & donations)
    - leaderboards (competitive rankings)
    - pvp_matches (duels & competitions)
    - challenges (community & individual)
    - nft_certificates (blockchain rewards)
    
  2. Security
    - RLS enabled on all tables
    - Telegram-based authentication
    - Anti-abuse protection
    
  3. Real-time Features
    - Live leaderboards
    - PvP matchmaking
    - Challenge updates
*/

-- Enhanced Users Table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tg_id text UNIQUE NOT NULL,
  username text,
  name text NOT NULL,
  avatar_url text,
  archetype text,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  daily_xp integer DEFAULT 0,
  daily_xp_date date DEFAULT CURRENT_DATE,
  subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'premium')),
  subscription_tier text DEFAULT 'none' CHECK (subscription_tier IN ('none', 'basic', 'pro', 'master')),
  trial_started_at timestamptz,
  subscription_expires_at timestamptz,
  stripe_customer_id text,
  total_donated numeric DEFAULT 0,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES users(id),
  referral_count integer DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referrals System
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'rewarded')),
  xp_earned integer DEFAULT 0,
  activated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(inviter_id, invited_id)
);

-- Payments & Subscriptions
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_id text,
  telegram_payment_id text,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  type text NOT NULL CHECK (type IN ('subscription', 'donation', 'xp_boost', 'nft_mint')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata jsonb DEFAULT '{}',
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Leaderboards (Materialized View)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('xp', 'referrals', 'donations', 'pvp_wins')),
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  score integer NOT NULL,
  rank integer NOT NULL,
  period_start date NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, period, period_start)
);

-- PvP System
CREATE TABLE IF NOT EXISTS pvp_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id uuid NOT NULL REFERENCES users(id),
  player2_id uuid NOT NULL REFERENCES users(id),
  match_type text NOT NULL CHECK (match_type IN ('quiz', 'mindmap', 'meme_battle')),
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  winner_id uuid REFERENCES users(id),
  player1_score integer DEFAULT 0,
  player2_score integer DEFAULT 0,
  xp_stake integer DEFAULT 25,
  match_data jsonb DEFAULT '{}',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- PvP Queue
CREATE TABLE IF NOT EXISTS pvp_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type text NOT NULL,
  xp_stake integer DEFAULT 25,
  skill_rating integer DEFAULT 1000,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, match_type)
);

-- Enhanced Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('daily', 'weekly', 'community', 'pvp', 'premium')),
  category text NOT NULL CHECK (category IN ('individual', 'community', 'competitive')),
  requirement jsonb NOT NULL,
  reward_xp integer NOT NULL,
  reward_nft boolean DEFAULT false,
  max_participants integer,
  current_participants integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Challenge Completions
CREATE TABLE IF NOT EXISTS challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  xp_earned integer NOT NULL,
  completion_data jsonb DEFAULT '{}',
  UNIQUE(user_id, challenge_id)
);

-- NFT Certificates
CREATE TABLE IF NOT EXISTS nft_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certificate_type text NOT NULL CHECK (certificate_type IN ('awakening', 'level_milestone', 'pvp_champion', 'referral_master', 'premium_member')),
  token_id text,
  contract_address text,
  blockchain text DEFAULT 'polygon',
  metadata_uri text,
  image_uri text,
  minted_at timestamptz,
  transaction_hash text,
  created_at timestamptz DEFAULT now()
);

-- XP Transactions (Audit Trail)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'spent', 'bonus', 'penalty')),
  source text NOT NULL CHECK (source IN ('challenge', 'pvp', 'referral', 'daily_bonus', 'premium_boost', 'admin')),
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User Sessions (for anti-abuse)
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  ip_address inet,
  user_agent text,
  telegram_data jsonb,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (tg_id = current_setting('request.tg_id', true));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (tg_id = current_setting('request.tg_id', true));

CREATE POLICY "Anyone can read leaderboards" ON leaderboard_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can read own referrals" ON referrals
  FOR SELECT USING (
    inviter_id = (SELECT id FROM users WHERE tg_id = current_setting('request.tg_id', true))
    OR invited_id = (SELECT id FROM users WHERE tg_id = current_setting('request.tg_id', true))
  );

CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE tg_id = current_setting('request.tg_id', true)));

CREATE POLICY "Users can read active challenges" ON challenges
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can read own challenge completions" ON challenge_completions
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE tg_id = current_setting('request.tg_id', true)));

CREATE POLICY "Users can read own NFTs" ON nft_certificates
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE tg_id = current_setting('request.tg_id', true)));

CREATE POLICY "Users can read own XP transactions" ON xp_transactions
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE tg_id = current_setting('request.tg_id', true)));

-- Indexes for performance
CREATE INDEX idx_users_tg_id ON users(tg_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_xp ON users(xp DESC);
CREATE INDEX idx_referrals_inviter ON referrals(inviter_id);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_leaderboard_category_period ON leaderboard_entries(category, period, rank);
CREATE INDEX idx_pvp_matches_players ON pvp_matches(player1_id, player2_id);
CREATE INDEX idx_pvp_queue_type ON pvp_queue(match_type, skill_rating);
CREATE INDEX idx_challenges_active ON challenges(is_active, type);
CREATE INDEX idx_challenge_completions_user ON challenge_completions(user_id);
CREATE INDEX idx_xp_transactions_user_date ON xp_transactions(user_id, created_at DESC);

-- Functions for referral code generation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
BEGIN
  RETURN 'REF' || UPPER(substring(gen_random_uuid()::text from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate referral code on user creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS trigger AS $$
BEGIN
  NEW.level := GREATEST(1, FLOOR(NEW.xp / 100) + 1);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF xp ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Materialized view for leaderboards
CREATE MATERIALIZED VIEW leaderboard_current AS
SELECT 
  u.id,
  u.tg_id,
  u.name,
  u.username,
  u.avatar_url,
  u.archetype,
  u.xp,
  u.level,
  u.referral_count,
  u.total_donated,
  ROW_NUMBER() OVER (ORDER BY u.xp DESC) as xp_rank,
  ROW_NUMBER() OVER (ORDER BY u.referral_count DESC) as referral_rank,
  ROW_NUMBER() OVER (ORDER BY u.total_donated DESC) as donation_rank
FROM users u
WHERE u.last_active > now() - interval '30 days'
ORDER BY u.xp DESC;

CREATE UNIQUE INDEX idx_leaderboard_current_id ON leaderboard_current(id);

-- Function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_current;
END;
$$ LANGUAGE plpgsql;