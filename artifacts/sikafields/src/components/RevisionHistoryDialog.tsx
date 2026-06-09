import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-fetch";
import {
  History,
  X,
  RotateCcw,
  Loader2,
  AlertCircle,
  Check,
  Eye,
  ArrowLeft,
  GitCompare,
  EyeOff,
} from "lucide-react";
import {
  StandardTemplate,
  HeroTemplate,
  VisualTemplate,
} from "@/components/article-templates";
import type { Article, ArticleBlock, EventDetails } from "@/data/articles";
import {
  summarizeChanges,
  annotateRestoredBlocks,
  type AnnotatedBlock,
  type BlockAnnotation,
  type ChangeSummary,
  type DiffBlock,
  type DiffPayload,
} from "@/lib/revision-diff";

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

interface AuditEntry {
  id: string;
  postTitle: string;
  revisionId: string;
  revisionTimestamp: string;
  restoredAt: string;
  restoredBy: { id: string; name: string };
}

interface AuditResponse {
  entries: AuditEntry[];
  warning?: string;
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

function payloadToArticle(
  p: ServerPostPayload,
  contentOverride?: ServerPostBlock[],
): Article {
  const content = (contentOverride ?? p.content ?? []).map(serverBlockToArticleBlock);
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

const TONE_CLASSES: Record<ChangeSummary["tone"], string> = {
  added: "bg-emerald-50 text-emerald-700 border-emerald-200",
  removed: "bg-rose-50 text-rose-700 border-rose-200",
  edited: "bg-sky-50 text-sky-700 border-sky-200",
};

function ChangeBadges({
  value,
  limit = 4,
}: {
  value: ChangeSummary[] | "loading" | "error" | undefined;
  limit?: number;
}) {
  if (value === undefined) return null;
  if (value === "loading") {
    return (
      <p className="mt-1.5 text-[10px] text-muted-foreground/70 italic">
        Comparing…
      </p>
    );
  }
  if (value === "error") {
    return (
      <p className="mt-1.5 text-[10px] text-muted-foreground/70 italic">
        Couldn't compare with the previous version
      </p>
    );
  }
  if (value.length === 0) {
    return (
      <p className="mt-1.5 text-[10px] text-muted-foreground/70 italic">
        No content changes
      </p>
    );
  }
  const shown = value.slice(0, limit);
  const overflow = value.length - shown.length;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {shown.map((c, i) => (
        <span
          key={`${c.label}-${i}`}
          title={c.detail ?? c.label}
          className={`text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${TONE_CLASSES[c.tone]}`}
        >
          {c.label}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border border-border text-muted-foreground bg-white"
          title={value
            .slice(limit)
            .map((c) => c.label)
            .join(", ")}
        >
          +{overflow} more
        </span>
      )}
    </div>
  );
}

function ChangeList({ summary }: { summary: ChangeSummary[] }) {
  if (summary.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground italic">
        This version is identical to the current live post.
      </p>
    );
  }
  return (
    <ul className="space-y-1">
      {summary.map((c, i) => (
        <li
          key={`${c.label}-${i}`}
          className="flex items-start gap-2 text-[11px]"
        >
          <span
            className={`mt-0.5 inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border shrink-0 ${TONE_CLASSES[c.tone]}`}
          >
            {c.label}
          </span>
          {c.detail && (
            <span className="text-muted-foreground leading-snug pt-0.5">
              {c.detail}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function PreviewBody({
  post,
  currentPost,
}: {
  post: ServerPostPayload;
  currentPost?: ServerPostPayload | null;
}) {
  // When we have the live version cached, build a merged block stream that
  // interleaves removed-from-live blocks at their original positions so the
  // preview can render true side-by-side-style markings (added/edited inline,
  // removed as strike-through ghosts).
  const { article, annotations } = useMemo(() => {
    const isCurrent = !currentPost || currentPost === post;
    if (isCurrent) {
      return { article: payloadToArticle(post), annotations: undefined as BlockAnnotation[] | undefined };
    }
    const merged: AnnotatedBlock[] = annotateRestoredBlocks(
      (currentPost!.content ?? []) as DiffBlock[],
      (post.content ?? []) as DiffBlock[],
    );
    const mergedContent: ServerPostBlock[] = merged.map((m) => m.block as ServerPostBlock);
    const ann: BlockAnnotation[] = merged.map((m) => m.annotation);
    return {
      article: payloadToArticle(post, mergedContent),
      annotations: ann,
    };
  }, [post, currentPost]);

  const shareUrl = `https://sikafields.com/articles/${article.slug}`;
  const tpl = article.template ?? "standard";
  if (tpl === "hero")
    return (
      <HeroTemplate
        article={article}
        shareUrl={shareUrl}
        preview
        blockAnnotations={annotations}
      />
    );
  if (tpl === "visual")
    return (
      <VisualTemplate
        article={article}
        shareUrl={shareUrl}
        preview
        blockAnnotations={annotations}
      />
    );
  return (
    <StandardTemplate
      article={article}
      shareUrl={shareUrl}
      preview
      blockAnnotations={annotations}
    />
  );
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
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [tab, setTab] = useState<"revisions" | "audit">("revisions");
  // Hide auto-saves / no-op revisions (where the diff against the previous
  // version is empty) by default. The "Current" row is always shown.
  const [showNoOp, setShowNoOp] = useState(false);

  const loadAudit = useCallback(async () => {
    try {
      const res = await apiFetch(
        `${API_BASE}/admin/posts/${encodeURIComponent(postId)}/restore-audit`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as AuditResponse;
      setAudit(data.entries ?? []);
    } catch {
      // Audit log is best-effort; ignore failures here.
    }
  }, [postId]);

  // Preview mode
  const [previewing, setPreviewing] = useState<RevisionItem | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPost, setPreviewPost] = useState<ServerPostPayload | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Per-revision payload cache + computed change summaries for the row badges.
  // We fetch each revision's full payload once, reuse it for the preview pane,
  // and derive change badges by diffing each revision against the next-older
  // one in the list.
  const payloadCacheRef = useRef<Map<string, ServerPostPayload>>(new Map());
  const [diffs, setDiffs] = useState<Record<string, ChangeSummary[] | "loading" | "error">>({});

  const fetchPayload = useCallback(
    async (revisionId: string): Promise<ServerPostPayload | null> => {
      const cached = payloadCacheRef.current.get(revisionId);
      if (cached) return cached;
      const res = await apiFetch(
        `${API_BASE}/admin/posts/${encodeURIComponent(postId)}/revisions/${encodeURIComponent(revisionId)}`,
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Could not load revision (${res.status})`);
      }
      const data = (await res.json()) as RevisionFetchResponse;
      payloadCacheRef.current.set(revisionId, data.post);
      return data.post;
    },
    [postId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setWarning(null);
    try {
      const res = await apiFetch(
        `${API_BASE}/admin/posts/${encodeURIComponent(postId)}/revisions`,
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
    void loadAudit();
  }, [postId, loadAudit]);

  useEffect(() => {
    if (!open) return;
    setRestoredId(null);
    setRestoreError(null);
    setConfirmId(null);
    setPreviewing(null);
    setPreviewPost(null);
    setPreviewError(null);
    payloadCacheRef.current = new Map();
    setDiffs({});
    setShowNoOp(false);
    void load();
  }, [open, load]);

  // Once the revision list lands, fetch each revision's payload (with a small
  // concurrency cap) and compute a change summary against the next-older one.
  // Newest-first ordering means revisions[idx+1] is "the version this row
  // replaced". Errors per row are isolated so one bad fetch doesn't block the
  // rest.
  useEffect(() => {
    if (!open || revisions.length === 0) return;
    let cancelled = false;
    const queue = revisions.slice();
    const initial: Record<string, "loading"> = {};
    for (const r of queue) initial[r.id] = "loading";
    setDiffs((prev) => ({ ...initial, ...prev }));

    const indexById = new Map(revisions.map((r, i) => [r.id, i]));

    async function processOne(rev: RevisionItem) {
      try {
        const curr = await fetchPayload(rev.id);
        if (cancelled || !curr) return;
        const idx = indexById.get(rev.id) ?? 0;
        const olderRev = revisions[idx + 1];
        const prev = olderRev ? await fetchPayload(olderRev.id) : null;
        if (cancelled) return;
        const summary = summarizeChanges(
          prev ? (prev as unknown as DiffPayload) : null,
          curr as unknown as DiffPayload,
        );
        setDiffs((d) => ({ ...d, [rev.id]: summary }));
      } catch {
        if (!cancelled) setDiffs((d) => ({ ...d, [rev.id]: "error" }));
      }
    }

    const CONCURRENCY = 3;
    const workers: Promise<void>[] = [];
    let cursor = 0;
    for (let w = 0; w < CONCURRENCY; w++) {
      workers.push(
        (async () => {
          while (!cancelled && cursor < queue.length) {
            const next = queue[cursor++];
            await processOne(next);
          }
        })(),
      );
    }
    void Promise.all(workers);

    return () => {
      cancelled = true;
    };
  }, [open, revisions, fetchPayload]);

  const openPreview = useCallback(
    async (rev: RevisionItem) => {
      setPreviewing(rev);
      setPreviewLoading(true);
      setPreviewPost(null);
      setPreviewError(null);
      setRestoreError(null);
      setConfirmId(null);
      try {
        const post = await fetchPayload(rev.id);
        if (!post) throw new Error("Revision not found");
        setPreviewPost(post);
      } catch (e) {
        setPreviewError(e instanceof Error ? e.message : "Could not load revision");
      } finally {
        setPreviewLoading(false);
      }
    },
    [fetchPayload],
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
        const res = await apiFetch(
          `${API_BASE}/admin/posts/${encodeURIComponent(postId)}/restore`,
          {
            method: "POST",
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
        void loadAudit();
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
    [postId, queryClient, onRestored, loadAudit],
  );

  // A revision counts as "no-op" when its computed diff against the older
  // version is an empty array. We never hide the Current row (idx 0), and
  // rows still loading or that errored stay visible so the user isn't
  // surprised by missing entries.
  const noOpIds = useMemo(() => {
    const ids = new Set<string>();
    revisions.forEach((rev, idx) => {
      if (idx === 0) return;
      const d = diffs[rev.id];
      if (Array.isArray(d) && d.length === 0) ids.add(rev.id);
    });
    return ids;
  }, [revisions, diffs]);

  const visibleRevisions = useMemo(() => {
    const indexed = revisions.map((rev, idx) => ({ rev, idx }));
    if (showNoOp) return indexed;
    return indexed.filter(({ rev, idx }) => idx === 0 || !noOpIds.has(rev.id));
  }, [revisions, noOpIds, showNoOp]);

  const hiddenCount = noOpIds.size;

  const inPreview = previewing !== null;
  const [showPreviewDiff, setShowPreviewDiff] = useState(true);

  // "What would change if we restored this version" — diff is computed from
  // the cached payloads so toggling the panel never refetches. Restoring
  // moves state from the *current* live version back to the *previewing*
  // version, so we pass them in that direction: any block that exists today
  // but is missing in the older revision counts as a "removal" if you
  // restore. Depending on `diffs` ensures the panel re-renders the moment
  // the cache fills (otherwise it could stay stuck on "Comparing…").
  const previewVsCurrent = useMemo<ChangeSummary[] | null>(() => {
    if (!previewing || !previewPost) return null;
    const currentRev = revisions[0];
    if (!currentRev || currentRev.id === previewing.id) return [];
    const currentPost = payloadCacheRef.current.get(currentRev.id);
    if (!currentPost) return null;
    return summarizeChanges(
      currentPost as unknown as DiffPayload,
      previewPost as unknown as DiffPayload,
    );
  // `diffs` is included so the memo recomputes once the background fetch
  // populates the cache for the current revision.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewing, previewPost, revisions, diffs]);

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
                {inPreview && previewing && revisions[0]?.id !== previewing.id && (
                  <button
                    onClick={() => setShowPreviewDiff((v) => !v)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors ${
                      showPreviewDiff
                        ? "bg-sky-50 border-sky-200 text-sky-700"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    title="Toggle the change summary panel"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    {showPreviewDiff ? "Hide changes" : "Show changes"}
                  </button>
                )}
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

            {/* Tabs (hidden in preview mode) */}
            {!inPreview && (
              <div className="flex border-b border-border bg-muted/30 text-[11px] font-bold">
                <button
                  onClick={() => setTab("revisions")}
                  className={`flex-1 px-4 py-2 transition-colors ${
                    tab === "revisions"
                      ? "text-primary border-b-2 border-primary -mb-px bg-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Revisions
                </button>
                <button
                  onClick={() => setTab("audit")}
                  className={`flex-1 px-4 py-2 transition-colors ${
                    tab === "audit"
                      ? "text-primary border-b-2 border-primary -mb-px bg-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Restore log {audit.length > 0 ? `(${audit.length})` : ""}
                </button>
              </div>
            )}

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
                    {showPreviewDiff && previewing && revisions[0]?.id !== previewing.id && (
                      <div className="px-5 py-3 bg-sky-50/50 border-b border-sky-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-800 mb-2 flex items-center gap-1.5">
                          <GitCompare className="w-3 h-3" />
                          What restoring this version would change
                        </p>
                        {previewVsCurrent === null ? (
                          <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Comparing with current…
                          </p>
                        ) : (
                          <ChangeList summary={previewVsCurrent} />
                        )}
                      </div>
                    )}
                    <div className="pointer-events-none select-text">
                      <PreviewBody
                        post={previewPost}
                        currentPost={
                          revisions[0] && revisions[0].id !== previewing?.id
                            ? payloadCacheRef.current.get(revisions[0].id) ?? null
                            : null
                        }
                      />
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
            ) : tab === "audit" ? (
              <div className="flex-1 overflow-y-auto px-5 py-3">
                {audit.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    <RotateCcw className="w-8 h-8 opacity-30 mx-auto mb-2" />
                    <p className="font-semibold text-foreground mb-1">
                      No restores yet
                    </p>
                    <p className="leading-relaxed">
                      When someone restores an older version, the action will
                      be recorded here.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-1.5 py-1">
                    {audit.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-xl border border-border bg-white px-3 py-2.5"
                      >
                        <p className="text-xs font-semibold text-foreground">
                          {entry.restoredBy.name || "Admin"}
                          <span className="text-muted-foreground font-normal">
                            {" "}restored to{" "}
                          </span>
                          {entry.revisionTimestamp
                            ? relativeTime(entry.revisionTimestamp)
                            : "an earlier version"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {fullTimestamp(entry.restoredAt)}
                          {entry.revisionTimestamp
                            ? ` · source: ${fullTimestamp(entry.revisionTimestamp)}`
                            : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
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

                {!loading && revisions.length > 0 && hiddenCount > 0 && (
                  <div className="flex items-center justify-between gap-2 mb-2 px-2.5 py-2 rounded-lg bg-muted/50 border border-border">
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {showNoOp ? (
                        <>Showing all {revisions.length} revisions, including auto-saves with no content changes.</>
                      ) : (
                        <>
                          Hiding {hiddenCount} auto-save{hiddenCount === 1 ? "" : "s"} with no content changes.
                        </>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowNoOp((v) => !v)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-white text-[10.5px] font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shrink-0"
                      title={showNoOp ? "Hide revisions with no content changes" : "Show revisions with no content changes"}
                    >
                      {showNoOp ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Hide auto-saves
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Show all
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!loading && revisions.length > 0 && (
                  <ul className="space-y-1.5 py-1">
                    {visibleRevisions.map(({ rev, idx }) => {
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
                              <ChangeBadges value={diffs[rev.id]} />
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
