/*
# Admin policies on public.users

1. Purpose
   The admin dashboard needs to:
     - List every user (teachers, parents, admins) with their email and full_name
     - Edit a user's full_name / role / phone
   Currently public.users only has self-access policies (read_own_user, update_own_user,
   insert_own_user), so an admin viewing the Teachers or Parents page cannot see anyone
   else's email/name — the joins return null.

2. Security changes
   - Added SELECT policy "admin_read_all_users": admins can SELECT any row in public.users.
     Non-admins keep the existing read_own_user policy (only their own row).
   - Added UPDATE policy "admin_update_users": admins can UPDATE any row's full_name,
     role, phone. Non-admins keep the existing update_own_user policy (only their own row).
   - Added DELETE policy "admin_delete_users": admins can DELETE a users row. Cascade is
     handled by the FK constraint to auth.users (ON DELETE CASCADE) plus the edge function
     that removes the auth user first.

3. Notes
   - No columns added or renamed. No data migrated.
   - insert_own_user is unchanged: a new auth user still inserts their own profile row
     on signup.
*/

-- Admin can read every user row (student/teacher/parent lists need the email + name).
DROP POLICY IF EXISTS "admin_read_all_users" ON public.users;
CREATE POLICY "admin_read_all_users"
  ON public.users FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Admin can edit any user's full_name / role / phone.
DROP POLICY IF EXISTS "admin_update_users" ON public.users;
CREATE POLICY "admin_update_users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Admin can delete a public.users row (edge function deletes the auth user first).
DROP POLICY IF EXISTS "admin_delete_users" ON public.users;
CREATE POLICY "admin_delete_users"
  ON public.users FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));
