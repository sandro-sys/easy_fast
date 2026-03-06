import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isMasterUser } from "@/lib/auth-utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isMasterUser(user.email)) redirect("/dashboard");
  return <>{children}</>;
}
