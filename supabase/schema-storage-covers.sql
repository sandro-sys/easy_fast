-- ============================================================
-- Bucket público para fotos de capa dos restaurantes
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Criar bucket público para capas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-images',
  'company-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Permitir leitura pública (qualquer pessoa pode ver as imagens)
CREATE POLICY "company_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-images');

-- Permitir upload apenas para usuários autenticados (na pasta covers/)
CREATE POLICY "company_images_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-images' AND (storage.foldername(name))[1] = 'covers');

-- Permitir que o dono atualize/delete o próprio arquivo
CREATE POLICY "company_images_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-images' AND owner = auth.uid());

CREATE POLICY "company_images_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-images' AND owner = auth.uid());
