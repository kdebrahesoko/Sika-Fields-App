import { useQuery } from "@tanstack/react-query";

const API_BASE = "/api";

export type GalleryCategory = "Reforestation" | "Agroforestry" | "Community Work" | "Technology";

export interface GalleryImage {
  _id: string;
  title: string;
  category: GalleryCategory;
  description: string;
  imageUrl: string;
  alt: string;
  location?: string;
  featured: boolean;
  publishedAt: string;
}

const FALLBACK_IMAGES: GalleryImage[] = [
  {
    _id: "fallback-1",
    title: "Fields in Full Bloom",
    category: "Agroforestry",
    description: "Smallholder farmers tend to rows of leafy crops across a patchwork of managed fields, each plot part of a verified carbon sequestration program.",
    imageUrl: "/hero-farmers.jpg",
    alt: "Aerial view of farmers tending green crop rows",
    location: "Brong-Ahafo Region, Ghana",
    featured: true,
    publishedAt: "2025-03-01T00:00:00Z",
  },
  {
    _id: "fallback-2",
    title: "Planting the Future",
    category: "Reforestation",
    description: "A farmer carefully plants a seedling in rich, dark soil — a simple act that will sequester carbon for decades to come.",
    imageUrl: "/about-farming.jpg",
    alt: "Hands planting a seedling in dark soil",
    location: "Ashanti Region, Ghana",
    featured: true,
    publishedAt: "2025-02-15T00:00:00Z",
  },
  {
    _id: "fallback-3",
    title: "Amara Harvests Rice",
    category: "Community Work",
    description: "Amara, one of SikaFields' founding community members, harvests rice at sunrise.",
    imageUrl: "/farmer-amara.png",
    alt: "A woman in traditional hat harvesting rice in a lush green field",
    location: "Senegal",
    featured: false,
    publishedAt: "2025-01-20T00:00:00Z",
  },
  {
    _id: "fallback-4",
    title: "Kofi Mensah — Carbon Pioneer",
    category: "Community Work",
    description: "Kofi has worked the same land for 40 years. Through SikaFields he now earns a verified income for the carbon his forest plots remove every year.",
    imageUrl: "/farmer-kofi.png",
    alt: "Portrait of an African elder farmer",
    location: "Northern Region, Ghana",
    featured: false,
    publishedAt: "2024-12-10T00:00:00Z",
  },
  {
    _id: "fallback-5",
    title: "Carbon Credit Marketplace",
    category: "Technology",
    description: "SikaFields' digital platform connects smallholder farmers directly to verified carbon credit buyers.",
    imageUrl: "/hero-carbon.png",
    alt: "Digital illustration of carbon credit certificates and sustainable energy",
    location: "Platform — Global",
    featured: false,
    publishedAt: "2024-11-05T00:00:00Z",
  },
  {
    _id: "fallback-6",
    title: "Invest in a Greener Planet",
    category: "Technology",
    description: "Corporate buyers and impact investors access high-integrity African carbon removals through SikaFields' verified marketplace.",
    imageUrl: "/hero-invest.png",
    alt: "Farmers in terraced fields alongside carbon credit investment imagery",
    location: "Platform — Global",
    featured: false,
    publishedAt: "2024-10-18T00:00:00Z",
  },
];

function docToGalleryImage(doc: Record<string, unknown>): GalleryImage {
  return {
    _id: doc._id as string,
    title: doc.title as string,
    category: doc.category as GalleryCategory,
    description: (doc.description as string) ?? "",
    imageUrl: (doc.imageUrl as string) ?? "",
    alt: (doc.alt as string) ?? (doc.title as string),
    location: doc.location as string | undefined,
    featured: Boolean(doc.featured),
    publishedAt: (doc.publishedAt as string) ?? new Date().toISOString(),
  };
}

export function useGalleryImages(category?: GalleryCategory) {
  return useQuery<GalleryImage[]>({
    queryKey: ["gallery", category ?? "all"],
    queryFn: async () => {
      try {
        const url = category
          ? `${API_BASE}/content/gallery?category=${encodeURIComponent(category)}`
          : `${API_BASE}/content/gallery`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const docs = (await res.json()) as Record<string, unknown>[];
        const result = docs.map(docToGalleryImage);
        if (result.length > 0) return result;
      } catch {
        // fall through to fallback
      }
      if (!category) return FALLBACK_IMAGES;
      return FALLBACK_IMAGES.filter((img) => img.category === category);
    },
    staleTime: 1000 * 60 * 5,
  });
}
