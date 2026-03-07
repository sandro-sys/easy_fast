-- ============================================================
-- Plano por empresa e permissão do master editar
-- Execute após schema-companies.sql
-- ============================================================

-- Plano da empresa: trial | basic | pro
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS plan_slug text NOT NULL DEFAULT 'trial';

-- E-mail do responsável (para exibir no painel master sem usar Admin API)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS owner_email text;

-- Master pode atualizar qualquer empresa (ex.: alterar plano)
DROP POLICY IF EXISTS "companies_update_master" ON public.companies;
CREATE POLICY "companies_update_master" ON public.companies
  FOR UPDATE TO authenticated
  USING (public.is_master_user());

-- Permitir que o dono atualize a própria empresa (incl. owner_email no insert)
-- A policy "companies_update_own" já existe; master agora também pode atualizar via companies_update_master
