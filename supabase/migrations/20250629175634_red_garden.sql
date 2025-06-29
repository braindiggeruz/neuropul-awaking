/*
  # Error Logging System
  
  1. New Tables
    - error_logs (centralized error tracking)
    
  2. Features
    - Structured error logging
    - Error categorization
    - User association
    - Timestamp tracking
*/

-- Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  context text NOT NULL,
  error_message text NOT NULL,
  stack_trace text,
  source text NOT NULL CHECK (source IN ('client', 'server', 'edge')),
  level text NOT NULL CHECK (level IN ('ERROR', 'WARNING', 'INFO')),
  additional_data jsonb DEFAULT '{}'::jsonb,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Add awakening_status to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS awakening_status text DEFAULT 'pending' CHECK (awakening_status IN ('pending', 'completed', 'failed'));

-- Add pdf_generated to awakenings
ALTER TABLE awakenings
ADD COLUMN IF NOT EXISTS pdf_generated boolean DEFAULT false;

-- Enable RLS on error_logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can read all error logs" ON error_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

CREATE POLICY "Users can read their own error logs" ON error_logs
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Indexes for performance
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_level ON error_logs(level);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

-- Function to log errors
CREATE OR REPLACE FUNCTION log_error(
  p_context text,
  p_error_message text,
  p_stack_trace text DEFAULT NULL,
  p_source text DEFAULT 'server',
  p_level text DEFAULT 'ERROR',
  p_user_id uuid DEFAULT NULL,
  p_additional_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_error_id uuid;
BEGIN
  INSERT INTO error_logs (
    context,
    error_message,
    stack_trace,
    source,
    level,
    user_id,
    additional_data
  ) VALUES (
    p_context,
    p_error_message,
    p_stack_trace,
    p_source,
    p_level,
    p_user_id,
    p_additional_data
  )
  RETURNING id INTO v_error_id;
  
  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;