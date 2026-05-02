import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ServicesSection from "@/components/landing/ServicesSection";
import EventsPreview from "@/components/landing/EventsPreview";
import MembersSection from "@/components/landing/MembersSection";
import Footer from "@/components/landing/Footer";
import ParticleField from "@/components/effects/ParticleField";

const LandingPage = () => (
  <div className="min-h-screen bg-background relative">
    <ParticleField />
    <div className="relative z-[2]">
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <EventsPreview />
      <MembersSection />
      <Footer />
    </div>
  </div>
);

export default LandingPage;
