import React from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ArrowLeft, Clock, Calendar, Twitter, Linkedin,
  ChevronRight, BookOpen, Share2, Loader2,
} from "lucide-react";
import { type Article, type ArticleBlock } from "@/data/articles";
import { useArticle, useRelatedArticles } from "@/hooks/useArticles";

const TAG_COLORS: Record<string, { text: string; bg: string }> = {
  Education:               { text: "#16a34a", bg: "#f0faf4" },
  "Carbon Markets":        { text: "#16a34a", bg: "#f0faf4" },
  Farmers:                 { text: "#16a34a", bg: "#f0faf4" },
  Africa:                  { text: "#16a34a", bg: "#f0faf4" },
  Science:                 { text: "#7c3aed", bg: "#faf5ff" },
  Technology:              { text: "#7c3aed", bg: "#faf5ff" },
  MRV:                     { text: "#7c3aed", bg: "#faf5ff" },
  Blockchain:              { text: "#7c3aed", bg: "#faf5ff" },
  "Regenerative Agriculture": { text: "#15803d", bg: "#f0fdf4" },
  ESG:                     { text: "#0f766e", bg: "#f0fdfa" },
  Buyers:                  { text: "#0f766e", bg: "#f0fdfa" },
  Investment:              { text: "#0f766e", bg: "#f0fdfa" },
  Finance:                 { text: "#ca8a04", bg: "#fffbeb" },
  Ghana:                   { text: "#ca8a04", bg: "#fffbeb" },
  Impact:                  { text: "#ca8a04", bg: "#fffbeb" },
  "Carbon Prices":         { text: "#b45309", bg: "#fff7ed" },
  Market:                  { text: "#b45309", bg: "#fff7ed" },
  Regulatory:              { text: "#0891b2", bg: "#f0f9ff" },
  Announcement:            { text: "#db2777", bg: "#fdf2f8" },
  Growth:                  { text: "#db2777", bg: "#fdf2f8" },
};

function tagStyle(tag: string) {
  return TAG_COLORS[tag] ?? { text: "#5a7a65", bg: "#f0faf4" };
}

function AuthorAvatar({ author, size = 12 }: { author: Article["author"]; size?: number }) {
  const wh = `w-${size} h-${size}`;
  const outline: React.CSSProperties = { outline: "2px solid rgba(22,163,74,0.15)", outlineOffset: "2px" };
  if (author.photo) {
    return (
      <img
        src={author.photo}
        alt={author.name}
        className={`${wh} rounded-2xl shrink-0 object-cover`}
        style={outline}
      />
    );
  }
  if (author.imgFile) {
    const ext = author.imgFile === "dr-kwame" ? "jpeg" : "png";
    return (
      <div
        className={`${wh} rounded-2xl shrink-0`}
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
      className={`${wh} rounded-2xl shrink-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-xl`}
      style={outline}
    >
      {author.name.charAt(0)}
    </div>
  );
}

function ContentBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mt-10 mb-4 leading-snug">
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p className="text-base text-foreground/80 leading-[1.85] mb-5">
          {block.text}
        </p>
      );
    case "quote":
      return (
        <blockquote className="my-8 pl-5 border-l-4 border-primary">
          <p className="text-lg italic text-foreground/70 leading-relaxed mb-2">
            {block.text}
          </p>
          {block.attribution && (
            <p className="text-sm font-semibold text-primary">{block.attribution}</p>
          )}
        </blockquote>
      );
    case "list":
      return (
        <ul className="mb-6 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-foreground/80 leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function RelatedCard({ article }: { article: Article }) {
  const cc = article.coverColor ?? "#16a34a";
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div
        className="h-24 relative"
        style={{
          background: `linear-gradient(135deg, ${cc}44 0%, ${cc}11 100%)`,
        }}
      >
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <span
          className="absolute bottom-3 left-4 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white z-10"
          style={{ backgroundColor: cc }}
        >
          {article.kind === "news" ? "News" : "Article"}
        </span>
      </div>
      <div className="p-4">
        <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Clock className="w-3 h-3" /> {article.readTime} min
          <span>·</span>
          {article.publishedAt}
        </div>
      </div>
    </Link>
  );
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug ?? "");
  const { data: related = [] } = useRelatedArticles(
    slug ?? "",
    article?.tags ?? []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading article…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-display font-bold text-foreground">Article not found</h1>
        <p className="text-muted-foreground">This article may have been moved or removed.</p>
        <Link href="/articles" className="text-primary font-semibold hover:underline">← Back to Articles & Updates</Link>
      </div>
    );
  }

  const cc = article.coverColor ?? "#16a34a";
  const shareUrl = `https://sikafields.com/articles/${article.slug}`;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/articles" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Articles & Updates
          </Link>
          <img src="/sikafields-logo.png" alt="SikaFields" className="h-8 object-contain" />
          <div className="w-36" />
        </div>
      </div>

      {/* Article header — full hero when coverImage present, colour gradient otherwise */}
      <div
        className={`relative ${article.coverImage ? "min-h-[420px] flex flex-col justify-end" : "py-16"}`}
        style={
          article.coverImage
            ? {}
            : {
                background: `linear-gradient(135deg, ${cc}22 0%, ${cc}08 100%)`,
                borderBottom: `3px solid ${cc}33`,
              }
        }
      >
        {/* Hero photo */}
        {article.coverImage && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative w-full pb-12 pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Kind + tags */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: cc }}
              >
                {article.kind === "news" ? "News Update" : "Article"}
              </span>
              {article.tags.map((t) => {
                const s = tagStyle(t);
                return (
                  <span
                    key={t}
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${article.coverImage ? "bg-white/20 text-white border border-white/30" : ""}`}
                    style={article.coverImage ? {} : { color: s.text, backgroundColor: s.bg }}
                  >
                    {t}
                  </span>
                );
              })}
            </div>

            {/* Title */}
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold leading-tight mb-5 ${
                article.coverImage ? "text-white" : "text-foreground"
              }`}
            >
              {article.title}
            </h1>

            {/* Meta row */}
            <div
              className={`flex items-center gap-4 flex-wrap text-sm mb-6 ${
                article.coverImage ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {article.publishedAt}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {article.readTime} min read
              </span>
            </div>

            {/* Author */}
            <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur rounded-2xl border border-border inline-flex w-auto">
              <AuthorAvatar author={article.author} size={12} />
              <div>
                <p className="font-bold text-foreground text-sm">{article.author.name}</p>
                <p className="text-xs text-muted-foreground">{article.author.role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Excerpt lead */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 pb-8 border-b border-border font-medium">
            {article.excerpt}
          </p>

          {/* Content blocks */}
          {article.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </motion.div>

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-border flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Share2 className="w-4 h-4" /> Share this post
          </span>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Twitter className="w-4 h-4" /> Twitter / X
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
        </div>

        {/* Author bio */}
        <div className="mt-8 p-6 bg-card rounded-2xl border border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">About the Author</p>
          <div className="flex gap-4">
            <AuthorAvatar author={article.author} size={16} />
            <div>
              <p className="font-bold text-foreground text-base mb-0.5">{article.author.name}</p>
              <p className="text-sm font-semibold text-primary mb-2">{article.author.role} · SikaFields</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A member of the SikaFields executive team writing from direct operational experience across our carbon farming programs in Ghana, India, and beyond.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="bg-card border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-foreground">Related Articles</h2>
              <Link href="/articles" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((a) => (
                <RelatedCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 SikaFields. All rights reserved.</p>
          <Link href="/" className="hover:text-primary transition-colors font-semibold">← Back to homepage</Link>
        </div>
      </div>
    </div>
  );
}
