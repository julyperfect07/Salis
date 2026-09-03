"use client";

import worldMap from "@svg-maps/world";
import { motion } from "motion/react";
import { MapPin, PackageCheck, Store, Truck } from "lucide-react";
import { useTranslations } from "next-intl";

const mapMarkers = [
  {
    id: "SL-2846",
    label: "Dana Ahmad",
    status: "inProgress",
    icon: Truck,
    position: {
      left: "57%",
      top: "48%",
    },
    size: "large",
    delay: 0,
  },
  {
    id: "SL-2847",
    label: "Omar Khaled",
    status: "delivered",
    icon: PackageCheck,
    position: {
      left: "47%",
      top: "31%",
    },
    size: "small",
    delay: 0.2,
  },
  {
    id: "SL-2848",
    label: "Yousef Ali",
    status: "pending",
    icon: MapPin,
    position: {
      left: "25%",
      top: "42%",
    },
    size: "medium",
    delay: 0.4,
  },
  {
    id: "SL-2849",
    label: "Salis Shop",
    status: "pending",
    icon: Store,
    position: {
      left: "75%",
      top: "39%",
    },
    size: "small",
    delay: 0.6,
  },
  {
    id: "SL-2850",
    label: "East Express",
    status: "inProgress",
    icon: Truck,
    position: {
      left: "38%",
      top: "68%",
    },
    size: "small",
    delay: 0.8,
  },
] as const;

const markerSizes = {
  small: "size-11",
  medium: "size-14",
  large: "size-20",
};

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function DeliveryMap() {
  const t = useTranslations("Landing");

  return (
    <div className="relative flex min-h-107.5 w-full items-center justify-center overflow-hidden bg-card px-4 py-12 sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--secondary),transparent_65%)] opacity-60" />

      <motion.svg
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 1.3,
          ease: smoothEase,
        }}
        viewBox={worldMap.viewBox}
        role="img"
        aria-label="Salis delivery network map"
        className="relative h-auto w-full max-w-4xl text-primary/15"
      >
        <g fill="currentColor" stroke="var(--card)" strokeWidth="0.35">
          {worldMap.locations.map((location) => (
            <path key={location.id} id={location.id} d={location.path} />
          ))}
        </g>
      </motion.svg>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-[12%] size-[76%]"
      >
        <motion.path
          d="M 25 42 C 35 26, 46 27, 57 48 S 69 48, 75 39"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="0.45"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.45 }}
          viewport={{ once: true }}
          transition={{
            duration: 2.2,
            delay: 0.45,
            ease: smoothEase,
          }}
        />

        <motion.path
          d="M 38 68 C 43 60, 50 55, 57 48"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="0.45"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.35 }}
          viewport={{ once: true }}
          transition={{
            duration: 1.8,
            delay: 0.8,
            ease: smoothEase,
          }}
        />
      </svg>

      {mapMarkers.map((marker, index) => {
        const Icon = marker.icon;

        return (
          <motion.div
            key={marker.id}
            initial={{
              opacity: 0,
              scale: 0.5,
              y: 60,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 1,
              delay: 0.45 + marker.delay,
              ease: smoothEase,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={marker.position}
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 5 + index * 0.45,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="group relative"
            >
              <div
                className={`relative z-10 flex ${
                  markerSizes[marker.size]
                } items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground shadow-xl shadow-primary/20`}
              >
                <Icon className="size-[42%]" />
              </div>

              <span className="absolute inset-s-1/2 top-[85%] h-8 w-px -translate-x-1/2 bg-linear-to-b from-primary/60 to-transparent" />

              <span className="absolute inset-s-1/2 top-[calc(85%+1.8rem)] size-2 -translate-x-1/2 rounded-full bg-primary/40" />

              <div className="pointer-events-none absolute inset-s-1/2 top-full z-20 mt-7 w-max -translate-x-1/2 rounded-full border bg-card px-3 py-1.5 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-[10px] font-bold">{marker.id}</p>
                <p className="text-[9px] text-muted-foreground">
                  {marker.label} · {t(marker.status)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
