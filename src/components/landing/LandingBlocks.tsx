// LandingBlocks — renders landing page sections in DB-driven sort_order.
// Each block is its own component that handles its own visibility internally.
// Reordering happens in the SectionSwitcher (Phase 5 — drag handles).

import { useMemo } from "react";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ServicesSection from "@/components/landing/ServicesSection";
import EventsPreview from "@/components/landing/EventsPreview";
import MembersSection from "@/components/landing/MembersSection";
import Footer from "@/components/landing/Footer";

const REGISTRY: Record<string, React.ComponentType> = {
  hero: HeroSection,
  about: AboutSection,
  services: ServicesSection,
  events_preview: EventsPreview,
  members: MembersSection,
  footer: Footer,
};

// Footer always renders last regardless of sort_order, to keep page structure sane.
const FALLBACK_ORDER = ["hero", "about", "services", "events_preview", "members", "footer"];

const LandingBlocks = () => {
  const { getOrderedKeys, loading } = usePageBlocks();
  const ordered = useMemo(() => {
    const fromDb = getOrderedKeys("landing").filter((k) => REGISTRY[k]);
    if (fromDb.length === 0) return FALLBACK_ORDER;
    // ensure footer is last
    const noFooter = fromDb.filter((k) => k !== "footer");
    const hasFooter = fromDb.includes("footer");
    return hasFooter ? [...noFooter, "footer"] : noFooter;
  }, [getOrderedKeys, loading]);

  return (
    <>
      {ordered.map((key) => {
        const Cmp = REGISTRY[key];
        return Cmp ? <Cmp key={key} /> : null;
      })}
    </>
  );
};

export default LandingBlocks;
