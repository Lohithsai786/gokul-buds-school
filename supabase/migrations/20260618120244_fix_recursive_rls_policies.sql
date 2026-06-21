-- Fix infinite recursion in RLS policies
-- The problem: policies referencing users table to check admin role cause recursion
-- Solution: Remove recursive policies and use direct auth.uid() checks

-- 1. DROP THE RECURSIVE admin_full_users POLICY (causes infinite recursion)
DROP POLICY IF EXISTS admin_full_users ON users;

-- 2. Keep simple self-access policies on users (they already exist but let's ensure they're there)
-- These don't cause recursion because they use auth.uid() directly, not a subquery on users

-- 3. Fix admission_inquiries policies
DROP POLICY IF EXISTS admin_select_admission_inquiries ON admission_inquiries;

-- Create a non-recursive admin check for admission_inquiries
-- We check if the authenticated user's ID matches an admin record directly
CREATE POLICY admin_select_admission_inquiries ON admission_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 4. Fix parents table - remove recursive admin policy
DROP POLICY IF EXISTS admin_full_parents ON parents;

-- Admin can manage parents using direct ID check (no self-reference)
CREATE POLICY admin_manage_parents ON parents
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- 5. Fix students table - remove recursive admin policy
DROP POLICY IF EXISTS admin_full_students ON students;

-- Admin can manage students
CREATE POLICY admin_manage_students ON students
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Also fix the student SELECT for parents which joins users
DROP POLICY IF EXISTS parent_read_own_students ON students;

-- Parent reads own child's student record
CREATE POLICY parent_read_own_students ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents p
      WHERE p.user_id = auth.uid()
      AND p.student_id = students.id
    )
  );

-- 6. Fix teachers table policies
DROP POLICY IF EXISTS admin_delete_teachers ON teachers;
DROP POLICY IF EXISTS admin_modify_teachers ON teachers;
DROP POLICY IF EXISTS admin_update_teachers ON teachers;

-- Admin can manage teachers
CREATE POLICY admin_manage_teachers ON teachers
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Teachers can read their own record
CREATE POLICY teacher_read_own ON teachers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());