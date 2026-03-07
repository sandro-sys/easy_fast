-- ============================================================
-- Empresas (multi-tenant) e vínculo com usuário
-- Execute APÓS o schema.sql principal. Adiciona tabela companies
-- e coluna company_id nas tabelas existentes.
-- ============================================================

-- Tabela de empresas (uma por usuário dono)
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text,
  address text,
  whatsapp_number text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON public.companies(owner_id);

-- Adicionar company_id às tabelas existentes (nullable para compatibilidade)
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.closed_dates ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reservations_company ON public.reservations(company_id);
CREATE INDEX IF NOT EXISTS idx_settings_company ON public.settings(company_id);
CREATE INDEX IF NOT EXISTS idx_closed_dates_company ON public.closed_dates(company_id);

-- RLS para companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário atual é master (painel admin)
CREATE OR REPLACE FUNCTION public.is_master_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt()->>'email') IS NOT NULL
    AND lower(auth.jwt()->>'email') = 'sandro@rhumarh.com',
    false
  );
$$;

-- Usuário vê apenas a própria empresa; master vê todas (para painel admin)
CREATE POLICY "companies_select_own" ON public.companies FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "companies_select_master" ON public.companies FOR SELECT TO authenticated USING (public.is_master_user());
CREATE POLICY "companies_insert_own" ON public.companies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "companies_update_own" ON public.companies FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "companies_delete_own" ON public.companies FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Para políticas RLS restritivas (evitar avisos do Security Advisor), execute depois:
--   supabase/fix-rls-policies.sql
