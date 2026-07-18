"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/lib/types";

const BUENOS_AIRES_CENTER: [number, number] = [-34.6037, -58.3816];

const hulkGreenIcon = L.divIcon({
  className: "",
  html: `
    <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="#39ff14" flood-opacity="0.9"/>
        </filter>
      </defs>
      <g filter="url(#glow)">
        <path d="M17 1C8.163 1 1 8.163 1 17c0 11 16 26 16 26s16-15 16-26C33 8.163 25.837 1 17 1z"
              fill="#39ff14" stroke="#0a0e14" stroke-width="1.5"/>
        <circle cx="17" cy="17" r="6.5" fill="#06210a"/>
      </g>
    </svg>
  `,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

function ClickCatcher({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapProps {
  locations: Location[];
  isAddMode: boolean;
  onMapClick: (lat: number, lng: number) => void;
}

export default function Map({ locations, isAddMode, onMapClick }: MapProps) {
  return (
    <MapContainer
      center={BUENOS_AIRES_CENTER}
      zoom={13}
      scrollWheelZoom
      className={isAddMode ? "cursor-crosshair" : ""}
      style={{ height: "100%", width: "100%", background: "#0a0e14" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {isAddMode && <ClickCatcher onMapClick={onMapClick} />}
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={hulkGreenIcon}>
          <Popup minWidth={320} maxWidth={360} className="hulk-popup">
            <div className="flex min-w-[300px] flex-col gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#39ff14]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_6px_#39ff14]" />
                Locación
              </span>
              {loc.location_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loc.location_image}
                  alt={loc.location_name}
                  className="h-52 w-full rounded-xl object-cover"
                />
              )}
              <span className="text-base font-semibold text-[#e7eaee]">
                {loc.location_name}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
