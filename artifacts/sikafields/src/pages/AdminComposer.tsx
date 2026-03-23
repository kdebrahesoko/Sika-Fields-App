import { useState, useCallback, useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, Plus, Trash2, FileText, ImageIcon, LayoutGrid,
  Type, AlignLeft, Quote, List, Check, Copy, ExternalLink,
  Eye, X, RotateCcw, ChevronUp, ChevronDown, PenLine,
} from "lucide-react";
import { type Article, type ArticleBlock } from "@/data/articles";
import { isSanityConfigured } from "@/lib/sanity";
import { tagStyle } from "@/lib/article-shared";
import {
  StandardTemplate,
  HeroTemplate,
  VisualTemplate,
} from "@/components/article-templates";

type TemplateId = "standard" | "hero" | "visual";
type BlockType = "p" | "h2" | "quote" | "list";

interface DraftBlock {
  id: string;
  type: BlockType;
  text: string;
  attribution: string;
  items: string[];
}

interface Draft {
  title: string;
  slug: string;
  slugManual: boolean;
  kind: "article" | "news";
  template: TemplateId;
  excerpt: string;
  authorName: string;
  authorRole: string;
  coverColor: string;
  coverImage: string;
  tags: string[];
  content: DraftBlock[];
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
    coverImage: draft.coverImage || undefined,
    author: {
      name: draft.authorName || "Admin",
      role: draft.authorRole || "",
    },
    tags: draft.tags,
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
};

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
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

// --- Sub-components ---

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label, children, hint,
}: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-xs font-semibold text-foreground mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50";
const textareaCls = `${inputCls} resize-none`;

function BlockEditor({
  block,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
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
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {typeLabel}
        </span>
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
            title="Remove block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {block.type === "h2" && (
        <input
          className={inputCls}
          placeholder="Section heading…"
          value={block.text}
          onChange={(e) => set({ text: e.target.value })}
        />
      )}

      {block.type === "p" && (
        <textarea
          className={textareaCls}
          rows={4}
          placeholder="Write your paragraph…"
          value={block.text}
          onChange={(e) => set({ text: e.target.value })}
        />
      )}

      {block.type === "quote" && (
        <div className="space-y-2">
          <textarea
            className={textareaCls}
            rows={3}
            placeholder="Pull quote text…"
            value={block.text}
            onChange={(e) => set({ text: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Attribution (e.g. — Jane Smith, CEO)"
            value={block.attribution}
            onChange={(e) => set({ attribution: e.target.value })}
          />
        </div>
      )}

      {block.type === "list" && (
        <div className="space-y-1.5">
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-xs shrink-0">•</span>
              <input
                className={`${inputCls} flex-1`}
                placeholder={`Item ${i + 1}…`}
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
              />
              <button
                onClick={() => removeItem(i)}
                disabled={block.items.length === 1}
                className="w-6 h-6 shrink-0 rounded flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1"
          >
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
            <span
              key={t}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full cursor-pointer hover:opacity-75 transition-opacity"
              style={{ color: s.text, backgroundColor: s.bg }}
              onClick={() => onChange(tags.filter((x) => x !== t))}
              title="Click to remove"
            >
              {t} <X className="w-2.5 h-2.5" />
            </span>
          );
        })}
        {tags.length === 0 && (
          <span className="text-xs text-muted-foreground/60 italic">No tags yet</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Add a tag and press Enter…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
        />
        <button
          onClick={addTag}
          disabled={!input.trim()}
          className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Press Enter or click Add · click a tag to remove it</p>
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
    <button
      onClick={copy}
      disabled={!hasTitle}
      title={!hasTitle ? "Add a title before copying" : undefined}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
        state === "copied"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-foreground hover:bg-muted/80"
      }`}
    >
      {state === "copied" ? (
        <><Check className="w-4 h-4" /> Copied!</>
      ) : (
        <><Copy className="w-4 h-4" /> Copy JSON</>
      )}
    </button>
  );
}

function LivePreview({ draft }: { draft: Draft }) {
  const article = draftToArticle(draft);
  const shareUrl = `https://sikafields.com/articles/${article.slug}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={draft.template}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        {draft.template === "hero"    && <HeroTemplate    article={article} shareUrl={shareUrl} preview />}
        {draft.template === "visual"  && <VisualTemplate  article={article} shareUrl={shareUrl} preview />}
        {draft.template === "standard" && <StandardTemplate article={article} shareUrl={shareUrl} preview />}
      </motion.div>
    </AnimatePresence>
  );
}

// --- Main page ---

export default function AdminComposerPage() {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const update = useCallback((patch: Partial<Draft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
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
          <Link
            href="/articles"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Articles</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <PenLine className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-semibold text-foreground truncate">
              <span className="text-primary">Admin</span>
              <span className="text-muted-foreground hidden sm:inline"> · New Post</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Clear draft?</span>
                <button
                  onClick={clearDraft}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Clear draft"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear draft</span>
              </button>
            )}
            <img src="/sikafields-logo.png" alt="SikaFields" className="h-7 object-contain" />
          </div>
        </div>
      </div>

      {/* Mobile tab strip */}
      <div className="lg:hidden bg-white border-b border-border px-4 py-2.5 flex gap-2 shrink-0">
        <button
          onClick={() => setMobileTab("form")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            mobileTab === "form"
              ? "bg-primary text-white border-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          <PenLine className="w-3.5 h-3.5" /> Form
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            mobileTab === "preview"
              ? "bg-primary text-white border-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex max-w-screen-2xl mx-auto w-full overflow-hidden">
        {/* Left form panel */}
        <div
          className={`lg:flex flex-col w-full lg:w-96 shrink-0 border-r border-border bg-white/60 ${
            mobileTab === "form" ? "flex" : "hidden"
          } lg:flex`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">

            {/* Post type + template */}
            <SectionCard title="Post Settings">
              <Field label="Post type">
                <div className="flex rounded-xl border border-border overflow-hidden">
                  {(["article", "news"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => update({ kind: k })}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        draft.kind === k
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {k === "article" ? "Article" : "News"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Template">
                <div className="space-y-2">
                  {TEMPLATE_OPTIONS.map((t) => {
                    const isActive = draft.template === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => update({ template: t.id })}
                        className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className={`mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                          {t.icon}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                            {t.label}
                          </p>
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

            {/* Details */}
            <SectionCard title="Details">
              <Field
                label="Title"
                hint={
                  !draft.title.trim()
                    ? "Required — add a title to enable JSON export."
                    : "Slug is auto-generated from title."
                }
              >
                <input
                  className={`${inputCls} ${!draft.title.trim() ? "border-amber-300 focus:border-amber-400 focus:ring-amber-200/50" : ""}`}
                  placeholder="Article title…"
                  value={draft.title}
                  onChange={(e) => updateTitle(e.target.value)}
                />
              </Field>
              <Field label="Slug" hint="Edit to override the auto-generated URL slug.">
                <input
                  className={inputCls}
                  placeholder="url-friendly-slug"
                  value={draft.slug}
                  onChange={(e) => update({ slug: toSlug(e.target.value), slugManual: true })}
                />
              </Field>
              <Field label="Excerpt" hint="1–2 sentence summary shown on article cards and at the top of the article.">
                <textarea
                  className={textareaCls}
                  rows={3}
                  placeholder="A concise summary of this article…"
                  value={draft.excerpt}
                  onChange={(e) => update({ excerpt: e.target.value })}
                />
              </Field>
            </SectionCard>

            {/* Author */}
            <SectionCard title="Author">
              <Field label="Name">
                <input
                  className={inputCls}
                  placeholder="Full name…"
                  value={draft.authorName}
                  onChange={(e) => update({ authorName: e.target.value })}
                />
              </Field>
              <Field label="Role">
                <input
                  className={inputCls}
                  placeholder="e.g. Chief Strategy Officer"
                  value={draft.authorRole}
                  onChange={(e) => update({ authorRole: e.target.value })}
                />
              </Field>
            </SectionCard>

            {/* Appearance */}
            <SectionCard title="Appearance">
              <Field label="Cover colour">
                <div className="flex gap-2 flex-wrap">
                  {COVER_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => update({ coverColor: c.value })}
                      title={c.label}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        draft.coverColor === c.value
                          ? "border-foreground shadow-md scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Cover image URL" hint="Optional. Paste a direct image URL (used by Hero and Visual Story templates).">
                <input
                  className={inputCls}
                  placeholder="https://…"
                  value={draft.coverImage}
                  onChange={(e) => update({ coverImage: e.target.value })}
                />
              </Field>
            </SectionCard>

            {/* Tags */}
            <SectionCard title="Tags">
              <TagInput tags={draft.tags} onChange={(tags) => update({ tags })} />
            </SectionCard>

            {/* Content */}
            <SectionCard title="Content">
              {draft.content.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No content blocks yet. Add one below.
                </p>
              )}
              <div className="space-y-2 mb-4">
                {draft.content.map((block, idx) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    onUpdate={(b) => updateBlock(block.id, b)}
                    onRemove={() => removeBlock(block.id)}
                    onMoveUp={() => moveBlock(block.id, -1)}
                    onMoveDown={() => moveBlock(block.id, 1)}
                    isFirst={idx === 0}
                    isLast={idx === draft.content.length - 1}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {BLOCK_BUTTONS.map((b) => (
                  <button
                    key={b.type}
                    onClick={() => addBlock(b.type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-3 h-3" /> {b.label}
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Right preview panel */}
        <div
          className={`lg:flex flex-1 flex-col overflow-y-auto ${
            mobileTab === "preview" ? "flex" : "hidden"
          } lg:flex`}
        >
          {/* Preview label */}
          <div className="sticky top-0 z-30 bg-muted/80 backdrop-blur border-b border-border px-5 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              Live Preview
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                {TEMPLATE_OPTIONS.find((t) => t.id === draft.template)?.label}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              Updates as you type
            </span>
          </div>

          <div className="flex-1 bg-white shadow-sm pb-28">
            <LivePreview draft={draft} />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
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
            {sanityUrl ? (
              <a
                href={sanityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open Sanity CMS</span>
                <span className="sm:hidden">CMS</span>
              </a>
            ) : (
              <span
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-semibold cursor-not-allowed opacity-50"
                title="Sanity CMS is not configured. Set VITE_SANITY_PROJECT_ID to enable."
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open Sanity CMS</span>
                <span className="sm:hidden">CMS</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
