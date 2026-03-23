import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/Landing";
import FAQPage from "@/pages/FAQ";
import ContactPage from "@/pages/Contact";
import AdvisoryPage from "@/pages/Advisory";
import ArticlesPage from "@/pages/Articles";
import ArticleDetailPage from "@/pages/ArticleDetail";
import PostStudioPage from "@/pages/PostStudio";
import AdminComposerPage from "@/pages/AdminComposer";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/advisory" component={AdvisoryPage} />
      <Route path="/articles" component={ArticlesPage} />
      <Route path="/articles/:slug/studio" component={PostStudioPage} />
      <Route path="/articles/:slug" component={ArticleDetailPage} />
      <Route path="/admin/new-post" component={AdminComposerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
