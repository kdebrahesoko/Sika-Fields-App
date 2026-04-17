import { type ReactNode } from "react";
import { Redirect } from "wouter";
import { Show, useUser } from "@clerk/react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function useIsAdmin(): { isAdmin: boolean; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  return { isAdmin: role === "admin", isLoaded };
}

function NotAuthorized() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 px-6">
      <div className="max-w-md w-full bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground mb-2">
          Admin access required
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          You're signed in, but this area is restricted to SikaFields administrators.
          Ask an existing admin to grant you access.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, isLoaded } = useIsAdmin();

  return (
    <>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
      <Show when="signed-in">
        {!isLoaded ? <LoadingScreen /> : isAdmin ? <>{children}</> : <NotAuthorized />}
      </Show>
    </>
  );
}

export { basePath };
