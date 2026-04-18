import { Router, type IRouter, type Request, type Response } from "express";
import express from "express";
import { clerkClient } from "@clerk/express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAdmin, type AdminRequest } from "../middlewares/requireAdmin";
import {
  getSanityWriteClient,
  toPortableText,
  fromPortableText,
  uploadImageBuffer,
  type ComposerBlock,
  type SanityBlock,
} from "../lib/sanity-write";

const router: IRouter = Router();

router.use(requireAdmin);

// ──────────────────────────────────────────────────────────────
// Editor metadata helper — used to stamp posts with who edited
// ──────────────────────────────────────────────────────────────

interface EditorMeta {
  id: string;
  name: string;
}

async function getEditorMeta(req: AdminRequest): Promise<EditorMeta | null> {
  const id = req.userId;
  if (!id) return null;
  try {
    const u = await clerkClient.users.getUser(id);
    const first = (u.firstName ?? "").trim();
    const last = (u.lastName ?? "").trim();
    const fullName = [first, last].filter(Boolean).join(" ").trim();
    const email = u.emailAddresses?.[0]?.emailAddress ?? "";
    const name = fullName || email || "Admin";
    return { id, name };
  } catch (err) {
    console.warn("Could not load editor meta:", err);
    return { id, name: "Admin" };
  }
}

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

async function ensureUniqueSlugServer(client: ReturnType<typeof getSanityWriteClient>, slug: string): Promise<string> {
  if (!client) return slug;
  const exists = await client.fetch<string[]>(
    `*[_type in ["blog","news","event"] && slug.current match $pattern].slug.current`,
    { pattern: `${slug}*` },
  );
  if (!exists.includes(slug)) return slug;
  let i = 2;
  while (exists.includes(`${slug}-${i}`)) i += 1;
  return `${slug}-${i}`;
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

  const finalSlug = await ensureUniqueSlugServer(client, body.slug);

  const doc: Record<string, unknown> = {
    _type,
    title: body.title.trim(),
    slug: { _type: "slug", current: finalSlug },
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

  const editor = await getEditorMeta(req as AdminRequest);
  if (editor) {
    doc.lastEditedBy = editor;
    doc.lastEditedAt = new Date().toISOString();
  }

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
    res.status(201).json({ id: created._id, slug: finalSlug, kind: body.kind });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    console.error("Sanity create error:", e);
    res.status(500).json({ error: message });
  }
});

// ──────────────────────────────────────────────────────────────
// Load a single post for editing — GET /admin/posts/:id
// ──────────────────────────────────────────────────────────────

interface RawSanityPost {
  _id: string;
  _type: "blog" | "news" | "event";
  _updatedAt?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  summary?: string;
  template?: "standard" | "hero" | "visual";
  coverColor?: string;
  tags?: string[];
  authorInline?: { name?: string; role?: string };
  coverImageAssetId?: string;
  coverImageUrl?: string;
  content?: SanityBlock[];
  format?: "event" | "webinar" | "podcast";
  startsAt?: string;
  endsAt?: string;
  location?: string;
  virtualLink?: string;
  host?: string;
  registerUrl?: string;
  mediaUrl?: string;
  durationMinutes?: number;
  recurrence?: "none" | "weekly" | "monthly";
  recurrenceEnd?: string;
}

router.get("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");
  if (!id || !/^[A-Za-z0-9._-]+$/.test(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const client = getSanityWriteClient();
  if (!client) {
    res.status(503).json({
      error: "Sanity is not configured. Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN secrets to enable editing.",
      code: "sanity_not_configured",
    });
    return;
  }
  try {
    const doc = await client.fetch<RawSanityPost | null>(
      `*[_id == $id][0]{
        _id, _type, _updatedAt, title, "slug": slug.current,
        excerpt, summary, template, coverColor, tags, authorInline,
        "coverImageAssetId": coverImage.asset._ref,
        "coverImageUrl": coverImage.asset->url,
        content,
        format, startsAt, endsAt, location, virtualLink, host,
        registerUrl, mediaUrl, durationMinutes, recurrence, recurrenceEnd
      }`,
      { id },
    );
    if (!doc) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (!["blog", "news", "event"].includes(doc._type)) {
      res.status(400).json({ error: "Not an editable post document" });
      return;
    }
    const kind: "article" | "news" | "event" =
      doc._type === "event" ? "event" : doc._type === "news" ? "news" : "article";
    const post = {
      id: doc._id,
      updatedAt: doc._updatedAt ?? "",
      kind,
      title: doc.title ?? "",
      slug: doc.slug ?? "",
      excerpt: doc.excerpt ?? doc.summary ?? "",
      template: doc.template ?? "standard",
      coverColor: doc.coverColor ?? "",
      tags: doc.tags ?? [],
      authorName: doc.authorInline?.name ?? "",
      authorRole: doc.authorInline?.role ?? "",
      coverImage: doc.coverImageAssetId
        ? { assetId: doc.coverImageAssetId, url: doc.coverImageUrl ?? "" }
        : null,
      content: fromPortableText(doc.content),
      event:
        doc._type === "event"
          ? {
              date: doc.startsAt ?? "",
              endDate: doc.endsAt ?? "",
              location: doc.location ?? "",
              virtualLink: doc.virtualLink ?? "",
              registerUrl: doc.registerUrl ?? "",
              recurrence: doc.recurrence ?? "none",
              recurrenceEnd: doc.recurrenceEnd ?? "",
            }
          : null,
    };
    res.json({ post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Load failed";
    console.error("Sanity load error:", e);
    res.status(500).json({ error: message });
  }
});

// ──────────────────────────────────────────────────────────────
// Update a post — PATCH /admin/posts/:id
// ──────────────────────────────────────────────────────────────

router.patch("/:id", express.json({ limit: "1mb" }), async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");
  if (!id || !/^[A-Za-z0-9._-]+$/.test(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const body = (req.body ?? {}) as CreatePostBody & { baseUpdatedAt?: string };
  const err = validateCreate(body);
  if (err) {
    res.status(400).json({ error: err });
    return;
  }
  const client = getSanityWriteClient();
  if (!client) {
    res.status(503).json({
      error: "Sanity is not configured. Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN secrets to enable editing.",
      code: "sanity_not_configured",
    });
    return;
  }

  try {
    const existing = await client.fetch<{ _type?: string; _updatedAt?: string; slug?: string } | null>(
      `*[_id == $id][0]{ _type, _updatedAt, "slug": slug.current }`,
      { id },
    );
    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (!existing._type || !["blog", "news", "event"].includes(existing._type)) {
      res.status(400).json({ error: "Refusing to update non-post document" });
      return;
    }

    // Concurrency check: reject if the document has been modified since the
    // composer loaded it. Prevents two admins from silently overwriting each
    // other's edits.
    const baseUpdatedAt = typeof body.baseUpdatedAt === "string" ? body.baseUpdatedAt : "";
    const currentUpdatedAt = existing._updatedAt ?? "";
    if (baseUpdatedAt && currentUpdatedAt && baseUpdatedAt !== currentUpdatedAt) {
      res.status(409).json({
        error: "This post was changed by someone else since you opened it. Reload to keep editing.",
        code: "stale_edit",
        currentUpdatedAt,
      });
      return;
    }
    const expectedType = body.kind === "event" ? "event" : body.kind === "news" ? "news" : "blog";
    if (existing._type !== expectedType) {
      res.status(400).json({ error: "Cannot change post type when editing. Delete and recreate instead." });
      return;
    }

    // If slug changed, ensure new one is unique (excluding this doc).
    let finalSlug = body.slug;
    if (body.slug !== existing.slug) {
      const taken = await client.fetch<string[]>(
        `*[_type in ["blog","news","event"] && _id != $id && slug.current match $pattern].slug.current`,
        { id, pattern: `${body.slug}*` },
      );
      if (taken.includes(body.slug)) {
        let i = 2;
        while (taken.includes(`${body.slug}-${i}`)) i += 1;
        finalSlug = `${body.slug}-${i}`;
      }
    }

    const portable = toPortableText(body.content);
    const set: Record<string, unknown> = {
      title: body.title.trim(),
      slug: { _type: "slug", current: finalSlug },
      tags: body.tags ?? [],
      content: portable,
    };
    const unset: string[] = [];

    if (body.excerpt) {
      if (existing._type === "blog") set.excerpt = body.excerpt;
      else set.summary = body.excerpt;
    } else {
      unset.push(existing._type === "blog" ? "excerpt" : "summary");
    }

    if (body.coverImageAssetId) {
      set.coverImage = { _type: "image", asset: { _type: "reference", _ref: body.coverImageAssetId } };
    } else {
      unset.push("coverImage");
    }

    if (body.template) set.template = body.template;
    if (body.coverColor) set.coverColor = body.coverColor;
    else unset.push("coverColor");

    if (body.authorName) {
      set.authorInline = { name: body.authorName, role: body.authorRole ?? "" };
    } else {
      unset.push("authorInline");
    }

    if (existing._type === "event" && body.event) {
      set.format = body.event.format ?? "event";
      set.startsAt = body.event.date;
      if (body.event.endDate) set.endsAt = body.event.endDate;
      else unset.push("endsAt");
      if (body.event.location) set.location = body.event.location;
      else unset.push("location");
      if (body.event.virtualLink) set.virtualLink = body.event.virtualLink;
      else unset.push("virtualLink");
      if (body.event.host) set.host = body.event.host;
      else unset.push("host");
      if (body.event.registerUrl) set.registerUrl = body.event.registerUrl;
      else unset.push("registerUrl");
      if (body.event.mediaUrl) set.mediaUrl = body.event.mediaUrl;
      else unset.push("mediaUrl");
      if (body.event.durationMinutes) set.durationMinutes = body.event.durationMinutes;
      else unset.push("durationMinutes");
      set.recurrence = body.event.recurrence ?? "none";
      if (body.event.recurrenceEnd) set.recurrenceEnd = body.event.recurrenceEnd;
      else unset.push("recurrenceEnd");
    }

    const editor = await getEditorMeta(req as AdminRequest);
    if (editor) {
      set.lastEditedBy = editor;
      set.lastEditedAt = new Date().toISOString();
    }

    let patch = client.patch(id).set(set);
    if (unset.length > 0) patch = patch.unset(unset);
    const committed = (await patch.commit()) as { _updatedAt?: string } | undefined;

    res.json({
      id,
      slug: finalSlug,
      kind: body.kind,
      updatedAt: committed?._updatedAt ?? "",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    console.error("Sanity patch error:", e);
    res.status(500).json({ error: message });
  }
});

// ──────────────────────────────────────────────────────────────
// List posts — GET /admin/posts
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// Delete post — DELETE /admin/posts/:id
// ──────────────────────────────────────────────────────────────

router.delete("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");
  if (!id || !/^[A-Za-z0-9._-]+$/.test(id)) {
    res.status(400).json({ error: "invalid id" });
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
  try {
    const existing = await client.fetch<{ _type?: string } | null>(
      `*[_id == $id][0]{ _type }`,
      { id },
    );
    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (!existing._type || !["blog", "news", "event"].includes(existing._type)) {
      res.status(400).json({ error: "Refusing to delete non-post document" });
      return;
    }
    await client.delete(id);
    res.json({ ok: true, id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    console.error("Sanity delete error:", e);
    res.status(500).json({ error: message });
  }
});

// ──────────────────────────────────────────────────────────────
// Revision history — list & restore
// ──────────────────────────────────────────────────────────────

interface SanityTransaction {
  id: string;
  timestamp: string;
  author?: string;
  documentIDs?: string[];
}

interface RevisionItem {
  id: string;
  timestamp: string;
  authorName?: string;
}

router.get("/:id/revisions", async (req: Request, res: Response) => {
  const id = String(req.params.id ?? "");
  if (!id || !/^[A-Za-z0-9._-]+$/.test(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const client = getSanityWriteClient();
  if (!client) {
    res.status(503).json({
      error: "Sanity is not configured.",
      code: "sanity_not_configured",
    });
    return;
  }
  const dataset = process.env.SANITY_DATASET ?? "production";
  try {
    // Sanity History API returns newline-delimited JSON of transactions.
    const raw = await client.request<unknown>({
      url: `/data/history/${dataset}/transactions/${id}?excludeContent=true&limit=50`,
    });
    const text = typeof raw === "string" ? raw : "";
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const txs: SanityTransaction[] = [];
    for (const line of lines) {
      try {
        txs.push(JSON.parse(line) as SanityTransaction);
      } catch {
        // skip malformed lines
      }
    }
    // Newest first; cap at 25 to keep the picker manageable.
    txs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    const revisions: RevisionItem[] = txs.slice(0, 25).map((t) => ({
      id: t.id,
      timestamp: t.timestamp,
    }));
    res.json({ revisions });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load history";
    // The history API requires a paid plan / certain dataset configurations;
    // degrade gracefully so the UI can show a friendly message.
    console.warn("Sanity history error:", e);
    res.status(200).json({ revisions: [], warning: message });
  }
});

interface HistoricalDoc {
  _id: string;
  _type?: string;
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
  [k: string]: unknown;
}

async function fetchHistoricalDoc(
  client: NonNullable<ReturnType<typeof getSanityWriteClient>>,
  id: string,
  revisionId: string,
): Promise<HistoricalDoc | null> {
  const dataset = process.env.SANITY_DATASET ?? "production";
  const result = await client.request<{ documents?: HistoricalDoc[] } | HistoricalDoc>({
    url: `/data/history/${dataset}/documents/${id}?revision=${encodeURIComponent(revisionId)}`,
  });
  if (result && typeof result === "object") {
    if ("documents" in result && Array.isArray(result.documents)) {
      return result.documents[0] ?? null;
    }
    if ("_id" in result) return result as HistoricalDoc;
  }
  return null;
}

router.post(
  "/:id/restore",
  express.json({ limit: "256kb" }),
  async (req: Request, res: Response) => {
    const id = String(req.params.id ?? "");
    if (!id || !/^[A-Za-z0-9._-]+$/.test(id)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const body = (req.body ?? {}) as { revisionId?: string };
    const revisionId = String(body.revisionId ?? "");
    if (!revisionId || !/^[A-Za-z0-9._-]+$/.test(revisionId)) {
      res.status(400).json({ error: "revisionId is required" });
      return;
    }
    const client = getSanityWriteClient();
    if (!client) {
      res.status(503).json({
        error: "Sanity is not configured.",
        code: "sanity_not_configured",
      });
      return;
    }
    try {
      const existing = await client.fetch<{ _type?: string } | null>(
        `*[_id == $id][0]{ _type }`,
        { id },
      );
      if (!existing) {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      if (!existing._type || !["blog", "news", "event"].includes(existing._type)) {
        res.status(400).json({ error: "Refusing to restore non-post document" });
        return;
      }

      const historical = await fetchHistoricalDoc(client, id, revisionId);
      if (!historical) {
        res.status(404).json({ error: "Revision not found" });
        return;
      }
      if (historical._type !== existing._type) {
        res.status(400).json({ error: "Revision belongs to a different document type" });
        return;
      }

      // Strip system fields the server controls; keep _id so createOrReplace
      // overwrites the live document in place.
      const {
        _rev: _r,
        _createdAt: _c,
        _updatedAt: _u,
        ...rest
      } = historical;

      const editor = await getEditorMeta(req as AdminRequest);
      const replacement: HistoricalDoc & { _id: string; _type: string } = {
        ...(rest as HistoricalDoc),
        _id: id,
        _type: existing._type,
        lastEditedAt: new Date().toISOString(),
      };
      if (editor) {
        replacement.lastEditedBy = editor;
      }

      await client.createOrReplace(
        replacement as { _id: string; _type: string } & Record<string, unknown>,
      );
      res.json({ ok: true, id, revisionId });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Restore failed";
      console.error("Sanity restore error:", e);
      res.status(500).json({ error: message });
    }
  },
);

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
