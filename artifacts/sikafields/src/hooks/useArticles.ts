import { useQuery } from "@tanstack/react-query";
import { sanityClient, isSanityConfigured } from "@/lib/sanity";
import { sanityDocToArticle } from "@/lib/sanity-adapter";
import {
  ALL_ARTICLES_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  RELATED_ARTICLES_QUERY,
} from "@/lib/sanity-queries";
import { ARTICLES, type Article } from "@/data/articles";

function mergeSanityWithBundled(sanityDocs: Article[]): Article[] {
  const sanityIds = new Set(sanityDocs.map((d) => d.id));
  const sanitySlugs = new Set(sanityDocs.map((d) => d.slug));
  const bundledOnly = ARTICLES.filter(
    (a) => !sanityIds.has(a.id) && !sanitySlugs.has(a.slug)
  );
  return [...sanityDocs, ...bundledOnly];
}

export function useAllArticles() {
  return useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      if (!isSanityConfigured || !sanityClient) return ARTICLES;
      try {
        const docs = await sanityClient.fetch(ALL_ARTICLES_QUERY);
        const result = (docs as Parameters<typeof sanityDocToArticle>[0][]).map(
          sanityDocToArticle
        );
        return mergeSanityWithBundled(result);
      } catch {
        return ARTICLES;
      }
    },
    staleTime: 1000 * 15,
  });
}

export function useArticle(slug: string) {
  return useQuery<Article | undefined>({
    queryKey: ["article", slug],
    queryFn: async () => {
      if (!isSanityConfigured || !sanityClient) {
        return ARTICLES.find((a) => a.slug === slug);
      }
      try {
        const doc = await sanityClient.fetch(ARTICLE_BY_SLUG_QUERY, { slug });
        if (!doc) return ARTICLES.find((a) => a.slug === slug);
        return sanityDocToArticle(doc as Parameters<typeof sanityDocToArticle>[0]);
      } catch {
        return ARTICLES.find((a) => a.slug === slug);
      }
    },
    staleTime: 1000 * 15,
  });
}

export function useRelatedArticles(slug: string, tags: string[]) {
  return useQuery<Article[]>({
    queryKey: ["related", slug, tags],
    queryFn: async () => {
      if (!isSanityConfigured || !sanityClient) {
        return ARTICLES.filter(
          (a) => a.slug !== slug && a.tags.some((t) => tags.includes(t))
        ).slice(0, 3);
      }
      try {
        const docs = await sanityClient.fetch(RELATED_ARTICLES_QUERY, {
          slug,
          tags,
        });
        const result = (docs as Parameters<typeof sanityDocToArticle>[0][]).map(
          sanityDocToArticle
        );
        if (result.length > 0) return result;
      } catch {
        // fall through to bundled
      }
      return ARTICLES.filter(
        (a) => a.slug !== slug && a.tags.some((t) => tags.includes(t))
      ).slice(0, 3);
    },
    enabled: tags.length > 0,
    staleTime: 1000 * 15,
  });
}
