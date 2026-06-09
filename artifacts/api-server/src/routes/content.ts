import { Router, type Request, type Response } from "express";
import { getSanityWriteClient } from "../lib/sanity-write";

const router = Router();

const ALL_ARTICLES_QUERY = `
  *[_type in ["blog", "news", "event"]] | order(coalesce(publishedAt, startsAt) desc) {
    _id,
    _type,
    _updatedAt,
    lastEditedAt,
    lastEditedBy,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, summary),
    "coverImage": coverImage.asset->url,
    coverColor,
    "author": author->{
      name,
      role,
      "photo": photo.asset->url
    },
    authorInline,
    tags,
    category,
    featured,
    template,
    publishedAt,
    format,
    startsAt,
    endsAt,
    location,
    virtualLink,
    host,
    registerUrl,
    mediaUrl,
    recurrence,
    recurrenceEnd
  }
`;

const ARTICLE_BY_SLUG_QUERY = `
  *[_type in ["blog", "news", "event"] && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, summary),
    "coverImage": coverImage.asset->url,
    coverColor,
    "author": author->{
      name,
      role,
      bio,
      linkedin,
      "photo": photo.asset->url
    },
    authorInline,
    tags,
    category,
    featured,
    template,
    publishedAt,
    format,
    startsAt,
    endsAt,
    location,
    virtualLink,
    host,
    registerUrl,
    mediaUrl,
    recurrence,
    recurrenceEnd,
    content
  }
`;

router.get("/articles", async (_req: Request, res: Response) => {
  try {
    const client = getSanityWriteClient();
    if (!client) {
      res.json([]);
      return;
    }
    const docs = await client.fetch(ALL_ARTICLES_QUERY);
    res.json(docs);
  } catch (err) {
    console.error("GET /content/articles error:", err);
    res.json([]);
  }
});

router.get("/articles/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const client = getSanityWriteClient();
    if (!client) {
      res.json(null);
      return;
    }
    const doc = await client.fetch(ARTICLE_BY_SLUG_QUERY, { slug });
    res.json(doc ?? null);
  } catch (err) {
    console.error("GET /content/articles/:slug error:", err);
    res.json(null);
  }
});

export default router;
