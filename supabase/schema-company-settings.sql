-- ============================================================
-- Configurações por unidade (empresa)
-- Execute após schema-companies.sql e schema-company-approved.sql.
-- Cada empresa tem seus próprios horários, limites e datas de fechamento.
-- ============================================================

-- Tabela de configurações por empresa (substitui uso global de settings para horários/limites)
CREATE TABLE IF NOT EXISTS public.company_settings (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (company_id, key)
);

CREATE INDEX IF NOT EXISTS idx_company_settings_company ON public.company_settings(company_id);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_settings_select" ON public.company_settings FOR SELECT TO authenticated
  USING (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()) OR public.is_master_user());
CREATE POLICY "company_settings_insert" ON public.company_settings FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()) OR public.is_master_user());
CREATE POLICY "company_settings_update" ON public.company_settings FOR UPDATE TO authenticated
  USING (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()) OR public.is_master_user());
CREATE POLICY "company_settings_delete" ON public.company_settings FOR DELETE TO authenticated
  USING (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()) OR public.is_master_user());

-- closed_dates: permitir uma data por empresa (remover unique só em date)
ALTER TABLE public.closed_dates DROP CONSTRAINT IF EXISTS closed_dates_date_key;
ALTER TABLE public.closed_dates
  ADD CONSTRAINT closed_dates_company_date_key UNIQUE (company_id, date);

-- date_hour_overrides: opcional por empresa (company_id nullable para compatibilidade)
ALTER TABLE public.date_hour_overrides
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_date_hour_overrides_company ON public.date_hour_overrides(company_id);
-- Remover unique(date) se existir, para permitir (company_id, date)
ALTER TABLE public.date_hour_overrides DROP CONSTRAINT IF EXISTS date_hour_overrides_date_key;
-- Unique por empresa e data (várias empresas podem ter override na mesma data)
ALTER TABLE public.date_hour_overrides
  ADD CONSTRAINT date_hour_overrides_company_date_key UNIQUE (company_id, date);
