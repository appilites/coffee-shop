-- Loyalty Program Database Schema
-- Run this after 01-create-tables.sql

-- Add loyalty_points column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points_earned INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points_redeemed INTEGER DEFAULT 0;

-- Create loyalty_points_transactions table
CREATE TABLE IF NOT EXISTS loyalty_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points INTEGER NOT NULL, -- Positive for earned, negative for redeemed
  transaction_type TEXT NOT NULL, -- 'earned', 'redeemed', 'expired', 'bonus'
  description TEXT,
  reward_id UUID, -- Reference to redeemed reward (if applicable)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'free_drink', 'free_tea', 'discount', 'bonus_points'
  discount_percentage DECIMAL(5, 2), -- For discount rewards
  discount_amount DECIMAL(10, 2), -- For fixed discount rewards
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_rewards table (tracks redeemed rewards)
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Order where reward was used
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'used', 'expired'
  expires_at TIMESTAMPTZ, -- Optional expiration date
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order_id ON loyalty_points_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status) WHERE status = 'active';

-- Insert default rewards
INSERT INTO rewards (name, description, points_required, reward_type, is_active, display_order) VALUES
  ('Free Coffee', 'Redeem for any coffee drink', 100, 'free_drink', true, 1),
  ('Free Tea', 'Redeem for any tea drink', 100, 'free_tea', true, 2),
  ('Free Protein Drink', 'Redeem for any protein drink', 120, 'free_drink', true, 3),
  ('10% Off', 'Get 10% off your next order', 50, 'discount', true, 4),
  ('20% Off', 'Get 20% off your next order', 100, 'discount', true, 5),
  ('Free Drink (Any)', 'Redeem for any drink of your choice', 150, 'free_drink', true, 6)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE loyalty_points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_points_transactions
CREATE POLICY "Users can view own transactions" ON loyalty_points_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for rewards
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_rewards
CREATE POLICY "Users can view own rewards" ON user_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards" ON user_rewards
  FOR UPDATE USING (auth.uid() = user_id);
