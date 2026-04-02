import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, Clock, Calendar, Twitter, Linkedin, Facebook,
  ChevronRight, Share2, Copy, Check, ExternalLink, Edit3, Palette,
} from "lucide-react";
import { type Article } from "@/data/articles";
import { isSanityConfigured } from "@/lib/sanity";
import {
  tagStyle, AuthorAvatar, ContentBlock, AuthorBio,
  groupBySections, VisualSection, WHATSAPP_ICON,
} from "@/lib/article-shared";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-primary transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function SharePanel({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      icon: <Twitter className="w-4 h-4" />,
      color: "#1d9bf0",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encoded}&title=${encodedTitle}`,
      icon: <Linkedin className="w-4 h-4" />,
      color: "#0a66c2",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: <Facebook className="w-4 h-4" />,
      color: "#1877f2",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
      icon: WHATSAPP_ICON,
      color: "#25d366",
    },
  ];

  return (
    <>
      {/* Desktop: fixed left sidebar */}
      <div className="hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2">
        <Share2 className="w-3.5 h-3.5 text-muted-foreground mb-1" />
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            title={l.label}
            className="w-9 h-9 rounded-full border border-border bg-white hover:scale-110 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
            style={{ color: l.color }}
          >
            {l.icon}
          </a>
        ))}
        <button
          onClick={copyLink}
          title="Copy link"
          className="w-9 h-9 rounded-full border border-border bg-white hover:scale-110 transition-all flex items-center justify-center shadow-sm hover:shadow-md text-muted-foreground hover:text-primary"
        >
          {copied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile: sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-border px-4 py-2.5 flex items-center justify-around">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            title={l.label}
            className="flex flex-col items-center gap-0.5"
            style={{ color: l.color }}
          >
            {l.icon}
            <span className="text-[9px] font-semibold text-muted-foreground">
              {l.label}
            </span>
          </a>
        ))}
        <button
          onClick={copyLink}
          title="Copy link"
          className="flex flex-col items-center gap-0.5 text-muted-foreground"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-semibold text-primary">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-[9px] font-semibold">Copy</span>
            </>
          )}
        </button>
      </div>
    </>
  );
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
        style={{ background: `linear-gradient(135deg, ${cc}44 0%, ${cc}11 100%)` }}
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

function RelatedSection({ related }: { related: Article[] }) {
  if (related.length === 0) return null;
  return (
    <div className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-foreground">
            Related Articles
          </h2>
          <Link
            href="/articles"
            className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
          >
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
  );
}

function ArticleFooter() {
  return (
    <div className="border-t border-border py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© 2026 SikaFields. All rights reserved.</p>
        <Link
          href="/"
          className="hover:text-primary transition-colors font-semibold"
        >
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}

export function TopBar({ article }: { article: Article }) {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
  const cmsUrl =
    isSanityConfigured && projectId
      ? `https://${projectId}.sanity.studio/structure/blog;${article.id}`
      : null;

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link
          href="/articles"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Articles & Updates</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <img
          src="/sikafields-logo-new.png"
          alt="SikaFields"
          className="h-7 object-contain"
        />
        <div className="flex items-center gap-2">
          <Link
            href={`/articles/${article.slug}/studio`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit & Share</span>
          </Link>
          {cmsUrl && (
            <>
              <a
                href={cmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Edit in CMS"
                className="sm:hidden flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary border border-border rounded-lg hover:border-primary/40 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </a>
              <a
                href={cmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary border border-border rounded-lg px-3 py-1.5 hover:border-primary/40 transition-all"
              >
                <Edit3 className="w-3 h-3" />
                Edit in CMS
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export interface TemplateProps {
  article: Article;
  shareUrl: string;
  related?: Article[];
  preview?: boolean;
}

export function StandardTemplate({
  article,
  shareUrl,
  related = [],
  preview = false,
}: TemplateProps) {
  const cc = article.coverColor ?? "#16a34a";

  return (
    <div className={`${preview ? "" : "min-h-screen"} bg-background font-sans`}>
      {!preview && <TopBar article={article} />}

      <div
        className={`relative ${
          article.coverImage
            ? `${preview ? "min-h-[320px]" : "min-h-[420px]"} flex flex-col justify-end`
            : "py-16"
        }`}
        style={
          article.coverImage
            ? {}
            : {
                background: `linear-gradient(135deg, ${cc}22 0%, ${cc}08 100%)`,
                borderBottom: `3px solid ${cc}33`,
              }
        }
      >
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
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      article.coverImage
                        ? "bg-white/20 text-white border border-white/30"
                        : ""
                    }`}
                    style={
                      article.coverImage
                        ? {}
                        : { color: s.text, backgroundColor: s.bg }
                    }
                  >
                    {t}
                  </span>
                );
              })}
            </div>

            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold leading-tight mb-5 ${
                article.coverImage ? "text-white" : "text-foreground"
              }`}
            >
              {article.title}
            </h1>

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

            <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur rounded-2xl border border-border inline-flex w-auto">
              <AuthorAvatar author={article.author} size={12} />
              <div>
                <p className="font-bold text-foreground text-sm">
                  {article.author.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {article.author.role}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className={`max-w-3xl mx-auto px-4 sm:px-6 py-12 ${
          preview ? "pb-12" : "pb-24 lg:pb-12"
        }`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 pb-8 border-b border-border font-medium">
            {article.excerpt}
          </p>
          {article.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </motion.div>
        <AuthorBio author={article.author} />
      </div>

      {!preview && <SharePanel url={shareUrl} title={article.title} />}
      {!preview && <RelatedSection related={related} />}
      {!preview && <ArticleFooter />}
    </div>
  );
}

export function HeroTemplate({
  article,
  shareUrl,
  related = [],
  preview = false,
}: TemplateProps) {
  const cc = article.coverColor ?? "#16a34a";

  return (
    <div className={`${preview ? "" : "min-h-screen"} bg-background font-sans`}>
      {!preview && <ReadingProgress />}
      {!preview && <TopBar article={article} />}

      <div
        className="relative flex flex-col justify-end"
        style={{
          minHeight: preview ? "440px" : "90vh",
          background: !article.coverImage
            ? `linear-gradient(160deg, ${cc} 0%, #0d2418 100%)`
            : undefined,
        }}
      >
        {article.coverImage && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover scale-105"
                style={{ transformOrigin: "center 40%" }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          </>
        )}

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 pb-16 pt-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: cc }}
              >
                {article.kind === "news" ? "News Update" : "Article"}
              </span>
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/25"
                >
                  {t}
                </span>
              ))}
            </div>

            <h1
              className={`font-display font-bold text-white leading-[1.05] mb-8 max-w-3xl ${
                preview
                  ? "text-3xl sm:text-4xl"
                  : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              }`}
            >
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-4 py-3">
                <AuthorAvatar
                  author={article.author}
                  size={10}
                  rounded="rounded-xl"
                />
                <div>
                  <p className="font-bold text-white text-sm leading-tight">
                    {article.author.name}
                  </p>
                  <p className="text-white/60 text-xs">{article.author.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {article.publishedAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {article.readTime} min read
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className={`max-w-3xl mx-auto px-4 sm:px-6 py-14 ${
          preview ? "pb-14" : "pb-24 lg:pb-14"
        }`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xl text-muted-foreground leading-relaxed mb-10 pb-10 border-b border-border font-medium">
            {article.excerpt}
          </p>
          {article.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </motion.div>
        <AuthorBio author={article.author} />
      </div>

      {!preview && <SharePanel url={shareUrl} title={article.title} />}
      {!preview && <RelatedSection related={related} />}
      {!preview && <ArticleFooter />}
    </div>
  );
}

export function VisualTemplate({
  article,
  shareUrl,
  related = [],
  preview = false,
}: TemplateProps) {
  const cc = article.coverColor ?? "#16a34a";
  const sections = groupBySections(article.content);

  return (
    <div className={`${preview ? "" : "min-h-screen"} bg-background font-sans`}>
      {!preview && <ReadingProgress />}
      {!preview && <TopBar article={article} />}

      <div
        className="border-b border-border"
        style={{ borderTop: `4px solid ${cc}` }}
      >
        {article.coverImage && (
          <div className={`relative overflow-hidden ${preview ? "h-44" : "h-56 md:h-72"}`}>
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: cc }}
              >
                Visual Story
              </span>
              {article.tags.map((t) => {
                const s = tagStyle(t);
                return (
                  <span
                    key={t}
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ color: s.text, backgroundColor: s.bg }}
                  >
                    {t}
                  </span>
                );
              })}
            </div>

            <div
              className="pl-6 mb-8"
              style={{ borderLeft: `5px solid ${cc}` }}
            >
              <h1
                className={`font-display font-bold text-foreground leading-[1.1] mb-5 ${
                  preview
                    ? "text-2xl sm:text-3xl"
                    : "text-3xl sm:text-4xl md:text-5xl"
                }`}
              >
                {article.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                {article.excerpt}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <AuthorAvatar
                  author={article.author}
                  size={11}
                  rounded="rounded-xl"
                />
                <div>
                  <p className="font-bold text-foreground text-sm leading-tight">
                    {article.author.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {article.author.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground text-sm ml-auto">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {article.publishedAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {article.readTime} min read
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className={`max-w-4xl mx-auto ${
          preview ? "pb-10" : "pb-24 lg:pb-14"
        }`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {sections.map((section, sectionIdx) => (
            <VisualSection
              key={sectionIdx}
              section={section}
              idx={sectionIdx}
              cc={cc}
            />
          ))}
        </motion.div>
        <div className="px-4 sm:px-8">
          <AuthorBio author={article.author} />
        </div>
      </div>

      {!preview && <SharePanel url={shareUrl} title={article.title} />}
      {!preview && <RelatedSection related={related} />}
      {!preview && <ArticleFooter />}
    </div>
  );
}
