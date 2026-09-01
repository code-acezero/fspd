import React, { useState, useEffect, useRef } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  RefreshCw,
  X,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeviceSimulatorProps {
  children: React.ReactNode;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ children }) => {
  const { editMode, previewDevice, setPreviewDevice } = useVisualEditor();
  const { lang } = useLanguage();
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [iframeKey, setIframeKey] = useState(0);
  const [currentIframeUrl, setCurrentIframeUrl] = useState(
    typeof window !== "undefined" ? window.location.pathname + window.location.search : "/"
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync current route if location changes
  useEffect(() => {
    setCurrentIframeUrl(window.location.pathname + window.location.search);
  }, []);

  // Lock background scroll when simulator is active
  useEffect(() => {
    if (editMode && previewDevice !== "desktop") {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [editMode, previewDevice]);

  const isInsideIframe = typeof window !== "undefined" && window.self !== window.top;

  if (isInsideIframe || !editMode || previewDevice === "desktop") {
    return <>{children}</>;
  }

  const isMobile = previewDevice === "mobile";
  const isTablet = previewDevice === "tablet";

  // Calculate pixel dimensions for true media queries
  const width = isMobile
    ? orientation === "portrait"
      ? 390
      : 780
    : orientation === "portrait"
    ? 768
    : 1024;

  const height = isMobile
    ? orientation === "portrait"
      ? 780
      : 390
    : orientation === "portrait"
    ? 860
    : 660;

  const refreshIframe = () => {
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="fixed inset-0 z-[160] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      {/* ── Top Simulation Control Bar ── */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 border border-white/15 text-white shadow-2xl backdrop-blur-xl z-20 shrink-0">
        {/* Device Information Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
            {isMobile ? <Smartphone className="w-4 h-4" /> : <Tablet className="w-4 h-4" />}
          </div>
          <div className="min-w-0 hidden sm:block">
            <span className="text-xs font-bold font-bengali block truncate">
              {isMobile
                ? lang === "en"
                  ? "Mobile Viewport Simulator"
                  : "মোবাইল ভিউপোর্ট সিমুলেটর"
                : lang === "en"
                ? "Tablet Viewport Simulator"
                : "ট্যাবলেট ভিউপোর্ট সিমুলেটর"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {width} × {height} px ({orientation})
            </span>
          </div>
        </div>

        {/* Viewport Switcher Buttons */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setPreviewDevice("desktop")}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewDevice === "desktop"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{lang === "en" ? "Desktop" : "ডেস্কটপ"}</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("tablet")}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewDevice === "tablet"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{lang === "en" ? "Tablet" : "ট্যাবলেট"}</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("mobile")}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewDevice === "mobile"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
            title="Mobile View (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{lang === "en" ? "Mobile" : "মোবাইল"}</span>
          </button>
        </div>

        {/* Action Controls: Rotate, Refresh, Close */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={lang === "en" ? "Rotate Device Orientation" : "ডিভাইস ঘোরান"}
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={refreshIframe}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={lang === "en" ? "Reload Frame" : "রিলোড করুন"}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setPreviewDevice("desktop")}
            className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors ml-1"
            title={lang === "en" ? "Exit Simulator" : "সিমুলেটর বন্ধ করুন"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Realistic Device Frame Bezel with Iframe Viewport ── */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full overflow-hidden my-auto py-2">
        <div
          className={`relative bg-slate-900 shadow-2xl ring-1 ring-white/20 transition-all duration-300 flex flex-col overflow-hidden ${
            isMobile
              ? "rounded-[46px] border-[10px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
              : "rounded-[34px] border-[12px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
          }`}
          style={{
            width: `${width}px`,
            maxWidth: "calc(100vw - 32px)",
            height: `${height}px`,
            maxHeight: "calc(100vh - 120px)",
          }}
        >
          {/* Mock Mobile Status Bar (Dynamic Island + Time + Icons) */}
          <div className="h-7 bg-black text-white px-6 flex items-center justify-between text-[11px] font-semibold shrink-0 select-none z-30">
            <span>9:41</span>

            {/* Dynamic Island / Camera Notch Pill */}
            {isMobile && (
              <div className="w-24 h-4 bg-slate-950 rounded-full border border-white/10 flex items-center justify-end px-2">
                <div className="w-2 h-2 rounded-full bg-blue-900/60 border border-blue-400/40" />
              </div>
            )}

            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Iframe Viewport (Authentic Media Queries Execution) */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={currentIframeUrl}
              title="Responsive Device Preview"
              className="w-full h-full border-0 bg-background"
            />
          </div>

          {/* Mock Mobile Bottom Home Indicator Bar */}
          {isMobile && (
            <div className="h-5 bg-black flex items-center justify-center shrink-0 z-30">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceSimulator;
