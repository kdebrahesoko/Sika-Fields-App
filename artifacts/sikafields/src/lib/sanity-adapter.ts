import type { Article, ArticleBlock } from "@/data/articles";

interface SanityAuthor {
  name: string;
  role?: string;
  photo?: string;
  bio?: string;
  linkedin?: string;
}

interface SanityContentBlock {
  _type: "block" | "image";
  style?: string;
  children?: { text: string; marks?: string[] }[];
  asset?: { url: string };
  alt?: string;
  caption?: string;
}

interface SanityDocument {
  _id: string;
  _type: "blog" | "news";
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  author?: SanityAuthor;
  tags?: string[];
  category?: string;
  featured?: boolean;
  template?: "standard" | "hero" | "visual";
  publishedAt?: string;
  content?: SanityContentBlock[];
}

function blocksToArticleBlocks(blocks: SanityContentBlock[]): ArticleBlock[] {
  return blocks.flatMap((block): ArticleBlock[] => {
    if (block._type === "image") {
      const caption = block.alt ?? block.caption;
      return caption ? [{ type: "p", text: `[Image: ${caption}]` }] : [];
    }
    const text = (block.children ?? []).map((c) => c.text).join("");
    if (!text.trim()) return [];
    if (block.style === "blockquote") return [{ type: "quote", text }];
    if (block.style === "h2" || block.style === "h3") return [{ type: "h2", text }];
    return [{ type: "p", text }];
  });
}

function wordCount(blocks: SanityContentBlock[]): number {
  return blocks
    .filter((b) => b._type === "block")
    .flatMap((b) => b.children ?? [])
    .map((c) => c.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function sanityDocToArticle(doc: SanityDocument): Article {
  const publishedDate = doc.publishedAt
    ? new Date(doc.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Draft";

  return {
    id: doc._id,
    kind: doc._type === "news" ? "news" : "article",
    template: doc.template ?? "standard",
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt ?? "",
    coverImage: doc.coverImage,
    coverColor: "#16a34a",
    author: {
      name: doc.author?.name ?? "SikaFields Team",
      role: doc.author?.role ?? "",
      bio: doc.author?.bio,
      photo: doc.author?.photo,
    },
    publishedAt: publishedDate,
    readTime: doc.content
      ? Math.max(1, Math.ceil(wordCount(doc.content) / 200))
      : 3,
    tags: doc.tags ?? [],
    featured: doc.featured ?? false,
    content: doc.content ? blocksToArticleBlocks(doc.content) : [],
  };
}
