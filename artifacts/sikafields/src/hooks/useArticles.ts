import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sanityClient, isSanityConfigured } from "@/lib/sanity";
import { sanityDocToArticle } from "@/lib/sanity-adapter";
import {
  ALL_ARTICLES_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  RELATED_ARTICLES_QUERY,
} from "@/lib/sanity-queries";
import { ARTICLES, type Article } from "@/data/articles";
import { loadPublishedPosts } from "@/lib/published-posts";

function mergeWithPublished(base: Article[]): Article[] {
  const published = loadPublishedPosts();
  if (published.length === 0) return base;
  const baseSlugs = new Set(base.map((b) => b.slug));
  const fresh = published.filter((p) => !baseSlugs.has(p.slug));
  return [...fresh, ...base];
}

function usePublishedSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["article"] });
    };
    window.addEventListener("sf-published-changed", handler);
    return () => window.removeEventListener("sf-published-changed", handler);
  }, [qc]);
}

export function useAllArticles() {
  usePublishedSync();
  return useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      if (!isSanityConfigured || !sanityClient) return mergeWithPublished(ARTICLES);
      const docs = await sanityClient.fetch(ALL_ARTICLES_QUERY);
      const result = (docs as Parameters<typeof sanityDocToArticle>[0][]).map(
        sanityDocToArticle
      );
      return mergeWithPublished(result.length > 0 ? result : ARTICLES);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useArticle(slug: string) {
  usePublishedSync();
  return useQuery<Article | undefined>({
    queryKey: ["article", slug],
    queryFn: async () => {
      const local = loadPublishedPosts().find((p) => p.slug === slug);
      if (local) return local;
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
