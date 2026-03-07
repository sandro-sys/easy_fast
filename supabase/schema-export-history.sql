-- ============================================================
-- Histórico de exportações de leads (reservas)
-- Execute no SQL Editor do Supabase após schema.sql e schema-companies (se usar).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.export_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  date_from date NOT NULL,
  date_to date NOT NULL,
  total_rows integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_export_history_created_by ON public.export_history(created_by);
CREATE INDEX IF NOT EXISTS idx_export_history_company ON public.export_history(company_id);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON public.export_history(created_at DESC);

ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export_history_select" ON public.export_history
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "export_history_insert" ON public.export_history
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
