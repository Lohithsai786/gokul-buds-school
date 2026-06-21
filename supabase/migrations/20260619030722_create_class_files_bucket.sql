/*
# Create class-files storage bucket + policies

1. Purpose
   Issue 6 requires photo, PDF, and document sharing in class groups. We need a
   Supabase Storage bucket plus RLS policies so that:
     - Admins can upload/read/delete any class file.
     - Teachers can upload/read files in any class group (they post to their class).
     - Parents can read files but NOT upload (parents only view per Issue 6).
   Files are stored at path: class-files/{group_id}/{filename}

2. New objects
   - Storage bucket "class-files" (public read so embedded images render without signed URLs;
     writes still require authentication + RLS).

3. Security changes (storage.objects RLS)
   - authenticated_read_class_files: any authenticated user can READ objects in class-files
     (parents, teachers, admins all need to view shared photos/PDFs).
   - teacher_admin_upload_class_files: only teachers and admins can INSERT/UPDATE/DELETE
     objects. Parents cannot upload.

4. Notes
   - The bucket is public-read so <img src> and PDF links work directly in the browser.
   - Uploads still go through the authenticated supabase client, so anonymous uploads are blocked.
   - The messages.message_type column ('text'|'image'|'pdf'|'document') distinguishes content.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('class-files', 'class-files', true)
ON CONFLICT (id) DO NOTHING;

-- Read: any authenticated user (parents, teachers, admins).
DROP POLICY IF EXISTS "authenticated_read_class_files" ON storage.objects;
CREATE POLICY "authenticated_read_class_files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'class-files');

-- Upload/Update/Delete: only teachers and admins.
DROP POLICY IF EXISTS "teacher_admin_upload_class_files" ON storage.objects;
CREATE POLICY "teacher_admin_upload_class_files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'class-files'
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
  );

DROP POLICY IF EXISTS "teacher_admin_update_class_files" ON storage.objects;
CREATE POLICY "teacher_admin_update_class_files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'class-files'
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
  )
  WITH CHECK (
    bucket_id = 'class-files'
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
  );

DROP POLICY IF EXISTS "teacher_admin_delete_class_files" ON storage.objects;
CREATE POLICY "teacher_admin_delete_class_files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'class-files'
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher')
    )
  );
