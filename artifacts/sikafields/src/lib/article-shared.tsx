import React from "react";
import { type Article, type ArticleBlock } from "@/data/articles";

export const TAG_COLORS: Record<string, { text: string; bg: string }> = {
  Education:                  { text: "#16a34a", bg: "#f0faf4" },
  "Carbon Markets":           { text: "#16a34a", bg: "#f0faf4" },
  Farmers:                    { text: "#16a34a", bg: "#f0faf4" },
  Africa:                     { text: "#16a34a", bg: "#f0faf4" },
  Science:                    { text: "#7c3aed", bg: "#faf5ff" },
  Technology:                 { text: "#7c3aed", bg: "#faf5ff" },
  MRV:                        { text: "#7c3aed", bg: "#faf5ff" },
  Blockchain:                 { text: "#7c3aed", bg: "#faf5ff" },
  "Regenerative Agriculture": { text: "#15803d", bg: "#f0fdf4" },
  ESG:                        { text: "#0f766e", bg: "#f0fdfa" },
  Buyers:                     { text: "#0f766e", bg: "#f0fdfa" },
  Investment:                 { text: "#0f766e", bg: "#f0fdfa" },
  Finance:                    { text: "#ca8a04", bg: "#fffbeb" },
  Ghana:                      { text: "#ca8a04", bg: "#fffbeb" },
  Impact:                     { text: "#ca8a04", bg: "#fffbeb" },
  "Carbon Prices":            { text: "#b45309", bg: "#fff7ed" },
  Market:                     { text: "#b45309", bg: "#fff7ed" },
  Regulatory:                 { text: "#0891b2", bg: "#f0f9ff" },
  Announcement:               { text: "#db2777", bg: "#fdf2f8" },
  Growth:                     { text: "#db2777", bg: "#fdf2f8" },
};

export function tagStyle(tag: string) {
  return TAG_COLORS[tag] ?? { text: "#5a7a65", bg: "#f0faf4" };
}

export const WHATSAPP_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function AuthorAvatar({
  author,
  size = 12,
  rounded = "rounded-2xl",
}: {
  author: Article["author"];
  size?: number;
  rounded?: string;
}) {
  const wh = `w-${size} h-${size}`;
  const outline: React.CSSProperties = {
    outline: "2px solid rgba(22,163,74,0.15)",
    outlineOffset: "2px",
  };
  if (author.photo) {
    return (
      <img
        src={author.photo}
        alt={author.name}
        className={`${wh} ${rounded} shrink-0 object-cover`}
        style={outline}
      />
    );
  }
  if (author.imgFile) {
    const ext = author.imgFile === "dr-kwame" ? "jpeg" : "png";
    return (
      <div
        className={`${wh} ${rounded} shrink-0`}
        style={{
          backgroundImage: `url('/${author.imgFile}.${ext}')`,
          backgroundSize: author.bgSize ?? "cover",
          backgroundPosition: author.bgPos ?? "center",
          backgroundRepeat: "no-repeat",
          ...outline,
        }}
      />
    );
  }
  return (
    <div
      className={`${wh} ${rounded} shrink-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-xl`}
      style={outline}
    >
      {author.name.charAt(0)}
    </div>
  );
}

export function ContentBlock({
  block,
  visual = false,
}: {
  block: ArticleBlock;
  visual?: boolean;
}) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          className={`font-display font-bold text-foreground mt-10 mb-4 leading-snug ${
            visual ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          }`}
        >
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p
          className={`text-foreground/80 leading-[1.9] mb-5 ${
            visual ? "text-[17px]" : "text-base"
          }`}
        >
          {block.text}
        </p>
      );
    case "quote":
      if (visual) {
        return (
          <div className="my-10 relative">
            <span className="absolute -top-6 -left-2 text-8xl font-serif text-primary/20 leading-none select-none">
              &#8220;
            </span>
            <blockquote className="pl-6 border-l-4 border-primary py-2">
              <p className="text-2xl md:text-3xl font-display font-semibold italic text-foreground/80 leading-snug mb-4">
                {block.text}
              </p>
              {block.attribution && (
                <p className="text-sm font-bold text-primary tracking-wide">
                  {block.attribution}
                </p>
              )}
            </blockquote>
          </div>
        );
      }
      return (
        <blockquote className="my-8 pl-5 border-l-4 border-primary">
          <p className="text-lg italic text-foreground/70 leading-relaxed mb-2">
            {block.text}
          </p>
          {block.attribution && (
            <p className="text-sm font-semibold text-primary">
              {block.attribution}
            </p>
          )}
        </blockquote>
      );
    case "list":
      return (
        <ul className="mb-6 space-y-3">
          {block.items.map((item, i) => (
            <li
              key={i}
              className={`flex gap-3 text-foreground/80 leading-relaxed ${
                visual ? "text-[17px]" : "text-base"
              }`}
            >
              {visual ? (
                <span className="mt-1.5 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
              ) : (
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export function groupBySections(blocks: ArticleBlock[]): ArticleBlock[][] {
  const sections: ArticleBlock[][] = [[]];
  for (const block of blocks) {
    if (block.type === "h2" && sections[sections.length - 1].length > 0) {
      sections.push([]);
    }
    sections[sections.length - 1].push(block);
  }
  return sections.filter((s) => s.length > 0);
}

export function VisualSection({
  section,
  idx,
  cc,
}: {
  section: ArticleBlock[];
  idx: number;
  cc: string;
}) {
  const isAlternate = idx % 2 === 1;
  const h2Block = section.find((b) => b.type === "h2") as
    | { type: "h2"; text: string }
    | undefined;
  const bodyBlocks = section.filter((b) => b.type !== "h2");

  if (!isAlternate || !h2Block || bodyBlocks.length === 0) {
    return (
      <div className="px-4 sm:px-8 py-8">
        {section.map((block, i) => (
          <ContentBlock key={i} block={block} visual />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[5fr_8fr]">
      <div
        className="flex flex-col items-center justify-center px-8 py-10 text-center"
        style={{ backgroundColor: `${cc}0a`, borderRight: `1px solid ${cc}20` }}
      >
        <span
          className="block text-[88px] leading-none font-display font-black select-none mb-3"
          style={{ color: `${cc}22` }}
        >
          {String(Math.ceil(idx / 2)).padStart(2, "0")}
        </span>
        <h2
          className="text-xl md:text-2xl font-display font-bold leading-tight"
          style={{ color: `${cc}dd` }}
        >
          {h2Block.text}
        </h2>
      </div>
      <div className="px-6 sm:px-10 py-10">
        {bodyBlocks.map((block, i) => (
          <ContentBlock key={i} block={block} visual />
        ))}
      </div>
    </div>
  );
}

export function AuthorBio({ author }: { author: Article["author"] }) {
  return (
    <div className="mt-8 p-6 bg-card rounded-2xl border border-border">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
        About the Author
      </p>
      <div className="flex gap-4">
        <AuthorAvatar author={author} size={16} />
        <div>
          <p className="font-bold text-foreground text-base mb-0.5">
            {author.name}
          </p>
          <p className="text-sm font-semibold text-primary mb-2">
            {author.role} · SikaFields
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {author.bio ??
              "A member of the SikaFields executive team writing from direct operational experience across our carbon farming programs in Ghana, India, and beyond."}
          </p>
        </div>
      </div>
    </div>
  );
}
