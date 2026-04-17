import { useQuery } from "@tanstack/react-query";
import { sanityClient, isSanityConfigured } from "@/lib/sanity";
import { ALL_EVENTS_QUERY } from "@/lib/sanity-queries";

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
    summary:
      "A two-day in-person summit bringing together farmers, project developers, buyers and regulators shaping the future of African carbon removal.",
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
    summary:
      "Walk a working SikaFields plot with the field team. See satellite-aided MRV, soil sampling, and farmer onboarding live.",
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
    summary:
      "A 45-minute walkthrough of how SikaFields measures, verifies and pays smallholder farmers for soil carbon sequestration.",
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
    summary:
      "For corporate buyers and ESG leads — what makes SikaFields' African removal credits high-integrity and how to lock in volume.",
    coverImage: "/hero-invest.png",
    startsAt: "2026-03-14T16:00:00Z",
    durationMinutes: 38,
    location: "Online",
    host: "SikaFields Commercial Team",
    mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["Buyers", "Verra", "ESG"],
  },
  {
    _id: "fallback-webinar-3",
    title: "Live Q&A — The 2026 Voluntary Carbon Market Outlook",
    slug: "vcm-2026-outlook-qa",
    format: "webinar",
    summary:
      "Recorded panel session unpacking the 2026 VCM outlook with our advisory board and external market analysts.",
    coverImage: "/hero-carbon.png",
    startsAt: "2026-02-08T17:00:00Z",
    durationMinutes: 62,
    location: "Online",
    host: "SikaFields Advisory Board",
    mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["VCM", "Policy"],
  },
  {
    _id: "fallback-podcast-1",
    title: "Ep. 07 — From Esoko to SikaFields: 17 Years in the Field",
    slug: "podcast-ep-07-esoko-to-sikafields",
    format: "podcast",
    summary:
      "Daniel Asare-Kyei on building trust with farmers, why African data infrastructure matters, and the road from agri-data to carbon markets.",
    coverImage: "/esoko-office-exterior.png",
    startsAt: "2026-03-30T06:00:00Z",
    durationMinutes: 41,
    host: "The SikaFields Podcast",
    mediaUrl:
      "https://cdn.pixabay.com/audio/2024/11/05/audio_1c3a7e0f72.mp3",
    tags: ["Founder", "Africa"],
    featured: true,
  },
  {
    _id: "fallback-podcast-2",
    title: "Ep. 06 — Inside an MRV Walkthrough With Field Officer Kojo",
    slug: "podcast-ep-06-mrv-walkthrough",
    format: "podcast",
    summary:
      "Field officer Kojo Owusu explains how a single hectare gets enrolled, verified, and turned into tradable credits.",
    coverImage: "/field-visit-3.jpg",
    startsAt: "2026-03-16T06:00:00Z",
    durationMinutes: 28,
    host: "The SikaFields Podcast",
    mediaUrl:
      "https://cdn.pixabay.com/audio/2023/10/30/audio_8d76b2f35c.mp3",
    tags: ["MRV", "Field"],
  },
  {
    _id: "fallback-podcast-3",
    title: "Ep. 05 — Why Buyers Choose African Removals",
    slug: "podcast-ep-05-buyers-african-removals",
    format: "podcast",
    summary:
      "A conversation with two Fortune 500 ESG leads on why African removal credits are moving to the top of their procurement lists.",
    coverImage: "/hero-invest.png",
    startsAt: "2026-03-02T06:00:00Z",
    durationMinutes: 35,
    host: "The SikaFields Podcast",
    mediaUrl:
      "https://cdn.pixabay.com/audio/2022/03/15/audio_e7e3a52cce.mp3",
    tags: ["Buyers", "ESG"],
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
      if (!isSanityConfigured || !sanityClient) return FALLBACK_EVENTS;
      const docs = await sanityClient.fetch(ALL_EVENTS_QUERY);
      const result = (docs as Record<string, unknown>[]).map(docToEvent);
      return result.length > 0 ? result : FALLBACK_EVENTS;
    },
    staleTime: 1000 * 60 * 5,
  });
}
