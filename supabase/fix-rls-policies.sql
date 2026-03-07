-- ============================================================
-- Ajuste de RLS: remove políticas "Always True" (Security Advisor)
-- Execute no SQL Editor do Supabase APÓS:
--   schema.sql, schema-companies.sql e schema-hours.sql (se usar).
-- Requer a função public.is_master_user() (criada em schema-companies.sql).
-- ============================================================

-- Helper: usuário é dono da empresa da linha (ou master)
-- Reservations: ver apenas da minha empresa, ou criadas por mim sem empresa, ou master
DROP POLICY IF EXISTS "reservations_select" ON public.reservations;
DROP POLICY IF EXISTS "reservations_insert" ON public.reservations;
DROP POLICY IF EXISTS "reservations_update" ON public.reservations;
DROP POLICY IF EXISTS "reservations_delete" ON public.reservations;

CREATE POLICY "reservations_select" ON public.reservations FOR SELECT TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NOT NULL AND company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
    OR (company_id IS NULL AND created_by = auth.uid())
  );
CREATE POLICY "reservations_insert" ON public.reservations FOR INSERT TO authenticated
  WITH CHECK (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );
CREATE POLICY "reservations_update" ON public.reservations FOR UPDATE TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NOT NULL AND company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
    OR (company_id IS NULL AND created_by = auth.uid())
  );
CREATE POLICY "reservations_delete" ON public.reservations FOR DELETE TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NOT NULL AND company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
    OR (company_id IS NULL AND created_by = auth.uid())
  );

-- Settings: por empresa ou global (company_id NULL) ou master
DROP POLICY IF EXISTS "settings_select" ON public.settings;
DROP POLICY IF EXISTS "settings_insert" ON public.settings;
DROP POLICY IF EXISTS "settings_update" ON public.settings;
DROP POLICY IF EXISTS "settings_delete" ON public.settings;

CREATE POLICY "settings_select" ON public.settings FOR SELECT TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );
CREATE POLICY "settings_insert" ON public.settings FOR INSERT TO authenticated
  WITH CHECK (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );
CREATE POLICY "settings_update" ON public.settings FOR UPDATE TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );
CREATE POLICY "settings_delete" ON public.settings FOR DELETE TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );

-- Closed dates: por empresa ou global ou master
DROP POLICY IF EXISTS "closed_dates_select" ON public.closed_dates;
DROP POLICY IF EXISTS "closed_dates_insert" ON public.closed_dates;
DROP POLICY IF EXISTS "closed_dates_update" ON public.closed_dates;
DROP POLICY IF EXISTS "closed_dates_delete" ON public.closed_dates;

CREATE POLICY "closed_dates_select" ON public.closed_dates FOR SELECT TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );
CREATE POLICY "closed_dates_insert" ON public.closed_dates FOR INSERT TO authenticated
  WITH CHECK (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );
CREATE POLICY "closed_dates_update" ON public.closed_dates FOR UPDATE TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );
CREATE POLICY "closed_dates_delete" ON public.closed_dates FOR DELETE TO authenticated
  USING (
    public.is_master_user()
    OR (company_id IS NULL)
    OR (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
  );

-- Plans: leitura pública (anon + authenticated); escrita só master
DROP POLICY IF EXISTS "plans_select" ON public.plans;
DROP POLICY IF EXISTS "plans_select_anon" ON public.plans;
DROP POLICY IF EXISTS "plans_insert" ON public.plans;
DROP POLICY IF EXISTS "plans_update" ON public.plans;
DROP POLICY IF EXISTS "plans_delete" ON public.plans;

CREATE POLICY "plans_select" ON public.plans FOR SELECT TO authenticated
  USING (active IS NOT NULL);
CREATE POLICY "plans_select_anon" ON public.plans FOR SELECT TO anon
  USING (active IS NOT NULL);
CREATE POLICY "plans_insert" ON public.plans FOR INSERT TO authenticated
  WITH CHECK (public.is_master_user());
CREATE POLICY "plans_update" ON public.plans FOR UPDATE TO authenticated
  USING (public.is_master_user());
CREATE POLICY "plans_delete" ON public.plans FOR DELETE TO authenticated
  USING (public.is_master_user());

-- Date hour overrides: leitura para autenticados; escrita só master
-- (Se não usa schema-hours.sql, comente o bloco abaixo.)
DROP POLICY IF EXISTS "date_hour_overrides_select" ON public.date_hour_overrides;
DROP POLICY IF EXISTS "date_hour_overrides_insert" ON public.date_hour_overrides;
DROP POLICY IF EXISTS "date_hour_overrides_update" ON public.date_hour_overrides;
DROP POLICY IF EXISTS "date_hour_overrides_delete" ON public.date_hour_overrides;

CREATE POLICY "date_hour_overrides_select" ON public.date_hour_overrides FOR SELECT TO authenticated
  USING (date IS NOT NULL);
CREATE POLICY "date_hour_overrides_insert" ON public.date_hour_overrides FOR INSERT TO authenticated
  WITH CHECK (public.is_master_user());
CREATE POLICY "date_hour_overrides_update" ON public.date_hour_overrides FOR UPDATE TO authenticated
  USING (public.is_master_user());
CREATE POLICY "date_hour_overrides_delete" ON public.date_hour_overrides FOR DELETE TO authenticated
  USING (public.is_master_user());
