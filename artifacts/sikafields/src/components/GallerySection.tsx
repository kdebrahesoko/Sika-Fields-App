import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGalleryImages, type GalleryImage, type GalleryCategory } from "@/hooks/useGalleryImages";
import ImageCard from "./ImageCard";

const CATEGORIES = ["All", "Reforestation", "Agroforestry", "Community Work", "Technology"] as const;
type FilterCategory = typeof CATEGORIES[number];

export default function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const category = activeFilter === "All" ? undefined : (activeFilter as GalleryCategory);
  const { data: images = [], isLoading } = useGalleryImages(category);

  const openLightbox = useCallback((image: GalleryImage, index: number) => {
    setLightboxImage(image);
    setLightboxIndex(index);
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
    if (lightboxImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxImage]);

  const featuredImage = images.find((img) => img.featured) ?? images[0];
  const restImages = images.filter((img) => img !== featuredImage);

  return (
    <section id="gallery" className="py-20 bg-[#f7f9f7]">
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
              onClick={() => setActiveFilter(cat)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-['Inter',sans-serif]">
            No images found in this category yet.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
                {featuredImage && (
                  <motion.div layout className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <div
                      className="group relative overflow-hidden rounded-2xl cursor-pointer bg-black shadow-md hover:shadow-xl transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      onClick={() => openLightbox(featuredImage, 0)}
                      onKeyDown={(e) => e.key === "Enter" && openLightbox(featuredImage, 0)}
                      tabIndex={0}
                      role="button"
                      aria-label={`View ${featuredImage.title}`}
                    >
                      <div className="relative w-full overflow-hidden" style={{ height: "clamp(220px, 40vw, 420px)" }}>
                        <motion.img
                          src={featuredImage.imageUrl}
                          alt={featuredImage.alt}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.04 }}
                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-700/90 text-emerald-50 mb-2 font-['Inter',sans-serif]">
                            {featuredImage.category}
                          </span>
                          <p className="text-white font-bold text-lg sm:text-xl leading-snug font-['Sora',sans-serif]">{featuredImage.title}</p>
                          {featuredImage.description && (
                            <p className="text-white/75 text-sm mt-1 line-clamp-2 font-['Inter',sans-serif]">{featuredImage.description}</p>
                          )}
                          {featuredImage.location && (
                            <p className="flex items-center gap-1 text-white/55 text-xs mt-1.5">
                              <MapPin className="w-3 h-3" />
                              {featuredImage.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {restImages.map((image, i) => (
                  <ImageCard
                    key={image._id}
                    image={image}
                    index={i + 1}
                    onClick={() => openLightbox(image, i + 1)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
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
