"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Location } from "@/lib/types";

interface AddLocationModalProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onCreated: (location: Location) => void;
}

export default function AddLocationModal({ lat, lng, onClose, onCreated }: AddLocationModalProps) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Poné un nombre para la locación.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let finalImageUrl: string | null = null;

    if (file) {
      const owner = user?.id ?? "anonymous";
      const path = `${owner}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("location-images")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("location-images")
        .getPublicUrl(path);
      finalImageUrl = publicUrlData.publicUrl;
    }

    // Generate the id client-side and skip .select(): an anonymous submitter's row
    // stays "pending" and isn't visible under the SELECT policy, so a RETURNING
    // read-back would fail RLS even though the INSERT itself succeeds.
    const id = crypto.randomUUID();

    const { error: insertError } = await supabase.from("locations").insert({
      id,
      lat,
      lng,
      location_name: name.trim(),
      location_image: finalImageUrl,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (!user) {
      setPendingNotice(true);
      return;
    }

    onCreated({
      id,
      lat,
      lng,
      location_name: name.trim(),
      location_image: finalImageUrl,
      user_id: user.id,
      approved: true,
      created_at: new Date().toISOString(),
    });
  }

  if (pendingNotice) {
    return (
      <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-[0_0_40px_rgba(57,255,20,0.1)]">
          <h2 className="mb-2 text-lg font-semibold text-foreground">¡Listo!</h2>
          <p className="text-sm text-muted">
            Tu punto quedó pendiente de aprobación. Cuando un admin lo revise y lo acepte, va a
            aparecer en el mapa para todos.
          </p>
          <button
            onClick={onClose}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(57,255,20,0.35)] hover:brightness-105"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-[0_0_40px_rgba(57,255,20,0.1)]">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Nueva locación</h2>
        <p className="mb-4 text-xs text-muted">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre de la locación"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
          />

          <label className="text-xs font-medium tracking-wide text-muted">
            FOTO (OPCIONAL)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-foreground"
            />
          </label>

          <p className="text-xs text-muted">
            Si no estás logueado, tu punto va a quedar pendiente hasta que un admin lo apruebe.
          </p>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted hover:bg-surface-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(57,255,20,0.35)] hover:brightness-105 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
