-- Fix: SECURITY DEFINER function is exposed via REST API in public schema
-- Move is_admin() to a non-public schema so it works for RLS policies
-- but is NOT exposed via /rest/v1/rpc/ endpoint

-- Create a non-public schema
CREATE SCHEMA IF NOT EXISTS app;

-- Move the function to the app schema
CREATE OR REPLACE FUNCTION app.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant authenticated access to the schema and function
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_admin() TO authenticated;

-- Revoke from public (defaults to anon)
REVOKE EXECUTE ON FUNCTION app.is_admin() FROM public;

-- Update ALL RLS policies to use the new schema function
-- admission_inquiries
DROP POLICY IF EXISTS admin_select_admission_inquiries ON admission_inquiries;
CREATE POLICY admin_select_admission_inquiries ON admission_inquiries
  FOR SELECT TO authenticated
  USING (app.is_admin());

-- parents
DROP POLICY IF EXISTS admin_manage_parents ON parents;
CREATE POLICY admin_manage_parents ON parents
  FOR ALL TO authenticated
  USING (app.is_admin())
  WITH CHECK (app.is_admin());

-- students
DROP POLICY IF EXISTS admin_manage_students ON students;
CREATE POLICY admin_manage_students ON students
  FOR ALL TO authenticated
  USING (app.is_admin())
  WITH CHECK (app.is_admin());

-- teacher_read_students
DROP POLICY IF EXISTS teacher_read_students ON students;
CREATE POLICY teacher_read_students ON students
  FOR SELECT TO authenticated
  USING (
    app.is_admin()
    OR EXISTS (
      SELECT 1 FROM teachers t
      JOIN class_teachers ct ON ct.teacher_id = t.id
      WHERE t.user_id = auth.uid() AND ct.class_id = students.class_id
    )
  );

-- teachers
DROP POLICY IF EXISTS admin_manage_teachers ON teachers;
CREATE POLICY admin_manage_teachers ON teachers
  FOR ALL TO authenticated
  USING (app.is_admin())
  WITH CHECK (app.is_admin());

-- contact_submissions
DROP POLICY IF EXISTS admin_select_contact ON contact_submissions;
CREATE POLICY admin_select_contact ON contact_submissions
  FOR SELECT TO authenticated
  USING (app.is_admin());

DROP POLICY IF EXISTS admin_delete_contact ON contact_submissions;
CREATE POLICY admin_delete_contact ON contact_submissions
  FOR DELETE TO authenticated
  USING (app.is_admin());

-- Drop the old public function (was exposed via REST API)
DROP FUNCTION IF EXISTS public.is_admin();
