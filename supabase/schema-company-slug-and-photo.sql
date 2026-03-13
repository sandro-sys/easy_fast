-- ============================================================
-- Slug (URL amigável) e foto de capa por restaurante
-- Execute após schema-companies.sql e schema-company-approved.sql.
-- ============================================================

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Índice único para slug (permite null para registros antigos até backfill)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug) WHERE slug IS NOT NULL;

-- Backfill: gera slug a partir do name para registros existentes (ajuste a função no app se precisar)
-- Exemplo manual: UPDATE public.companies SET slug = lower(regexp_replace(trim(name), '\s+', '-', 'g')) WHERE slug IS NULL;
COMMENT ON COLUMN public.companies.slug IS 'URL amigável: nome sem espaços, minúsculo (ex: feito-coqueiros). Deve ser único.';
COMMENT ON COLUMN public.companies.cover_image_url IS 'URL da foto de capa do restaurante (ex: Supabase Storage ou link externo).';
