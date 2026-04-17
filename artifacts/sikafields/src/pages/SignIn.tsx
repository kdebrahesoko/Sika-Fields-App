import { SignIn, SignUp } from "@clerk/react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthFrame({ children, mode }: { children: React.ReactNode; mode: "in" | "up" }) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#f5f7f2] via-white to-[#ecf2e8] flex flex-col">
      <div className="px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900/80 hover:text-emerald-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to SikaFields
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold text-emerald-950 mb-1">
              {mode === "in" ? "Welcome back" : "Activate your account"}
            </h1>
            <p className="text-sm text-emerald-900/60">
              {mode === "in"
                ? "Sign in to manage SikaFields content."
                : "Complete your invitation to join the SikaFields team."}
            </p>
          </div>
          {children}
        </div>
      </div>
      <div className="text-center text-xs text-emerald-900/50 pb-6">
        SikaFields · Carbon · Climate · Community
      </div>
    </div>
  );
}

export function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <AuthFrame mode="in">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        forceRedirectUrl={`${basePath}/admin/posts`}
      />
    </AuthFrame>
  );
}

export function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <AuthFrame mode="up">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        forceRedirectUrl={`${basePath}/admin/posts`}
      />
    </AuthFrame>
  );
}
