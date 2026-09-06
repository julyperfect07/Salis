"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export interface Coordinates {
  lat: number;
  lng: number;
}

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 rounded-2xl" />,
});

export function LocationPicker(props: {
  value: Coordinates | null;
  onChange: (value: Coordinates) => void;
  ariaLabel?: string;
}) {
  return <LocationMap {...props} />;
}
