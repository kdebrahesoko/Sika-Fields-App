import { ClerkProvider } from "@clerk/react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/Landing";
import FAQPage from "@/pages/FAQ";
import ContactPage from "@/pages/Contact";
import AdvisoryPage from "@/pages/Advisory";
import ArticlesPage from "@/pages/Articles";
import EventsPage from "@/pages/Events";
import ArticleDetailPage from "@/pages/ArticleDetail";
import PostStudioPage from "@/pages/PostStudio";
import AdminComposerPage from "@/pages/AdminComposer";
import AdminPostsPage from "@/pages/AdminPosts";
import NewPostHubPage from "@/pages/NewPostHub";
import NewPostAIPage from "@/pages/NewPostAI";
import AdminUsersPage from "@/pages/AdminUsers";
import AdminRestoreLogPage from "@/pages/AdminRestoreLog";
import { SignInPage, SignUpPage } from "@/pages/SignIn";
import { RequireAdmin } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import ChatWidget from "@/components/ChatWidget";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY env var");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(145, 62%, 33%)",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorText: "#14532d",
    colorTextSecondary: "rgba(20, 83, 45, 0.65)",
    colorInputText: "#14532d",
    colorNeutral: "#14532d",
    borderRadius: "0.875rem",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontFamilyButtons: "Sora, Inter, system-ui, -apple-system, sans-serif",
    fontSize: "0.95rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox:
      "bg-white border border-emerald-100 shadow-xl shadow-emerald-900/5 rounded-2xl w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none px-2 sm:px-4 pt-6 pb-2",
    footer:
      "!shadow-none !border-0 !bg-emerald-50/40 !rounded-none border-t border-emerald-100 px-6 py-4",
    headerTitle: "text-emerald-950 font-display",
    headerSubtitle: "text-emerald-900/70",
    socialButtonsBlockButtonText: "text-emerald-950 font-semibold",
    formFieldLabel: "text-emerald-950 font-semibold",
    footerActionLink: "text-emerald-700 font-semibold hover:text-emerald-800",
    footerActionText: "text-emerald-900/70",
    dividerText: "text-emerald-900/50",
    identityPreviewEditButton: "text-emerald-700 hover:text-emerald-800",
    formFieldSuccessText: "text-emerald-700",
    alertText: "text-red-700",
    logoBox: "justify-center mb-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton:
      "border border-emerald-200 hover:bg-emerald-50 transition-colors",
    formButtonPrimary:
      "bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm shadow-emerald-900/10 normal-case",
    formFieldInput:
      "border border-emerald-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white",
    footerAction: "flex items-center gap-2",
    dividerLine: "bg-emerald-100",
    alert: "bg-red-50 border border-red-200 rounded-xl",
    otpCodeFieldInput: "border border-emerald-200 focus:border-emerald-600",
    formFieldRow: "space-y-1.5",
    main: "gap-4",
  },
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/advisory" component={AdvisoryPage} />
      <Route path="/articles" component={ArticlesPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/articles/:slug/studio" component={PostStudioPage} />
      <Route path="/articles/:slug" component={ArticleDetailPage} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/admin/posts">
        <RequireAdmin>
          <AdminPostsPage />
        </RequireAdmin>
      </Route>
      <Route path="/admin/new-post">
        <RequireAdmin>
          <NewPostHubPage />
        </RequireAdmin>
      </Route>
      <Route path="/admin/new-post/scratch">
        <RequireAdmin>
          <AdminComposerPage />
        </RequireAdmin>
      </Route>
      <Route path="/admin/new-post/ai">
        <RequireAdmin>
          <NewPostAIPage />
        </RequireAdmin>
      </Route>
      <Route path="/admin/users">
        <RequireAdmin>
          <AdminUsersPage />
        </RequireAdmin>
      </Route>
      <Route path="/admin/restore-log">
        <RequireAdmin>
          <AdminRestoreLogPage />
        </RequireAdmin>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={{
        signIn: {
          start: {
            title: "Sign in to SikaFields",
            subtitle: "Carbon · Climate · Community",
          },
        },
        signUp: {
          start: {
            title: "Activate your invitation",
            subtitle: "Set a password to access the SikaFields admin",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Router />
      <ChatWidget />
    </ClerkProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
