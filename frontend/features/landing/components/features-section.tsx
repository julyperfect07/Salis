"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight, MapPinned } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { DeliveryMap } from "./delivery-map";

const features = [
  {
    title: "smartAssignment",
    description: "smartAssignmentDescription",
    image: "/illustrations/salis-smart-assignment.png",
  },
  {
    title: "securePickup",
    description: "securePickupDescription",
    image: "/illustrations/salis-secure-pickup.png",
  },
  {
    title: "clearPayments",
    description: "clearPaymentsDescription",
    image: "/illustrations/salis-clear-payments.png",
  },
] as const;

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function FeaturesSection() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <section id="features" className="overflow-hidden px-3 py-8 sm:px-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border bg-card shadow-[0_30px_90px_rgba(10,60,35,0.07)]">
        <div className="grid gap-10 px-6 py-16 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-16 lg:py-20">
          <motion.div
            initial={{
              opacity: 0,
              x: isArabic ? 100 : -100,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 1.2,
              ease: smoothEase,
            }}
            className="max-w-sm sm:col-span-2 lg:col-span-1"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t("featuresEyebrow")}
            </p>

            <h2
              className={
                isArabic
                  ? "mt-3 text-3xl font-extrabold leading-[1.45]"
                  : "mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]"
              }
            >
              {t("featuresTitle")}
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {t("featuresDescription")}
            </p>
          </motion.div>

          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{
                opacity: 0,
                y: -50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.4,
              }}
              transition={{
                duration: 1.05,
                delay: 0.18 + index * 0.18,
                ease: smoothEase,
              }}
              className="group"
            >
              <motion.div
                whileHover={{
                  y: -6,
                  rotate: index === 1 ? -2 : 2,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="relative mb-6 aspect-square w-full max-w-36 overflow-hidden rounded-[1.75rem] border bg-[#fbfaf5] shadow-sm"
              >
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </motion.div>

              <h3 className="font-bold">{t(feature.title)}</h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t(feature.description)}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="grid items-stretch border-t lg:grid-cols-[1.35fr_0.65fr]">
          <motion.div
            initial={{
              opacity: 0,
              x: isArabic ? 140 : -140,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 1.35,
              ease: smoothEase,
            }}
            className="relative min-h-107.5 overflow-hidden"
          >
            <DeliveryMap />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: isArabic ? -140 : 140,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 1.35,
              delay: 0.15,
              ease: smoothEase,
            }}
            className="flex min-h-107.5 flex-col justify-center border-t p-8 lg:border-s lg:border-t-0 lg:p-12"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <MapPinned className="size-5" />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t("liveTracking")}
            </p>

            <h3
              className={
                isArabic
                  ? "mt-3 text-2xl font-extrabold leading-[1.55] sm:text-3xl"
                  : "mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-4xl"
              }
            >
              {t("liveTrackingDescription")}
            </h3>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {t("featuresDescription")}
            </p>

            <Button
              nativeButton={false}
              variant="outline"
              className="mt-8 w-fit rounded-full"
              render={<a href="#how-it-works" />}
            >
              {t("learnMore")}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
