import { useQuery } from "@tanstack/react-query";
import { sanityClient, isSanityConfigured } from "@/lib/sanity";
import { GALLERY_IMAGES_QUERY, GALLERY_IMAGES_BY_CATEGORY_QUERY } from "@/lib/sanity-queries";

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
    description: "Amara, one of SikaFields' founding community members, harvests rice at sunrise. She now earns supplementary income from carbon credits on her 3-hectare plot.",
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
    description: "SikaFields' digital platform connects smallholder farmers directly to verified carbon credit buyers, removing intermediaries and maximising farmer income.",
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
  {
    _id: "fallback-7",
    title: "SikaFields Mobile App",
    category: "Technology",
    description: "Farmers across rural Africa track earnings, carbon measurements, and payments in real-time through SikaFields' mobile application — available in 6 local languages.",
    imageUrl: "/mobile-app.jpeg",
    alt: "SikaFields mobile application on a smartphone",
    location: "Platform — Mobile",
    featured: false,
    publishedAt: "2024-09-30T00:00:00Z",
  },
  {
    _id: "fallback-8",
    title: "Community Trainings & Field Activities",
    category: "Community Work",
    description: "SikaFields teams meet farmers at community level — conducting field trainings, attending district planning sessions, running radio outreach, and visiting farmers in their own communities.",
    imageUrl: "/gallery-field-activities.png",
    alt: "Collage of SikaFields community training events, radio broadcasts, and field visits in Ghana",
    location: "Western North Region, Ghana",
    featured: false,
    publishedAt: "2026-02-10T00:00:00Z",
  },
  {
    _id: "fallback-9",
    title: "From Esoko HQ to the Field",
    category: "Community Work",
    description: "From Esoko's Ghana headquarters to radio studios, training halls, and open-air village meetings — the SikaFields team brings carbon market knowledge directly to farming communities.",
    imageUrl: "/gallery-esoko-community.png",
    alt: "Esoko office exterior, radio studio appearances, farmer woman in field, and team photo",
    location: "Accra & Western Region, Ghana",
    featured: false,
    publishedAt: "2026-01-15T00:00:00Z",
  },
  {
    _id: "fallback-10",
    title: "Verify On Ground — Mobile MRV",
    category: "Technology",
    description: "The SikaFields mobile app guides farmers through evidence capture and validation of sustainable farming activities — making Measurement, Reporting & Verification accessible on any smartphone.",
    imageUrl: "/app-verify-ground.jpeg",
    alt: "SikaFields mobile app Verify On Ground screen showing field satellite imagery",
    location: "Platform — Mobile",
    featured: false,
    publishedAt: "2025-12-01T00:00:00Z",
  },
  {
    _id: "fallback-11",
    title: "Grow With Purpose",
    category: "Agroforestry",
    description: "Aerial view of patchwork smallholder farms illustrating the diversity of land use across SikaFields' program area — each plot monitored via satellite and enrolled in carbon sequestration.",
    imageUrl: "/app-grow-purpose.jpeg",
    alt: "Aerial view of colourful patchwork smallholder farm plots",
    location: "Platform — Mobile",
    featured: false,
    publishedAt: "2025-11-20T00:00:00Z",
  },
  {
    _id: "fallback-12",
    title: "SikaFields Platform Training",
    category: "Community Work",
    description: "A SikaFields field agent walks stakeholders through the platform at a training workshop — demonstrating how carbon data flows from farms to the registry in real time.",
    imageUrl: "/training-presentation.png",
    alt: "SikaFields team member presenting platform on projector to workshop participants",
    location: "Kumasi, Ghana",
    featured: false,
    publishedAt: "2026-03-15T00:00:00Z",
  },
  {
    _id: "fallback-13",
    title: "On Air at Liberty FM",
    category: "Community Work",
    description: "The SikaFields team takes carbon credit education to the airwaves at Liberty FM 92.7, Sefwi-Wiawso — reaching thousands of rural farmers across Western North Region.",
    imageUrl: "/liberty-fm-broadcast.png",
    alt: "Three Esoko/SikaFields team members speaking at Liberty FM radio station",
    location: "Sefwi-Wiawso, Western North Region",
    featured: false,
    publishedAt: "2026-03-10T00:00:00Z",
  },
  {
    _id: "fallback-14",
    title: "OTEC 102.9 FM Outreach",
    category: "Community Work",
    description: "SikaFields expands its radio outreach to OTEC 102.9 FM — the Voice of Asante — partnering with local broadcasters to spread awareness of carbon income for Ashanti farmers.",
    imageUrl: "/otec-fm-broadcast.png",
    alt: "SikaFields team on OTEC 102.9 FM radio with SikaFields banner visible",
    location: "Kumasi, Ashanti Region",
    featured: false,
    publishedAt: "2026-02-28T00:00:00Z",
  },
  {
    _id: "fallback-15",
    title: "SikaFields Team in the Field",
    category: "Community Work",
    description: "The full SikaFields Ghana team gathers for a group photo — district officers, field agents, and community partners united around a shared mission to bring carbon income to smallholder farmers.",
    imageUrl: "/team-group-photo.png",
    alt: "Large SikaFields team group photo in front of building with two SikaFields event banners",
    location: "Ghana",
    featured: true,
    publishedAt: "2026-02-20T00:00:00Z",
  },
  {
    _id: "fallback-16",
    title: "Stakeholder Workshop",
    category: "Community Work",
    description: "District officers, community leaders, and farm supervisors attend a SikaFields onboarding workshop — learning how digital MRV tools can unlock new income streams for their communities.",
    imageUrl: "/workshop-seminar.png",
    alt: "Mixed group of participants at a SikaFields stakeholder workshop with laptops",
    location: "Kumasi, Ghana",
    featured: false,
    publishedAt: "2026-02-12T00:00:00Z",
  },
  {
    _id: "fallback-17",
    title: "Village Farmer Circle",
    category: "Community Work",
    description: "Under the shade of a mango tree, a SikaFields field agent meets farmers in a traditional open-air circle meeting — the kind of trust built face-to-face that makes every carbon credit possible.",
    imageUrl: "/village-circle-meeting.png",
    alt: "Men seated in a circle under a tree at an open-air village community meeting",
    location: "Northern Region, Ghana",
    featured: false,
    publishedAt: "2026-01-30T00:00:00Z",
  },
  {
    _id: "fallback-18",
    title: "Esoko Team on the Platform",
    category: "Technology",
    description: "An Esoko team member processes field data in real time at a stakeholder event — demonstrating the seamless digital pipeline that converts farm activity into verified carbon credits.",
    imageUrl: "/esoko-team-at-work.png",
    alt: "Esoko team member focused on laptop at a busy stakeholder workshop",
    location: "Kumasi, Ghana",
    featured: false,
    publishedAt: "2026-01-22T00:00:00Z",
  },
  {
    _id: "fallback-19",
    title: "Community Elder at Dialogue",
    category: "Community Work",
    description: "A community elder in traditional print cloth listens intently at a SikaFields stakeholder dialogue — representing the wisdom of communities whose land holds Africa's greatest carbon potential.",
    imageUrl: "/community-elder.png",
    alt: "Community elder in colourful traditional African print shirt at stakeholder meeting",
    location: "Ghana",
    featured: false,
    publishedAt: "2026-01-10T00:00:00Z",
  },
  {
    _id: "fallback-20",
    title: "Esoko HQ, Kumasi",
    category: "Community Work",
    description: "The Esoko headquarters in Kumasi, Ghana — home base for the SikaFields team and the 17-year field data infrastructure that powers one of Africa's most trusted agricultural platforms.",
    imageUrl: "/esoko-office-exterior.png",
    alt: "Esoko office building exterior with orange and white sign in Kumasi Ghana",
    location: "Kumasi, Ghana",
    featured: false,
    publishedAt: "2025-12-15T00:00:00Z",
  },
  {
    _id: "fallback-21",
    title: "Forest Police Partnership",
    category: "Community Work",
    description: "A Forest Police officer participates in a SikaFields working group — one of many cross-sector partnerships that ensure SikaFields' carbon programs respect and protect Ghana's forests.",
    imageUrl: "/forest-police-partner.png",
    alt: "Forest Police officer attending a SikaFields partnership meeting",
    location: "Ghana",
    featured: false,
    publishedAt: "2025-11-30T00:00:00Z",
  },
  {
    _id: "fallback-22",
    title: "Seeds of Tomorrow",
    category: "Reforestation",
    description: "Gloved hands cradle a fragile seedling above rich, dark soil — a moment of care that represents every farmer's commitment to regenerating the land and earning a sustainable future.",
    imageUrl: "/seedling-in-hands.png",
    alt: "Gloved hands holding a green seedling with soil roots over a garden background",
    location: "Ghana",
    featured: false,
    publishedAt: "2025-10-20T00:00:00Z",
  },
  {
    _id: "fallback-23",
    title: "Into the Canopy",
    category: "Reforestation",
    description: "Looking up through towering bamboo into a cathedral of green — a symbol of what restored forests can become when communities commit to long-term carbon stewardship.",
    imageUrl: "/bamboo-forest-canopy.png",
    alt: "View looking up through a bamboo forest canopy towards the sky",
    location: "West Africa",
    featured: false,
    publishedAt: "2025-09-15T00:00:00Z",
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
      if (!isSanityConfigured || !sanityClient) {
        if (!category) return FALLBACK_IMAGES;
        return FALLBACK_IMAGES.filter((img) => img.category === category);
      }
      const query = category ? GALLERY_IMAGES_BY_CATEGORY_QUERY : GALLERY_IMAGES_QUERY;
      const params = category ? { category } : {};
      const docs = await sanityClient.fetch(query, params);
      const result = (docs as Record<string, unknown>[]).map(docToGalleryImage);
      if (result.length > 0) return result;
      if (!category) return FALLBACK_IMAGES;
      return FALLBACK_IMAGES.filter((img) => img.category === category);
    },
    staleTime: 1000 * 60 * 5,
  });
}
