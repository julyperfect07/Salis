"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const LocationMap = dynamic(() => import("./location-map"), { ssr: false, loading: () => <Skeleton className="h-80 rounded-2xl" /> });

export function LocationPicker(props: { value: { lat: number; lng: number } | null; onChange: (value: { lat: number; lng: number }) => void }) { return <LocationMap {...props} />; }
