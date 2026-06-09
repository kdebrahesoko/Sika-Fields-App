import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, RotateCcw, FileText, Loader2, X, Check } from "lucide-react";
import { useApiClient } from "@/lib/api-fetch";

interface RestoreNotification {
  id: string;
  postId: string;
  postType: string;
  postTitle: string;
  revisionId: string;
  revisionTimestamp: string;
  restoredAt: string;
  readAt: string | null;
  restoredBy: { id: string; name: string };
}

interface NotificationsResponse {
  notifications: RestoreNotification[];
  unreadCount: number;
  warning?: string;
}

const API_BASE = "/api";
const POLL_MS = 30_000;

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

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const qc = useQueryClient();
  const apiFetch = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: ["restore-notifications"],
    queryFn: async (): Promise<NotificationsResponse> => {
      const res = await apiFetch(`${API_BASE}/admin/posts/notifications`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<NotificationsResponse>;
    },
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  });

  const markRead = useMutation({
    mutationFn: async (payload: { ids?: string[]; all?: boolean }) => {
      const res = await apiFetch(`${API_BASE}/admin/posts/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<{ updated: number }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restore-notifications"] });
    },
  });

  // Close the dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        data-testid="button-notifications-bell"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none"
            data-testid="badge-notifications-unread"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-1rem)] bg-white rounded-2xl border border-border shadow-xl shadow-black/5 z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Bell className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold flex-1">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead.mutate({ all: true })}
                disabled={markRead.isPending}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
                data-testid="button-notifications-mark-all-read"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
              aria-label="Close notifications"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 px-6 text-center">
                <RotateCcw className="w-8 h-8 text-muted-foreground opacity-30" />
                <p className="text-sm font-semibold text-foreground">All caught up</p>
                <p className="text-xs text-muted-foreground">
                  We'll let you know here whenever a co-editor reverts one of
                  your edits.
                </p>
              </div>
            )}

            {!isLoading && notifications.length > 0 && (
              <ul className="divide-y divide-border">
                {notifications.map((n) => {
                  const isUnread = !n.readAt;
                  return (
                    <li
                      key={n.id}
                      className={`px-4 py-3 hover:bg-muted/30 transition-colors ${
                        isUnread ? "bg-primary/[0.04]" : ""
                      }`}
                      data-testid={`notification-${n.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            <span className="font-semibold">
                              {n.restoredBy.name || "An admin"}
                            </span>{" "}
                            reverted your edit on{" "}
                            <Link
                              href={`/admin/new-post/scratch?edit=${encodeURIComponent(n.postId)}`}
                              onClick={() => {
                                if (isUnread) markRead.mutate({ ids: [n.id] });
                                setOpen(false);
                              }}
                              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              {n.postTitle || "(untitled post)"}
                            </Link>
                          </p>
                          <div className="flex items-center justify-between gap-3 mt-1">
                            <p className="text-[11px] text-muted-foreground">
                              {fmtRelative(n.restoredAt)}
                            </p>
                            <div className="flex items-center gap-2">
                              {isUnread && (
                                <button
                                  type="button"
                                  onClick={() => markRead.mutate({ ids: [n.id] })}
                                  disabled={markRead.isPending}
                                  className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
                                  data-testid={`button-mark-read-${n.id}`}
                                >
                                  Mark read
                                </button>
                              )}
                              <Link
                                href="/admin/restore-log"
                                onClick={() => setOpen(false)}
                                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:underline"
                              >
                                View log
                              </Link>
                            </div>
                          </div>
                        </div>
                        {isUnread && (
                          <span
                            className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0"
                            aria-label="Unread"
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-center">
            <Link
              href="/admin/restore-log"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open full restore log
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
