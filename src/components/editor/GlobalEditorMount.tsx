// GlobalEditorMount — mounts the inline CMS editor on every page.
// Listens to the current route to expose the right per-page panels.

import { useLocation } from "react-router-dom";
import EditorToolbar from "@/components/editor/EditorToolbar";
import SectionSwitcher from "@/components/editor/SectionSwitcher";
import HeroEditorPanel from "@/components/editor/HeroEditorPanel";
import SectionEditorPanel from "@/components/editor/SectionEditorPanel";
import GlobalLinksEditorPanel from "@/components/editor/GlobalLinksEditorPanel";

const ROUTE_TO_PAGE: Array<{ test: RegExp; page: string }> = [
  { test: /^\/$/, page: "landing" },
  { test: /^\/home$/, page: "landing" },
  { test: /^\/about/, page: "about" },
  { test: /^\/members/, page: "members" },
  { test: /^\/blog/, page: "blog" },
  { test: /^\/events/, page: "events" },
  { test: /^\/courses/, page: "courses" },
];

const GlobalEditorMount = () => {
  const { pathname } = useLocation();
  const match = ROUTE_TO_PAGE.find((r) => r.test.test(pathname));
  const page = match?.page ?? null;

  return (
    <>
      <EditorToolbar />
      <SectionSwitcher />

      {/* Always-mounted editors (visibility self-managed by activeBlock match) */}
      <HeroEditorPanel />
      <SectionEditorPanel blockKey="about" page="landing" />
      <SectionEditorPanel blockKey="services" page="landing" />
      <SectionEditorPanel blockKey="events_preview" page="landing" />
      <SectionEditorPanel blockKey="members" page="landing" />
      <SectionEditorPanel blockKey="footer" page="landing" />

      {/* Global blocks */}
      <GlobalLinksEditorPanel blockKey="nav" />
      <GlobalLinksEditorPanel blockKey="footer_links" />

      {/* Per-page hero (only mount the one for the current route to avoid noise) */}
      {page && page !== "landing" && (
        <SectionEditorPanel blockKey="page_hero" page={page} label="Page Header" />
      )}
    </>
  );
};

export default GlobalEditorMount;
