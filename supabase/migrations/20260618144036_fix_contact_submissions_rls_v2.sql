-- Fix contact_submissions admin SELECT policy to use is_admin() function
DROP POLICY IF EXISTS admin_select_contact ON contact_submissions;

CREATE POLICY admin_select_contact ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (is_admin());