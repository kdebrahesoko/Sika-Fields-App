import { useQuery } from "@tanstack/react-query";

const API_BASE = "/api";

export type EventFormat = "event" | "webinar" | "podcast";

export interface SikaEvent {
  _id: string;
  title: string;
  slug: string;
  format: EventFormat;
  summary?: string;
  coverImage?: string;
  coverAlt?: string;
  startsAt: string;
  endsAt?: string;
  durationMinutes?: number;
  location?: string;
  host?: string;
  registerUrl?: string;
  mediaUrl?: string;
  tags?: string[];
  featured?: boolean;
}

const FALLBACK_EVENTS: SikaEvent[] = [
  {
    _id: "fallback-event-1",
    title: "Africa Carbon Markets Summit 2026",
    slug: "africa-carbon-markets-summit-2026",
    format: "event",
    summary: "A two-day in-person summit bringing together farmers, project developers, buyers and regulators shaping the future of African carbon removal.",
    coverImage: "/government-delegation.jpg",
    startsAt: "2026-06-12T09:00:00Z",
    endsAt: "2026-06-13T17:00:00Z",
    location: "Kempinski Hotel, Accra, Ghana",
    host: "SikaFields & Esoko",
    registerUrl: "https://sikafields.com/events/africa-carbon-summit-2026",
    tags: ["Africa", "Policy", "Buyers"],
    featured: true,
  },
  {
    _id: "fallback-event-2",
    title: "Field Day: MRV in Practice — Kumasi",
    slug: "field-day-mrv-kumasi",
    format: "event",
    summary: "Walk a working SikaFields plot with the field team. See satellite-aided MRV, soil sampling, and farmer onboarding live.",
    coverImage: "/training-presentation.png",
    startsAt: "2026-05-22T08:30:00Z",
    location: "Kumasi, Ashanti Region",
    host: "SikaFields Field Operations",
    registerUrl: "https://sikafields.com/events/field-day-kumasi",
    tags: ["MRV", "Ghana", "Farmers"],
  },
  {
    _id: "fallback-webinar-1",
    title: "How Smallholders Earn From Soil Carbon",
    slug: "smallholders-soil-carbon-webinar",
    format: "webinar",
    summary: "A 45-minute walkthrough of how SikaFields measures, verifies and pays smallholder farmers for soil carbon sequestration.",
    coverImage: "/farmer-amara.png",
    startsAt: "2026-04-02T15:00:00Z",
    durationMinutes: 45,
    location: "Online",
    host: "Daniel Asare-Kyei, CEO",
    mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["Farmers", "Soil Carbon", "Education"],
    featured: true,
  },
  {
    _id: "fallback-webinar-2",
    title: "Buyer Briefing: Verra-Aligned Removal Credits From Africa",
    slug: "buyer-briefing-verra-africa",
    format: "webinar",
    summary: "For corporate buyers and ESG leads — what makes SikaFields' African removal credits high-integrity and how to lock in volume.",
    coverImage: "/hero-invest.png",
    startsAt: "2026-03-14T16:00:00Z",
    durationMinutes: 38,
    location: "Online",
    host: "SikaFields Commercial Team",
    mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["Buyers", "Verra", "ESG"],
  },
  {
    _id: "fallback-podcast-1",
    title: "Ep. 07 — From Esoko to SikaFields: 17 Years in the Field",
    slug: "podcast-ep-07-esoko-to-sikafields",
    format: "podcast",
    summary: "Daniel Asare-Kyei on building trust with farmers, why African data infrastructure matters, and the road from agri-data to carbon markets.",
    coverImage: "/esoko-office-exterior.png",
    startsAt: "2026-03-30T06:00:00Z",
    durationMinutes: 41,
    host: "The SikaFields Podcast",
    mediaUrl: "https://cdn.pixabay.com/audio/2024/11/05/audio_1c3a7e0f72.mp3",
    tags: ["Founder", "Africa"],
    featured: true,
  },
];

function docToEvent(doc: Record<string, unknown>): SikaEvent {
  return {
    _id: doc._id as string,
    title: doc.title as string,
    slug: doc.slug as string,
    format: doc.format as EventFormat,
    summary: doc.summary as string | undefined,
    coverImage: doc.coverImage as string | undefined,
    coverAlt: doc.coverAlt as string | undefined,
    startsAt: doc.startsAt as string,
    endsAt: doc.endsAt as string | undefined,
    durationMinutes: doc.durationMinutes as number | undefined,
    location: doc.location as string | undefined,
    host: doc.host as string | undefined,
    registerUrl: doc.registerUrl as string | undefined,
    mediaUrl: doc.mediaUrl as string | undefined,
    tags: (doc.tags as string[] | undefined) ?? [],
    featured: Boolean(doc.featured),
  };
}

export function useEvents() {
  return useQuery<SikaEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE}/content/events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const docs = (await res.json()) as Record<string, unknown>[];
        const result = docs.map(docToEvent);
        if (result.length > 0) return result;
      } catch {
        // fall through to fallback
      }
      return FALLBACK_EVENTS;
    },
    staleTime: 1000 * 60 * 5,
  });
}
