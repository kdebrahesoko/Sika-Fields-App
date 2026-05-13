import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, History, Loader2, AlertCircle, RotateCcw, User, FileText, Clock,
  Search, X, Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { NotificationsBell } from "@/components/NotificationsBell";

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

  const [titleQuery, setTitleQuery] = useState("");
  const [selectedRestorers, setSelectedRestorers] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const restorers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const e of entries) {
      const id = e.restoredBy.id || e.restoredBy.name || "unknown";
      const name = e.restoredBy.name || "Admin";
      const existing = map.get(id);
      if (existing) existing.count += 1;
      else map.set(id, { id, name, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const q = titleQuery.trim().toLowerCase();
    const fromTs = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
    const toTs = toDate ? new Date(toDate + "T23:59:59.999").getTime() : null;
    return entries.filter((e) => {
      if (q && !(e.postTitle || "").toLowerCase().includes(q)) return false;
      if (selectedRestorers.length > 0) {
        const id = e.restoredBy.id || e.restoredBy.name || "unknown";
        if (!selectedRestorers.includes(id)) return false;
      }
      if (fromTs != null || toTs != null) {
        const t = new Date(e.restoredAt).getTime();
        if (Number.isNaN(t)) return false;
        if (fromTs != null && t < fromTs) return false;
        if (toTs != null && t > toTs) return false;
      }
      return true;
    });
  }, [entries, titleQuery, selectedRestorers, fromDate, toDate]);

  const filtersActive =
    titleQuery.trim() !== "" ||
    selectedRestorers.length > 0 ||
    fromDate !== "" ||
    toDate !== "";

  function toggleRestorer(id: string) {
    setSelectedRestorers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function clearFilters() {
    setTitleQuery("");
    setSelectedRestorers([]);
    setFromDate("");
    setToDate("");
  }

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
          <div className="ml-auto">
            <NotificationsBell />
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

        {!isLoading && !error && entries.length > 0 && (
          <div className="mb-4 bg-white rounded-2xl border border-border p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={titleQuery}
                  onChange={(e) => setTitleQuery(e.target.value)}
                  placeholder="Search by post title…"
                  className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                  data-testid="input-restore-search"
                />
                {titleQuery && (
                  <button
                    type="button"
                    onClick={() => setTitleQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    aria-label="Clear search"
                    data-testid="button-clear-search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">From</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2 py-1.5 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                    data-testid="input-restore-from-date"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">To</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2 py-1.5 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                    data-testid="input-restore-to-date"
                  />
                </label>
              </div>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-2 py-1.5"
                  data-testid="button-clear-filters"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              )}
            </div>

            {restorers.length > 0 && (
              <div className="flex items-start gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground pt-1.5 pr-1">
                  <Filter className="w-3.5 h-3.5" />
                  Restorer
                </div>
                {restorers.map((r) => {
                  const active = selectedRestorers.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRestorer(r.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-white text-foreground border-border hover:border-primary/50 hover:bg-muted/40"
                      }`}
                      data-testid={`chip-restorer-${r.id}`}
                    >
                      <User className="w-3 h-3" />
                      <span>{r.name}</span>
                      <span className={`text-[10px] px-1.5 rounded-full ${
                        active ? "bg-white/20" : "bg-muted text-muted-foreground"
                      }`}>
                        {r.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {filtersActive && (
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredEntries.length}</span> of {entries.length} restores
              </p>
            )}
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

        {!isLoading && entries.length > 0 && filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center bg-white rounded-2xl border border-border">
            <Search className="w-10 h-10 text-muted-foreground opacity-30" />
            <p className="text-base font-semibold text-foreground">No matching restores</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Try clearing a filter or broadening your search.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-1 text-xs font-semibold text-primary hover:underline"
              data-testid="button-clear-filters-empty"
            >
              Clear all filters
            </button>
          </div>
        )}

        {!isLoading && filteredEntries.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/40">
              <div className="col-span-5">Post</div>
              <div className="col-span-3">Restored by</div>
              <div className="col-span-2">From revision</div>
              <div className="col-span-2">Restored</div>
            </div>
            <ul className="divide-y divide-border">
              {filteredEntries.map((entry, i) => (
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
