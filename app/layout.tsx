import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { isMasterUser } from "@/lib/auth-utils";
import { getMyCompany } from "@/app/actions/companies";

export const metadata: Metadata = {
  title: "Easy & Fast - Gestão de Reservas para Restaurante",
  description: "Reservas fácil e rápido. Calendário, limites e lembretes por WhatsApp. Powered by SO.RH.IA",
};

async function getHeaderData(): Promise<{
  userEmail: string | null;
  isMaster: boolean;
  companyName: string | null;
}> {
  const supabase = await createClient();
  if (!supabase) return { userEmail: null, isMaster: false, companyName: null };
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email ?? null;
  const isMaster = isMasterUser(userEmail);
  const company = await getMyCompany();
  return { userEmail, isMaster, companyName: company?.name ?? null };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userEmail, isMaster, companyName } = await getHeaderData();

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <div className="flex min-h-screen flex-col">
          <Header userEmail={userEmail} isMaster={isMaster} companyName={companyName} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
