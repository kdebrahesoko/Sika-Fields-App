import { createClient } from "@sanity/client";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.VITE_SANITY_DATASET as string | undefined) ?? "production";

export const isSanityConfigured = Boolean(projectId);

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      useCdn: false,
      apiVersion: "2026-03-01",
    })
  : null;

export function imageUrl(ref: string): string {
  if (!projectId) return "";
  const [, id, dimensionsAndExt] = ref.split("-");
  const [dimensions, ext] = dimensionsAndExt.split(".");
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${ext}`;
}
