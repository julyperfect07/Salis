"use client";

import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import type { LatLngExpression } from "leaflet";

interface LocationMapProps { value: { lat: number; lng: number } | null; onChange: (value: { lat: number; lng: number }) => void }

function ClickHandler({ onChange }: Pick<LocationMapProps, "onChange">) {
  useMapEvents({ click: (event) => onChange({ lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.lng.toFixed(6)) }) });
  return null;
}

function Recenter({ value }: { value: LocationMapProps["value"] }) {
  const map = useMap();
  useEffect(() => { if (value) map.flyTo([value.lat, value.lng], 16); }, [map, value]);
  return null;
}

export default function LocationMap({ value, onChange }: LocationMapProps) {
  const center: LatLngExpression = value ? [value.lat, value.lng] : [31.9539, 35.9106];
  return <MapContainer center={center} zoom={12} scrollWheelZoom className="h-80 w-full rounded-2xl" aria-label="Customer location map">
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <ClickHandler onChange={onChange} />
    <Recenter value={value} />
    {value && <CircleMarker center={[value.lat, value.lng]} radius={10} pathOptions={{ color: "#ffffff", fillColor: "#0b8f5a", fillOpacity: 1, weight: 4 }} />}
  </MapContainer>;
}
