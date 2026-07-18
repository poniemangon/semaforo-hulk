"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AdminUserForm from "@/components/AdminUserForm";
import type { Location } from "@/lib/types";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full items-center justify-center rounded-lg border border-border bg-surface-2 text-sm text-muted">
      Cargando mapa...
    </div>
  ),
});

const BUENOS_AIRES_CENTER = { lat: -34.6037, lng: -58.3816 };

interface AdminUser {
  id: string;
  email: string;
  username: string;
}

interface AdminPanelProps {
  initialLocations: Location[];
  initialUsers: AdminUser[];
}

export default function AdminPanel({ initialLocations, initialUsers }: AdminPanelProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [name, setName] = useState("");
  const [coords, setCoords] = useState(BUENOS_AIRES_CENTER);
  const [latText, setLatText] = useState(String(BUENOS_AIRES_CENTER.lat));
  const [lngText, setLngText] = useState(String(BUENOS_AIRES_CENTER.lng));
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleLatText(value: string) {
    setLatText(value);
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setCoords((prev) => ({ ...prev, lat: parsed }));
    }
  }

  function handleLngText(value: string) {
    setLngText(value);
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setCoords((prev) => ({ ...prev, lng: parsed }));
    }
  }

  function handleMapChange(lat: number, lng: number) {
    setCoords({ lat, lng });
    setLatText(lat.toFixed(6));
    setLngText(lng.toFixed(6));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Poné un nombre.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Tenés que estar logueado.");
      setSaving(false);
      return;
    }

    let imageUrl: string | null = null;

    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
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
      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from("locations")
      .insert({
        lat: coords.lat,
        lng: coords.lng,
        location_name: name.trim(),
        location_image: imageUrl,
        user_id: user.id,
      })
      .select()
      .single();

    setSaving(false);

    if (insertError || !data) {
      setError(insertError?.message ?? "No se pudo guardar.");
      return;
    }

    setLocations((prev) => [data as Location, ...prev]);
    setName("");
    setFile(null);
    setCoords(BUENOS_AIRES_CENTER);
    setLatText(String(BUENOS_AIRES_CENTER.lat));
    setLngText(String(BUENOS_AIRES_CENTER.lng));
  }

  async function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    const supabase = createClient();

    const { error: deleteError } = await supabase.from("locations").delete().eq("id", id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  }

  return (
    <main className="min-h-dvh w-full bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
              <Image src="/logo-mark.png" alt="Semáforo Hulk" width={36} height={36} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Panel de control</h1>
              <p className="text-xs text-muted">Semáforo Hulk · Buenos Aires</p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:border-primary hover:text-primary"
          >
            ← Volver al mapa
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-5">
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] lg:col-span-2 lg:self-start"
        >
          <h2 className="text-sm font-semibold tracking-wide text-muted">
            AGREGAR LOCACIÓN
          </h2>
          <input
            type="text"
            placeholder="Nombre del punto"
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
              className="mt-1 block w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-foreground"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Latitud"
              value={latText}
              onChange={(e) => handleLatText(e.target.value)}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Longitud"
              value={lngText}
              onChange={(e) => handleLngText(e.target.value)}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-muted">
              Tocá el mapa (o arrastrá el pin) para elegir el punto — si escribís lat/lng arriba,
              el pin se mueve solo.
            </p>
            <LocationPicker lat={coords.lat} lng={coords.lng} onChange={handleMapChange} />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:brightness-105 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar punto"}
          </button>
        </form>

        <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-[0_0_30px_rgba(0,0,0,0.3)] lg:col-span-3">
          <h2 className="border-b border-border px-6 py-4 text-sm font-semibold tracking-wide text-muted">
            {locations.length} LOCACIONES
          </h2>
          <ul className="divide-y divide-border">
            {locations.map((loc) => (
              <li key={loc.id} className="flex items-center gap-4 px-6 py-3.5">
                {loc.location_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loc.location_image}
                    alt={loc.location_name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-surface-2" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {loc.location_name}
                  </p>
                  <p className="text-xs text-muted">
                    {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(loc.id)}
                  disabled={deletingId === loc.id}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
                >
                  {deletingId === loc.id ? "..." : "Quitar"}
                </button>
              </li>
            ))}
            {locations.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-muted">
                No hay locaciones todavía.
              </li>
            )}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <AdminUserForm initialUsers={initialUsers} />
        </div>
      </div>
    </main>
  );
}
