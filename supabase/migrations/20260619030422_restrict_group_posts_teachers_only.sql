/*
# Restrict group message posting to teachers and admins

1. Purpose
   Issue 6 requires: "Teachers can post. Parents can view. Admin can monitor all groups."
   The current member_post_messages policy allows ANY group member (including parents)
   to post messages. This change restricts message INSERT to users whose role is
   'admin' or 'teacher' AND who are members of the target group.

2. Security changes
   - Replace member_post_messages INSERT policy: posts allowed only when the sender's
     public.users.role is 'admin' or 'teacher' AND the sender is a member of the group.

3. Notes
   - Messages can still be read by any group member (member_read_messages unchanged).
   - admin_full_messages (FOR ALL) already gives admins unconditional access.
*/

DROP POLICY IF EXISTS "member_post_messages" ON public.messages;
CREATE POLICY "member_post_messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
    AND (
      group_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.chat_group_members cgm
        WHERE cgm.group_id = messages.group_id AND cgm.user_id = auth.uid()
      )
    )
  );

-- Also allow teachers/admins to add group members (for auto-membership on class assignment).
DROP POLICY IF EXISTS "teacher_admin_add_group_members" ON public.chat_group_members;
CREATE POLICY "teacher_admin_add_group_members"
  ON public.chat_group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
    AND EXISTS (
      SELECT 1 FROM public.chat_groups cg
      WHERE cg.id = chat_group_members.group_id
    )
  );

-- Admin can read announcements; teachers can create announcements for their classes.
DROP POLICY IF EXISTS "teacher_create_announcements" ON public.announcements;
CREATE POLICY "teacher_create_announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
  );

DROP POLICY IF EXISTS "teacher_update_announcements" ON public.announcements;
CREATE POLICY "teacher_update_announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
  );

DROP POLICY IF EXISTS "teacher_delete_announcements" ON public.announcements;
CREATE POLICY "teacher_delete_announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
  );
