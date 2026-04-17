import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Users, Mail, Shield, ShieldCheck, Trash2, UserPlus,
  Loader2, X, Check, AlertCircle, Crown, User as UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  role: "admin" | "user";
  createdAt: number;
  lastSignInAt: number | null;
}

const apiBase = `${import.meta.env.BASE_URL}api/admin`.replace("//api", "/api");

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function fmtDate(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const mut = useMutation({
    mutationFn: (payload: { email: string; role: string }) =>
      api<{ invitation: unknown }>("/users/invite", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold">Invite a user</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            mut.mutate({ email: email.trim(), role });
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["user", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    role === r
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {r === "admin" ? <Crown className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  {r === "admin" ? "Admin" : "Normal user"}
                </button>
              ))}
            </div>
          </div>
          {mut.isError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{(mut.error as Error).message}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mut.isPending || !email.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Send invitation
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api<{ users: AdminUser[] }>("/users"),
  });

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "admin" | "user" }) =>
      api(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onMutate: ({ id }) => setPendingId(id),
    onSettled: () => {
      setPendingId(null);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: "DELETE" }),
    onMutate: (id) => setPendingId(id),
    onSettled: () => {
      setPendingId(null);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users = data?.users ?? [];
  const admins = users.filter((u) => u.role === "admin").length;

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
            <Users className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-semibold">
              <span className="text-primary">User Management</span>
              <span className="text-muted-foreground hidden sm:inline">
                {" "}· {users.length} users · {admins} admins
              </span>
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite user
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-8">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Loading users…</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Failed to load users</p>
              <p className="text-xs mt-0.5">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && users.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <Users className="w-12 h-12 text-muted-foreground opacity-30" />
            <p className="text-lg font-semibold">No users yet</p>
            <p className="text-sm text-muted-foreground">
              Invite your first teammate to get started.
            </p>
          </div>
        )}

        {users.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_140px_140px_120px_120px] gap-4 px-5 py-3 border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <div>User</div>
              <div>Role</div>
              <div>Joined</div>
              <div>Last sign-in</div>
              <div className="text-right">Actions</div>
            </div>
            <ul className="divide-y divide-border">
              {users.map((u) => {
                const isPending = pendingId === u.id;
                const isAdmin = u.role === "admin";
                const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
                return (
                  <li
                    key={u.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_120px_120px] gap-2 md:gap-4 px-5 py-4 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.imageUrl ? (
                        <img
                          src={u.imageUrl}
                          alt={fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {(u.firstName[0] || u.email[0] || "?").toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                          isAdmin
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isAdmin ? <Crown className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{fmtDate(u.createdAt)}</div>
                    <div className="text-xs text-muted-foreground">{fmtDate(u.lastSignInAt)}</div>
                    <div className="flex items-center gap-1.5 md:justify-end">
                      <button
                        onClick={() =>
                          roleMut.mutate({
                            id: u.id,
                            role: isAdmin ? "user" : "admin",
                          })
                        }
                        disabled={isPending}
                        title={isAdmin ? "Demote to normal user" : "Promote to admin"}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isAdmin ? (
                          <Shield className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${fullName}? This cannot be undone.`)) {
                            deleteMut.mutate(u.id);
                          }
                        }}
                        disabled={isPending}
                        title="Delete user"
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
