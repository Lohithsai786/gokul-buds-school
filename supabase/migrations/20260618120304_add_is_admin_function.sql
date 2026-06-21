-- Create a security definer function to check admin status
-- This avoids infinite recursion because the function runs with owner privileges
-- and doesn't trigger RLS when querying the users table

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Now update policies on other tables to use this function
-- This eliminates all recursive references to users table

-- Fix admission_inquiries
DROP POLICY IF EXISTS admin_select_admission_inquiries ON admission_inquiries;
CREATE POLICY admin_select_admission_inquiries ON admission_inquiries
  FOR SELECT TO authenticated
  USING (is_admin());

-- Fix parents table
DROP POLICY IF EXISTS admin_manage_parents ON parents;
CREATE POLICY admin_manage_parents ON parents
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Fix students table  
DROP POLICY IF EXISTS admin_manage_students ON students;
CREATE POLICY admin_manage_students ON students
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Fix teachers table
DROP POLICY IF EXISTS admin_manage_teachers ON teachers;
CREATE POLICY admin_manage_teachers ON teachers
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Fix student SELECT for teacher (use is_admin function)
DROP POLICY IF EXISTS teacher_read_students ON students;
CREATE POLICY teacher_read_students ON students
  FOR SELECT TO authenticated
  USING (
    is_admin() 
    OR EXISTS (
      SELECT 1 FROM teachers t
      JOIN class_teachers ct ON ct.teacher_id = t.id
      WHERE t.user_id = auth.uid() AND ct.class_id = students.class_id
    )
  );