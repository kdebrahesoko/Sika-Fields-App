import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, History, Loader2, AlertCircle, RotateCcw, User, FileText, Clock,
} from "lucide-react";
import { motion } from "framer-motion";

interface RestoreAuditEntry {
  id: string;
  postId: string;
  postType: string;
  postTitle: string;
  revisionId: string;
  revisionTimestamp: string;
  restoredAt: string;
  restoredBy: { id: string; name: string };
}

interface RestoreAuditResponse {
  entries: RestoreAuditEntry[];
  warning?: string;
  sanityConfigured?: boolean;
}

const API_BASE = "/api";

function fmtDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtRelative(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diffMs = Date.now() - d;
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

function postHref(entry: RestoreAuditEntry): string {
  return `/admin/new-post/scratch?edit=${encodeURIComponent(entry.postId)}`;
}

export default function AdminRestoreLogPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-restore-audit"],
    queryFn: async (): Promise<RestoreAuditResponse> => {
      const res = await fetch(`${API_BASE}/admin/posts/restore-audit`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<RestoreAuditResponse>;
    },
  });

  const entries = data?.entries ?? [];

  return (
    <div className="min-h-screen bg-muted/30 font-sans flex flex-col">
      <div className="border-b border-border bg-white sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Manage Posts</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <History className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-semibold">
              <span className="text-primary">Restore Activity</span>
              <span className="text-muted-foreground hidden sm:inline">
                {" "}· {entries.length} recent restore{entries.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Global restore log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every revision revert across all posts, newest first. Useful for spotting
            patterns — a single editor reverting everything, or repeated reverts on
            the same post.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Loading restore activity…</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Could not load restore activity</p>
              <p className="opacity-80">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && data?.warning && (
          <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{data.warning}</span>
          </div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <RotateCcw className="w-12 h-12 text-muted-foreground opacity-30" />
            <p className="text-lg font-semibold text-foreground">No restores yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              When an admin reverts a post to a previous revision, the activity will
              show up here.
            </p>
          </div>
        )}

        {!isLoading && entries.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/40">
              <div className="col-span-5">Post</div>
              <div className="col-span-3">Restored by</div>
              <div className="col-span-2">From revision</div>
              <div className="col-span-2">Restored</div>
            </div>
            <ul className="divide-y divide-border">
              {entries.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.015, 0.2) }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="sm:col-span-5 min-w-0 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <Link
                        href={postHref(entry)}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block"
                        title={entry.postTitle || "(untitled)"}
                      >
                        {entry.postTitle || "(untitled)"}
                      </Link>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {entry.postType || "post"}
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2 text-sm text-foreground min-w-0">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{entry.restoredBy.name || "Admin"}</span>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span title={fmtDateTime(entry.revisionTimestamp)}>
                      {fmtDateTime(entry.revisionTimestamp)}
                    </span>
                  </div>

                  <div className="sm:col-span-2 text-xs">
                    <p className="font-semibold text-foreground" title={fmtDateTime(entry.restoredAt)}>
                      {fmtRelative(entry.restoredAt)}
                    </p>
                    <p className="text-muted-foreground">
                      {fmtDateTime(entry.restoredAt)}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
