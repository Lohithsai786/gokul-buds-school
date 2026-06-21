/*
# Auto-create chat groups for each class + auto-membership helper

1. Purpose
   Issue 6 requires class-based groups. Instead of manually creating a group for every
   class, we:
     - Backfill a chat_groups row for each existing class (one group per class, named
       "{ClassName} Group").
     - Add a function add_class_group_member(class_id, user_id, role) that inserts a
       chat_group_member row, creating the chat_groups row first if it doesn't exist.
       This is the single source of truth for membership — the admin/teacher UI calls it.

2. New objects
   - Function public.add_class_group_member(p_class_id uuid, p_user_id uuid, p_role text)
     RETURNS void. SECURITY DEFINER so it can write to chat_groups/chat_group_members
     regardless of caller RLS (called from the edge function / admin client).
     - Finds the chat_group for the class, creates one if missing.
     - Inserts a member row if not already present.

3. Backfill
   - For every existing public.classes row that has no chat_groups row, create one.

4. Notes
   -chat_groups.created_by is set to the first admin user id (or nullable if none).
   - Idempotent: re-running does not duplicate groups or members.
   - No columns renamed or dropped.
*/

-- 1. Find a system admin user id for created_by backfill.
-- (Stored in a CTE so we can reuse it.)

-- 2. Backfill chat_groups for every class that lacks one.
INSERT INTO public.chat_groups (class_id, name, type, created_by)
SELECT
  c.id,
  c.name || ' Group',
  'class',
  (SELECT u.id FROM public.users u WHERE u.role = 'admin' ORDER BY u.created_at LIMIT 1)
FROM public.classes c
WHERE NOT EXISTS (
  SELECT 1 FROM public.chat_groups cg WHERE cg.class_id = c.id
);

-- 3. Membership helper function. SECURITY DEFINER bypasses RLS so the admin
--    frontend (anon client) can call it via .rpc() without tripping RLS loops.
CREATE OR REPLACE FUNCTION public.add_class_group_member(
  p_class_id uuid,
  p_user_id uuid,
  p_role text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_group_id uuid;
BEGIN
  -- Find or create the class group.
  SELECT id INTO v_group_id FROM chat_groups WHERE class_id = p_class_id LIMIT 1;
  IF v_group_id IS NULL THEN
    INSERT INTO chat_groups (class_id, name, type, created_by)
    VALUES (p_class_id, (SELECT name FROM classes WHERE id = p_class_id) || ' Group', 'class', p_user_id)
    RETURNING id INTO v_group_id;
  END IF;

  -- Insert membership if not already present.
  INSERT INTO chat_group_members (group_id, user_id, role)
  VALUES (v_group_id, p_user_id, p_role)
  ON CONFLICT DO NOTHING;
END;
$$;
