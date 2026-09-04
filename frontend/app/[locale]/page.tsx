import { LandingFooter } from "@/components/layout/landing-footer";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { FaqSection } from "@/features/landing/components/faq-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { ProcessSection } from "@/features/landing/components/process-section";
import { RolesSection } from "@/features/landing/components/roles-section";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <RolesSection />
      <FaqSection />
      <LandingFooter />
    </main>
  );
}
