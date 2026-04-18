import { useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  History,
  X,
  RotateCcw,
  Loader2,
  AlertCircle,
  Check,
  Eye,
  ArrowLeft,
} from "lucide-react";
import {
  StandardTemplate,
  HeroTemplate,
  VisualTemplate,
} from "@/components/article-templates";
import type { Article, ArticleBlock, EventDetails } from "@/data/articles";

const API_BASE = "/api";

export interface RevisionItem {
  id: string;
  timestamp: string;
  authorName?: string;
}

interface ListResponse {
  revisions: RevisionItem[];
  warning?: string;
}

interface ServerPostBlock {
  type: "p" | "h2" | "quote" | "list";
  text?: string;
  attribution?: string;
  items?: string[];
}

interface ServerPostPayload {
  id: string;
  kind: "article" | "news" | "event";
  title: string;
  slug: string;
  excerpt: string;
  template: "standard" | "hero" | "visual";
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

interface RevisionFetchResponse {
  post: ServerPostPayload;
  revision: { id: string; timestamp: string };
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fullTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function serverBlockToArticleBlock(b: ServerPostBlock): ArticleBlock {
  if (b.type === "list") return { type: "list", items: (b.items ?? []).filter((i) => i.trim()) };
  if (b.type === "quote") {
    const a = (b.attribution ?? "").trim();
    return a
      ? { type: "quote", text: b.text ?? "", attribution: a }
      : { type: "quote", text: b.text ?? "" };
  }
  return { type: b.type, text: b.text ?? "" };
}

function eventFromPayload(
  e: ServerPostPayload["event"],
): EventDetails | undefined {
  if (!e) return undefined;
  if (!e.date && !e.location && !e.virtualLink) return undefined;
  const out: EventDetails = { date: e.date };
  if (e.endDate) out.endDate = e.endDate;
  if (e.location) out.location = e.location;
  if (e.virtualLink) out.virtualLink = e.virtualLink;
  if (e.recurrence && e.recurrence !== "none") out.recurrence = e.recurrence;
  if (e.recurrenceEnd) out.recurrenceEnd = e.recurrenceEnd;
  return out;
}

function payloadToArticle(p: ServerPostPayload): Article {
  const content = (p.content ?? []).map(serverBlockToArticleBlock);
  const wc = content
    .flatMap((b) => (b.type === "list" ? b.items : "text" in b ? [b.text] : []))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    id: p.id,
    slug: p.slug || "preview",
    kind: p.kind,
    template: p.template ?? "standard",
    title: p.title || "Untitled Post",
    excerpt: p.excerpt || "",
    content,
    coverColor: p.coverColor || "#16a34a",
    coverImage: p.coverImage?.url || undefined,
    author: {
      name: p.authorName || "Admin",
      role: p.authorRole || "",
    },
    tags: p.tags ?? [],
    event: p.kind === "event" ? eventFromPayload(p.event) : undefined,
    publishedAt: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    readTime: Math.max(1, Math.ceil(wc / 200)),
  };
}

function PreviewBody({ post }: { post: ServerPostPayload }) {
  const article = useMemo(() => payloadToArticle(post), [post]);
  const shareUrl = `https://sikafields.com/articles/${article.slug}`;
  const tpl = article.template ?? "standard";
  if (tpl === "hero") return <HeroTemplate article={article} shareUrl={shareUrl} preview />;
  if (tpl === "visual") return <VisualTemplate article={article} shareUrl={shareUrl} preview />;
  return <StandardTemplate article={article} shareUrl={shareUrl} preview />;
}

export interface RevisionHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  /** Called after a successful restore. The composer uses this to reload its draft. */
  onRestored?: () => void;
}

export function RevisionHistoryDialog({
  open,
  onClose,
  postId,
  postTitle,
  onRestored,
}: RevisionHistoryDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Preview mode
  const [previewing, setPreviewing] = useState<RevisionItem | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPost, setPreviewPost] = useState<ServerPostPayload | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setWarning(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/posts/${encodeURIComponent(postId)}/revisions`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Could not load history (${res.status})`);
      }
      const data = (await res.json()) as ListResponse;
      setRevisions(data.revisions ?? []);
      if (data.warning) setWarning(data.warning);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load history");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!open) return;
    setRestoredId(null);
    setRestoreError(null);
    setConfirmId(null);
    setPreviewing(null);
    setPreviewPost(null);
    setPreviewError(null);
    void load();
  }, [open, load]);

  const openPreview = useCallback(
    async (rev: RevisionItem) => {
      setPreviewing(rev);
      setPreviewLoading(true);
      setPreviewPost(null);
      setPreviewError(null);
      setRestoreError(null);
      setConfirmId(null);
      try {
        const res = await fetch(
          `${API_BASE}/admin/posts/${encodeURIComponent(postId)}/revisions/${encodeURIComponent(rev.id)}`,
          { credentials: "include" },
        );
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `Could not load revision (${res.status})`);
        }
        const data = (await res.json()) as RevisionFetchResponse;
        setPreviewPost(data.post);
      } catch (e) {
        setPreviewError(e instanceof Error ? e.message : "Could not load revision");
      } finally {
        setPreviewLoading(false);
      }
    },
    [postId],
  );

  const closePreview = useCallback(() => {
    setPreviewing(null);
    setPreviewPost(null);
    setPreviewError(null);
  }, []);

  const restore = useCallback(
    async (revisionId: string) => {
      setRestoringId(revisionId);
      setRestoreError(null);
      try {
        const res = await fetch(
          `${API_BASE}/admin/posts/${encodeURIComponent(postId)}/restore`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ revisionId }),
          },
        );
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `Restore failed (${res.status})`);
        }
        setRestoredId(revisionId);
        setConfirmId(null);
        await queryClient.invalidateQueries({ queryKey: ["articles"] });
        await queryClient.invalidateQueries({ queryKey: ["events"] });
        await queryClient.invalidateQueries({ queryKey: ["article"] });
        if (onRestored) onRestored();
        // Drop out of preview mode after a successful restore so the user
        // sees the confirmed list state.
        setPreviewing(null);
        setPreviewPost(null);
      } catch (e) {
        setRestoreError(e instanceof Error ? e.message : "Restore failed");
      } finally {
        setRestoringId(null);
      }
    },
    [postId, queryClient, onRestored],
  );

  const inPreview = previewing !== null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden ${
              inPreview ? "max-w-5xl max-h-[90vh]" : "max-w-lg max-h-[80vh]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="min-w-0 flex items-center gap-3">
                {inPreview && (
                  <button
                    onClick={closePreview}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    aria-label="Back to revision list"
                    title="Back to revision list"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                    {inPreview ? (
                      <>
                        <Eye className="w-4 h-4 text-primary" /> Revision preview
                      </>
                    ) : (
                      <>
                        <History className="w-4 h-4 text-primary" /> Revision history
                      </>
                    )}
                  </p>
                  {inPreview && previewing ? (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {fullTimestamp(previewing.timestamp)} · {relativeTime(previewing.timestamp)}
                    </p>
                  ) : (
                    postTitle && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {postTitle}
                      </p>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {inPreview && previewing && (
                  <button
                    onClick={() => restore(previewing.id)}
                    disabled={restoringId === previewing.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors disabled:opacity-40"
                    title="Replace the current version with this one"
                  >
                    {restoringId === previewing.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    {restoringId === previewing.id ? "Restoring…" : "Restore this version"}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            {inPreview ? (
              <div className="flex-1 overflow-y-auto bg-white">
                {previewLoading && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground py-20 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading this version…
                  </div>
                )}
                {!previewLoading && previewError && (
                  <div className="m-5 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{previewError}</span>
                  </div>
                )}
                {!previewLoading && !previewError && previewPost && (
                  <div className="pb-10">
                    <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 text-[11px] text-amber-900 font-semibold flex items-center gap-2">
                      <Eye className="w-3 h-3" /> Read-only preview of a historical version. Restoring will overwrite the current live post.
                    </div>
                    <div className="pointer-events-none select-text">
                      <PreviewBody post={previewPost} />
                    </div>
                  </div>
                )}
                {restoreError && (
                  <div className="m-5 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{restoreError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-3">
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground py-10 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading history…
                  </div>
                )}

                {!loading && loadError && (
                  <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{loadError}</span>
                  </div>
                )}

                {!loading && !loadError && revisions.length === 0 && (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    <History className="w-8 h-8 opacity-30 mx-auto mb-2" />
                    <p className="font-semibold text-foreground mb-1">
                      No revisions available
                    </p>
                    <p className="leading-relaxed">
                      {warning
                        ? "The CMS history API is unavailable for this dataset, so older versions can't be shown here."
                        : "This post hasn't been edited yet."}
                    </p>
                  </div>
                )}

                {!loading && revisions.length > 0 && (
                  <ul className="space-y-1.5 py-1">
                    {revisions.map((rev, idx) => {
                      const isCurrent = idx === 0;
                      const isConfirming = confirmId === rev.id;
                      const isRestoring = restoringId === rev.id;
                      const isRestored = restoredId === rev.id;
                      return (
                        <li
                          key={rev.id}
                          className={`rounded-xl border px-3 py-2.5 transition-all ${
                            isConfirming
                              ? "border-amber-300 bg-amber-50"
                              : isRestored
                                ? "border-emerald-300 bg-emerald-50"
                                : "border-border bg-white hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => openPreview(rev)}
                              className="min-w-0 text-left flex-1 group"
                              title="Preview this version"
                            >
                              <p className="text-xs font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                {relativeTime(rev.timestamp)}
                                {isCurrent && (
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {fullTimestamp(rev.timestamp)}
                                {rev.authorName ? ` · ${rev.authorName}` : ""}
                              </p>
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => openPreview(rev)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                                title="Preview this version"
                              >
                                <Eye className="w-3 h-3" /> Preview
                              </button>
                              {!isCurrent && !isConfirming && !isRestored && (
                                <button
                                  onClick={() => {
                                    setConfirmId(rev.id);
                                    setRestoreError(null);
                                  }}
                                  disabled={isRestoring}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-40"
                                >
                                  <RotateCcw className="w-3 h-3" /> Restore
                                </button>
                              )}
                              {isRestored && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <Check className="w-3 h-3" /> Restored
                                </span>
                              )}
                            </div>
                          </div>
                          {isConfirming && (
                            <div className="mt-2 flex items-center gap-2">
                              <p className="text-[11px] text-amber-900 flex-1">
                                Replace the current version with this one?
                              </p>
                              <button
                                onClick={() => restore(rev.id)}
                                disabled={isRestoring}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-colors disabled:opacity-40"
                              >
                                {isRestoring ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3 h-3" />
                                )}
                                {isRestoring ? "Restoring…" : "Yes, restore"}
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                disabled={isRestoring}
                                className="px-2.5 py-1 rounded-lg border border-border text-[11px] font-semibold text-muted-foreground hover:bg-white transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {restoreError && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{restoreError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border bg-muted/30 text-[10px] text-muted-foreground leading-relaxed">
              {inPreview
                ? "You're viewing a read-only preview. Use Restore to overwrite the current live version with this one."
                : "Click any revision to preview it before restoring. Restoring overwrites the current live version, but earlier versions stay in history."}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RevisionHistoryDialog;
