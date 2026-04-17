import { useState, useCallback, useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, Plus, Trash2, FileText, ImageIcon, LayoutGrid,
  Type, AlignLeft, Quote, List, Check, Copy, ExternalLink,
  Eye, X, RotateCcw, ChevronUp, ChevronDown, PenLine, LayoutDashboard,
  Send, CheckCircle2, Loader2, Calendar, MapPin, Globe2, Repeat, Upload, Wand2,
} from "lucide-react";
import { type Article, type ArticleBlock, type EventDetails } from "@/data/articles";
import { isSanityConfigured } from "@/lib/sanity";
import { tagStyle } from "@/lib/article-shared";
import {
  StandardTemplate,
  HeroTemplate,
  VisualTemplate,
} from "@/components/article-templates";
import { savePublishedPost, consumeAiDraftHandoff, ensureUniqueSlug } from "@/lib/published-posts";

type TemplateId = "standard" | "hero" | "visual";
type BlockType = "p" | "h2" | "quote" | "list";
type Kind = "article" | "news" | "event";

interface DraftBlock {
  id: string;
  type: BlockType;
  text: string;
  attribution: string;
  items: string[];
}

interface DraftEvent {
  date: string;
  endDate: string;
  location: string;
  virtualLink: string;
  recurrence: "none" | "weekly" | "monthly";
  recurrenceEnd: string;
}

interface Draft {
  title: string;
  slug: string;
  slugManual: boolean;
  kind: Kind;
  template: TemplateId;
  excerpt: string;
  authorName: string;
  authorRole: string;
  coverColor: string;
  coverImage: string;
  tags: string[];
  content: DraftBlock[];
  event: DraftEvent;
}

const DRAFT_KEY = "sf-admin-draft";

const COVER_COLORS = [
  { label: "Forest Green", value: "#16a34a" },
  { label: "Purple",       value: "#7c3aed" },
  { label: "Teal",         value: "#0f766e" },
  { label: "Amber",        value: "#ca8a04" },
  { label: "Ocean Blue",   value: "#0891b2" },
  { label: "Crimson",      value: "#dc2626" },
];

const TEMPLATE_OPTIONS: { id: TemplateId; label: string; desc: string; icon: ReactNode }[] = [
  { id: "standard", label: "Standard",     desc: "Clean reading experience with optional cover image header.",            icon: <FileText   className="w-4 h-4" /> },
  { id: "hero",     label: "Hero",         desc: "Full-viewport cinematic cover. Best for flagship long-form pieces.",    icon: <ImageIcon  className="w-4 h-4" /> },
  { id: "visual",   label: "Visual Story", desc: "Magazine-style alternating sections with oversized pull quotes.",       icon: <LayoutGrid className="w-4 h-4" /> },
];

const BLOCK_BUTTONS: { type: BlockType; label: string; icon: ReactNode }[] = [
  { type: "p",     label: "Paragraph",  icon: <AlignLeft className="w-3.5 h-3.5" /> },
  { type: "h2",    label: "Heading",    icon: <Type      className="w-3.5 h-3.5" /> },
  { type: "quote", label: "Pull Quote", icon: <Quote     className="w-3.5 h-3.5" /> },
  { type: "list",  label: "List",       icon: <List      className="w-3.5 h-3.5" /> },
];

const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "news",    label: "News" },
  { value: "event",   label: "Event" },
];

const RECURRENCE_OPTIONS: { value: DraftEvent["recurrence"]; label: string }[] = [
  { value: "none",    label: "One-off" },
  { value: "weekly",  label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const DEFAULT_EVENT: DraftEvent = {
  date: "",
  endDate: "",
  location: "",
  virtualLink: "",
  recurrence: "none",
  recurrenceEnd: "",
};

function newBlock(type: BlockType): DraftBlock {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    type,
    text: "",
    attribution: "",
    items: [""],
  };
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function wordCount(draft: Draft): number {
  return draft.content
    .flatMap((b) => (b.type === "list" ? b.items : [b.text]))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function eventToDetails(e: DraftEvent): EventDetails | undefined {
  if (!e.date && !e.location && !e.virtualLink) return undefined;
  const out: EventDetails = { date: e.date };
  if (e.endDate) out.endDate = e.endDate;
  if (e.location) out.location = e.location;
  if (e.virtualLink) out.virtualLink = e.virtualLink;
  if (e.recurrence !== "none") out.recurrence = e.recurrence;
  if (e.recurrenceEnd) out.recurrenceEnd = e.recurrenceEnd;
  return out;
}

function draftToArticle(draft: Draft, idOverride?: string): Article {
  const wc = wordCount(draft);
  const content: ArticleBlock[] = draft.content.map((block): ArticleBlock => {
    if (block.type === "list") return { type: "list", items: block.items.filter((i) => i.trim()) };
    if (block.type === "quote") {
      const a = block.attribution.trim();
      return a ? { type: "quote", text: block.text, attribution: a } : { type: "quote", text: block.text };
    }
    return { type: block.type as "p" | "h2", text: block.text };
  });

  return {
    id: idOverride ?? "draft",
    slug: draft.slug || "draft-post",
    kind: draft.kind,
    template: draft.template,
    title: draft.title || "Untitled Post",
    excerpt: draft.excerpt || "Your excerpt will appear here.",
    content,
    coverColor: draft.coverColor,
    coverImage: draft.coverImage || undefined,
    author: {
      name: draft.authorName || "Admin",
      role: draft.authorRole || "",
    },
    tags: draft.tags,
    event: draft.kind === "event" ? eventToDetails(draft.event) : undefined,
    publishedAt: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    readTime: Math.max(1, Math.ceil(wc / 200)),
  };
}

const DEFAULT_DRAFT: Draft = {
  title: "",
  slug: "",
  slugManual: false,
  kind: "article",
  template: "standard",
  excerpt: "",
  authorName: "",
  authorRole: "",
  coverColor: "#16a34a",
  coverImage: "",
  tags: [],
  content: [],
  event: DEFAULT_EVENT,
};

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Draft>;
      return {
        ...DEFAULT_DRAFT,
        ...parsed,
        event: { ...DEFAULT_EVENT, ...(parsed.event ?? {}) },
      };
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_DRAFT;
}

function saveDraft(draft: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable
  }
}

function clearDraftStorage() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // localStorage unavailable
  }
}

// Convert AI markdown into our block structure
function markdownToBlocks(md: string): DraftBlock[] {
  const lines = md.split(/\r?\n/);
  const blocks: DraftBlock[] = [];
  let listBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({ ...newBlock("list"), items: [...listBuffer] });
      listBuffer = [];
    }
  };
  const flushPara = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ ...newBlock("p"), text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      flushPara();
      continue;
    }
    if (/^#{1,3}\s+/.test(line)) {
      flushList();
      flushPara();
      blocks.push({ ...newBlock("h2"), text: line.replace(/^#{1,3}\s+/, "") });
      continue;
    }
    if (line.startsWith(">")) {
      flushList();
      flushPara();
      blocks.push({ ...newBlock("quote"), text: line.replace(/^>\s*/, "") });
      continue;
    }
    if (/^[-*+]\s+/.test(line)) {
      flushPara();
      listBuffer.push(line.replace(/^[-*+]\s+/, ""));
      continue;
    }
    flushList();
    paragraphBuffer.push(line);
  }
  flushList();
  flushPara();
  return blocks;
}

// --- Sub-components ---

function SectionCard({ title, children, accent }: { title: string; children: ReactNode; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 ${
        accent ? "border-emerald-200 bg-emerald-50/40" : "border-border"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-xs font-semibold text-foreground mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50";
const textareaCls = `${inputCls} resize-none`;

function BlockEditor({
  block, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  block: DraftBlock;
  onUpdate: (b: DraftBlock) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const set = (patch: Partial<DraftBlock>) => onUpdate({ ...block, ...patch });

  const updateItem = (i: number, val: string) => {
    const items = [...block.items];
    items[i] = val;
    set({ items });
  };
  const addItem = () => set({ items: [...block.items, ""] });
  const removeItem = (i: number) => set({ items: block.items.filter((_, idx) => idx !== i) });

  const typeLabel = BLOCK_BUTTONS.find((b) => b.type === block.type)?.label ?? block.type;

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{typeLabel}</span>
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button onClick={onMoveUp} disabled={isFirst} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={onRemove} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors" title="Remove block">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {block.type === "h2" && (
        <input className={inputCls} placeholder="Section heading…" value={block.text} onChange={(e) => set({ text: e.target.value })} />
      )}
      {block.type === "p" && (
        <textarea className={textareaCls} rows={4} placeholder="Write your paragraph…" value={block.text} onChange={(e) => set({ text: e.target.value })} />
      )}
      {block.type === "quote" && (
        <div className="space-y-2">
          <textarea className={textareaCls} rows={3} placeholder="Pull quote text…" value={block.text} onChange={(e) => set({ text: e.target.value })} />
          <input className={inputCls} placeholder="Attribution (e.g. — Jane Smith, CEO)" value={block.attribution} onChange={(e) => set({ attribution: e.target.value })} />
        </div>
      )}
      {block.type === "list" && (
        <div className="space-y-1.5">
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-xs shrink-0">•</span>
              <input className={`${inputCls} flex-1`} placeholder={`Item ${i + 1}…`} value={item} onChange={(e) => updateItem(i, e.target.value)} />
              <button onClick={() => removeItem(i)} disabled={block.items.length === 1} className="w-6 h-6 shrink-0 rounded flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1">
            <Plus className="w-3 h-3" /> Add item
          </button>
        </div>
      )}
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {tags.map((t) => {
          const s = tagStyle(t);
          return (
            <span key={t} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full cursor-pointer hover:opacity-75 transition-opacity" style={{ color: s.text, backgroundColor: s.bg }} onClick={() => onChange(tags.filter((x) => x !== t))} title="Click to remove">
              {t} <X className="w-2.5 h-2.5" />
            </span>
          );
        })}
        {tags.length === 0 && <span className="text-xs text-muted-foreground/60 italic">No tags yet</span>}
      </div>
      <div className="flex gap-2">
        <input className={`${inputCls} flex-1`} placeholder="Add a tag and press Enter…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
        <button onClick={addTag} disabled={!input.trim()} className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Add</button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Press Enter or click Add · click a tag to remove it</p>
    </div>
  );
}

function ImageUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image.");
      return;
    }
    setError(null);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      onChange(result);
      setUploading(false);
    };
    reader.onerror = () => {
      setError("Could not read that file.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="https://… or upload below"
          value={value.startsWith("data:") ? "(uploaded image)" : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={value.startsWith("data:")}
        />
        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all whitespace-nowrap">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Reading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <img src={value} alt="Cover preview" className="w-20 h-12 object-cover rounded-md border border-border" />
          <button onClick={() => onChange("")} className="text-[11px] font-semibold text-red-500 hover:underline">
            Remove
          </button>
        </div>
      )}
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
      <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WebP — max 4 MB. Used by Hero and Visual templates.</p>
    </div>
  );
}

function CopyJsonButton({ draft }: { draft: Draft }) {
  const [state, setState] = useState<"idle" | "copied">("idle");
  const hasTitle = draft.title.trim().length > 0;
  const copy = useCallback(async () => {
    if (!hasTitle) return;
    const article = draftToArticle(draft);
    const json = JSON.stringify({ ...article, id: Date.now().toString() }, null, 2);
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      const el = document.createElement("textarea");
      el.value = json;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setState("copied");
    setTimeout(() => setState("idle"), 2500);
  }, [draft, hasTitle]);
  return (
    <button onClick={copy} disabled={!hasTitle} title={!hasTitle ? "Add a title before copying" : undefined} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${state === "copied" ? "bg-primary/10 text-primary" : "bg-muted text-foreground hover:bg-muted/80"}`}>
      {state === "copied" ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> JSON</>}
    </button>
  );
}

function LivePreview({ draft }: { draft: Draft }) {
  const article = draftToArticle(draft);
  const shareUrl = `https://sikafields.com/articles/${article.slug}`;
  return (
    <AnimatePresence mode="wait">
      <motion.div key={draft.template} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
        {draft.template === "hero"     && <HeroTemplate     article={article} shareUrl={shareUrl} preview />}
        {draft.template === "visual"   && <VisualTemplate   article={article} shareUrl={shareUrl} preview />}
        {draft.template === "standard" && <StandardTemplate article={article} shareUrl={shareUrl} preview />}
      </motion.div>
    </AnimatePresence>
  );
}

// --- Main page ---

export default function AdminComposerPage() {
  const [, setLocation] = useLocation();
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published">("idle");
  const [aiBanner, setAiBanner] = useState(false);

  // AI handoff: pre-fill draft if redirected from /admin/new-post/ai
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") !== "ai") return;
    const handoff = consumeAiDraftHandoff();
    if (!handoff) return;
    setDraft((prev) => {
      const blocks = markdownToBlocks(handoff.contentMarkdown ?? "");
      const next: Draft = {
        ...prev,
        title: handoff.title || prev.title,
        slug: handoff.title ? toSlug(handoff.title) : prev.slug,
        slugManual: false,
        kind: handoff.kind ?? prev.kind,
        excerpt: handoff.excerpt || prev.excerpt,
        authorName: handoff.authorName || prev.authorName,
        authorRole: handoff.authorRole || prev.authorRole,
        tags: handoff.tags?.length ? handoff.tags : prev.tags,
        content: blocks.length > 0 ? blocks : prev.content,
        event: handoff.event
          ? {
              ...prev.event,
              date: handoff.event.date ?? prev.event.date,
              location: handoff.event.location ?? prev.event.location,
              virtualLink: handoff.event.virtualLink ?? prev.event.virtualLink,
            }
          : prev.event,
      };
      saveDraft(next);
      return next;
    });
    setAiBanner(true);
    // Clean the query string so refresh doesn't re-import
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const update = useCallback((patch: Partial<Draft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(next);
      return next;
    });
  }, []);

  const updateEvent = useCallback((patch: Partial<DraftEvent>) => {
    setDraft((prev) => {
      const next = { ...prev, event: { ...prev.event, ...patch } };
      saveDraft(next);
      return next;
    });
  }, []);

  const updateTitle = useCallback((title: string) => {
    setDraft((prev) => {
      const next: Draft = {
        ...prev,
        title,
        slug: prev.slugManual ? prev.slug : toSlug(title),
      };
      saveDraft(next);
      return next;
    });
  }, []);

  const addBlock = useCallback((type: BlockType) => {
    setDraft((prev) => {
      const next = { ...prev, content: [...prev.content, newBlock(type)] };
      saveDraft(next);
      return next;
    });
  }, []);

  const updateBlock = useCallback((id: string, block: DraftBlock) => {
    setDraft((prev) => {
      const next = { ...prev, content: prev.content.map((b) => (b.id === id ? block : b)) };
      saveDraft(next);
      return next;
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setDraft((prev) => {
      const next = { ...prev, content: prev.content.filter((b) => b.id !== id) };
      saveDraft(next);
      return next;
    });
  }, []);

  const moveBlock = useCallback((id: string, dir: -1 | 1) => {
    setDraft((prev) => {
      const idx = prev.content.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const arr = [...prev.content];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      const next = { ...prev, content: arr };
      saveDraft(next);
      return next;
    });
  }, []);

  const clearDraft = useCallback(() => {
    clearDraftStorage();
    setDraft(DEFAULT_DRAFT);
    setShowClearConfirm(false);
  }, []);

  const eventDateMissing = draft.kind === "event" && !draft.event.date.trim();
  const canPublish =
    draft.title.trim().length > 0 &&
    draft.content.length > 0 &&
    !eventDateMissing;

  const publishDisabledReason = !draft.title.trim()
    ? "Add a title to publish"
    : draft.content.length === 0
    ? "Add at least one content block to publish"
    : eventDateMissing
    ? "Events need a start date before publishing"
    : undefined;

  const publish = useCallback(async () => {
    if (!canPublish) return;
    setPublishState("publishing");
    const id = `local-${Date.now().toString(36)}`;
    const baseSlug = draft.slug || toSlug(draft.title) || "draft-post";
    const uniqueSlug = ensureUniqueSlug(baseSlug, id);
    const article = draftToArticle({ ...draft, slug: uniqueSlug }, id);
    savePublishedPost(article);
    // brief delay so the user sees the success state
    await new Promise((r) => setTimeout(r, 600));
    setPublishState("published");
    clearDraftStorage();
    setTimeout(() => {
      setLocation(`/articles/${article.slug}`);
    }, 700);
  }, [canPublish, draft, setLocation]);

  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
  const sanityUrl =
    isSanityConfigured && projectId
      ? `https://${projectId}.sanity.studio/structure/${draft.kind === "news" ? "news" : "blog"}`
      : null;

  return (
    <div className="min-h-screen bg-muted/30 font-sans flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-white sticky top-0 z-40 shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/admin/new-post" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <PenLine className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-semibold text-foreground truncate">
              <span className="text-primary">Compose</span>
              <span className="text-muted-foreground hidden sm:inline"> · {KIND_OPTIONS.find((k) => k.value === draft.kind)?.label}</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Clear draft?</span>
                <button onClick={clearDraft} className="text-xs font-bold text-red-500 hover:underline">Yes, clear</button>
                <button onClick={() => setShowClearConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowClearConfirm(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" title="Clear draft">
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <Link href="/admin/posts" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors" title="Manage all posts">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All posts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI banner */}
      {aiBanner && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-50 to-amber-50 border-b border-emerald-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
            <Wand2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <p className="text-xs sm:text-sm text-emerald-900 flex-1">
              <span className="font-bold">AI draft loaded.</span>{" "}
              <span className="hidden sm:inline">Review and refine — your edits auto-save.</span>
            </p>
            <button onClick={() => setAiBanner(false)} className="text-emerald-700 hover:text-emerald-900 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Mobile tab strip */}
      <div className="lg:hidden bg-white border-b border-border px-4 py-2.5 flex gap-2 shrink-0">
        <button onClick={() => setMobileTab("form")} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${mobileTab === "form" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"}`}>
          <PenLine className="w-3.5 h-3.5" /> Form
        </button>
        <button onClick={() => setMobileTab("preview")} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${mobileTab === "preview" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"}`}>
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex max-w-screen-2xl mx-auto w-full overflow-hidden">
        {/* Left form panel */}
        <div className={`lg:flex flex-col w-full lg:w-[26rem] shrink-0 border-r border-border bg-white/60 ${mobileTab === "form" ? "flex" : "hidden"} lg:flex`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
            {/* Post type + template */}
            <SectionCard title="Post Settings">
              <Field label="Post type">
                <div className="flex rounded-xl border border-border overflow-hidden">
                  {KIND_OPTIONS.map((k) => (
                    <button
                      key={k.value}
                      onClick={() => update({ kind: k.value })}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all ${draft.kind === k.value ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Template">
                <div className="space-y-2">
                  {TEMPLATE_OPTIONS.map((t) => {
                    const isActive = draft.template === t.id;
                    return (
                      <button key={t.id} onClick={() => update({ template: t.id })} className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all ${isActive ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/50"}`}>
                        <span className={`mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}>{t.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{t.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{t.desc}</p>
                        </div>
                        {isActive && (
                          <span className="ml-auto mt-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </SectionCard>

            {/* Event details */}
            {draft.kind === "event" && (
              <SectionCard title="Event Details" accent>
                <Field label={<span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Start date / time</span> as unknown as string}>
                  <input type="datetime-local" className={inputCls} value={draft.event.date} onChange={(e) => updateEvent({ date: e.target.value })} />
                </Field>
                <Field label="End date / time (optional)">
                  <input type="datetime-local" className={inputCls} value={draft.event.endDate} onChange={(e) => updateEvent({ endDate: e.target.value })} />
                </Field>
                <Field label={<span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span> as unknown as string}>
                  <input className={inputCls} placeholder="e.g. Accra Head Office" value={draft.event.location} onChange={(e) => updateEvent({ location: e.target.value })} />
                </Field>
                <Field label={<span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> Virtual link (optional)</span> as unknown as string}>
                  <input type="url" className={inputCls} placeholder="https://meet.google.com/…" value={draft.event.virtualLink} onChange={(e) => updateEvent({ virtualLink: e.target.value })} />
                </Field>
                <Field label={<span className="flex items-center gap-1"><Repeat className="w-3 h-3" /> Recurrence</span> as unknown as string}>
                  <div className="flex rounded-xl border border-border overflow-hidden">
                    {RECURRENCE_OPTIONS.map((r) => (
                      <button key={r.value} onClick={() => updateEvent({ recurrence: r.value })} className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${draft.event.recurrence === r.value ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </Field>
                {draft.event.recurrence !== "none" && (
                  <Field label="Recurrence ends" hint="Optional — leave blank for ongoing.">
                    <input type="date" className={inputCls} value={draft.event.recurrenceEnd} onChange={(e) => updateEvent({ recurrenceEnd: e.target.value })} />
                  </Field>
                )}
              </SectionCard>
            )}

            {/* Details */}
            <SectionCard title="Details">
              <Field label="Title" hint={!draft.title.trim() ? "Required to publish." : "Slug auto-generated."}>
                <input className={`${inputCls} ${!draft.title.trim() ? "border-amber-300 focus:border-amber-400 focus:ring-amber-200/50" : ""}`} placeholder={draft.kind === "event" ? "Event title…" : "Post title…"} value={draft.title} onChange={(e) => updateTitle(e.target.value)} />
              </Field>
              <Field label="Slug" hint="Edit to override the auto-generated URL slug.">
                <input className={inputCls} placeholder="url-friendly-slug" value={draft.slug} onChange={(e) => update({ slug: toSlug(e.target.value), slugManual: true })} />
              </Field>
              <Field label="Excerpt" hint="1–2 sentence summary shown on cards.">
                <textarea className={textareaCls} rows={3} placeholder="A concise summary…" value={draft.excerpt} onChange={(e) => update({ excerpt: e.target.value })} />
              </Field>
            </SectionCard>

            {/* Author */}
            <SectionCard title="Author">
              <Field label="Name">
                <input className={inputCls} placeholder="Full name…" value={draft.authorName} onChange={(e) => update({ authorName: e.target.value })} />
              </Field>
              <Field label="Role">
                <input className={inputCls} placeholder="e.g. Chief Strategy Officer" value={draft.authorRole} onChange={(e) => update({ authorRole: e.target.value })} />
              </Field>
            </SectionCard>

            {/* Appearance */}
            <SectionCard title="Appearance">
              <Field label="Cover colour">
                <div className="flex gap-2 flex-wrap">
                  {COVER_COLORS.map((c) => (
                    <button key={c.value} onClick={() => update({ coverColor: c.value })} title={c.label} className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${draft.coverColor === c.value ? "border-foreground shadow-md scale-110" : "border-transparent"}`} style={{ backgroundColor: c.value }} />
                  ))}
                </div>
              </Field>
              <Field label="Cover image">
                <ImageUploadField value={draft.coverImage} onChange={(v) => update({ coverImage: v })} />
              </Field>
            </SectionCard>

            {/* Tags */}
            <SectionCard title="Tags">
              <TagInput tags={draft.tags} onChange={(tags) => update({ tags })} />
            </SectionCard>

            {/* Content */}
            <SectionCard title="Content">
              {draft.content.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-4">No content blocks yet. Add one below.</p>
              )}
              <div className="space-y-2 mb-4">
                {draft.content.map((block, idx) => (
                  <BlockEditor key={block.id} block={block} onUpdate={(b) => updateBlock(block.id, b)} onRemove={() => removeBlock(block.id)} onMoveUp={() => moveBlock(block.id, -1)} onMoveDown={() => moveBlock(block.id, 1)} isFirst={idx === 0} isLast={idx === draft.content.length - 1} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {BLOCK_BUTTONS.map((b) => (
                  <button key={b.type} onClick={() => addBlock(b.type)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                    <Plus className="w-3 h-3" /> {b.label}
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Right preview panel */}
        <div className={`lg:flex flex-1 flex-col overflow-y-auto ${mobileTab === "preview" ? "flex" : "hidden"} lg:flex`}>
          <div className="sticky top-0 z-30 bg-muted/80 backdrop-blur border-b border-border px-5 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              Live Preview
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                {TEMPLATE_OPTIONS.find((t) => t.id === draft.template)?.label}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">Updates as you type</span>
          </div>
          <div className="flex-1 bg-white shadow-sm pb-28">
            <LivePreview draft={draft} />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-4px_20px_-12px_rgba(0,0,0,0.08)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {draft.title || <span className="text-muted-foreground italic">Untitled Post</span>}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Draft saved · {draft.content.length} blocks · {wordCount(draft)} words
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CopyJsonButton draft={draft} />
            {sanityUrl && (
              <a href={sanityUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all" title="Open in Sanity CMS">
                <ExternalLink className="w-3.5 h-3.5" />
                CMS
              </a>
            )}
            <button
              onClick={publish}
              disabled={!canPublish || publishState !== "idle"}
              title={publishDisabledReason}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${
                publishState === "published"
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {publishState === "publishing" && (<><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>)}
              {publishState === "published" && (<><CheckCircle2 className="w-4 h-4" /> Published</>)}
              {publishState === "idle" && (<><Send className="w-4 h-4" /> <span className="hidden sm:inline">Publish post</span><span className="sm:hidden">Publish</span></>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
