import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.use(requireAdmin);

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

router.post("/draft", async (req: Request, res: Response) => {
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

export default router;
