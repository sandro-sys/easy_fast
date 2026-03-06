import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DemoBanner } from "@/components/DemoBanner";
import { getMyCompany } from "@/app/actions/companies";
import { isMasterUser } from "@/lib/auth-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <>
        <DemoBanner />
        {children}
      </>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company = await getMyCompany();
  const isMaster = isMasterUser(user.email);
  if (!company && !isMaster) redirect("/onboarding");

  return <>{children}</>;
}
