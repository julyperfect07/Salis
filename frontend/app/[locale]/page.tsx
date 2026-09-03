import { LandingNavbar } from "@/components/layout/landing-navbar";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HeroSection } from "@/features/landing/components/hero-section";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}
