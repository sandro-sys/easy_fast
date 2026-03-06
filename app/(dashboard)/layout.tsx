import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DemoBanner } from "@/components/DemoBanner";

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

  return <>{children}</>;
}
