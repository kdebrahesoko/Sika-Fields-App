import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, ArrowRight, Wand2, Loader2, Sparkles, AlertCircle,
  CheckCircle2, PenLine, Calendar, MapPin, Globe2,
} from "lucide-react";
import { setAiDraftHandoff } from "@/lib/published-posts";

const apiBase = "/api";

interface FormState {
  kind: "article" | "news" | "event";
  topic: string;
  audience: string;
  keyPoints: string;
  tone: string;
  eventDate: string;
  eventLocation: string;
  eventVirtualLink: string;
}

const DEFAULTS: FormState = {
  kind: "event",
  topic: "",
  audience: "Mixed: farmers, corporate buyers, investors",
  keyPoints: "",
  tone: "Confident, warm, plain English",
  eventDate: "",
  eventLocation: "",
  eventVirtualLink: "",
};

const KIND_OPTIONS: { value: FormState["kind"]; label: string; desc: string }[] = [
  { value: "event", label: "Event", desc: "Webinar, workshop, in-person meetup or recurring series." },
  { value: "news", label: "News", desc: "Announcement, milestone, market or regulatory update." },
  { value: "article", label: "Article", desc: "Educational long-form for farmers, buyers, or investors." },
];

const TONE_OPTIONS = [
  "Confident, warm, plain English",
  "Formal, investor-grade, data-driven",
  "Conversational, farmer-friendly",
  "Energetic, campaign launch",
];

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full transition-all ${
        done ? "bg-primary" : active ? "bg-primary/50 ring-4 ring-primary/15" : "bg-muted"
      }`}
    />
  );
}

export default function NewPostAIPage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback((patch: Partial<FormState>) => {
    setForm((p) => ({ ...p, ...patch }));
  }, []);

  const isEvent = form.kind === "event";
  const totalSteps = isEvent ? 4 : 3;

  const canAdvance = (s: number): boolean => {
    if (s === 0) return form.topic.trim().length > 3;
    if (s === 1) return true;
    if (s === 2 && isEvent) return true;
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/admin/posts/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const { draft } = (await res.json()) as { draft: {
        title: string; excerpt: string; kind: FormState["kind"];
        tags: string[]; authorName: string; authorRole: string;
        contentMarkdown: string; event?: { date: string; location: string; virtualLink: string };
      } };
      setAiDraftHandoff({
        title: draft.title ?? "",
        excerpt: draft.excerpt ?? "",
        kind: draft.kind ?? form.kind,
        tags: Array.isArray(draft.tags) ? draft.tags : [],
        authorName: draft.authorName || "SikaFields Team",
        authorRole: draft.authorRole || "Editorial",
        contentMarkdown: draft.contentMarkdown ?? "",
        event:
          draft.event ??
          (isEvent
            ? { date: form.eventDate, location: form.eventLocation, virtualLink: form.eventVirtualLink }
            : undefined),
      });
      setLocation("/admin/new-post/scratch?from=ai");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [form, isEvent, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white font-sans flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-40 shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/admin/new-post"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <Wand2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <p className="text-sm font-semibold">
              <span className="text-emerald-800">AI Assistant</span>
              <span className="text-muted-foreground hidden sm:inline"> · Quick create</span>
            </p>
          </div>
          <Link
            href="/admin/new-post/scratch"
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            title="Switch to manual composer"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compose manually</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <StepDot key={i} active={i === step} done={i < step} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-3xl border border-border shadow-sm p-6 sm:p-8"
          >
            {/* Step 0 — Kind + topic */}
            {step === 0 && (
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full mb-3">
                  <Sparkles className="w-3 h-3" /> Step 1 of {totalSteps}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  What are we creating?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Pick a type and tell Sika the headline idea. We'll draft the rest.
                </p>

                <div className="grid sm:grid-cols-3 gap-2 mb-5">
                  {KIND_OPTIONS.map((k) => {
                    const active = form.kind === k.value;
                    return (
                      <button
                        key={k.value}
                        onClick={() => update({ kind: k.value })}
                        className={`text-left p-3 rounded-2xl border-2 transition-all ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <p className={`text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}>
                          {k.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-1">
                          {k.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Headline idea or topic
                </label>
                <textarea
                  rows={3}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
                  placeholder="e.g. Q2 farmer training webinar in Kumasi covering MRV basics and how to enrol new plots…"
                  value={form.topic}
                  onChange={(e) => update({ topic: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  A sentence or two is plenty. Sika will expand it.
                </p>
              </div>
            )}

            {/* Step 1 — Audience + tone + key points */}
            {step === 1 && (
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full mb-3">
                  <Sparkles className="w-3 h-3" /> Step 2 of {totalSteps}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Who is it for, and how should it sound?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Both fields are optional — defaults work great.
                </p>

                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Audience
                </label>
                <input
                  className="w-full text-sm border border-border rounded-xl px-3 py-2.5 mb-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.audience}
                  onChange={(e) => update({ audience: e.target.value })}
                />

                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Tone
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {TONE_OPTIONS.map((t) => {
                    const active = form.tone === t;
                    return (
                      <button
                        key={t}
                        onClick={() => update({ tone: t })}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Key points to cover (optional)
                </label>
                <textarea
                  rows={4}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
                  placeholder={
                    "e.g.\n• Live MRV demo\n• How to register new plots\n• Q&A with the field team"
                  }
                  value={form.keyPoints}
                  onChange={(e) => update({ keyPoints: e.target.value })}
                />
              </div>
            )}

            {/* Step 2 — Event details (only when kind=event) */}
            {step === 2 && isEvent && (
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full mb-3">
                  <Sparkles className="w-3 h-3" /> Step 3 of {totalSteps}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Event logistics
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Skip any field you don't have yet — you can always edit later.
                </p>

                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Date / time
                </label>
                <input
                  type="datetime-local"
                  className="w-full text-sm border border-border rounded-xl px-3 py-2.5 mb-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.eventDate}
                  onChange={(e) => update({ eventDate: e.target.value })}
                />

                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Location
                </label>
                <input
                  className="w-full text-sm border border-border rounded-xl px-3 py-2.5 mb-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="e.g. Accra Head Office or 'Online'"
                  value={form.eventLocation}
                  onChange={(e) => update({ eventLocation: e.target.value })}
                />

                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  <Globe2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Virtual link (optional)
                </label>
                <input
                  type="url"
                  className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="https://meet.google.com/…"
                  value={form.eventVirtualLink}
                  onChange={(e) => update({ eventVirtualLink: e.target.value })}
                />
              </div>
            )}

            {/* Final step — Review + submit */}
            {step === totalSteps - 1 && (
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full mb-3">
                  <Wand2 className="w-3 h-3" /> Final step
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Ready to draft?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Sika will write a polished draft based on your inputs and open it
                  in the composer for you to refine.
                </p>

                <div className="rounded-2xl bg-muted/50 border border-border p-4 mb-5 text-sm space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Type
                    </span>
                    <p className="font-semibold capitalize">{form.kind}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Topic
                    </span>
                    <p className="leading-snug">{form.topic}</p>
                  </div>
                  {isEvent && (form.eventDate || form.eventLocation) && (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
                      {form.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {form.eventDate}
                        </span>
                      )}
                      {form.eventLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {form.eventLocation}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Drafting your post…
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate draft with AI
                    </>
                  )}
                </button>
                <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  You'll be able to edit everything before publishing.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step nav */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {step < totalSteps - 1 && (
            <button
              onClick={next}
              disabled={!canAdvance(step)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
