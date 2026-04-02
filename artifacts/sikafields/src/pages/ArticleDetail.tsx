import { Link, useParams } from "wouter";
import { Loader2, BookOpen, Eye } from "lucide-react";
import { useArticle, useRelatedArticles } from "@/hooks/useArticles";
import {
  StandardTemplate,
  HeroTemplate,
  VisualTemplate,
} from "@/components/article-templates";

function PostStudioFAB({ slug }: { slug: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href={`/articles/${slug}/studio`}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold shadow-lg hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        <Eye className="w-4 h-4" />
        Post Studio
      </Link>
    </div>
  );
}

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
      <>
        <HeroTemplate
          article={article}
          shareUrl={shareUrl}
          related={related}
        />
        <PostStudioFAB slug={article.slug} />
      </>
    );
  }
  if (template === "visual") {
    return (
      <>
        <VisualTemplate
          article={article}
          shareUrl={shareUrl}
          related={related}
        />
        <PostStudioFAB slug={article.slug} />
      </>
    );
  }
  return (
    <>
      <StandardTemplate
        article={article}
        shareUrl={shareUrl}
        related={related}
      />
      <PostStudioFAB slug={article.slug} />
    </>
  );
}
