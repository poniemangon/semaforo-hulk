"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface AuthWidgetProps {
  username: string | null;
  isAdmin?: boolean;
}

export default function AuthWidget({ username, isAdmin }: AuthWidgetProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div className="fixed top-6 right-6 z-[1000] flex items-center gap-3 rounded-full border border-border bg-surface/90 px-4 py-2.5 text-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur">
      {username ? (
        <>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary hover:bg-primary/20"
            >
              Panel de control
            </Link>
          )}
          <span className="font-medium text-foreground">{username}</span>
          <button onClick={handleLogout} className="text-muted hover:text-foreground">
            Salir
          </button>
        </>
      ) : (
        <Link href="/login" className="font-medium text-primary hover:brightness-110">
          Iniciar sesión
        </Link>
      )}
    </div>
  );
}
