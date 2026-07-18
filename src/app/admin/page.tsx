import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminPanel from "@/components/AdminPanel";
import type { Location } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const [{ data: locations }, { data: users }] = await Promise.all([
    supabase.from("locations").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, email, username").order("created_at", { ascending: false }),
  ]);

  return (
    <AdminPanel
      initialLocations={(locations as Location[]) ?? []}
      initialUsers={users ?? []}
    />
  );
}
