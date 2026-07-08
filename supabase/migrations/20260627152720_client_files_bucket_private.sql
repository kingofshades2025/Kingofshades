-- Create client-files bucket (private) for Next.js signed-URL vault
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('client-files', 'client-files', false, 4194304)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "client_files_select_public" ON storage.objects;
DROP POLICY IF EXISTS client_files_select_public ON storage.objects;
