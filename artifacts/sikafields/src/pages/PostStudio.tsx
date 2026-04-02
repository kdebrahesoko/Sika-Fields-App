import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ArrowLeft, Clock, Calendar, Twitter, Linkedin, Facebook,
  Copy, Check, ExternalLink, Edit3, Loader2, BookOpen,
  FileText, ImageIcon, LayoutGrid, Share2, Eye,
  ChevronRight, Palette, Tag,
} from "lucide-react";
import { type Article } from "@/data/articles";
import { useArticle } from "@/hooks/useArticles";
import { isSanityConfigured } from "@/lib/sanity";
import { tagStyle, AuthorAvatar, WHATSAPP_ICON } from "@/lib/article-shared";
import {
  StandardTemplate,
  HeroTemplate,
  VisualTemplate,
} from "@/components/article-templates";

type TemplateId = "standard" | "hero" | "visual";

const TEMPLATES: {
  id: TemplateId;
  label: string;
  desc: string;
  icon: ReactNode;
}[] = [
  {
    id: "standard",
    label: "Standard",
    desc: "Clean, focused reading experience with optional cover image header.",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "hero",
    label: "Hero",
    desc: "Full-viewport cinematic cover with bold typography. Best for flagship pieces.",
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: "visual",
    label: "Visual Story",
    desc: "Magazine-style alternating sections with oversized pull quotes.",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
];

function readStoredTemplate(key: string): TemplateId | null {
  try {
    const v = localStorage.getItem(key);
    if (v === "standard" || v === "hero" || v === "visual") return v;
  } catch {
    // localStorage unavailable
  }
  return null;
}

function useTemplateState(slug: string, initialTemplate: TemplateId) {
  const storageKey = `sf-studio-template:${slug}`;
  const prevStorageKeyRef = useRef(storageKey);

  const [template, setTemplateRaw] = useState<TemplateId>(
    () => readStoredTemplate(storageKey) ?? initialTemplate
  );

  const setTemplate = useCallback(
    (t: TemplateId) => {
      setTemplateRaw(t);
      try {
        localStorage.setItem(storageKey, t);
      } catch {
        // localStorage unavailable
      }
    },
    [storageKey]
  );

  // Re-hydrate from the new key whenever the slug (storageKey) changes
  useEffect(() => {
    if (prevStorageKeyRef.current !== storageKey) {
      prevStorageKeyRef.current = storageKey;
      setTemplateRaw(readStoredTemplate(storageKey) ?? initialTemplate);
    }
  }, [storageKey, initialTemplate]);

  // Apply article's own template as default once data has loaded (no stored pref)
  useEffect(() => {
    if (initialTemplate === "standard") return;
    if (!readStoredTemplate(storageKey)) {
      setTemplateRaw(initialTemplate);
    }
  }, [initialTemplate, storageKey]);

  return [template, setTemplate] as const;
}

function buildShareLinks(url: string, title: string) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return [
    {
      id: "twitter",
      label: "Twitter / X",
      shortLabel: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      icon: <Twitter className="w-4 h-4" />,
      color: "#1d9bf0",
      bg: "#e8f5fe",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      shortLabel: "LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encoded}&title=${encodedTitle}`,
      icon: <Linkedin className="w-4 h-4" />,
      color: "#0a66c2",
      bg: "#e7f0f9",
    },
    {
      id: "facebook",
      label: "Facebook",
      shortLabel: "FB",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: <Facebook className="w-4 h-4" />,
      color: "#1877f2",
      bg: "#e7f0fe",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      shortLabel: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
      icon: WHATSAPP_ICON,
      color: "#25d366",
      bg: "#e9f9ef",
    },
  ];
}

function ShareCard({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const links = buildShareLinks(url, title);

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

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-3.5 h-3.5 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Share
        </p>
      </div>
      <div className="space-y-2">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:scale-[1.01] transition-all group"
            style={{ backgroundColor: l.bg }}
          >
            <span style={{ color: l.color }}>{l.icon}</span>
            <span
              className="text-sm font-semibold group-hover:underline"
              style={{ color: l.color }}
            >
              {l.label}
            </span>
          </a>
        ))}
        <button
          onClick={copyLink}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            copied
              ? "bg-primary/10 text-primary"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:scale-[1.01]"
          }`}
        >
          {copied ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <Copy className="w-4 h-4 shrink-0" />
          )}
          <span className="text-sm font-semibold">
            {copied ? "Link copied!" : "Copy link"}
          </span>
        </button>
      </div>
    </div>
  );
}

function TemplateSwitcher({
  active,
  onChange,
}: {
  active: TemplateId;
  onChange: (t: TemplateId) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-3.5 h-3.5 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Template
        </p>
      </div>
      <div className="space-y-2">
        {TEMPLATES.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl border transition-all ${
                isActive
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-transparent hover:border-border hover:bg-muted/50"
              }`}
            >
              <span
                className={`mt-0.5 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t.icon}
              </span>
              <div>
                <p
                  className={`text-sm font-semibold leading-tight mb-0.5 ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {t.label}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.desc}
                </p>
              </div>
              {isActive && (
                <span className="ml-auto mt-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetadataCard({ article }: { article: Article }) {
  const cc = article.coverColor ?? "#16a34a";
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-3.5 h-3.5 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Post Info
        </p>
      </div>

      <p className="text-sm font-semibold text-foreground leading-snug mb-3">
        {article.title}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {article.tags.map((t) => {
          const s = tagStyle(t);
          return (
            <span
              key={t}
              className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ color: s.text, backgroundColor: s.bg }}
            >
              {t}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
        <AuthorAvatar author={article.author} size={9} rounded="rounded-xl" />
        <div>
          <p className="text-xs font-semibold text-foreground leading-tight">
            {article.author.name}
          </p>
          <p className="text-[10px] text-muted-foreground">{article.author.role}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {article.publishedAt}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {article.readTime} min read
        </span>
        <span
          className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: cc }}
        >
          {article.kind}
        </span>
      </div>
    </div>
  );
}

function LinksCard({ article }: { article: Article }) {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
  const cmsUrl =
    isSanityConfigured && projectId
      ? `https://${projectId}.sanity.studio/structure/blog;${article.id}`
      : null;

  return (
    <div className="rounded-2xl border border-border bg-white p-4 space-y-2">
      <Link
        href={`/articles/${article.slug}`}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Eye className="w-4 h-4" />
        View full article
      </Link>
      {cmsUrl && (
        <a
          href={cmsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
        >
          <Edit3 className="w-4 h-4" />
          Edit content in CMS
          <ExternalLink className="w-3 h-3 ml-auto" />
        </a>
      )}
    </div>
  );
}

// Inline mobile share row — not fixed, lives in the top controls area
function MobileShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const links = buildShareLinks(url, title);

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

  return (
    <div className="lg:hidden bg-white border-b border-border px-4 py-2.5 flex items-center gap-3 justify-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">
        Share
      </p>
      {links.map((l) => (
        <a
          key={l.id}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          title={l.label}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          style={{ backgroundColor: l.bg, color: l.color }}
        >
          {l.icon}
        </a>
      ))}
      <button
        onClick={copyLink}
        title="Copy link"
        className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${
          copied ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function ArticlePreview({
  article,
  template,
}: {
  article: Article;
  template: TemplateId;
}) {
  const shareUrl = `https://sikafields.com/articles/${article.slug}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={template}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {template === "hero" && (
          <HeroTemplate article={article} shareUrl={shareUrl} preview />
        )}
        {template === "visual" && (
          <VisualTemplate article={article} shareUrl={shareUrl} preview />
        )}
        {template === "standard" && (
          <StandardTemplate article={article} shareUrl={shareUrl} preview />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function PostStudioPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug ?? "");
  const [template, setTemplate] = useTemplateState(
    slug ?? "",
    article?.template ?? "standard"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Post Studio…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-display font-bold text-foreground">
          Article not found
        </h1>
        <Link href="/articles" className="text-primary font-semibold hover:underline">
          ← Back to Articles
        </Link>
      </div>
    );
  }

  const shareUrl = `https://sikafields.com/articles/${article.slug}`;

  return (
    <div className="min-h-screen bg-muted/30 font-sans flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-white sticky top-0 z-40 shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href={`/articles/${article.slug}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to article</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <Palette className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-semibold text-foreground truncate">
              <span className="text-primary">Post Studio</span>
              <span className="text-muted-foreground hidden sm:inline">
                {" "}— {article.title}
              </span>
            </p>
          </div>
          <div className="ml-auto">
            <img
              src="/sikafields-logo-new.png"
              alt="SikaFields"
              className="h-7 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Mobile controls: template tab strip + share row stacked at top */}
      <div className="lg:hidden bg-white border-b border-border px-4 py-3 flex gap-2 overflow-x-auto shrink-0">
        {TEMPLATES.map((t) => {
          const isActive = template === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-muted-foreground border-border"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
        <Link
          href={`/articles/${article.slug}`}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border text-muted-foreground ml-auto"
        >
          <Eye className="w-3 h-3" /> View
        </Link>
      </div>

      {/* Mobile share row — inline below template strip, not fixed */}
      <MobileShareRow url={shareUrl} title={article.title} />

      {/* Two-panel layout */}
      <div className="flex-1 flex max-w-screen-2xl mx-auto w-full">
        {/* Left sidebar — desktop only */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 border-r border-border bg-white/60">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
            <TemplateSwitcher active={template} onChange={setTemplate} />
            <ShareCard url={shareUrl} title={article.title} />
            <MetadataCard article={article} />
            <LinksCard article={article} />
          </div>
        </div>

        {/* Right preview panel */}
        <div className="flex-1 overflow-y-auto">
          {/* Preview label strip */}
          <div className="sticky top-0 z-30 bg-muted/80 backdrop-blur border-b border-border px-5 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              Preview
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                {TEMPLATES.find((t) => t.id === template)?.label}
              </span>
            </div>
            <Link
              href={`/articles/${article.slug}`}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              Open article <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Article preview rendered with shared template, preview=true */}
          <div className="bg-white min-h-full shadow-sm">
            <ArticlePreview article={article} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}
