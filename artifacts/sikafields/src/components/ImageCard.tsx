import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage, GalleryCategory } from "@/hooks/useGalleryImages";

const CATEGORY_COLORS: Record<GalleryCategory, string> = {
  "Reforestation": "bg-emerald-700/90 text-emerald-50",
  "Agroforestry": "bg-lime-700/90 text-lime-50",
  "Community Work": "bg-amber-700/90 text-amber-50",
  "Technology": "bg-sky-700/90 text-sky-50",
};

interface ImageCardProps {
  image: GalleryImage;
  index: number;
  onClick: () => void;
}

export default function ImageCard({ image, index, onClick }: ImageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer bg-stone-100 shadow-md hover:shadow-xl transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      tabIndex={0}
      role="button"
      aria-label={`View ${image.title}`}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <motion.img
          src={image.imageUrl}
          alt={image.alt}
          loading="lazy"
          className="w-full h-auto block"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 flex flex-col justify-end p-3.5 gap-0.5"
          initial={{ opacity: 0, y: 6 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
        >
          <p className="text-white font-semibold text-sm leading-snug line-clamp-2 font-['Sora',sans-serif]">
            {image.title}
          </p>
          {image.description && (
            <p className="text-white/75 text-xs leading-relaxed line-clamp-2 font-['Inter',sans-serif]">
              {image.description}
            </p>
          )}
          {image.location && (
            <p className="flex items-center gap-1 text-white/55 text-xs mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {image.location}
            </p>
          )}
        </motion.div>

        <div className="absolute top-2.5 left-2.5">
          <span
            className={cn(
              "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide font-['Inter',sans-serif]",
              CATEGORY_COLORS[image.category] ?? "bg-gray-700/90 text-gray-50"
            )}
          >
            {image.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
