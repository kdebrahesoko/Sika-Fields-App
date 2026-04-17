import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Clock, MapPin, Mic, Radio, Video,
  Play, ExternalLink, ArrowRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, type SikaEvent, type EventFormat } from "@/hooks/useEvents";

type FilterKey = "all" | "events" | "webinars" | "podcasts";

const FILTERS: { key: FilterKey; label: string; match: (f: EventFormat) => boolean }[] = [
  { key: "all",       label: "All",       match: () => true },
  { key: "events",    label: "Events",    match: (f) => f === "event" },
  { key: "webinars",  label: "Webinars",  match: (f) => f === "webinar" },
  { key: "podcasts",  label: "Podcasts",  match: (f) => f === "podcast" },
];

const FORMAT_META: Record<EventFormat, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  event:   { label: "Event",   icon: CalendarDays, color: "text-emerald-700", bg: "bg-emerald-50" },
  webinar: { label: "Webinar", icon: Video,        color: "text-sky-700",     bg: "bg-sky-50" },
  podcast: { label: "Podcast", icon: Mic,          color: "text-violet-700",  bg: "bg-violet-50" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short",
  });
}

function formatDuration(mins?: number): string | null {
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function isUpcoming(ev: SikaEvent): boolean {
  return new Date(ev.startsAt).getTime() > Date.now();
}

function isYouTubeOrVimeo(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

function toEmbedUrl(url: string): string {
  // Already an embed URL
  if (url.includes("/embed/")) return url;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function EventCard({ ev, index }: { ev: SikaEvent; index: number }) {
  const meta = FORMAT_META[ev.format];
  const Icon = meta.icon;
  const upcoming = isUpcoming(ev);
  const duration = formatDuration(ev.durationMinutes);
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
      className="group flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative h-44 overflow-hidden bg-stone-100">
        {ev.coverImage ? (
          <img
            src={ev.coverImage}
            alt={ev.coverAlt ?? ev.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center", meta.bg)}>
            <Icon className={cn("w-12 h-12 opacity-40", meta.color)} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm",
            meta.bg, meta.color
          )}>
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
          {upcoming && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800">
              <Sparkles className="w-2.5 h-2.5" /> Upcoming
            </span>
          )}
          {ev.featured && !upcoming && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/90 text-foreground">
              Featured
            </span>
          )}
        </div>
        {ev.format === "podcast" && (
          <div className="absolute bottom-3 right-3">
            <Radio className="w-4 h-4 text-white/80" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-display font-bold text-lg leading-snug text-foreground line-clamp-2">
          {ev.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDate(ev.startsAt)}
          </span>
          {upcoming && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(ev.startsAt)}
            </span>
          )}
          {duration && !upcoming && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {duration}
            </span>
          )}
          {ev.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {ev.location}
            </span>
          )}
        </div>

        {ev.summary && (
          <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
            {ev.summary}
          </p>
        )}

        {ev.host && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">Host:</span> {ev.host}
          </p>
        )}

        {ev.tags && ev.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {ev.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Player area for on-demand webinars */}
        {ev.format === "webinar" && !upcoming && ev.mediaUrl && showPlayer && (
          <div className="rounded-xl overflow-hidden border border-border aspect-video bg-black">
            {isYouTubeOrVimeo(ev.mediaUrl) ? (
              <iframe
                src={toEmbedUrl(ev.mediaUrl)}
                title={ev.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={ev.mediaUrl} controls className="w-full h-full" />
            )}
          </div>
        )}

        {/* Inline audio for podcasts (always rendered when chosen to play) */}
        {ev.format === "podcast" && ev.mediaUrl && (
          <audio
            controls
            src={ev.mediaUrl}
            className="w-full mt-1"
            preload="none"
          >
            Your browser does not support audio playback.
          </audio>
        )}

        {/* CTAs */}
        <div className="mt-auto pt-2 flex flex-wrap gap-2">
          {upcoming && ev.registerUrl && (
            <a
              href={ev.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
            >
              {ev.format === "webinar" ? "Register" : "RSVP"}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
          {!upcoming && ev.format === "webinar" && ev.mediaUrl && !showPlayer && (
            <button
              onClick={() => setShowPlayer(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-700 text-white text-xs font-bold hover:bg-sky-800 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              Watch on demand
            </button>
          )}
          {!upcoming && ev.format === "podcast" && ev.mediaUrl && (
            <a
              href={ev.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open in player
            </a>
          )}
          {!upcoming && ev.format === "event" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              Past event
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function EventsSection() {
  const { data: events = [], isLoading } = useEvents();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const matcher = FILTERS.find((f) => f.key === filter)?.match ?? (() => true);
    const list = events.filter((e) => matcher(e.format));
    // Upcoming first, then most recent past
    return [...list].sort((a, b) => {
      const aUp = isUpcoming(a) ? 0 : 1;
      const bUp = isUpcoming(b) ? 0 : 1;
      if (aUp !== bUp) return aUp - bUp;
      const aT = new Date(a.startsAt).getTime();
      const bT = new Date(b.startsAt).getTime();
      return aUp === 0 ? aT - bT : bT - aT;
    });
  }, [events, filter]);

  const counts = useMemo(() => {
    return {
      all:      events.length,
      events:   events.filter((e) => e.format === "event").length,
      webinars: events.filter((e) => e.format === "webinar").length,
      podcasts: events.filter((e) => e.format === "podcast").length,
    };
  }, [events]);

  return (
    <section id="resources" className="py-24 bg-[#f5f7f2] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-4">
            <CalendarDays className="w-4 h-4 text-emerald-700" />
            <span className="text-emerald-800 text-xs font-semibold tracking-widest uppercase">
              Events · Webinars · Podcasts
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Sora',sans-serif] leading-tight">
            Learn from the field, in real time
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Join live sessions with our team, watch on-demand webinars for buyers and farmers,
            and listen to the SikaFields podcast — straight from the people building Africa's carbon economy.
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            const count = counts[f.key];
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
                )}
              >
                {f.label}
                <span className={cn(
                  "ml-1.5 text-[10px] font-bold",
                  isActive ? "text-white/80" : "text-gray-400"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-stone-100 animate-pulse h-[420px]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No sessions in this category yet — check back soon.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((ev, i) => (
                <EventCard key={ev._id} ev={ev} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
