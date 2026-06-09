import { useState, useCallback, useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { useApiClient } from "@/lib/api-fetch";
import {
  ArrowLeft, Plus, Trash2, FileText, ImageIcon, LayoutGrid,
  Type, AlignLeft, Quote, List, Check, Copy, ExternalLink,
  Eye, X, RotateCcw, ChevronUp, ChevronDown, PenLine, LayoutDashboard,
  Send, CheckCircle2, Loader2, Calendar, MapPin, Globe2, Repeat, Upload, Wand2,
  AlertCircle, Ticket, History, Users,
} from "lucide-react";
import { RevisionHistoryDialog } from "@/components/RevisionHistoryDialog";
import { type Article, type ArticleBlock, type EventDetails } from "@/data/articles";
import { isSanityConfigured } from "@/lib/sanity";
import { tagStyle } from "@/lib/article-shared";
import {
  StandardTemplate,
  HeroTemplate,
  VisualTemplate,
} from "@/components/article-templates";
import { consumeAiDraftHandoff, ensureUniqueSlug } from "@/lib/published-posts";

const API_BASE = "/api";

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
  registerUrl: string;
  recurrence: "none" | "weekly" | "monthly";
  recurrenceEnd: string;
}

interface CoverImageState {
  url: string;
  assetId?: string;
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
  coverImage: CoverImageState | null;
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
  registerUrl: "",
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
  if (!e.date && !e.location && !e.virtualLink && !e.registerUrl) return undefined;
  const out: EventDetails = { date: e.date };
  if (e.endDate) out.endDate = e.endDate;
  if (e.location) out.location = e.location;
  if (e.virtualLink) out.virtualLink = e.virtualLink;
  if (e.recurrence !== "none") out.recurrence = e.recurrence;
  if (e.recurrenceEnd) out.recurrenceEnd = e.recurrenceEnd;
  return out;
}

function draftToArticle(draft: Draft): Article {
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
    id: "draft",
    slug: draft.slug || "draft-post",
    kind: draft.kind,
    template: draft.template,
    title: draft.title || "Untitled Post",
    excerpt: draft.excerpt || "Your excerpt will appear here.",
    content,
    coverColor: draft.coverColor,
    coverImage: draft.coverImage?.url,
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
  coverImage: null,
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
        coverImage: parsed.coverImage ?? null,
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

interface UploadResponse {
  asset: { assetId: string; ref: string; url: string };
}

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

function ImageUploadField({ value, onChange, apiFetch }: { value: CoverImageState | null; onChange: (v: CoverImageState | null) => void; apiFetch: ApiFetch }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setError("Image must be under 6 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const res = await apiFetch(`${API_BASE}/admin/posts/upload`, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          "X-Filename": file.name,
        },
        body: buffer,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Upload failed (${res.status})`);
      }
      const data = (await res.json()) as UploadResponse;
      onChange({ url: data.asset.url, assetId: data.asset.assetId });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="https://… or upload below"
          value={value?.url ?? ""}
          onChange={(e) => onChange(e.target.value ? { url: e.target.value } : null)}
          disabled={Boolean(value?.assetId)}
        />
        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all whitespace-nowrap">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {value?.url && (
        <div className="mt-2 flex items-center gap-2">
          <img src={value.url} alt="Cover preview" className="w-20 h-12 object-cover rounded-md border border-border" />
          <button onClick={() => onChange(null)} className="text-[11px] font-semibold text-red-500 hover:underline">
            Remove
          </button>
          {value.assetId && (
            <span className="text-[10px] text-emerald-700 font-semibold">CMS asset</span>
          )}
        </div>
      )}
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
      <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WebP — max 6 MB. Uploaded to the CMS asset library.</p>
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

interface ServerPostBlock {
  type: "p" | "h2" | "quote" | "list";
  text?: string;
  attribution?: string;
  items?: string[];
}

interface ServerPostPayload {
  id: string;
  updatedAt: string;
  lastEditedBy: { id: string; name: string } | null;
  kind: Kind;
  title: string;
  slug: string;
  excerpt: string;
  template: TemplateId;
  coverColor: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  coverImage: { assetId: string; url: string } | null;
  content: ServerPostBlock[];
  event: {
    date: string;
    endDate: string;
    location: string;
    virtualLink: string;
    registerUrl: string;
    recurrence: "none" | "weekly" | "monthly";
    recurrenceEnd: string;
  } | null;
}

function serverBlockToDraftBlock(b: ServerPostBlock): DraftBlock {
  const base = newBlock(b.type);
  if (b.type === "list") return { ...base, items: b.items?.length ? b.items : [""] };
  if (b.type === "quote") return { ...base, text: b.text ?? "", attribution: b.attribution ?? "" };
  return { ...base, text: b.text ?? "" };
}

function serverPostToDraft(p: ServerPostPayload): Draft {
  return {
    title: p.title,
    slug: p.slug,
    slugManual: true,
    kind: p.kind,
    template: p.template ?? "standard",
    excerpt: p.excerpt,
    authorName: p.authorName,
    authorRole: p.authorRole,
    coverColor: p.coverColor || "#16a34a",
    coverImage: p.coverImage,
    tags: p.tags ?? [],
    content: (p.content ?? []).map(serverBlockToDraftBlock),
    event: p.event
      ? {
          date: p.event.date,
          endDate: p.event.endDate,
          location: p.event.location,
          virtualLink: p.event.virtualLink,
          registerUrl: p.event.registerUrl,
          recurrence: p.event.recurrence,
          recurrenceEnd: p.event.recurrenceEnd,
        }
      : DEFAULT_EVENT,
  };
}

interface PresenceUser {
  id: string;
  name: string;
  imageUrl?: string;
}

const PRESENCE_HEARTBEAT_MS = 10_000;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function PresenceBar({ others }: { others: PresenceUser[] }) {
  if (others.length === 0) return null;
  const visible = others.slice(0, 4);
  const extra = others.length - visible.length;
  const summary =
    others.length === 1
      ? `${others[0].name} is also editing this post`
      : `${others.length} others are editing this post`;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-violet-50 border-b border-violet-200"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <Users className="w-4 h-4 text-violet-700 shrink-0" />
        <div className="flex -space-x-2 shrink-0">
          {visible.map((u) =>
            u.imageUrl ? (
              <img
                key={u.id}
                src={u.imageUrl}
                alt={u.name}
                title={u.name}
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <span
                key={u.id}
                title={u.name}
                className="w-7 h-7 rounded-full border-2 border-white bg-violet-200 text-violet-900 text-[10px] font-bold flex items-center justify-center"
              >
                {initials(u.name)}
              </span>
            ),
          )}
          {extra > 0 && (
            <span className="w-7 h-7 rounded-full border-2 border-white bg-violet-100 text-violet-800 text-[10px] font-bold flex items-center justify-center">
              +{extra}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-violet-900 flex-1 truncate">
          <span className="font-bold">{summary}.</span>{" "}
          <span className="hidden sm:inline">Coordinate to avoid overwriting each other.</span>
        </p>
      </div>
    </motion.div>
  );
}

export default function AdminComposerPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const apiFetch = useApiClient();
  const { user } = useUser();
  const meId = user?.id ?? "";
  // Determine edit mode synchronously so we don't briefly hydrate from the
  // localStorage "new post" draft when arriving via ?edit=<id>.
  const editId = (() => {
    if (typeof window === "undefined") return null;
    const v = new URLSearchParams(window.location.search).get("edit");
    return v && /^[A-Za-z0-9._-]+$/.test(v) ? v : null;
  })();
  const [draft, setDraft] = useState<Draft>(() => (editId ? DEFAULT_DRAFT : loadDraft()));
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published">("idle");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [aiBanner, setAiBanner] = useState(false);
  const [editLoading, setEditLoading] = useState<boolean>(Boolean(editId));
  const [editLoadError, setEditLoadError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string>("");
  const [staleConflict, setStaleConflict] = useState(false);
  const [presenceOthers, setPresenceOthers] = useState<PresenceUser[]>([]);
  const [savedByOther, setSavedByOther] = useState<{ name: string; updatedAt: string } | null>(null);
  const isEditing = Boolean(editId);

  // Live presence: while editing, ping the server every ~10s so other admins
  // see we're here, and clear ourselves on close. The list of *other* editors
  // is returned by every heartbeat so the indicator stays current.
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    const url = `${API_BASE}/admin/posts/${encodeURIComponent(editId)}/presence`;

    const heartbeat = async () => {
      try {
        const res = await apiFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          others?: PresenceUser[];
          updatedAt?: string;
          lastEditedBy?: { id: string; name: string } | null;
        };
        if (cancelled) return;
        setPresenceOthers(Array.isArray(data.others) ? data.others : []);

        // If the server's `_updatedAt` is newer than the version we loaded,
        // a co-editor has saved while we were typing. Surface a non-blocking
        // notice with a Reload button so admins can pull in fresh content
        // before they invest more work into a stale view.
        const latest = data.updatedAt ?? "";
        // Self-saves bump `baseUpdatedAt` from the PATCH response, so the
        // comparison usually excludes our own writes — but there's a small
        // race window where a heartbeat can fire between Sanity committing
        // and the PATCH response landing. Belt-and-braces: skip if the
        // server tells us *we* are the last editor.
        setBaseUpdatedAt((prevBase) => {
          if (latest && prevBase && latest > prevBase) {
            const editor = data.lastEditedBy;
            if (!editor || !meId || editor.id !== meId) {
              const name = editor?.name?.trim() || "Someone";
              setSavedByOther({ name, updatedAt: latest });
            }
          }
          return prevBase;
        });
      } catch {
        // Network blip — keep last known list; next tick will retry.
      }
    };

    void heartbeat();
    const interval = window.setInterval(() => {
      void heartbeat();
    }, PRESENCE_HEARTBEAT_MS);

    const announceLeave = () => {
      // `keepalive` lets the request finish even if the document is unloading,
      // so this works for both SPA navigations and full page closes.
      void fetch(url, {
        method: "DELETE",
        credentials: "include",
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener("beforeunload", announceLeave);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", announceLeave);
      announceLeave();
      setPresenceOthers([]);
    };
  }, [editId]);

  // Load existing post — extracted so we can call again after a restore so
  // the composer reflects the rolled-back content immediately.
  const loadEditingPost = useCallback(
    async (signal?: { cancelled: boolean }) => {
      if (!editId) return;
      setEditLoading(true);
      setEditLoadError(null);
      try {
        const res = await apiFetch(`${API_BASE}/admin/posts/${encodeURIComponent(editId)}`);
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `Load failed (${res.status})`);
        }
        const data = (await res.json()) as { post: ServerPostPayload };
        if (signal?.cancelled) return;
        setDraft(serverPostToDraft(data.post));
        setBaseUpdatedAt(data.post.updatedAt ?? "");
        setStaleConflict(false);
        setSavedByOther(null);
        setEditLoading(false);
      } catch (e) {
        if (signal?.cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load post";
        setEditLoadError(message);
        setEditLoading(false);
      }
    },
    [editId],
  );

  useEffect(() => {
    if (!editId) return;
    const signal = { cancelled: false };
    void loadEditingPost(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [editId, loadEditingPost]);

  // AI handoff: pre-fill draft if redirected from /admin/new-post/ai
  useEffect(() => {
    if (editId) return;
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
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // While editing an existing post we deliberately don't write to the
  // localStorage "new post" draft — those slots are reserved for the
  // create-from-scratch flow.
  const persistDraft = useCallback(
    (next: Draft) => {
      if (!isEditing) saveDraft(next);
    },
    [isEditing],
  );

  const update = useCallback((patch: Partial<Draft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      persistDraft(next);
      return next;
    });
  }, [persistDraft]);

  const updateEvent = useCallback((patch: Partial<DraftEvent>) => {
    setDraft((prev) => {
      const next = { ...prev, event: { ...prev.event, ...patch } };
      persistDraft(next);
      return next;
    });
  }, [persistDraft]);

  const updateTitle = useCallback((title: string) => {
    setDraft((prev) => {
      const next: Draft = {
        ...prev,
        title,
        slug: prev.slugManual ? prev.slug : toSlug(title),
      };
      persistDraft(next);
      return next;
    });
  }, [persistDraft]);

  const addBlock = useCallback((type: BlockType) => {
    setDraft((prev) => {
      const next = { ...prev, content: [...prev.content, newBlock(type)] };
      persistDraft(next);
      return next;
    });
  }, [persistDraft]);

  const updateBlock = useCallback((id: string, block: DraftBlock) => {
    setDraft((prev) => {
      const next = { ...prev, content: prev.content.map((b) => (b.id === id ? block : b)) };
      persistDraft(next);
      return next;
    });
  }, [persistDraft]);

  const removeBlock = useCallback((id: string) => {
    setDraft((prev) => {
      const next = { ...prev, content: prev.content.filter((b) => b.id !== id) };
      persistDraft(next);
      return next;
    });
  }, [persistDraft]);

  const moveBlock = useCallback((id: string, dir: -1 | 1) => {
    setDraft((prev) => {
      const idx = prev.content.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const arr = [...prev.content];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      const next = { ...prev, content: arr };
      persistDraft(next);
      return next;
    });
  }, [persistDraft]);

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
    setPublishError(null);

    const baseSlug = draft.slug || toSlug(draft.title) || "draft-post";
    // When editing, the server scopes uniqueness checks to "other documents",
    // so we should NOT pre-suffix the slug — that would needlessly rename the
    // post on every save.
    const uniqueSlug = isEditing ? baseSlug : ensureUniqueSlug(baseSlug);

    const payload = {
      kind: draft.kind,
      title: draft.title.trim(),
      slug: uniqueSlug,
      baseUpdatedAt: isEditing ? baseUpdatedAt : undefined,
      excerpt: draft.excerpt.trim(),
      authorName: draft.authorName.trim(),
      authorRole: draft.authorRole.trim(),
      tags: draft.tags,
      template: draft.template,
      coverColor: draft.coverColor,
      coverImageAssetId: draft.coverImage?.assetId,
      coverImageUrl: draft.coverImage?.url,
      content: draft.content.map((b) => {
        if (b.type === "list") return { type: "list" as const, items: b.items.filter((i) => i.trim()) };
        if (b.type === "quote") return { type: "quote" as const, text: b.text, attribution: b.attribution || undefined };
        return { type: b.type as "p" | "h2", text: b.text };
      }),
      event:
        draft.kind === "event"
          ? {
              date: draft.event.date,
              endDate: draft.event.endDate || undefined,
              location: draft.event.location || undefined,
              virtualLink: draft.event.virtualLink || undefined,
              registerUrl: draft.event.registerUrl || undefined,
              recurrence: draft.event.recurrence,
              recurrenceEnd: draft.event.recurrenceEnd || undefined,
            }
          : undefined,
    };

    try {
      const url = isEditing
        ? `${API_BASE}/admin/posts/${encodeURIComponent(editId!)}`
        : `${API_BASE}/admin/posts`;
      const method = isEditing ? "PATCH" : "POST";
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
          currentUpdatedAt?: string;
        };
        if (res.status === 409 && data.code === "stale_edit") {
          setStaleConflict(true);
          setPublishError(null);
          setPublishState("idle");
          return;
        }
        throw new Error(data.error ?? `${isEditing ? "Update" : "Publish"} failed (${res.status})`);
      }
      const okData = (await res.json().catch(() => ({}))) as { updatedAt?: string };
      if (isEditing && okData.updatedAt) setBaseUpdatedAt(okData.updatedAt);
      setSavedByOther(null);
      setPublishState("published");
      if (!isEditing) clearDraftStorage();
      // Invalidate cached lists so the change shows up immediately everywhere.
      await queryClient.invalidateQueries({ queryKey: ["articles"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["article"] });
      setTimeout(() => {
        setLocation("/admin/posts");
      }, 700);
    } catch (e) {
      const message = e instanceof Error ? e.message : `${isEditing ? "Update" : "Publish"} failed`;
      setPublishError(message);
      setPublishState("idle");
    }
  }, [canPublish, draft, setLocation, queryClient, isEditing, editId, baseUpdatedAt]);

  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
  const sanityBase =
    isSanityConfigured && projectId
      ? `https://${projectId}.sanity.studio/structure/${
          draft.kind === "event" ? "event" : draft.kind === "news" ? "news" : "blog"
        }`
      : null;
  const sanityUrl = sanityBase
    ? isEditing && editId
      ? `${sanityBase};${editId}`
      : sanityBase
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
              <span className="text-primary">{isEditing ? "Edit" : "Compose"}</span>
              <span className="text-muted-foreground hidden sm:inline"> · {KIND_OPTIONS.find((k) => k.value === draft.kind)?.label}</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {!isEditing && (showClearConfirm ? (
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
            ))}
            <Link href="/admin/posts" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors" title="Manage all posts">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All posts</span>
            </Link>
          </div>
        </div>
      </div>

      {isEditing && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-sky-50 to-emerald-50 border-b border-sky-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
            <PenLine className="w-4 h-4 text-sky-700 shrink-0" />
            <p className="text-xs sm:text-sm text-sky-900 flex-1">
              <span className="font-bold">Editing existing post.</span>{" "}
              <span className="hidden sm:inline">
                {editLoading ? "Loading current content…" : "Saving will update the live post for everyone."}
              </span>
            </p>
            {editLoading && <Loader2 className="w-4 h-4 text-sky-700 animate-spin" />}
          </div>
        </motion.div>
      )}

      {isEditing && <PresenceBar others={presenceOthers} />}

      {savedByOther && !staleConflict && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-sky-50 border-b border-sky-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-sky-700 shrink-0" />
            <p className="text-xs sm:text-sm text-sky-900 flex-1">
              <span className="font-bold">{savedByOther.name} just saved this post</span> — your view is now stale. Reload to pick up their changes before you keep editing.
            </p>
            <button
              onClick={async () => {
                setSavedByOther(null);
                await loadEditingPost();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
            >
              Reload
            </button>
            <button onClick={() => setSavedByOther(null)} className="text-sky-700 hover:text-sky-900 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {staleConflict && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-900 flex-1">
              <span className="font-bold">This post was changed by someone else</span> — reload to keep editing. Saving now would overwrite their changes.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Reload
            </button>
            <button onClick={() => setStaleConflict(false)} className="text-amber-700 hover:text-amber-900 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {editLoadError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-b border-red-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-xs sm:text-sm text-red-900 flex-1">
              <span className="font-bold">Couldn't load post.</span> {editLoadError}
            </p>
            <Link href="/admin/posts" className="text-xs font-bold text-red-700 hover:underline">
              Back to posts
            </Link>
          </div>
        </motion.div>
      )}

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

      {publishError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-b border-red-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-xs sm:text-sm text-red-900 flex-1">
              <span className="font-bold">Publish failed.</span> {publishError}
            </p>
            <button onClick={() => setPublishError(null)} className="text-red-700 hover:text-red-900 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="lg:hidden bg-white border-b border-border px-4 py-2.5 flex gap-2 shrink-0">
        <button onClick={() => setMobileTab("form")} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${mobileTab === "form" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"}`}>
          <PenLine className="w-3.5 h-3.5" /> Form
        </button>
        <button onClick={() => setMobileTab("preview")} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${mobileTab === "preview" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"}`}>
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      <div className="flex-1 flex max-w-screen-2xl mx-auto w-full overflow-hidden">
        <div className={`lg:flex flex-col w-full lg:w-[26rem] shrink-0 border-r border-border bg-white/60 ${mobileTab === "form" ? "flex" : "hidden"} lg:flex`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
            <SectionCard title="Post Settings">
              <Field
                label="Post type"
                hint={isEditing ? "Post type can't change once published — delete and recreate to switch." : undefined}
              >
                <div className={`flex rounded-xl border border-border overflow-hidden ${isEditing ? "opacity-60" : ""}`}>
                  {KIND_OPTIONS.map((k) => (
                    <button
                      key={k.value}
                      onClick={() => !isEditing && update({ kind: k.value })}
                      disabled={isEditing}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all ${draft.kind === k.value ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"} ${isEditing ? "cursor-not-allowed" : ""}`}
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

            {draft.kind === "event" && (
              <SectionCard title="Event Details" accent>
                <Field label={<span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Start date / time</span>}>
                  <input type="datetime-local" className={inputCls} value={draft.event.date} onChange={(e) => updateEvent({ date: e.target.value })} />
                </Field>
                <Field label="End date / time (optional)">
                  <input type="datetime-local" className={inputCls} value={draft.event.endDate} onChange={(e) => updateEvent({ endDate: e.target.value })} />
                </Field>
                <Field label={<span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span>}>
                  <input className={inputCls} placeholder="e.g. Accra Head Office" value={draft.event.location} onChange={(e) => updateEvent({ location: e.target.value })} />
                </Field>
                <Field label={<span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> Virtual link (optional)</span>}>
                  <input type="url" className={inputCls} placeholder="https://meet.google.com/…" value={draft.event.virtualLink} onChange={(e) => updateEvent({ virtualLink: e.target.value })} />
                </Field>
                <Field label={<span className="flex items-center gap-1"><Ticket className="w-3 h-3" /> Registration link (optional)</span>} hint="Where attendees go to register or RSVP — shown on the event card.">
                  <input type="url" className={inputCls} placeholder="https://sikafields.com/events/register" value={draft.event.registerUrl} onChange={(e) => updateEvent({ registerUrl: e.target.value })} />
                </Field>
                <Field label={<span className="flex items-center gap-1"><Repeat className="w-3 h-3" /> Recurrence</span>}>
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

            <SectionCard title="Author">
              <Field label="Name">
                <input className={inputCls} placeholder="Full name…" value={draft.authorName} onChange={(e) => update({ authorName: e.target.value })} />
              </Field>
              <Field label="Role">
                <input className={inputCls} placeholder="e.g. Chief Strategy Officer" value={draft.authorRole} onChange={(e) => update({ authorRole: e.target.value })} />
              </Field>
            </SectionCard>

            <SectionCard title="Appearance">
              <Field label="Cover colour">
                <div className="flex gap-2 flex-wrap">
                  {COVER_COLORS.map((c) => (
                    <button key={c.value} onClick={() => update({ coverColor: c.value })} title={c.label} className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${draft.coverColor === c.value ? "border-foreground shadow-md scale-110" : "border-transparent"}`} style={{ backgroundColor: c.value }} />
                  ))}
                </div>
              </Field>
              <Field label="Cover image">
                <ImageUploadField value={draft.coverImage} onChange={(v) => update({ coverImage: v })} apiFetch={apiFetch} />
              </Field>
            </SectionCard>

            <SectionCard title="Tags">
              <TagInput tags={draft.tags} onChange={(tags) => update({ tags })} />
            </SectionCard>

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

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-4px_20px_-12px_rgba(0,0,0,0.08)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {draft.title || <span className="text-muted-foreground italic">Untitled Post</span>}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isEditing ? "Editing live post" : "Draft saved"} · {draft.content.length} blocks · {wordCount(draft)} words
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CopyJsonButton draft={draft} />
            {isEditing && editId && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                title="View revision history"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
              </button>
            )}
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
              {publishState === "publishing" && (<><Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? "Saving…" : "Publishing…"}</>)}
              {publishState === "published" && (<><CheckCircle2 className="w-4 h-4" /> {isEditing ? "Saved" : "Published"}</>)}
              {publishState === "idle" && (<><Send className="w-4 h-4" /> <span className="hidden sm:inline">{isEditing ? "Save changes" : "Publish post"}</span><span className="sm:hidden">{isEditing ? "Save" : "Publish"}</span></>)}
            </button>
          </div>
        </div>
      </div>

      {isEditing && editId && (
        <RevisionHistoryDialog
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          postId={editId}
          postTitle={draft.title || "Untitled Post"}
          onRestored={() => {
            void loadEditingPost();
          }}
        />
      )}
    </div>
  );
}
