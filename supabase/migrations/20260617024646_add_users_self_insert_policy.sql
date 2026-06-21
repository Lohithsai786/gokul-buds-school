-- Allow authenticated users to insert their own profile row during signup
CREATE POLICY "insert_own_user" ON users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);