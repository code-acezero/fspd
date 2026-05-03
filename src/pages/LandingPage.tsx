import LandingBlocks from "@/components/landing/LandingBlocks";
import ParticleField from "@/components/effects/ParticleField";

// Editor mount lives globally in App.tsx, no need to mount it per-page anymore.
// Section order is driven by page_blocks.sort_order (Phase 5).

const LandingPage = () => (
  <div className="min-h-screen bg-background relative">
    <ParticleField />
    <div className="relative z-[2]">
      <LandingBlocks />
    </div>
  </div>
);

export default LandingPage;
