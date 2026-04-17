import { createClient, type SanityClient } from "@sanity/client";

let cached: SanityClient | null = null;

export function getSanityWriteClient(): SanityClient | null {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET ?? "production";
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!projectId || !token) return null;
  if (cached) return cached;
  cached = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2026-03-01",
    useCdn: false,
  });
  return cached;
}

export interface SanityImageRef {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
}

export interface SanityBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "blockquote";
  children: { _type: "span"; _key: string; text: string; marks: string[] }[];
  markDefs: never[];
  listItem?: "bullet";
  level?: number;
}

let blockKeySeed = 0;
function key(prefix: string): string {
  blockKeySeed += 1;
  return `${prefix}_${Date.now().toString(36)}_${blockKeySeed}`;
}

export type ComposerBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; items: string[] };

/**
 * Convert composer blocks to Sanity portable text blocks.
 * Lists become multiple bullet blocks per item.
 */
export function toPortableText(blocks: ComposerBlock[]): SanityBlock[] {
  const out: SanityBlock[] = [];
  for (const b of blocks) {
    if (b.type === "list") {
      for (const item of b.items) {
        if (!item.trim()) continue;
        out.push({
          _type: "block",
          _key: key("blk"),
          style: "normal",
          listItem: "bullet",
          level: 1,
          markDefs: [],
          children: [{ _type: "span", _key: key("sp"), text: item, marks: [] }],
        });
      }
      continue;
    }
    if (b.type === "quote") {
      const text = b.attribution ? `${b.text} — ${b.attribution}` : b.text;
      out.push({
        _type: "block",
        _key: key("blk"),
        style: "blockquote",
        markDefs: [],
        children: [{ _type: "span", _key: key("sp"), text, marks: [] }],
      });
      continue;
    }
    const style = b.type === "h2" ? "h2" : "normal";
    out.push({
      _type: "block",
      _key: key("blk"),
      style,
      markDefs: [],
      children: [{ _type: "span", _key: key("sp"), text: b.text, marks: [] }],
    });
  }
  return out;
}

export interface UploadedAsset {
  assetId: string;
  ref: string; // image-<id>-<dim>-<ext> for Sanity image schema
  url: string;
}

export async function uploadImageBuffer(
  buffer: Buffer,
  contentType: string,
  filename = "upload",
): Promise<UploadedAsset> {
  const client = getSanityWriteClient();
  if (!client) throw new Error("Sanity is not configured (missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN)");
  const asset = await client.assets.upload("image", buffer, {
    contentType,
    filename,
  });
  return { assetId: asset._id, ref: asset._id, url: asset.url };
}
