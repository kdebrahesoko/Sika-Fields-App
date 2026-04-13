import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ChevronLeft, ChevronRight, Images, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGalleryImages, type GalleryImage, type GalleryCategory } from "@/hooks/useGalleryImages";
import ImageCard from "./ImageCard";

const CATEGORIES = ["All", "Reforestation", "Agroforestry", "Community Work", "Technology"] as const;
type FilterCategory = typeof CATEGORIES[number];

const PAGE_SIZE = 9;

export default function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const category = activeFilter === "All" ? undefined : (activeFilter as GalleryCategory);
  const { data: images = [], isLoading } = useGalleryImages(category);

  const visibleImages = images.slice(0, visibleCount);
  const remaining = images.length - visibleCount;

  const handleFilterChange = (cat: FilterCategory) => {
    setActiveFilter(cat);
    setVisibleCount(PAGE_SIZE);
  };

  const openLightbox = useCallback((image: GalleryImage, idx: number) => {
    setLightboxImage(image);
    setLightboxIndex(idx);
  }, []);

  const closeLightbox = useCallback(() => setLightboxImage(null), []);

  const navigateLightbox = useCallback((direction: "prev" | "next") => {
    if (!images.length) return;
    const next = direction === "next"
      ? (lightboxIndex + 1) % images.length
      : (lightboxIndex - 1 + images.length) % images.length;
    setLightboxIndex(next);
    setLightboxImage(images[next]);
  }, [images, lightboxIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "ArrowLeft") navigateLightbox("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxImage, closeLightbox, navigateLightbox]);

  useEffect(() => {
    document.body.style.overflow = lightboxImage ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxImage]);

  return (
    <section id="gallery" className="py-20 bg-[#f5f7f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-4">
            <Images className="w-4 h-4 text-emerald-700" />
            <span className="text-emerald-800 text-xs font-semibold tracking-widest uppercase font-['Inter',sans-serif]">Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Sora',sans-serif] leading-tight">
            Our Impact in Action
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-['Inter',sans-serif]">
            Real stories from communities driving carbon removal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 font-['Inter',sans-serif]",
                activeFilter === cat
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-4 rounded-2xl bg-stone-100 animate-pulse"
                style={{ height: `${180 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-['Inter',sans-serif]">
            No images found in this category yet.
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeFilter}-${visibleCount}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {visibleImages.map((image, i) => (
                    <div key={image._id} className="break-inside-avoid mb-4">
                      <ImageCard
                        image={image}
                        index={i}
                        onClick={() => openLightbox(image, images.indexOf(image))}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {remaining > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-2 mt-10"
              >
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold shadow-md hover:bg-emerald-800 transition-colors duration-200 font-['Inter',sans-serif]"
                >
                  Show {Math.min(remaining, PAGE_SIZE)} more photos
                  <ChevronDown className="w-4 h-4" />
                </button>
                <p className="text-gray-400 text-xs font-['Inter',sans-serif]">
                  Showing {Math.min(visibleCount, images.length)} of {images.length}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            key="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
            onClick={closeLightbox}
          >
            <motion.div
              key={lightboxImage._id}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f1a0f] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox("prev")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateLightbox("next")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="relative flex-1 min-h-0 overflow-hidden" style={{ maxHeight: "65vh" }}>
                <img
                  src={lightboxImage.imageUrl}
                  alt={lightboxImage.alt}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-5 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-800 text-emerald-100 mb-2 font-['Inter',sans-serif]">
                      {lightboxImage.category}
                    </span>
                    <h3 className="text-white font-bold text-lg leading-snug font-['Sora',sans-serif]">
                      {lightboxImage.title}
                    </h3>
                    {lightboxImage.description && (
                      <p className="text-white/65 text-sm mt-1.5 leading-relaxed font-['Inter',sans-serif]">
                        {lightboxImage.description}
                      </p>
                    )}
                    {lightboxImage.location && (
                      <p className="flex items-center gap-1.5 text-white/40 text-xs mt-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {lightboxImage.location}
                      </p>
                    )}
                  </div>
                  {images.length > 1 && (
                    <span className="shrink-0 text-white/30 text-xs font-['Inter',sans-serif]">
                      {lightboxIndex + 1} / {images.length}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
