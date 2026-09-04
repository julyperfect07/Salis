"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

const illustrations = [
  {
    src: "/illustrations/salis-smart-assignment.png",
    alt: "Automatic delivery assignment",
    className: "start-[4%] top-[25%] size-28 sm:size-36",
    delay: 0,
    floatDuration: 8,
  },
  {
    src: "/illustrations/salis-secure-pickup.png",
    alt: "Secure order pickup",
    className: "start-1/2 top-[5%] size-40 -translate-x-1/2 sm:size-52",
    delay: 0.25,
    floatDuration: 9,
  },
  {
    src: "/illustrations/salis-clear-payments.png",
    alt: "Clear payment settlement",
    className: "end-[2%] top-[40%] size-28 sm:size-36",
    delay: 0.5,
    floatDuration: 8.5,
  },
] as const;

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function ProcessSection() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <section id="how-it-works" className="overflow-hidden px-3 py-8 sm:px-5">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border bg-card shadow-[0_30px_90px_rgba(10,60,35,0.07)]">
        <div className="pointer-events-none absolute -inset-s-28 -top-28 size-72 rounded-full border border-primary/10" />

        <div className="pointer-events-none absolute -bottom-32 inset-e-[15%] size-80 rounded-full bg-secondary/40 blur-3xl" />

        <div className="grid min-h-155 items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[0.82fr_1.18fr] lg:px-16 lg:py-24">
          <motion.div
            initial={{
              opacity: 0,
              x: isArabic ? 150 : -150,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.35,
            }}
            transition={{
              duration: 1.65,
              ease: smoothEase,
            }}
            className="relative z-10"
          >
            <motion.p
              initial={{
                opacity: 0,
                y: 18,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 1.1,
                delay: 0.45,
                ease: smoothEase,
              }}
              className="text-xs font-bold uppercase tracking-[0.2em] text-primary"
            >
              {t("processEyebrow")}
            </motion.p>

            <h2
              className={
                isArabic
                  ? "mt-4 max-w-xl text-3xl font-extrabold leading-normal sm:text-4xl lg:text-5xl"
                  : "mt-4 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl"
              }
            >
              {t("processTitle")}
            </h2>

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
                duration: 1.15,
                delay: 0.65,
                ease: smoothEase,
              }}
              className="mt-6 max-w-lg text-base leading-8 text-muted-foreground"
            >
              {t("processDescription")}
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                scaleX: 0,
              }}
              whileInView={{
                opacity: 1,
                scaleX: 1,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 1.5,
                delay: 0.85,
                ease: smoothEase,
              }}
              className="mt-10 h-px w-28 origin-start bg-primary rtl:origin-end"
            />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: isArabic ? -170 : 170,
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
              duration: 1.8,
              delay: 0.2,
              ease: smoothEase,
            }}
            className="relative min-h-87.5 sm:min-h-107.5"
          >
            <div className="absolute inset-[8%] rounded-[50%] bg-secondary/45 blur-3xl" />

            <svg
              viewBox="0 0 600 400"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
            >
              <motion.path
                d="M80 240 C175 55 365 55 525 245"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray="7 12"
                initial={{
                  pathLength: 0,
                  opacity: 0,
                }}
                whileInView={{
                  pathLength: 1,
                  opacity: 0.3,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 3,
                  delay: 0.65,
                  ease: smoothEase,
                }}
              />

              <motion.circle
                cx="80"
                cy="240"
                r="5"
                fill="var(--primary)"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 0.5, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.8,
                }}
              />

              <motion.circle
                cx="525"
                cy="245"
                r="5"
                fill="var(--primary)"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 0.5, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 2.5,
                }}
              />
            </svg>

            {illustrations.map((illustration) => (
              <motion.div
                key={illustration.src}
                initial={{
                  opacity: 0,
                  scale: 0.65,
                  y: 70,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.25,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.6 + illustration.delay,
                  ease: smoothEase,
                }}
                className={`absolute overflow-hidden rounded-full border-4 border-card bg-[#fbfaf5] shadow-xl shadow-primary/10 ${illustration.className}`}
              >
                <motion.div
                  animate={{
                    y: [0, -7, 0],
                  }}
                  transition={{
                    duration: illustration.floatDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative size-full"
                >
                  <Image
                    src={illustration.src}
                    alt={illustration.alt}
                    fill
                    sizes="208px"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
