"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  CircleDot,
  MapPin,
  PackageCheck,
  Truck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statistics = [
  { value: "1K+", key: "liveOrders" },
  { value: "94.8%", key: "deliveryRate" },
  { value: "850+", key: "delivered" },
  { value: "24", key: "inProgress" },
] as const;

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <section className="px-3 pb-8 pt-24 sm:px-5 sm:pt-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border bg-card shadow-[0_30px_90px_rgba(10,60,35,0.10)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -inset-e-24 -top-28 size-80 rounded-full bg-primary/8" />
          <div className="absolute inset-e-[20%] top-[18%] size-44 rounded-full border border-primary/10" />
          <div className="absolute bottom-20 inset-s-[43%] size-24 rounded-full bg-secondary/60 blur-2xl" />
        </div>

        <div className="relative grid min-h-160 items-center gap-14 px-6 pb-16 pt-16 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-16 lg:py-20">
          <motion.div
            initial={{
              opacity: 0,
              x: isArabic ? 130 : -130,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 1.25,
              delay: 0.1,
              ease: smoothEase,
            }}
            className="relative z-10 text-center lg:text-start"
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.9,
                delay: 0.45,
                ease: smoothEase,
              }}
            >
              <Badge
                variant="secondary"
                className="mb-6 rounded-full border border-primary/15 px-4 py-2 text-primary"
              >
                <CircleDot className="me-2 size-3.5" />
                {t("eyebrow")}
              </Badge>
            </motion.div>

            <h1 className="max-w-2xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[4.15rem]">
              {t("headline")}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg lg:mx-0">
              {t("description")}
            </p>

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.9,
                delay: 0.65,
                ease: smoothEase,
              }}
              className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Button
                nativeButton={false}
                size="lg"
                className="h-12 rounded-full px-7"
                render={<a href="#how-it-works" />}
              >
                {t("getStarted")}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </Button>

              <Button
                nativeButton={false}
                size="lg"
                variant="outline"
                className="h-12 rounded-full bg-card px-7"
                render={<a href="#features" />}
              >
                {t("learnMore")}
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative flex min-h-112.5 items-center justify-center">
            <motion.div
              initial={{
                opacity: 0,
                x: isArabic ? -160 : 160,
                rotate: isArabic ? -10 : 10,
              }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: isArabic ? -5 : 5,
              }}
              transition={{
                duration: 1.45,
                delay: 0.25,
                ease: smoothEase,
              }}
              className="relative z-10"
            >
              <motion.div
                animate={{
                  y: [0, -7, 0],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-65 rounded-[2.8rem] border-[7px] border-[#151a17] bg-[#151a17] p-1 shadow-[0_35px_70px_rgba(9,17,13,0.28)] sm:w-72.5"
              >
                <div className="absolute inset-s-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#151a17]" />

                <div className="overflow-hidden rounded-[2.25rem] bg-background">
                  <div className="bg-primary px-5 pb-8 pt-10 text-primary-foreground">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-75">{t("liveOrders")}</p>

                        <p className="mt-1 text-xl font-bold">#SL-2846</p>
                      </div>

                      <div className="flex size-10 items-center justify-center rounded-full bg-white/15">
                        <PackageCheck className="size-5" />
                      </div>
                    </div>
                  </div>

                  <div className="-mt-4 space-y-4 px-4 pb-5">
                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">Dana Ahmad</p>

                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            Amman East
                          </div>
                        </div>

                        <Badge className="rounded-full">
                          {t("inProgress")}
                        </Badge>
                      </div>

                      <div className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:inset-s-1.75 before:top-2 before:w-px before:bg-border">
                        <TrackingStep
                          complete
                          label={t("pending")}
                          time="10:20"
                        />

                        <TrackingStep
                          complete
                          label={t("inProgress")}
                          time="10:35"
                        />

                        <TrackingStep label={t("delivered")} time="--:--" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
                      <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                        <Truck className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          East Express
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {t("inProgress")}
                        </p>
                      </div>

                      <span className="size-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: isArabic ? -100 : 100,
                scale: 0.7,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              transition={{
                duration: 1.2,
                delay: 1,
                ease: smoothEase,
              }}
              className="absolute inset-e-0 top-[8%] hidden size-40 overflow-hidden rounded-full border-4 border-card bg-[#fbfaf5] shadow-xl sm:block lg:-inset-e-5 lg:size-48"
            >
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative size-full"
              >
                <Image
                  src="/illustrations/salis-hero-rider.png"
                  alt="Salis delivery rider"
                  fill
                  sizes="192px"
                  className="object-cover"
                  priority
                />
              </motion.div>
            </motion.div>

            <div className="absolute inset-x-[8%] bottom-[6%] h-20 rounded-[50%] bg-primary/10 blur-2xl" />
          </div>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 55,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1.1,
            delay: 1.05,
            ease: smoothEase,
          }}
          className="relative grid grid-cols-2 divide-x divide-white/15 bg-primary px-5 py-7 text-primary-foreground rtl:divide-x-reverse md:grid-cols-4"
        >
          {statistics.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.75,
                delay: 1.25 + index * 0.12,
                ease: smoothEase,
              }}
              className="px-4 py-4 text-center md:py-1"
            >
              <p className="text-2xl font-extrabold sm:text-3xl">
                {stat.value}
              </p>

              <p className="mt-1 text-xs text-white/70 sm:text-sm">
                {t(stat.key)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface TrackingStepProps {
  label: string;
  time: string;
  complete?: boolean;
}

function TrackingStep({ label, time, complete = false }: TrackingStepProps) {
  return (
    <div className="relative z-10 flex items-center gap-3">
      <span
        className={
          complete
            ? "flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
            : "size-4 rounded-full border-2 border-muted-foreground/30 bg-card"
        }
      >
        {complete && <Check className="size-2.5" />}
      </span>

      <span className="flex-1 text-xs font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground">{time}</span>
    </div>
  );
}
