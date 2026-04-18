import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Copy, Check, Eye, ExternalLink, Palette,
  LayoutDashboard, Calendar, Clock, Loader2, BookOpen, Plus,
  Trash2, AlertCircle, Pencil, History,
} from "lucide-react";
import { ARTICLES, type Article } from "@/data/articles";
import { useAllArticles } from "@/hooks/useArticles";
import { isSanityConfigured } from "@/lib/sanity";
import { AuthorAvatar, tagStyle } from "@/lib/article-shared";
import { RevisionHistoryDialog } from "@/components/RevisionHistoryDialog";

function formatLastEdited(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const API_BASE = "/api";

// Posts bundled into the source (artifacts/sikafields/src/data/articles.ts)
// can't be deleted via the API. Everything else is server-managed in Sanity.
const BUNDLED_ARTICLE_IDS: ReadonlySet<string> = new Set(ARTICLES.map((a) => a.id));
function isServerManaged(id: string): boolean {
  return !BUNDLED_ARTICLE_IDS.has(id);
}

type TemplateId = "standard" | "hero" | "visual";

const TEMPLATE_STORAGE_KEY = (slug: string) => `sf-studio-template:${slug}`;

function readStoredTemplate(slug: string): TemplateId | null {
  try {
    const v = localStorage.getItem(TEMPLATE_STORAGE_KEY(slug));
    if (v === "standard" || v === "hero" || v === "visual") return v;
  } catch {
  }
  return null;
}

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  standard: "Standard",
  hero: "Hero Focus",
  visual: "Visual Story",
};

function StandardThumbnail() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded">
      <div className="h-[5px] bg-gray-200 shrink-0" />
      <div className="flex-1 bg-white px-[5px] py-[3px] flex flex-col gap-[2px]">
        <div className="h-[5px] w-3/4 bg-gray-700 rounded-sm" />
        <div className="h-[3px] w-1/2 bg-gray-400 rounded-sm" />
        <div className="mt-[2px] h-[2px] w-full bg-gray-200 rounded-sm" />
        <div className="h-[2px] w-full bg-gray-200 rounded-sm" />
        <div className="h-[2px] w-4/5 bg-gray-200 rounded-sm" />
        <div className="mt-[2px] h-[2px] w-full bg-gray-200 rounded-sm" />
        <div className="h-[2px] w-3/4 bg-gray-200 rounded-sm" />
      </div>
    </div>
  );
}

function HeroThumbnail() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded">
      <div className="h-[18px] shrink-0 bg-gradient-to-br from-green-700 to-green-900 relative flex items-end px-[5px] pb-[3px]">
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative h-[4px] w-1/2 bg-white/70 rounded-sm" />
      </div>
      <div className="flex-1 bg-white px-[5px] py-[3px] flex flex-col gap-[2px]">
        <div className="h-[3px] w-2/3 bg-gray-600 rounded-sm" />
        <div className="h-[2px] w-full bg-gray-200 rounded-sm" />
        <div className="h-[2px] w-full bg-gray-200 rounded-sm" />
        <div className="h-[2px] w-4/5 bg-gray-200 rounded-sm" />
        <div className="mt-[2px] h-[2px] w-full bg-gray-200 rounded-sm" />
      </div>
    </div>
  );
}

function VisualThumbnail() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded">
      <div className="h-[5px] bg-gray-200 shrink-0" />
      <div className="flex-1 bg-white px-[4px] py-[3px] flex flex-col gap-[2px]">
        <div className="h-[3px] w-3/5 bg-gray-700 rounded-sm" />
        <div className="flex gap-[3px] mt-[1px] flex-1">
          <div className="flex flex-col gap-[2px] flex-1">
            <div className="h-[8px] bg-green-100 rounded-sm" />
            <div className="h-[2px] w-full bg-gray-200 rounded-sm" />
            <div className="h-[2px] w-3/4 bg-gray-200 rounded-sm" />
          </div>
          <div className="flex flex-col gap-[2px] flex-1">
            <div className="h-[2px] w-full bg-gray-200 rounded-sm" />
            <div className="h-[2px] w-4/5 bg-gray-200 rounded-sm" />
            <div className="h-[8px] bg-green-100 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATE_THUMBNAILS: Record<TemplateId, React.ReactNode> = {
  standard: <StandardThumbnail />,
  hero: <HeroThumbnail />,
  visual: <VisualThumbnail />,
};

function PostCard({ article, index }: { article: Article; index: number }) {
  const queryClient = useQueryClient();
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>(
    () => readStoredTemplate(article.slug) ?? article.template ?? "standard"
  );
  const [copied, setCopied] = useState(false);
  const [deleteState, setDeleteState] = useState<"idle" | "confirm" | "deleting" | "deleted">("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  // Bundled (in-source) posts can't be edited or deleted via the API —
  // those operations need a server-managed Sanity document.
  const isEditable = isServerManaged(article.id);
  const canDelete = isEditable;

  const cc = article.coverColor ?? "#16a34a";
  const shareUrl = `https://sikafields.com/articles/${article.slug}`;
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
  const cmsUrl =
    isSanityConfigured && projectId
      ? `https://${projectId}.sanity.studio/structure/${
          article.kind === "event" ? "event" : article.kind === "news" ? "news" : "blog"
        };${article.id}`
      : null;

  const selectTemplate = useCallback(
    (t: TemplateId) => {
      setActiveTemplate(t);
      try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY(article.slug), t);
      } catch {
      }
    },
    [article.slug],
  );

  const performDelete = useCallback(async () => {
    setDeleteState("deleting");
    setDeleteError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/posts/${encodeURIComponent(article.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      setDeleteState("deleted");
      await queryClient.invalidateQueries({ queryKey: ["articles"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["article"] });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Delete failed";
      setDeleteError(message);
      setDeleteState("idle");
    }
  }, [article.id, queryClient]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col ${
        deleteState === "deleted" ? "opacity-50 grayscale pointer-events-none" : ""
      }`}
    >
      {/* Cover strip */}
      <div
        className="h-24 relative flex items-end px-4 pb-3 shrink-0"
        style={{ backgroundColor: cc + "22" }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${cc}44 0%, ${cc}11 100%)` }}
        />
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative flex items-center gap-2">
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: cc }}
          >
            {article.kind === "event" ? "Event" : article.kind === "news" ? "News" : "Article"}
          </span>
          {article.featured && (
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500 text-white">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title + meta */}
        <div>
          <h3 className="font-display font-bold text-sm text-foreground leading-snug mb-2 line-clamp-2">
            {article.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <AuthorAvatar author={article.author} size={4} />
              <span className="font-medium truncate max-w-[120px]">{article.author.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" />
              {article.publishedAt}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              {article.readTime}m read
            </span>
          </div>
          {article.lastEdited && (
            <p
              className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1"
              title={new Date(article.lastEdited.at).toLocaleString()}
            >
              <Pencil className="w-2.5 h-2.5 shrink-0" />
              Edited {formatLastEdited(article.lastEdited.at)}
              {" by "}
              {article.lastEdited.byName ?? (
                <span className="italic">unknown editor</span>
              )}
            </p>
          )}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((t) => {
              const s = tagStyle(t);
              return (
                <span
                  key={t}
                  className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ color: s.text, backgroundColor: s.bg }}
                >
                  {t}
                </span>
              );
            })}
            {article.tags.length > 3 && (
              <span className="text-[8px] font-bold text-muted-foreground">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Template picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Palette className="w-2.5 h-2.5" /> Template
            </p>
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              {TEMPLATE_LABELS[activeTemplate]}
            </span>
          </div>
          <div className="flex gap-1.5">
            {(["standard", "hero", "visual"] as TemplateId[]).map((id) => {
              const isActive = activeTemplate === id;
              return (
                <button
                  key={id}
                  onClick={() => selectTemplate(id)}
                  title={TEMPLATE_LABELS[id]}
                  className={`flex-1 flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all group ${
                    isActive
                      ? "border-primary shadow-sm bg-primary/5"
                      : "border-border hover:border-primary/40 bg-transparent"
                  }`}
                >
                  <div className="w-full h-[44px] overflow-hidden rounded-md border border-border/50 bg-gray-50">
                    {TEMPLATE_THUMBNAILS[id]}
                  </div>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wide ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    }`}
                  >
                    {TEMPLATE_LABELS[id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 mt-auto">
          {isEditable ? (
            <div className="flex gap-1.5">
              <Link
                href={`/admin/new-post/scratch?edit=${encodeURIComponent(article.id)}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                title="Edit this post in the in-app composer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Link>
              <Link
                href={`/articles/${article.slug}/studio`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                title="Open the visual studio (template & layout preview)"
              >
                <Eye className="w-3.5 h-3.5" />
                Studio
              </Link>
            </div>
          ) : (
            <Link
              href={`/articles/${article.slug}/studio`}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Open Post Studio
            </Link>
          )}
          <div className="flex gap-1.5">
            <Link
              href={`/articles/${article.slug}`}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              <BookOpen className="w-3 h-3" />
              View
            </Link>
            <button
              onClick={copyLink}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                copied
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy link"}
            </button>
            {cmsUrl && (
              <a
                href={cmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Edit in Sanity CMS"
                className="flex items-center justify-center px-2 py-1.5 rounded-xl border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {isEditable && (
              <button
                onClick={() => setHistoryOpen(true)}
                title="View revision history"
                className="flex items-center justify-center px-2 py-1.5 rounded-xl border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
              >
                <History className="w-3 h-3" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setDeleteState("confirm")}
                title="Delete post"
                className="flex items-center justify-center px-2 py-1.5 rounded-xl border border-border text-muted-foreground hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          {isEditable && (
            <RevisionHistoryDialog
              open={historyOpen}
              onClose={() => setHistoryOpen(false)}
              postId={article.id}
              postTitle={article.title}
            />
          )}

          {deleteError && (
            <div className="flex items-start gap-1.5 text-[10px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          {deleteState === "confirm" && (
            <div className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2.5 space-y-2">
              <p className="text-[11px] font-semibold text-red-900 leading-snug">
                Permanently delete this post for everyone?
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={performDelete}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Yes, delete
                </button>
                <button
                  onClick={() => setDeleteState("idle")}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-border text-[11px] font-semibold text-muted-foreground hover:bg-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deleteState === "deleting" && (
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-muted-foreground py-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Deleting…
            </div>
          )}

          {deleteState === "deleted" && (
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-emerald-700 py-1">
              <Check className="w-3 h-3" /> Deleted
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminPostsPage() {
  const { data: articles = [], isLoading } = useAllArticles();

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
            <span className="hidden sm:inline">Articles</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <LayoutDashboard className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-semibold">
              <span className="text-primary">Blog Manager</span>
              <span className="text-muted-foreground hidden sm:inline"> · All posts</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/new-post"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New post
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && articles.length > 0 && (
        <div className="border-b border-border bg-white/70 backdrop-blur">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-6 text-xs text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">{articles.length}</span> total posts
            </span>
            <span>
              <span className="font-bold text-foreground">
                {articles.filter((a) => a.kind === "article").length}
              </span>{" "}
              articles
            </span>
            <span>
              <span className="font-bold text-foreground">
                {articles.filter((a) => a.kind === "news").length}
              </span>{" "}
              news
            </span>
            <span>
              <span className="font-bold text-foreground">
                {articles.filter((a) => a.kind === "event").length}
              </span>{" "}
              events
            </span>
            <span>
              <span className="font-bold text-foreground">
                {articles.filter((a) => a.featured).length}
              </span>{" "}
              featured
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-8">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Loading posts…</span>
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground opacity-30" />
            <p className="text-lg font-semibold text-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground">Create your first post to get started.</p>
            <Link
              href="/admin/new-post"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create first post
            </Link>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article, i) => (
              <PostCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border py-5 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted-foreground">
          <p>SikaFields Blog Manager</p>
          <Link href="/" className="hover:text-primary transition-colors font-semibold">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
