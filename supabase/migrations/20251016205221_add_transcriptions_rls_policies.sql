/*
  # Add RLS Policies for Transcriptions

  1. Security
    - Add policies for authenticated users to manage their own transcriptions
    - Users can only view, insert, update, and delete their own transcriptions
    - Policies check user_id matches auth.uid()
  
  2. Policies
    - SELECT: Users can view their own transcriptions
    - INSERT: Users can create transcriptions (user_id must match)
    - UPDATE: Users can update their own transcriptions
    - DELETE: Users can delete their own transcriptions
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own transcriptions" ON transcriptions;
DROP POLICY IF EXISTS "Users can insert own transcriptions" ON transcriptions;
DROP POLICY IF EXISTS "Users can update own transcriptions" ON transcriptions;
DROP POLICY IF EXISTS "Users can delete own transcriptions" ON transcriptions;

-- Create policies for authenticated users
CREATE POLICY "Users can view own transcriptions"
  ON transcriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcriptions"
  ON transcriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transcriptions"
  ON transcriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transcriptions"
  ON transcriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);