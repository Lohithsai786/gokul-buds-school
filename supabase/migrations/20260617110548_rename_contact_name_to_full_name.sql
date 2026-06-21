-- Rename column and update the RLS WITH CHECK to match
ALTER TABLE contact_submissions RENAME COLUMN name TO full_name;

DROP POLICY IF EXISTS "public_insert_contact" ON contact_submissions;

CREATE POLICY "public_insert_contact" ON contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (
    length(trim(full_name)) > 0 AND
    length(trim(email))     > 0 AND
    position('@' IN email)  > 1 AND
    length(trim(subject))   > 0 AND
    length(trim(message))   > 0
  );