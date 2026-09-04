"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import BlurText from "@/components/BlurText";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const roles = {
  shopOwner: {
    label: "shopOwner",
    description: "shopOwnerDescription",
    features: [
      "shopOwnerFeatureOne",
      "shopOwnerFeatureTwo",
      "shopOwnerFeatureThree",
    ],
    image: "/illustrations/salis-smart-assignment.png",
  },
  deliveryCompany: {
    label: "deliveryCompany",
    description: "deliveryCompanyDescription",
    features: ["companyFeatureOne", "companyFeatureTwo", "companyFeatureThree"],
    image: "/illustrations/salis-clear-payments.png",
  },
  driver: {
    label: "driver",
    description: "driverDescription",
    features: ["driverFeatureOne", "driverFeatureTwo", "driverFeatureThree"],
    image: "/illustrations/salis-hero-rider.png",
  },
  admin: {
    label: "admin",
    description: "adminDescription",
    features: ["adminFeatureOne", "adminFeatureTwo", "adminFeatureThree"],
    image: "/illustrations/salis-secure-pickup.png",
  },
} as const;

type RoleKey = keyof typeof roles;

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function RolesSection() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [selectedRole, setSelectedRole] = useState<RoleKey>("shopOwner");

  const activeRole = roles[selectedRole];

  return (
    <section id="roles" className="overflow-hidden px-3 py-8 sm:px-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border bg-card shadow-[0_30px_90px_rgba(10,60,35,0.07)]">
        <div className="px-6 pb-10 pt-16 text-center sm:px-10 lg:px-16 lg:pt-20">
          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 1.1,
              ease: smoothEase,
            }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-primary"
          >
            {t("rolesEyebrow")}
          </motion.p>

          <BlurText
            text={t("rolesTitle")}
            delay={100}
            animateBy="words"
            direction="top"
            className={
              isArabic
                ? "mx-auto mt-4 max-w-3xl justify-center text-3xl font-extrabold leading-[1.5] sm:text-4xl lg:text-5xl"
                : "mx-auto mt-4 max-w-3xl justify-center text-4xl font-extrabold leading-tight tracking-[-0.045em] sm:text-5xl"
            }
          />

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              delay: 0.45,
              ease: smoothEase,
            }}
            className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground"
          >
            {t("rolesDescription")}
          </motion.p>
        </div>

        <Tabs
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as RoleKey)}
          className="w-full px-6 pb-16 sm:px-10 lg:px-16 lg:pb-20"
        >
          <div className="-mx-6 overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
            <TabsList className="mx-auto grid h-10! w-full max-w-2xl grid-cols-4 gap-0.5 rounded-xl border bg-muted/60 p-1 shadow-inner sm:rounded-full">
              {(Object.keys(roles) as RoleKey[]).map((role) => (
                <TabsTrigger
                  key={role}
                  value={role}
                  className="
        h-8! min-w-0 rounded-lg
        px-1 py-1 text-center
        text-[10px] font-semibold leading-tight
        whitespace-normal text-muted-foreground
        transition-all duration-300
        hover:bg-card hover:text-foreground
        data-active:border-primary
        data-active:bg-primary
        data-active:text-primary-foreground
        data-active:shadow-sm
        sm:rounded-full sm:px-3 sm:text-xs
        md:text-sm
      "
                >
                  {t(roles[role].label)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.75rem] border bg-background/50 sm:mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
                transition={{
                  duration: 0.75,
                  ease: smoothEase,
                }}
                className="grid min-w-0 items-center lg:grid-cols-2"
              >
                <div className="min-w-0 p-6 sm:p-10 lg:p-14">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {t(activeRole.label)}
                  </p>

                  <h3
                    className={
                      isArabic
                        ? "mt-4 text-2xl font-extrabold leading-[1.55] sm:text-3xl"
                        : "mt-4 text-2xl font-extrabold leading-[1.25] tracking-[-0.035em] sm:text-3xl"
                    }
                  >
                    {t(activeRole.description)}
                  </h3>

                  <div className="mt-8 space-y-4">
                    {activeRole.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{
                          opacity: 0,
                          x: isArabic ? 24 : -24,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.6,
                          delay: 0.25 + index * 0.12,
                          ease: smoothEase,
                        }}
                        className="flex items-center gap-3"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                          <Check className="size-3.5" />
                        </span>

                        <span className="text-sm font-medium">
                          {t(feature)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[310px] overflow-hidden bg-[#fbfaf5] sm:min-h-[420px]">
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.92,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.95,
                      delay: 0.1,
                      ease: smoothEase,
                    }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeRole.image}
                      alt={t(activeRole.label)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </motion.div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
