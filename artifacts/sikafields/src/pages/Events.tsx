import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, ArrowRight, Calendar, CalendarDays, ChevronDown,
  Clock, ExternalLink, Loader2, MapPin, Repeat, Video,
} from "lucide-react";
import { type Article, type EventDetails } from "@/data/articles";
import { useAllArticles } from "@/hooks/useArticles";

type EventArticle = Article & { event: EventDetails };

function parseEventDate(d: string): Date | null {
  const t = new Date(d);
  return isNaN(t.getTime()) ? null : t;
}

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric" });
}

function formatWeekday(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatTimeRange(start: Date, end?: Date | null): string {
  const t = (x: Date) => x.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
  if (!end) return t(start);
  // If same day, show start–end times
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return `${t(start)} – ${t(end)}`;
  // Multi-day: show full end date
  return `${t(start)} → ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

function recurrenceLabel(r?: EventDetails["recurrence"]): string | null {
  if (!r || r === "none") return null;
  if (r === "weekly") return "Repeats weekly";
  if (r === "monthly") return "Repeats monthly";
  return null;
}

function EventCard({ article, index }: { article: EventArticle; index: number }) {
  const start = parseEventDate(article.event.date);
  const end = article.event.endDate ? parseEventDate(article.event.endDate) : null;
  if (!start) return null;

  const cc = article.coverColor ?? "#16a34a";
  const recur = recurrenceLabel(article.event.recurrence);
  const recurEnd = article.event.recurrenceEnd
    ? parseEventDate(article.event.recurrenceEnd)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.25) }}
      className="group relative flex gap-5 bg-white rounded-2xl border border-border p-5 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      {/* Date badge */}
      <div
        className="shrink-0 w-16 sm:w-20 rounded-xl flex flex-col items-center justify-center text-center py-3 self-start"
        style={{ backgroundColor: cc + "18", color: cc }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          {formatWeekday(start)}
        </span>
        <span className="text-2xl sm:text-3xl font-display font-black leading-none mt-0.5">
          {formatDay(start)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70 mt-0.5">
          {start.toLocaleDateString("en-GB", { month: "short" })}
        </span>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: cc }}
          >
            <CalendarDays className="w-3 h-3" /> Event
          </span>
          {article.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <h3 className="font-display font-bold text-foreground text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            {formatTimeRange(start, end)}
          </span>
          {article.event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {article.event.location}
            </span>
          )}
          {article.event.virtualLink && (
            <a
              href={article.event.virtualLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
            >
              <Video className="w-3.5 h-3.5" />
              Join online
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {recur && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Repeat className="w-3.5 h-3.5" />
              {recur}
              {recurEnd ? ` until ${recurEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            View details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {article.event.virtualLink && (
            <a
              href={article.event.virtualLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              Register
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function PastEventRow({ article }: { article: EventArticle }) {
  const start = parseEventDate(article.event.date);
  if (!start) return null;
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-border"
    >
      <span className="shrink-0 w-20 text-xs font-semibold text-muted-foreground tabular-nums">
        {start.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
      <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
        {article.title}
      </span>
      {article.event.location && (
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[200px]">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{article.event.location}</span>
        </span>
      )}
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </Link>
  );
}

export default function EventsPage() {
  const { data: articles = [], isLoading } = useAllArticles();
  const [showPast, setShowPast] = useState(false);

  const events = useMemo<EventArticle[]>(() => {
    return articles.filter(
      (a): a is EventArticle => a.kind === "event" && !!a.event && !!parseEventDate(a.event.date),
    );
  }, [articles]);

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { upcoming, past } = useMemo(() => {
    const u: EventArticle[] = [];
    const p: EventArticle[] = [];
    for (const ev of events) {
      const start = parseEventDate(ev.event.date)!;
      const end = ev.event.endDate ? parseEventDate(ev.event.endDate) : null;
      const referenceEnd = end ?? start;
      if (referenceEnd.getTime() >= startOfToday.getTime()) {
        u.push(ev);
      } else {
        p.push(ev);
      }
    }
    u.sort(
      (a, b) =>
        parseEventDate(a.event.date)!.getTime() -
        parseEventDate(b.event.date)!.getTime(),
    );
    p.sort(
      (a, b) =>
        parseEventDate(b.event.date)!.getTime() -
        parseEventDate(a.event.date)!.getTime(),
    );
    return { upcoming: u, past: p };
  }, [events, startOfToday.getTime()]);

  // Group upcoming by month (e.g. "June 2026")
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; sortKey: number; items: EventArticle[] }>();
    for (const ev of upcoming) {
      const d = parseEventDate(ev.event.date)!;
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const existing = map.get(key);
      if (existing) existing.items.push(ev);
      else map.set(key, {
        label: formatMonthYear(d),
        sortKey: d.getFullYear() * 12 + d.getMonth(),
        items: [ev],
      });
    }
    return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [upcoming]);

  const nextEvent = upcoming[0];
  const nextDate = nextEvent ? parseEventDate(nextEvent.event.date) : null;
  const daysUntil = nextDate
    ? Math.max(0, Math.ceil((nextDate.getTime() - now) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors min-w-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">Back to SikaFields</span>
            </span>
          </Link>
          <img
            src="/sikafields-logo-new.png"
            alt="SikaFields"
            className="h-7 sm:h-8 object-contain shrink-0"
          />
          <Link
            href="/articles"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors justify-end shrink-0"
          >
            <span className="hidden sm:inline">All articles</span>
            <span className="sm:hidden">Articles</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0d2418] via-[#133d22] to-[#0d2418] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-semibold mb-5 border border-white/20">
              <CalendarDays className="w-4 h-4" />
              SikaFields Events Calendar
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
              Upcoming events,<br />
              <span className="text-[#4ade80]">in person & online</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Field days, buyer briefings, regulator roundtables and webinars from the
              SikaFields team — sorted by date, with location and join links.
            </p>
          </motion.div>

          {/* Next-event card */}
          {nextEvent && nextDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur p-6"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4ade80] mb-3">
                Next up
                {daysUntil !== null && daysUntil > 0 && (
                  <span className="ml-2 text-white/60 normal-case font-semibold tracking-normal">
                    in {daysUntil} day{daysUntil === 1 ? "" : "s"}
                  </span>
                )}
                {daysUntil === 0 && (
                  <span className="ml-2 text-white/80 normal-case font-semibold tracking-normal">
                    today
                  </span>
                )}
              </p>
              <h2 className="text-xl font-display font-bold leading-snug mb-3">
                {nextEvent.title}
              </h2>
              <div className="space-y-1.5 text-sm text-white/80">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/50" />
                  {nextDate.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/50" />
                  {formatTimeRange(
                    nextDate,
                    nextEvent.event.endDate ? parseEventDate(nextEvent.event.endDate) : null,
                  )}
                </p>
                {nextEvent.event.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/50" />
                    {nextEvent.event.location}
                  </p>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/articles/${nextEvent.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0d2418] text-xs font-bold hover:bg-white/90 transition-colors"
                >
                  View details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {nextEvent.event.virtualLink && (
                  <a
                    href={nextEvent.event.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4ade80] text-[#0d2418] text-xs font-bold hover:bg-[#22c55e] transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" /> Join online
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Loading events…</span>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-foreground text-lg font-semibold">No upcoming events scheduled</p>
            <p className="text-sm text-muted-foreground mt-2">
              We&rsquo;re planning the next round of field days and webinars. Check back soon, or
              browse {past.length > 0 ? "past sessions below" : "our articles for recent updates"}.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map((group) => (
              <section key={group.label}>
                <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {group.label}
                  </h2>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {group.items.length} event{group.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid gap-4">
                  {group.items.map((ev, i) => (
                    <EventCard key={ev.id} article={ev} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Past events */}
        {past.length > 0 && (
          <section className="mt-16">
            <button
              onClick={() => setShowPast((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors text-left"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Past events
                <span className="text-xs font-semibold text-muted-foreground">
                  ({past.length})
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showPast ? "rotate-180" : ""}`}
              />
            </button>
            {showPast && (
              <div className="mt-3 grid gap-1">
                {past.map((ev) => (
                  <PastEventRow key={ev.id} article={ev} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 SikaFields. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/articles" className="hover:text-primary transition-colors font-semibold">
              All articles
            </Link>
            <Link href="/" className="hover:text-primary transition-colors font-semibold">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
