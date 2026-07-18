"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import FloatingAddButton from "@/components/FloatingAddButton";
import AddLocationModal from "@/components/AddLocationModal";
import type { Location } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-background text-muted">
      Cargando mapa...
    </div>
  ),
});

interface MapAppProps {
  initialLocations: Location[];
  isLoggedIn: boolean;
}

export default function MapApp({ initialLocations, isLoggedIn }: MapAppProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [isAddMode, setIsAddMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);

  function handleMapClick(lat: number, lng: number) {
    if (!isAddMode) return;
    setPendingCoords({ lat, lng });
    setIsAddMode(false);
  }

  function handleCreated(location: Location) {
    setLocations((prev) => [...prev, location]);
    setPendingCoords(null);
  }

  return (
    <div className="relative h-dvh w-full">
      <Map locations={locations} isAddMode={isAddMode} onMapClick={handleMapClick} />

      {isLoggedIn && (
        <FloatingAddButton
          active={isAddMode}
          onClick={() => setIsAddMode((prev) => !prev)}
        />
      )}

      {isAddMode && (
        <div className="pointer-events-none fixed top-8 left-1/2 z-[1000] -translate-x-1/2 rounded-full border border-primary/40 bg-surface/95 px-4 py-2 text-sm text-primary shadow-[0_0_20px_rgba(57,255,20,0.25)]">
          Tocá el mapa para elegir dónde va la locación
        </div>
      )}

      {pendingCoords && (
        <AddLocationModal
          lat={pendingCoords.lat}
          lng={pendingCoords.lng}
          onClose={() => setPendingCoords(null)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
