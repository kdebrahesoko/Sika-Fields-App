// Client-side diff utilities used by the Revision History dialog to
// summarise what changed between two historical post payloads. Kept in a
// standalone module so the logic is easy to unit-test and reuse between the
// per-row "at a glance" badges and the in-preview "what changed" panel.

export interface DiffBlock {
  type: "p" | "h2" | "quote" | "list";
  text?: string;
  attribution?: string;
  items?: string[];
}

export interface DiffPayload {
  title: string;
  slug: string;
  excerpt: string;
  template: "standard" | "hero" | "visual";
  coverColor: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  coverImage: { assetId: string; url: string } | null;
  content: DiffBlock[];
  event: {
    date: string;
    endDate: string;
    location: string;
    virtualLink: string;
    registerUrl: string;
    recurrence: "none" | "weekly" | "monthly";
    recurrenceEnd: string;
  } | null;
}

export type ChangeTone = "added" | "removed" | "edited";

export interface ChangeSummary {
  /** Short label suitable for a row badge, e.g. "Title changed" or "+3 blocks". */
  label: string;
  /** Optional longer description used in the preview "what changed" panel. */
  detail?: string;
  tone: ChangeTone;
}

function blockSignature(b: DiffBlock): string {
  if (b.type === "list") return `list:${(b.items ?? []).join("\u0001")}`;
  if (b.type === "quote")
    return `quote:${b.text ?? ""}\u0001${b.attribution ?? ""}`;
  return `${b.type}:${b.text ?? ""}`;
}

function blockPreview(b: DiffBlock): string {
  if (b.type === "list") {
    const first = (b.items ?? []).find((s) => s.trim()) ?? "";
    return first ? `“${truncate(first, 60)}”` : "(empty list)";
  }
  if (b.type === "quote") return `“${truncate(b.text ?? "", 60)}”`;
  return truncate(b.text ?? "", 60);
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1).trimEnd()}…`;
}

function diffStringSets(prev: string[], curr: string[]): { added: string[]; removed: string[] } {
  const a = new Set(prev);
  const b = new Set(curr);
  return {
    added: curr.filter((x) => !a.has(x)),
    removed: prev.filter((x) => !b.has(x)),
  };
}

function diffBlocks(prev: DiffBlock[], curr: DiffBlock[]): {
  added: number;
  removed: number;
  edited: number;
  addedSamples: string[];
  removedSamples: string[];
} {
  const prevSigs = prev.map(blockSignature);
  const currSigs = curr.map(blockSignature);
  const prevSet = new Set(prevSigs);
  const currSet = new Set(currSigs);

  const addedIdx: number[] = [];
  const removedIdx: number[] = [];
  currSigs.forEach((s, i) => {
    if (!prevSet.has(s)) addedIdx.push(i);
  });
  prevSigs.forEach((s, i) => {
    if (!currSet.has(s)) removedIdx.push(i);
  });

  // Heuristic for "edited": when both sides have unmatched blocks of the same
  // type at roughly aligned positions, treat the overlap as edits rather than
  // independent add/remove pairs. Keeps badges meaningful for the common case
  // of tweaking one paragraph in place.
  let edited = 0;
  const consumedAdded = new Set<number>();
  const consumedRemoved = new Set<number>();
  for (const ri of removedIdx) {
    const rType = prev[ri].type;
    const match = addedIdx.find(
      (ai) => !consumedAdded.has(ai) && curr[ai].type === rType,
    );
    if (match !== undefined) {
      edited += 1;
      consumedAdded.add(match);
      consumedRemoved.add(ri);
    }
  }

  const netAdded = addedIdx.filter((i) => !consumedAdded.has(i));
  const netRemoved = removedIdx.filter((i) => !consumedRemoved.has(i));
  return {
    added: netAdded.length,
    removed: netRemoved.length,
    edited,
    addedSamples: netAdded.slice(0, 3).map((i) => blockPreview(curr[i])),
    removedSamples: netRemoved.slice(0, 3).map((i) => blockPreview(prev[i])),
  };
}

const EVENT_FIELDS: { key: keyof NonNullable<DiffPayload["event"]>; label: string }[] = [
  { key: "date", label: "Start date" },
  { key: "endDate", label: "End date" },
  { key: "location", label: "Location" },
  { key: "virtualLink", label: "Virtual link" },
  { key: "registerUrl", label: "Register URL" },
  { key: "recurrence", label: "Recurrence" },
  { key: "recurrenceEnd", label: "Recurrence end" },
];

/**
 * Summarise the changes that turn `prev` into `curr`. Returns an empty list
 * when the payloads are equivalent. Designed for both compact row badges and
 * a fuller in-preview "what changed" list.
 */
export function summarizeChanges(
  prev: DiffPayload | null,
  curr: DiffPayload,
): ChangeSummary[] {
  if (!prev) {
    return [{ label: "Initial version", tone: "added" }];
  }

  const out: ChangeSummary[] = [];

  if (prev.title !== curr.title) {
    out.push({
      label: "Title changed",
      detail: `“${truncate(prev.title || "—", 50)}” → “${truncate(curr.title || "—", 50)}”`,
      tone: "edited",
    });
  }

  if (prev.slug !== curr.slug) {
    out.push({
      label: "Slug changed",
      detail: `${prev.slug || "—"} → ${curr.slug || "—"}`,
      tone: "edited",
    });
  }

  if ((prev.excerpt ?? "") !== (curr.excerpt ?? "")) {
    out.push({
      label: "Excerpt edited",
      detail: truncate(curr.excerpt || "(cleared)", 80),
      tone: "edited",
    });
  }

  if (prev.template !== curr.template) {
    out.push({
      label: `Template: ${prev.template} → ${curr.template}`,
      tone: "edited",
    });
  }

  if (prev.coverColor !== curr.coverColor) {
    out.push({
      label: "Cover color changed",
      detail: `${prev.coverColor || "—"} → ${curr.coverColor || "—"}`,
      tone: "edited",
    });
  }

  const prevCover = prev.coverImage?.assetId ?? "";
  const currCover = curr.coverImage?.assetId ?? "";
  if (prevCover !== currCover) {
    if (!prevCover && currCover) {
      out.push({ label: "Cover added", tone: "added" });
    } else if (prevCover && !currCover) {
      out.push({ label: "Cover removed", tone: "removed" });
    } else {
      out.push({ label: "Cover replaced", tone: "edited" });
    }
  }

  const tagDiff = diffStringSets(prev.tags ?? [], curr.tags ?? []);
  if (tagDiff.added.length || tagDiff.removed.length) {
    const parts: string[] = [];
    if (tagDiff.added.length) parts.push(`+${tagDiff.added.join(", +")}`);
    if (tagDiff.removed.length) parts.push(`−${tagDiff.removed.join(", −")}`);
    out.push({
      label: `Tags ${tagDiff.added.length ? `+${tagDiff.added.length}` : ""}${
        tagDiff.added.length && tagDiff.removed.length ? " " : ""
      }${tagDiff.removed.length ? `−${tagDiff.removed.length}` : ""}`.trim(),
      detail: parts.join("  "),
      tone: tagDiff.added.length && !tagDiff.removed.length
        ? "added"
        : tagDiff.removed.length && !tagDiff.added.length
          ? "removed"
          : "edited",
    });
  }

  if (
    (prev.authorName ?? "") !== (curr.authorName ?? "") ||
    (prev.authorRole ?? "") !== (curr.authorRole ?? "")
  ) {
    out.push({
      label: "Author updated",
      detail: `${prev.authorName || "—"}${prev.authorRole ? `, ${prev.authorRole}` : ""} → ${
        curr.authorName || "—"
      }${curr.authorRole ? `, ${curr.authorRole}` : ""}`,
      tone: "edited",
    });
  }

  const blockDiff = diffBlocks(prev.content ?? [], curr.content ?? []);
  if (blockDiff.added) {
    out.push({
      label: `+${blockDiff.added} block${blockDiff.added === 1 ? "" : "s"}`,
      detail: blockDiff.addedSamples.join(" · ") || undefined,
      tone: "added",
    });
  }
  if (blockDiff.removed) {
    out.push({
      label: `−${blockDiff.removed} block${blockDiff.removed === 1 ? "" : "s"}`,
      detail: blockDiff.removedSamples.join(" · ") || undefined,
      tone: "removed",
    });
  }
  if (blockDiff.edited) {
    out.push({
      label: `${blockDiff.edited} block${blockDiff.edited === 1 ? "" : "s"} edited`,
      tone: "edited",
    });
  }

  // Event-only fields
  if (prev.event || curr.event) {
    const p = prev.event ?? null;
    const c = curr.event ?? null;
    if (!p && c) {
      out.push({ label: "Event details added", tone: "added" });
    } else if (p && !c) {
      out.push({ label: "Event details removed", tone: "removed" });
    } else if (p && c) {
      for (const f of EVENT_FIELDS) {
        const a = String(p[f.key] ?? "");
        const b = String(c[f.key] ?? "");
        if (a !== b) {
          out.push({
            label: `${f.label} changed`,
            detail: `${a || "—"} → ${b || "—"}`,
            tone: "edited",
          });
        }
      }
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Per-block annotations (used by the inline diff highlighting in the preview)
// ---------------------------------------------------------------------------

export type BlockAnnotation = "added" | "removed" | "edited" | "unchanged";

export interface AnnotatedBlock {
  block: DiffBlock;
  annotation: BlockAnnotation;
}

/**
 * Compute the merged "what would change if you restored this revision" block
 * stream. Walks the revision's content top-to-bottom, but interleaves any
 * blocks that exist in the current live post yet are missing from this
 * revision so they can be rendered as strike-through ghosts at roughly their
 * original positions.
 *
 * Each output entry is one of:
 *  - { block: <revision block>, annotation: "added"     } — block in revision, no match in current
 *  - { block: <revision block>, annotation: "edited"    } — same type at a near-aligned slot, but text changed
 *  - { block: <revision block>, annotation: "unchanged" } — exact signature match in current
 *  - { block: <current block>,  annotation: "removed"   } — only in current; rendered as a placeholder
 *
 * Matching uses the same heuristic as `diffBlocks` so the row badges and the
 * inline highlights agree on what counts as edited vs. add/remove pairs.
 */
export function annotateRestoredBlocks(
  current: DiffBlock[],
  revision: DiffBlock[],
): AnnotatedBlock[] {
  const cur = current ?? [];
  const rev = revision ?? [];
  const cSigs = cur.map(blockSignature);
  const rSigs = rev.map(blockSignature);

  // matchedR[i] = index in current that revision[i] is matched to (or -1)
  // matchedC[j] = index in revision that current[j] is matched to (or -1)
  const matchedR: number[] = new Array(rev.length).fill(-1);
  const matchedC: number[] = new Array(cur.length).fill(-1);

  // Pass 1: exact signature pairing in left-to-right order so unchanged blocks
  // line up with their natural positions on both sides.
  for (let i = 0; i < rev.length; i++) {
    for (let j = 0; j < cur.length; j++) {
      if (matchedC[j] !== -1) continue;
      if (rSigs[i] === cSigs[j]) {
        matchedR[i] = j;
        matchedC[j] = i;
        break;
      }
    }
  }

  // Pass 2: leftover blocks of the same type at compatible positions are
  // treated as edits rather than independent add/remove pairs.
  const editedR = new Set<number>();
  const editedC = new Set<number>();
  for (let i = 0; i < rev.length; i++) {
    if (matchedR[i] !== -1) continue;
    for (let j = 0; j < cur.length; j++) {
      if (matchedC[j] !== -1) continue;
      if (cur[j].type === rev[i].type) {
        matchedR[i] = j;
        matchedC[j] = i;
        editedR.add(i);
        editedC.add(j);
        break;
      }
    }
  }

  const out: AnnotatedBlock[] = [];
  let cursor = 0;

  // Emit any "removed" current blocks whose original position falls before
  // the next surviving anchor in current.
  const flushRemovedUntil = (untilExclusive: number) => {
    while (cursor < untilExclusive) {
      if (matchedC[cursor] === -1) {
        out.push({ block: cur[cursor], annotation: "removed" });
      }
      cursor++;
    }
  };

  for (let i = 0; i < rev.length; i++) {
    const matchedCurIdx = matchedR[i];
    if (matchedCurIdx !== -1) {
      flushRemovedUntil(matchedCurIdx);
      out.push({
        block: rev[i],
        annotation: editedR.has(i) ? "edited" : "unchanged",
      });
      cursor = matchedCurIdx + 1;
    } else {
      out.push({ block: rev[i], annotation: "added" });
    }
  }

  // Anything left at the end of `current` was removed too.
  flushRemovedUntil(cur.length);

  return out;
}
