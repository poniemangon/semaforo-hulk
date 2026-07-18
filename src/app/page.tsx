import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import MapApp from "@/components/MapApp";
import AuthWidget from "@/components/AuthWidget";
import type { Location } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: locations }, { data: userData }] = await Promise.all([
    supabase.from("locations").select("*").order("created_at", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  let username: string | null = null;
  let isAdmin = false;
  if (userData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", userData.user.id)
      .single();
    username = profile?.username ?? userData.user.email ?? "Usuario";
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <main className="h-dvh w-full">
      <div className="fixed top-6 left-6 z-[1000] flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-surface/90 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur">
        <Image src="/logo-mark.png" alt="Semáforo Hulk" width={44} height={44} />
      </div>
      <AuthWidget username={username} isAdmin={isAdmin} />
      <MapApp initialLocations={(locations as Location[]) ?? []} isLoggedIn={!!userData.user} />
    </main>
  );
}
