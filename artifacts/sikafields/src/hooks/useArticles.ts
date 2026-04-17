import { useQuery } from "@tanstack/react-query";
import { sanityClient, isSanityConfigured } from "@/lib/sanity";
import { sanityDocToArticle } from "@/lib/sanity-adapter";
import {
  ALL_ARTICLES_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  RELATED_ARTICLES_QUERY,
} from "@/lib/sanity-queries";
import { ARTICLES, type Article } from "@/data/articles";

export function useAllArticles() {
  return useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      if (!isSanityConfigured || !sanityClient) return ARTICLES;
      const docs = await sanityClient.fetch(ALL_ARTICLES_QUERY);
      const result = (docs as Parameters<typeof sanityDocToArticle>[0][]).map(
        sanityDocToArticle
      );
      return result.length > 0 ? result : ARTICLES;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useArticle(slug: string) {
  return useQuery<Article | undefined>({
    queryKey: ["article", slug],
    queryFn: async () => {
      if (!isSanityConfigured || !sanityClient) {
        return ARTICLES.find((a) => a.slug === slug);
      }
      const doc = await sanityClient.fetch(ARTICLE_BY_SLUG_QUERY, { slug });
      if (!doc) return ARTICLES.find((a) => a.slug === slug);
      return sanityDocToArticle(doc as Parameters<typeof sanityDocToArticle>[0]);
    },
    staleTime: 1000 * 60 * 5,
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
      const docs = await sanityClient.fetch(RELATED_ARTICLES_QUERY, {
        slug,
        tags,
      });
      const result = (docs as Parameters<typeof sanityDocToArticle>[0][]).map(
        sanityDocToArticle
      );
      if (result.length > 0) return result;
      return ARTICLES.filter(
        (a) => a.slug !== slug && a.tags.some((t) => tags.includes(t))
      ).slice(0, 3);
    },
    enabled: tags.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
