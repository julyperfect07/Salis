"use client";

import { useEffect } from "react";
import type { LatLngExpression } from "leaflet";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Coordinates } from "./location-picker";

interface LocationMapProps {
  value: Coordinates | null;
  onChange: (value: Coordinates) => void;
  ariaLabel?: string;
}

function ClickHandler({ onChange }: Pick<LocationMapProps, "onChange">) {
  useMapEvents({
    click: ({ latlng }) =>
      onChange({
        lat: Number(latlng.lat.toFixed(6)),
        lng: Number(latlng.lng.toFixed(6)),
      }),
  });
  return null;
}

function Recenter({ value }: { value: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.flyTo([value.lat, value.lng], 16);
  }, [map, value]);
  return null;
}

export default function LocationMap({ value, onChange, ariaLabel = "Location map" }: LocationMapProps) {
  const center: LatLngExpression = value ? [value.lat, value.lng] : [31.9539, 35.9106];
  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom className="h-80 w-full rounded-2xl" aria-label={ariaLabel}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onChange={onChange} />
      <Recenter value={value} />
      {value && <CircleMarker center={[value.lat, value.lng]} radius={10} pathOptions={{ color: "#ffffff", fillColor: "#0b8f5a", fillOpacity: 1, weight: 4 }} />}
    </MapContainer>
  );
}
