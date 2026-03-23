import { Link, useParams } from "wouter";
import { Loader2, BookOpen } from "lucide-react";
import { useArticle, useRelatedArticles } from "@/hooks/useArticles";
import {
  StandardTemplate,
  HeroTemplate,
  VisualTemplate,
} from "@/components/article-templates";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug ?? "");
  const { data: related = [] } = useRelatedArticles(
    slug ?? "",
    article?.tags ?? []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading article…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-display font-bold text-foreground">
          Article not found
        </h1>
        <p className="text-muted-foreground">
          This article may have been moved or removed.
        </p>
        <Link
          href="/articles"
          className="text-primary font-semibold hover:underline"
        >
          ← Back to Articles & Updates
        </Link>
      </div>
    );
  }

  const shareUrl = `https://sikafields.com/articles/${article.slug}`;
  const template = article.template ?? "standard";

  if (template === "hero") {
    return (
      <HeroTemplate
        article={article}
        shareUrl={shareUrl}
        related={related}
      />
    );
  }
  if (template === "visual") {
    return (
      <VisualTemplate
        article={article}
        shareUrl={shareUrl}
        related={related}
      />
    );
  }
  return (
    <StandardTemplate
      article={article}
      shareUrl={shareUrl}
      related={related}
    />
  );
}
