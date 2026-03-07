-- ============================================================
-- Horários de atendimento por dia da semana e exceções por data
-- Execute após schema.sql e schema-companies.sql (se usar companies).
-- weekly_hours: em settings (key = 'weekly_hours', value = JSON).
-- date_hour_overrides: horário específico em uma data.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.date_hour_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  open_time text NOT NULL,
  close_time text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_date_hour_overrides_date ON public.date_hour_overrides(date);

ALTER TABLE public.date_hour_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "date_hour_overrides_select" ON public.date_hour_overrides FOR SELECT TO authenticated USING (true);
CREATE POLICY "date_hour_overrides_insert" ON public.date_hour_overrides FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "date_hour_overrides_update" ON public.date_hour_overrides FOR UPDATE TO authenticated USING (true);
CREATE POLICY "date_hour_overrides_delete" ON public.date_hour_overrides FOR DELETE TO authenticated USING (true);
