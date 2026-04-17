import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, ArrowRight, PenLine, Sparkles, Calendar,
  Image as ImageIcon, Repeat, ListChecks, Wand2, LayoutDashboard,
} from "lucide-react";

function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900/80 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
      <span className="text-emerald-700">{icon}</span>
      {label}
    </span>
  );
}

export default function NewPostHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white font-sans flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-40 shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Posts</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <PenLine className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-semibold">
              <span className="text-primary">Create</span>
              <span className="text-muted-foreground hidden sm:inline"> · Choose how to start</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/posts"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All posts</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3 h-3" /> New Post
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-3">
            How would you like to start?
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Pick the workflow that suits you — full creative control, or let Sika ask
            a few quick questions and assemble a draft for you.
          </p>
        </motion.div>

        {/* Two cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Scratch */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Link
              href="/admin/new-post/scratch"
              className="group block h-full bg-white rounded-3xl border border-border p-6 sm:p-8 hover:border-primary hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
                  <PenLine className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  Full control
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                Start from scratch
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Open the full composer with live preview. Compose articles, news,
                or events block-by-block with complete control over layout, cover image
                and metadata.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <FeatureChip icon={<ListChecks className="w-3 h-3" />} label="Block editor" />
                <FeatureChip icon={<ImageIcon className="w-3 h-3" />} label="Image upload" />
                <FeatureChip icon={<Calendar className="w-3 h-3" />} label="Event details" />
                <FeatureChip icon={<Repeat className="w-3 h-3" />} label="Recurring events" />
              </div>
              <span className="flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2.5 transition-all">
                Open composer <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>

          {/* AI */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <Link
              href="/admin/new-post/ai"
              className="group block h-full rounded-3xl border border-emerald-200 p-6 sm:p-8 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 transition-all relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #ecfdf5 0%, #ffffff 60%, #d1fae5 100%)",
              }}
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-300/30 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                    AI assisted
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Create my event faster with AI
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Answer a handful of quick questions and Sika will draft a polished
                  event announcement — title, summary, agenda and tags ready to
                  publish or refine.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <FeatureChip icon={<Sparkles className="w-3 h-3" />} label="Guided Q&A" />
                  <FeatureChip icon={<Wand2 className="w-3 h-3" />} label="AI-written copy" />
                  <FeatureChip icon={<Calendar className="w-3 h-3" />} label="Event-ready" />
                  <FeatureChip icon={<ListChecks className="w-3 h-3" />} label="Edit before publish" />
                </div>
                <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-800 group-hover:gap-2.5 transition-all">
                  Start the wizard <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-10 max-w-md mx-auto">
          Whichever path you choose, you can always switch — drafts auto-save and
          AI-generated drafts open inside the same composer for editing.
        </p>
      </div>
    </div>
  );
}
