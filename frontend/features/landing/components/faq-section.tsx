"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    value: "account",
    question: "faqAccountQuestion",
    answer: "faqAccountAnswer",
  },
  {
    value: "assignment",
    question: "faqAssignmentQuestion",
    answer: "faqAssignmentAnswer",
  },
  {
    value: "pickup",
    question: "faqPickupQuestion",
    answer: "faqPickupAnswer",
  },
  {
    value: "payment",
    question: "faqPaymentQuestion",
    answer: "faqPaymentAnswer",
  },
] as const;

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function FaqSection() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <section id="faq" className="overflow-hidden px-3 py-8 sm:px-5">
      <div className="mx-auto grid max-w-7xl gap-12 rounded-[2rem] border bg-card px-6 py-16 shadow-[0_30px_90px_rgba(10,60,35,0.07)] sm:px-10 lg:grid-cols-[0.75fr_1.25fr] lg:px-16 lg:py-20">
        <motion.div
          initial={{
            opacity: 0,
            x: isArabic ? 130 : -130,
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
            duration: 1.5,
            ease: smoothEase,
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t("faqEyebrow")}
          </p>

          <h2
            className={
              isArabic
                ? "mt-4 text-3xl font-extrabold leading-normal sm:text-4xl"
                : "mt-4 text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl"
            }
          >
            {t("faqTitle")}
          </h2>

          <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
            {t("faqDescription")}
          </p>
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
            amount: 0.25,
          }}
          transition={{
            duration: 1.6,
            delay: 0.15,
            ease: smoothEase,
          }}
        >
          <Accordion defaultValue={["account"]}>
            {questions.map((item, index) => (
              <motion.div
                key={item.value}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.85,
                  delay: 0.25 + index * 0.12,
                  ease: smoothEase,
                }}
              >
                <AccordionItem value={item.value} className="border-b">
                  <AccordionTrigger className="py-6 text-start text-base font-bold hover:text-primary sm:text-lg">
                    {t(item.question)}
                  </AccordionTrigger>

                  <AccordionContent className="max-w-2xl pb-6 text-sm leading-7 text-muted-foreground sm:text-base">
                    {t(item.answer)}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
