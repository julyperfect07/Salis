"use client";

import type { ChangeEvent, ComponentProps } from "react";
import { Input } from "@/components/ui/input";

function sanitizePhoneNumber(value: string) {
  const hasLeadingPlus = value.startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, hasLeadingPlus ? 19 : 20);
  return hasLeadingPlus ? `+${digits}` : digits;
}

export function PhoneInput({ onChange, ...props }: ComponentProps<typeof Input>) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    event.target.value = sanitizePhoneNumber(event.target.value);
    onChange?.(event);
  }

  return (
    <Input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      maxLength={20}
      pattern="\+?[0-9]{7,20}"
      onChange={handleChange}
    />
  );
}
