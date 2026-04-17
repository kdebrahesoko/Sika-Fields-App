import type { Article } from "@/data/articles";
import { ARTICLES as baseArticles } from "@/data/articles";

const HANDOFF_KEY = "sf-ai-draft-handoff";

export function kindLabel(kind: Article["kind"]): string {
  if (kind === "event") return "Event";
  if (kind === "news") return "News";
  return "Article";
}

/**
 * Generate a slug that won't collide with the bundled sample articles.
 * The API server performs the authoritative dedup against Sanity at publish
 * time; this is just a UX nicety so the slug field looks reasonable.
 */
export function ensureUniqueSlug(slug: string): string {
  const taken = new Set<string>();
  baseArticles.forEach((a) => taken.add(a.slug));
  if (!taken.has(slug)) return slug;
  let i = 2;
  while (taken.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
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
