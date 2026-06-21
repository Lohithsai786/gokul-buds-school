CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public contact form)
CREATE POLICY "public_insert_contact" ON contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only authenticated admins can read
CREATE POLICY "admin_select_contact" ON contact_submissions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );