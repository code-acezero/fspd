import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ServicesSection from "@/components/landing/ServicesSection";
import EventsPreview from "@/components/landing/EventsPreview";
import MembersSection from "@/components/landing/MembersSection";
import Footer from "@/components/landing/Footer";
import ParticleField from "@/components/effects/ParticleField";
import EditorToolbar from "@/components/editor/EditorToolbar";
import HeroEditorPanel from "@/components/editor/HeroEditorPanel";

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
    {/* Admin-only inline CMS editor (mounts only for admins/mods) */}
    <EditorToolbar />
    <HeroEditorPanel />
  </div>
);

export default LandingPage;
