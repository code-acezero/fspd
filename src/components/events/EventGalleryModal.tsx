import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageLucide,
  Video,
  Play,
  Download,
  Calendar,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface EventGalleryItem {
  id: string;
  name: string;
  image_url: string;
  created_at?: string;
}

interface EventGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventDate?: string;
  items: EventGalleryItem[];
}

export const EventGalleryModal: React.FC<EventGalleryModalProps> = ({
  isOpen,
  onClose,
  eventTitle,
  eventDate,
  items,
}) => {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("video");
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        if (activeIndex !== null) setActiveIndex(null);
        else onClose();
      } else if (e.key === "ArrowLeft" && activeIndex !== null) {
        setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
      } else if (e.key === "ArrowRight" && activeIndex !== null) {
        setActiveIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, items.length, onClose]);

  if (!isOpen) return null;

  const currentItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between gap-4 shrink-0 bg-card/90">
            <div className="min-w-0">
              <span className="text-[11px] text-primary font-bengali font-bold uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                <ImageLucide className="w-3.5 h-3.5" />
                {lang === "bn" ? "ইভেন্ট ফটো ও ভিডিও গ্যালারি" : "Event Photo & Video Gallery"}
              </span>
              <h3 className="font-bengali font-bold text-base sm:text-lg text-foreground truncate">
                {eventTitle}
              </h3>
              {eventDate && (
                <span className="text-xs text-muted-foreground font-bengali flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-accent" />
                  {eventDate}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grid of Gallery Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <ImageLucide className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-bengali text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "এই অনুষ্ঠানের জন্য এখনো কোনো ছবি বা ভিডিও যোগ করা হয়নি।"
                    : "No photos or videos attached to this event yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {items.map((item, idx) => {
                  const isVid = isVideo(item.image_url);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveIndex(idx)}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/40 cursor-pointer hover:border-primary/60 transition-all hover:scale-[1.02]"
                    >
                      {isVid ? (
                        <div className="w-full h-full bg-black/60 flex items-center justify-center relative">
                          <video src={item.image_url} className="w-full h-full object-cover" preload="metadata" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 text-white drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
                          {isVid ? <Video className="w-3 h-3" /> : <ImageLucide className="w-3 h-3" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lightbox Overlay when a single item is clicked */}
          <AnimatePresence>
            {currentItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/95 flex flex-col items-center justify-center p-4"
              >
                {/* Lightbox Controls */}
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-30"
                >
                  <X className="w-5 h-5" />
                </button>

                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-30"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-30"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Media Presentation */}
                <div className="max-w-4xl max-h-[75vh] flex items-center justify-center overflow-hidden">
                  {isVideo(currentItem.image_url) ? (
                    <video
                      src={currentItem.image_url}
                      controls
                      autoPlay
                      className="max-h-[70vh] max-w-full rounded-2xl"
                    />
                  ) : (
                    <img
                      src={currentItem.image_url}
                      alt={currentItem.name}
                      className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl"
                    />
                  )}
                </div>

                {/* Media Caption / Counter */}
                <div className="mt-3 text-center text-white/80 text-xs font-mono">
                  {activeIndex + 1} / {items.length}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventGalleryModal;
