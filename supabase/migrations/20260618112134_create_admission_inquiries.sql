CREATE TABLE admission_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  child_name text NOT NULL,
  child_age text NOT NULL,
  program text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admission_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_admission_inquiries" ON admission_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (
    length(trim(parent_name)) > 0 AND
    length(trim(email)) > 0 AND
    position('@' IN email) > 1 AND
    length(trim(phone)) > 0 AND
    length(trim(child_name)) > 0 AND
    length(trim(child_age)) > 0 AND
    length(trim(program)) > 0
  );

CREATE POLICY "admin_select_admission_inquiries" ON admission_inquiries FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
