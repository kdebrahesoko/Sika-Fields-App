import './_group.css';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, PenLine, Sparkles, Calendar,
  Image as ImageIcon, Repeat, ListChecks, Wand2, LayoutDashboard,
} from 'lucide-react';

const SERIF = "'Source Serif 4', 'Fraunces', Georgia, serif";
const SANS = "'Inter', -apple-system, sans-serif";
const INK = '#1a1d1b';
const PAPER = '#fbfaf6';
const RULE = '#dcd9cf';
const ACCENT = '#1f6b46';
const MUTED = '#6e6f68';

function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1"
      style={{ color: MUTED, fontFamily: SANS, borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}
    >
      <span style={{ color: ACCENT }}>{icon}</span>
      {label}
    </span>
  );
}

export function QuietEditorial() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAPER, color: INK, fontFamily: SANS }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 shrink-0" style={{ background: PAPER, borderBottom: `1px solid ${RULE}` }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <a href="/admin/posts" className="flex items-center gap-1.5 text-[13px] font-medium shrink-0" style={{ color: MUTED }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Posts</span>
          </a>
          <div className="w-px h-5 mx-1 hidden sm:block" style={{ background: RULE }} />
          <div className="flex items-center gap-2 min-w-0">
            <PenLine className="w-4 h-4" style={{ color: ACCENT }} />
            <p className="text-[13px] font-medium tracking-wide">
              <span style={{ color: ACCENT }}>Create</span>
              <span className="hidden sm:inline" style={{ color: MUTED }}> · Choose how to start</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a href="/admin/posts" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: MUTED }}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All posts</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-14 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase mb-6" style={{ color: ACCENT, letterSpacing: '0.22em' }}>
            <span style={{ width: 24, height: 1, background: ACCENT, display: 'inline-block' }} />
            <Sparkles className="w-3 h-3" /> New Post
            <span style={{ width: 24, height: 1, background: ACCENT, display: 'inline-block' }} />
          </span>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-4"
            style={{ fontFamily: SERIF, fontWeight: 400, letterSpacing: '-0.02em', color: INK }}
          >
            How would you<br />
            <em style={{ fontStyle: 'italic', color: ACCENT, fontWeight: 400 }}>like to start?</em>
          </h1>
          <p className="text-[15px] leading-relaxed max-w-lg mx-auto" style={{ color: MUTED }}>
            Pick the workflow that suits you — full creative control, or let Sika ask
            a few quick questions and assemble a draft for you.
          </p>
        </motion.div>

        {/* Two cards as editorial stories */}
        <div className="grid md:grid-cols-2 gap-px" style={{ background: RULE, border: `1px solid ${RULE}` }}>
          {/* Scratch */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <a href="/admin/posts" className="group block h-full p-8 sm:p-10" style={{ background: PAPER }}>
              <div className="flex items-center gap-3 mb-6">
                <span style={{ color: ACCENT, fontFamily: SERIF, fontStyle: 'italic', fontSize: 14 }}>
                  No. 01 — Manual
                </span>
                <span className="flex-1 h-px" style={{ background: RULE }} />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <PenLine className="w-5 h-5" style={{ color: ACCENT }} />
                <span className="text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: MUTED }}>
                  Full control
                </span>
              </div>
              <h2 className="text-[28px] sm:text-[32px] leading-[1.1] mb-3" style={{ fontFamily: SERIF, fontWeight: 500, letterSpacing: '-0.01em' }}>
                Start from scratch.
              </h2>
              <p className="text-[14px] leading-relaxed mb-7 max-w-md" style={{ color: MUTED }}>
                Open the full composer with live preview. Compose articles, news,
                or events block-by-block with complete control over layout, cover image
                and metadata.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-8 -mx-2.5">
                <FeatureChip icon={<ListChecks className="w-3 h-3" />} label="Block editor" />
                <FeatureChip icon={<ImageIcon className="w-3 h-3" />} label="Image upload" />
                <FeatureChip icon={<Calendar className="w-3 h-3" />} label="Event details" />
                <FeatureChip icon={<Repeat className="w-3 h-3" />} label="Recurring events" />
              </div>
              <span className="inline-flex items-center gap-2 text-[14px] font-medium pb-1 border-b" style={{ color: INK, borderColor: INK, fontFamily: SERIF }}>
                Open the composer <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </motion.div>

          {/* AI */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
            <a href="/admin/posts" className="group block h-full p-8 sm:p-10" style={{ background: PAPER }}>
              <div className="flex items-center gap-3 mb-6">
                <span style={{ color: ACCENT, fontFamily: SERIF, fontStyle: 'italic', fontSize: 14 }}>
                  No. 02 — Assisted
                </span>
                <span className="flex-1 h-px" style={{ background: RULE }} />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <Wand2 className="w-5 h-5" style={{ color: ACCENT }} />
                <span className="text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: MUTED }}>
                  AI assisted
                </span>
              </div>
              <h2 className="text-[28px] sm:text-[32px] leading-[1.1] mb-3" style={{ fontFamily: SERIF, fontWeight: 500, letterSpacing: '-0.01em' }}>
                Create my event<br /><em style={{ fontStyle: 'italic' }}>faster with AI.</em>
              </h2>
              <p className="text-[14px] leading-relaxed mb-7 max-w-md" style={{ color: MUTED }}>
                Answer a handful of quick questions and Sika will draft a polished
                event announcement — title, summary, agenda and tags ready to
                publish or refine.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-8 -mx-2.5">
                <FeatureChip icon={<Sparkles className="w-3 h-3" />} label="Guided Q&A" />
                <FeatureChip icon={<Wand2 className="w-3 h-3" />} label="AI-written copy" />
                <FeatureChip icon={<Calendar className="w-3 h-3" />} label="Event-ready" />
                <FeatureChip icon={<ListChecks className="w-3 h-3" />} label="Edit before publish" />
              </div>
              <span className="inline-flex items-center gap-2 text-[14px] font-medium pb-1 border-b" style={{ color: INK, borderColor: INK, fontFamily: SERIF }}>
                Start the wizard <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </motion.div>
        </div>

        <p className="text-center text-[12px] mt-12 max-w-md mx-auto leading-relaxed" style={{ color: MUTED, fontStyle: 'italic', fontFamily: SERIF }}>
          Whichever path you choose, you can always switch — drafts auto-save and
          AI-generated drafts open inside the same composer for editing.
        </p>
      </div>
    </div>
  );
}
