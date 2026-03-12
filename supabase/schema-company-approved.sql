-- ============================================================
-- Aprovação de empresas pelo administrador
-- Execute no SQL Editor do Supabase após schema-companies.sql.
-- Empresas criadas ficam com approved = false até o admin aprovar.
-- ============================================================

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.companies.approved IS 'Apenas empresas aprovadas pelo admin podem usar as funcionalidades do sistema.';

-- IMPORTANTE: após rodar este script, aprove as empresas que já existiam para não bloquear quem já usava:
-- UPDATE public.companies SET approved = true;
