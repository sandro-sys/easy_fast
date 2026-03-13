-- Permite que a página pública /reservar liste empresas (id, name) sem precisar de service role.
-- Execute após schema-companies.sql
CREATE POLICY "companies_select_anon" ON public.companies
  FOR SELECT TO anon
  USING (true);
