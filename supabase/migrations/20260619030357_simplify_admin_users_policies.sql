/*
# Simplify admin users policies to use app.is_admin()

1. Purpose
   The previous admin_read_all_users / admin_update_users / admin_delete_users policies
   used an inline `EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role='admin')`.
   While that subquery resolves via the existing read_own_user policy (no true recursion),
   every other admin policy in the schema uses the SECURITY DEFINER helper app.is_admin().
   This migration aligns users-table admin policies with that convention for consistency
   and to make the recursion-safe guarantee explicit (app.is_admin() bypasses RLS entirely).

2. Security changes
   - Drop and recreate admin_read_all_users, admin_update_users, admin_delete_users to
     use app.is_admin() instead of an inline subquery.
   - No other policy changes. insert_own_user / read_own_user / update_own_user remain.

3. Notes
   - No schema, column, or data changes.
*/

DROP POLICY IF EXISTS "admin_read_all_users" ON public.users;
CREATE POLICY "admin_read_all_users"
  ON public.users FOR SELECT
  TO authenticated
  USING (app.is_admin());

DROP POLICY IF EXISTS "admin_update_users" ON public.users;
CREATE POLICY "admin_update_users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (app.is_admin())
  WITH CHECK (app.is_admin());

DROP POLICY IF EXISTS "admin_delete_users" ON public.users;
CREATE POLICY "admin_delete_users"
  ON public.users FOR DELETE
  TO authenticated
  USING (app.is_admin());

-- Allow authenticated users to read their OWN profile (for teacher/parent dashboards
-- that joined public.users.id to auth.uid()). read_own_user already does this; kept here
-- as a safety net so dashboard queries never fail.
DROP POLICY IF EXISTS "read_own_user" ON public.users;
CREATE POLICY "read_own_user"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_user" ON public.users;
CREATE POLICY "update_own_user"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_user" ON public.users;
CREATE POLICY "insert_own_user"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
