import type { Article, ArticleBlock, EventDetails } from "@/data/articles";

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
  listItem?: string;
  children?: { text: string; marks?: string[] }[];
  asset?: { url: string };
  alt?: string;
  caption?: string;
}

interface SanityDocument {
  _id: string;
  _type: "blog" | "news" | "event";
  _updatedAt?: string;
  lastEditedAt?: string;
  lastEditedBy?: { id?: string; name?: string };
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  coverColor?: string;
  author?: SanityAuthor;
  authorInline?: { name?: string; role?: string };
  tags?: string[];
  category?: string;
  featured?: boolean;
  template?: "standard" | "hero" | "visual";
  publishedAt?: string;
  content?: SanityContentBlock[];
  format?: "event" | "webinar" | "podcast";
  startsAt?: string;
  endsAt?: string;
  location?: string;
  virtualLink?: string;
  host?: string;
  registerUrl?: string;
  mediaUrl?: string;
  recurrence?: "none" | "weekly" | "monthly";
  recurrenceEnd?: string;
}

function blocksToArticleBlocks(blocks: SanityContentBlock[]): ArticleBlock[] {
  // Group consecutive bullet items into a single list block
  const out: ArticleBlock[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (listBuf.length > 0) {
      out.push({ type: "list", items: [...listBuf] });
      listBuf = [];
    }
  };
  for (const block of blocks) {
    if (block._type === "image") {
      flushList();
      const caption = block.alt ?? block.caption;
      if (caption) out.push({ type: "p", text: `[Image: ${caption}]` });
      continue;
    }
    const text = (block.children ?? []).map((c) => c.text).join("");
    if (!text.trim()) continue;
    if (block.listItem === "bullet") {
      listBuf.push(text);
      continue;
    }
    flushList();
    if (block.style === "blockquote") out.push({ type: "quote", text });
    else if (block.style === "h2" || block.style === "h3") out.push({ type: "h2", text });
    else out.push({ type: "p", text });
  }
  flushList();
  return out;
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

function docToEvent(doc: SanityDocument): EventDetails | undefined {
  if (doc._type !== "event" || !doc.startsAt) return undefined;
  const out: EventDetails = { date: doc.startsAt };
  if (doc.endsAt) out.endDate = doc.endsAt;
  if (doc.location) out.location = doc.location;
  if (doc.virtualLink) out.virtualLink = doc.virtualLink;
  if (doc.recurrence && doc.recurrence !== "none") out.recurrence = doc.recurrence;
  if (doc.recurrenceEnd) out.recurrenceEnd = doc.recurrenceEnd;
  return out;
}

export function sanityDocToArticle(doc: SanityDocument): Article {
  const dateSource = doc.publishedAt ?? doc.startsAt;
  const publishedDate = dateSource
    ? new Date(dateSource).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Draft";

  const author = {
    name: doc.author?.name ?? doc.authorInline?.name ?? "SikaFields Team",
    role: doc.author?.role ?? doc.authorInline?.role ?? "",
    bio: doc.author?.bio,
    photo: doc.author?.photo,
  };

  const kind: Article["kind"] =
    doc._type === "event" ? "event" : doc._type === "news" ? "news" : "article";

  const lastEditedAt = doc.lastEditedAt ?? doc._updatedAt;
  const lastEdited = lastEditedAt
    ? { at: lastEditedAt, byName: doc.lastEditedBy?.name }
    : undefined;

  return {
    id: doc._id,
    kind,
    template: doc.template ?? "standard",
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt ?? "",
    coverImage: doc.coverImage,
    coverColor: doc.coverColor ?? "#16a34a",
    author,
    publishedAt: publishedDate,
    readTime: doc.content
      ? Math.max(1, Math.ceil(wordCount(doc.content) / 200))
      : 3,
    tags: doc.tags ?? [],
    featured: doc.featured ?? false,
    content: doc.content ? blocksToArticleBlocks(doc.content) : [],
    event: docToEvent(doc),
    lastEdited,
  };
}
