import type { Article } from "@/data/articles";
import { ARTICLES as baseArticles } from "@/data/articles";

const PUBLISHED_KEY = "sf-published-posts";
const HANDOFF_KEY = "sf-ai-draft-handoff";

export function kindLabel(kind: Article["kind"]): string {
  if (kind === "event") return "Event";
  if (kind === "news") return "News";
  return "Article";
}

/**
 * Generate a slug that won't collide with base articles or other local posts.
 * Appends -2, -3, … if needed.
 */
export function ensureUniqueSlug(slug: string, ignoreId?: string): string {
  const taken = new Set<string>();
  baseArticles.forEach((a) => taken.add(a.slug));
  loadPublishedPosts().forEach((p) => {
    if (p.id !== ignoreId) taken.add(p.slug);
  });
  if (!taken.has(slug)) return slug;
  let i = 2;
  while (taken.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

export function loadPublishedPosts(): Article[] {
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Article[]) : [];
  } catch {
    return [];
  }
}

export function savePublishedPost(article: Article): Article {
  const posts = loadPublishedPosts();
  const without = posts.filter((p) => p.slug !== article.slug);
  const next = [article, ...without];
  try {
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("sf-published-changed"));
  } catch {
    // localStorage unavailable
  }
  return article;
}

export function deletePublishedPost(slug: string): void {
  const posts = loadPublishedPosts().filter((p) => p.slug !== slug);
  try {
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent("sf-published-changed"));
  } catch {
    // localStorage unavailable
  }
}

export interface AiDraftHandoff {
  title: string;
  excerpt: string;
  kind: "article" | "news" | "event";
  tags: string[];
  authorName: string;
  authorRole: string;
  contentMarkdown: string;
  event?: {
    date: string;
    location: string;
    virtualLink: string;
  };
}

export function setAiDraftHandoff(handoff: AiDraftHandoff): void {
  try {
    localStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
  } catch {
    // localStorage unavailable
  }
}

export function consumeAiDraftHandoff(): AiDraftHandoff | null {
  try {
    const raw = localStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    localStorage.removeItem(HANDOFF_KEY);
    return JSON.parse(raw) as AiDraftHandoff;
  } catch {
    return null;
  }
}
