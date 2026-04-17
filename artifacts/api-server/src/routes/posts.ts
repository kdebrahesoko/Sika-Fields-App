import { Router, type IRouter, type Request, type Response } from "express";
import express from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  getSanityWriteClient,
  toPortableText,
  uploadImageBuffer,
  type ComposerBlock,
} from "../lib/sanity-write";

const router: IRouter = Router();

router.use(requireAdmin);

// ──────────────────────────────────────────────────────────────
// AI draft generator (existing)
// ──────────────────────────────────────────────────────────────

interface DraftRequestBody {
  kind?: "article" | "news" | "event";
  topic?: string;
  audience?: string;
  keyPoints?: string;
  tone?: string;
  eventDate?: string;
  eventLocation?: string;
  eventVirtualLink?: string;
}

interface AiDraft {
  title: string;
  excerpt: string;
  kind: "article" | "news" | "event";
  tags: string[];
  authorName: string;
  authorRole: string;
  contentMarkdown: string;
  event?: { date: string; location: string; virtualLink: string };
}

const SYSTEM_PROMPT = `You are an editorial assistant for SikaFields — a climate-tech platform connecting smallholder farmers with the global carbon market.

You draft polished, publication-ready content for the SikaFields newsroom. You always:
- Write in a confident, warm, plain-English tone (the SikaFields voice).
- Avoid jargon when possible; explain it when unavoidable.
- Keep paragraphs short (2–4 sentences).
- Structure content with clear section headings and use bullet lists where helpful.
- For events, include practical details (date, location, who should attend, what to expect).

Return your response as STRICT JSON matching this exact shape — no markdown fences, no commentary:
{
  "title": "Short, compelling title (max ~80 chars)",
  "excerpt": "1–2 sentence summary (max ~200 chars)",
  "kind": "article" | "news" | "event",
  "tags": ["3 to 6 short tags"],
  "authorName": "Reasonable author name (default 'SikaFields Team')",
  "authorRole": "Role/title for the author",
  "contentMarkdown": "The full article body in simple Markdown using # H1, ## H2, paragraphs, > quotes, and - bullet lists. ~400-700 words.",
  "event": { "date": "ISO date or empty", "location": "in-person location or empty", "virtualLink": "URL or empty" }
}

If kind is not "event", omit the event object.`;

router.post("/draft", express.json(), async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as DraftRequestBody;
  const kind = body.kind ?? "event";
  const topic = (body.topic ?? "").trim();
  if (!topic) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  const userPrompt = `Draft a ${kind} for the SikaFields newsroom.

Topic / headline idea:
${topic}

Audience: ${body.audience || "Mixed: farmers, corporate buyers, investors"}
Tone: ${body.tone || "Confident, warm, plain English"}

Key points to cover:
${body.keyPoints || "(use your judgement based on the topic)"}

${
  kind === "event"
    ? `Event details:
- Date / time: ${body.eventDate || "TBD"}
- Location: ${body.eventLocation || "TBD"}
- Virtual link: ${body.eventVirtualLink || "(none)"}
`
    : ""
}

Return STRICT JSON only.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      res.status(502).json({ error: "Empty response from model" });
      return;
    }

    let draft: AiDraft;
    try {
      draft = JSON.parse(raw) as AiDraft;
    } catch {
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart < 0 || jsonEnd < 0) {
        res.status(502).json({ error: "Model did not return JSON", raw });
        return;
      }
      draft = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as AiDraft;
    }

    if (kind === "event" && !draft.event) {
      draft.event = {
        date: body.eventDate ?? "",
        location: body.eventLocation ?? "",
        virtualLink: body.eventVirtualLink ?? "",
      };
    }

    res.json({ draft });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("AI draft error:", err);
    res.status(500).json({ error: message });
  }
});

// ──────────────────────────────────────────────────────────────
// Image upload — POST /admin/posts/upload  (binary stream)
// ──────────────────────────────────────────────────────────────

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

router.post(
  "/upload",
  express.raw({ type: ["image/*"], limit: MAX_UPLOAD_BYTES }),
  async (req: Request, res: Response) => {
    try {
      const buf = req.body as Buffer | undefined;
      if (!buf || !Buffer.isBuffer(buf) || buf.length === 0) {
        res.status(400).json({ error: "Empty body. POST raw image bytes with an image/* Content-Type." });
        return;
      }
      const contentType = req.headers["content-type"] ?? "image/jpeg";
      const filename = (req.headers["x-filename"] as string | undefined) ?? "upload";
      const client = getSanityWriteClient();
      if (!client) {
        res.status(503).json({ error: "Image upload requires Sanity to be configured (set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN)." });
        return;
      }
      const asset = await uploadImageBuffer(buf, String(contentType), String(filename));
      res.json({ asset });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", err);
      res.status(500).json({ error: message });
    }
  },
);

// ──────────────────────────────────────────────────────────────
// Create post — POST /admin/posts  (article | news | event)
// ──────────────────────────────────────────────────────────────

interface CreatePostBody {
  kind: "article" | "news" | "event";
  title: string;
  slug: string;
  excerpt?: string;
  authorName?: string;
  authorRole?: string;
  tags?: string[];
  template?: "standard" | "hero" | "visual";
  coverImageAssetId?: string;
  coverImageUrl?: string;
  coverColor?: string;
  content: ComposerBlock[];
  event?: {
    date: string;
    endDate?: string;
    location?: string;
    virtualLink?: string;
    format?: "event" | "webinar" | "podcast";
    host?: string;
    registerUrl?: string;
    mediaUrl?: string;
    durationMinutes?: number;
    recurrence?: "none" | "weekly" | "monthly";
    recurrenceEnd?: string;
  };
}

function validateCreate(body: CreatePostBody): string | null {
  if (!body.kind || !["article", "news", "event"].includes(body.kind)) return "kind must be article|news|event";
  if (!body.title || body.title.trim().length < 3) return "title is required (min 3 chars)";
  if (!body.slug || !/^[a-z0-9-]+$/.test(body.slug)) return "slug must be lowercase letters, digits, dashes";
  if (!Array.isArray(body.content) || body.content.length === 0) return "content must have at least one block";
  if (body.kind === "event") {
    if (!body.event?.date) return "event.date is required for events";
  }
  return null;
}

router.post("/", express.json({ limit: "1mb" }), async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as CreatePostBody;
  const err = validateCreate(body);
  if (err) {
    res.status(400).json({ error: err });
    return;
  }

  const client = getSanityWriteClient();
  if (!client) {
    res.status(503).json({
      error: "Sanity is not configured. Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN secrets to enable publishing.",
      code: "sanity_not_configured",
    });
    return;
  }

  const _type = body.kind === "event" ? "event" : body.kind === "news" ? "news" : "blog";
  const portable = toPortableText(body.content);
  const coverImage = body.coverImageAssetId
    ? { _type: "image" as const, asset: { _type: "reference" as const, _ref: body.coverImageAssetId } }
    : undefined;

  const doc: Record<string, unknown> = {
    _type,
    title: body.title.trim(),
    slug: { _type: "slug", current: body.slug },
    publishedAt: new Date().toISOString(),
    tags: body.tags ?? [],
    content: portable,
  };
  if (body.excerpt) {
    if (_type === "blog") doc.excerpt = body.excerpt;
    else doc.summary = body.excerpt;
  }
  if (coverImage) doc.coverImage = coverImage;
  if (body.template) doc.template = body.template;
  if (body.coverColor) doc.coverColor = body.coverColor;
  if (body.authorName) doc.authorInline = { name: body.authorName, role: body.authorRole ?? "" };

  if (_type === "event" && body.event) {
    doc.format = body.event.format ?? "event";
    doc.startsAt = body.event.date;
    if (body.event.endDate) doc.endsAt = body.event.endDate;
    if (body.event.location) doc.location = body.event.location;
    if (body.event.virtualLink) doc.virtualLink = body.event.virtualLink;
    if (body.event.host) doc.host = body.event.host;
    if (body.event.registerUrl) doc.registerUrl = body.event.registerUrl;
    if (body.event.mediaUrl) doc.mediaUrl = body.event.mediaUrl;
    if (body.event.durationMinutes) doc.durationMinutes = body.event.durationMinutes;
    doc.recurrence = body.event.recurrence ?? "none";
    if (body.event.recurrenceEnd) doc.recurrenceEnd = body.event.recurrenceEnd;
  }

  try {
    const created = await client.create(doc as { _type: string } & Record<string, unknown>);
    res.status(201).json({ id: created._id, slug: body.slug, kind: body.kind });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    console.error("Sanity create error:", e);
    res.status(500).json({ error: message });
  }
});

// ──────────────────────────────────────────────────────────────
// List posts — GET /admin/posts
// ──────────────────────────────────────────────────────────────

router.get("/", async (_req: Request, res: Response) => {
  const client = getSanityWriteClient();
  if (!client) {
    res.json({ posts: [], sanityConfigured: false });
    return;
  }
  try {
    const posts = await client.fetch<unknown[]>(
      `*[_type in ["blog","news","event"]] | order(coalesce(publishedAt, startsAt, _createdAt) desc)[0...100] {
        _id, _type, title, "slug": slug.current,
        "excerpt": coalesce(excerpt, summary),
        publishedAt, format, startsAt, location
      }`,
    );
    res.json({ posts, sanityConfigured: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "List failed";
    res.status(500).json({ error: message });
  }
});

export default router;
