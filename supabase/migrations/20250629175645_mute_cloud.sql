/*
  # Awakening Status Tracking
  
  1. Updates
    - Add awakening_status to user_profiles
    - Add pdf_generated to awakenings
    
  2. Features
    - Track awakening completion status
    - Track PDF generation status
    - Enable admin tools for troubleshooting
*/

-- Add awakening_status to user_profiles if not already added
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'awakening_status'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN awakening_status text DEFAULT 'pending' CHECK (awakening_status IN ('pending', 'completed', 'failed'));
  END IF;
END $$;

-- Add pdf_generated to awakenings if not already added
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'awakenings' AND column_name = 'pdf_generated'
  ) THEN
    ALTER TABLE awakenings
    ADD COLUMN pdf_generated boolean DEFAULT false;
  END IF;
END $$;

-- Add retry_count to awakenings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'awakenings' AND column_name = 'retry_count'
  ) THEN
    ALTER TABLE awakenings
    ADD COLUMN retry_count integer DEFAULT 0;
  END IF;
END $$;

-- Add last_retry_at to awakenings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'awakenings' AND column_name = 'last_retry_at'
  ) THEN
    ALTER TABLE awakenings
    ADD COLUMN last_retry_at timestamptz;
  END IF;
END $$;

-- Add error_message to awakenings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'awakenings' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE awakenings
    ADD COLUMN error_message text;
  END IF;
END $$;

-- Function to retry PDF generation
CREATE OR REPLACE FUNCTION retry_pdf_generation(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE awakenings
  SET 
    retry_count = retry_count + 1,
    last_retry_at = now(),
    pdf_generated = false
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset awakening
CREATE OR REPLACE FUNCTION reset_awakening(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Update user_profiles
  UPDATE user_profiles
  SET awakening_status = 'pending'
  WHERE user_id = p_user_id;
  
  -- Update awakenings
  UPDATE awakenings
  SET 
    pdf_generated = false,
    retry_count = 0,
    last_retry_at = NULL,
    error_message = NULL
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;