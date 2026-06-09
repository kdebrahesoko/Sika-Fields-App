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

export default router;
