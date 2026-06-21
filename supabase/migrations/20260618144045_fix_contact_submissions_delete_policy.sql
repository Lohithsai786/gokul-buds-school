-- Add admin delete policy for contact_submissions
DROP POLICY IF EXISTS admin_delete_contact ON contact_submissions;

CREATE POLICY admin_delete_contact ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (is_admin());