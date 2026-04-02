import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Search, ArrowLeft, Clock, Calendar, ChevronRight,
  BookOpen, Newspaper, ArrowRight, Filter, Loader2,
  Image as ImageIcon, LayoutGrid, FileText, LayoutDashboard,
} from "lucide-react";
import { type Article } from "@/data/articles";
import { useAllArticles } from "@/hooks/useArticles";

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
  Press:                   { text: "#dc2626", bg: "#fff5f5" },
};

function tagStyle(tag: string) {
  return TAG_COLORS[tag] ?? { text: "#5a7a65", bg: "#f0faf4" };
}

function TagBadge({ tag, small }: { tag: string; small?: boolean }) {
  const s = tagStyle(tag);
  return (
    <span
      className={`inline-block font-bold uppercase tracking-widest rounded-full ${small ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1"}`}
      style={{ color: s.text, backgroundColor: s.bg }}
    >
      {tag}
    </span>
  );
}

function AuthorAvatar({ author, size = 8 }: { author: Article["author"]; size?: number }) {
  const wh = `w-${size} h-${size}`;
  if (author.photo) {
    return (
      <img
        src={author.photo}
        alt={author.name}
        className={`${wh} rounded-full shrink-0 object-cover`}
      />
    );
  }
  if (author.imgFile) {
    const ext = author.imgFile === "dr-kwame" ? "jpeg" : "png";
    return (
      <div
        className={`${wh} rounded-full shrink-0`}
        style={{
          backgroundImage: `url('/${author.imgFile}.${ext}')`,
          backgroundSize: author.bgSize ?? "cover",
          backgroundPosition: author.bgPos ?? "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }
  return (
    <div className={`${wh} rounded-full shrink-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-xs`}>
      {author.name.charAt(0)}
    </div>
  );
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const cc = article.coverColor ?? "#16a34a";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
    >
      {/* Colour bar / cover */}
      <div
        className="h-36 relative flex items-end px-5 pb-4"
        style={{ backgroundColor: cc + "22" }}
      >
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `linear-gradient(135deg, ${cc}33 0%, ${cc}11 100%)`,
          }}
        />
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative flex items-center gap-2">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: cc }}
          >
            {article.kind === "news" ? "News" : "Article"}
          </span>
          {article.tags.slice(0, 1).map((t) => (
            <TagBadge key={t} tag={t} small />
          ))}
          {article.template && (
            <span className="absolute right-0 bottom-0 m-2 flex items-center gap-0.5 bg-black/40 backdrop-blur text-white/90 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md">
              {article.template === "hero" ? (
                <ImageIcon className="w-2.5 h-2.5" />
              ) : article.template === "visual" ? (
                <LayoutGrid className="w-2.5 h-2.5" />
              ) : (
                <FileText className="w-2.5 h-2.5" />
              )}
              {article.template}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-3">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {article.publishedAt}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readTime} min read
          </span>
        </div>

        {/* Author + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AuthorAvatar author={article.author} size={7} />
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">
                {article.author.name.split(" ")[0]} {article.author.name.split(" ").slice(-1)}
              </p>
              <p className="text-[10px] text-muted-foreground">{article.author.role}</p>
            </div>
          </div>
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            Read <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  const cc = article.coverColor ?? "#16a34a";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl overflow-hidden border border-border shadow-lg"
    >
      <div className="grid md:grid-cols-2">
        {/* Visual */}
        <div
          className="h-64 md:h-auto min-h-[240px] relative flex items-end p-8"
          style={{
            background: `linear-gradient(135deg, ${cc} 0%, ${cc}99 100%)`,
          }}
        >
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
            />
          )}
          <div className="relative">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 text-white mb-3 inline-block">
              Featured Article
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {article.tags.map((t) => (
                <span key={t} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground leading-snug mb-3">
              {article.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5 text-sm">
              {article.excerpt}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AuthorAvatar author={article.author} size={10} />
              <div>
                <p className="font-semibold text-foreground text-sm">{article.author.name}</p>
                <p className="text-xs text-muted-foreground">{article.author.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" /> {article.publishedAt}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {article.readTime} min read
              </span>
            </div>
            <Link
              href={`/articles/${article.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Read Article <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ArticlesPage() {
  const [search, setSearch] = useState("");
  const [activeKind, setActiveKind] = useState<"all" | "article" | "news">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: articles = [], isLoading } = useAllArticles();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [articles]);

  const featured = articles.find((a) => a.featured);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (activeKind !== "all" && a.kind !== activeKind) return false;
      if (activeTag && !a.tags.includes(activeTag)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [articles, search, activeKind, activeTag]);

  const gridArticles = filtered.filter((a) => !a.featured || activeKind !== "all" || activeTag || search);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to SikaFields
          </Link>
          <img src="/sikafields-logo-new.png" alt="SikaFields" className="h-8 object-contain" />
          <Link
            href="/admin/posts"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-36 justify-end"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Manage posts</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0d2418] via-[#133d22] to-[#0d2418] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-semibold mb-5 border border-white/20">
              <BookOpen className="w-4 h-4" />
              Articles & Updates
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
              Knowledge, Insights &<br />
              <span className="text-[#4ade80]">Market Updates</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Educational guides on carbon markets, MRV science, ESG investing — plus the latest news and announcements from SikaFields.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-xl relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, topics, authors…"
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80]/50 backdrop-blur"
            />
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {(["all", "article", "news"] as const).map((k) => (
            <button
              key={k}
              onClick={() => { setActiveKind(k); setActiveTag(null); }}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeKind === k && !activeTag
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {k === "all" && <BookOpen className="w-3 h-3" />}
              {k === "article" && <BookOpen className="w-3 h-3" />}
              {k === "news" && <Newspaper className="w-3 h-3" />}
              {k === "all" ? "All" : k === "article" ? "Articles" : "News"}
            </button>
          ))}
          <div className="w-px h-4 bg-border shrink-0 mx-1" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                activeTag === tag
                  ? "border-transparent text-white"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/40"
              }`}
              style={
                activeTag === tag
                  ? { backgroundColor: tagStyle(tag).text }
                  : {}
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured */}
        {featured && activeKind === "all" && !activeTag && !search && (
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Featured
            </p>
            <FeaturedCard article={featured} />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Loading articles…</span>
          </div>
        )}

        {/* Count */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filtered.length === articles.length
                ? `${articles.length} posts`
                : `${filtered.length} of ${articles.length} posts`}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && gridArticles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gridArticles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground text-lg font-medium">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search term or filter</p>
            <button
              onClick={() => { setSearch(""); setActiveKind("all"); setActiveTag(null); }}
              className="mt-4 text-sm text-primary hover:underline font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 SikaFields. All rights reserved.</p>
          <Link href="/" className="hover:text-primary transition-colors font-semibold">← Back to homepage</Link>
        </div>
      </div>
    </div>
  );
}
