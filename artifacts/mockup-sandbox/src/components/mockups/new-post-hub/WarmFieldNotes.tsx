import './_group.css';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, PenLine, Sparkles, Calendar,
  Image as ImageIcon, Repeat, ListChecks, Wand2, LayoutDashboard, Sprout,
} from 'lucide-react';

const HEAD = "'Fraunces', 'Source Serif 4', Georgia, serif";
const SANS = "'Inter', -apple-system, sans-serif";

const CREAM = '#f7efe1';
const SAND = '#efe4cf';
const INK = '#2b2418';
const COCOA = '#5a4733';
const FOREST = '#2f5d3a';
const FOREST_DEEP = '#22452b';
const OCHRE = '#c87a2c';
const OCHRE_LIGHT = '#e9b87a';

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.08  0 0 0 0.07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1"
      style={{ color: FOREST_DEEP, background: '#fff7e7', border: `1px solid ${OCHRE_LIGHT}`, fontFamily: SANS }}
    >
      <span style={{ color: OCHRE }}>{icon}</span>
      {label}
    </span>
  );
}

export function WarmFieldNotes() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `${grain}, linear-gradient(180deg, ${CREAM} 0%, ${SAND} 100%)`,
        backgroundBlendMode: 'multiply',
        color: INK,
        fontFamily: SANS,
      }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-40 shrink-0"
        style={{ background: 'rgba(247,239,225,0.92)', backdropFilter: 'blur(8px)', borderBottom: `1.5px solid ${OCHRE_LIGHT}` }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <a href="#" className="flex items-center gap-1.5 text-sm font-semibold shrink-0" style={{ color: COCOA }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Posts</span>
          </a>
          <div className="w-px h-5 mx-1 hidden sm:block" style={{ background: OCHRE_LIGHT }} />
          <div className="flex items-center gap-2 min-w-0">
            <Sprout className="w-4 h-4" style={{ color: FOREST }} />
            <p className="text-sm font-semibold">
              <span style={{ color: FOREST_DEEP }}>Create</span>
              <span className="hidden sm:inline" style={{ color: COCOA }}> · Choose how to start</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a href="#" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: COCOA }}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All posts</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
            style={{ background: '#fff7e7', color: OCHRE, border: `1.5px solid ${OCHRE_LIGHT}` }}
          >
            <Sparkles className="w-3 h-3" /> New Post
          </span>
          <h1
            className="text-4xl sm:text-5xl md:text-[56px] leading-[1.05] mb-4"
            style={{ fontFamily: HEAD, fontWeight: 600, letterSpacing: '-0.015em', color: INK, fontVariationSettings: '"opsz" 144' }}
          >
            How would you{' '}
            <span style={{ color: FOREST_DEEP, fontStyle: 'italic', fontWeight: 500 }}>like to start?</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: COCOA }}>
            Pick the workflow that suits you — full creative control, or let Sika ask
            a few quick questions and assemble a draft for you.
          </p>
        </motion.div>

        {/* Two cards as field-notebook entries */}
        <div className="grid md:grid-cols-2 gap-5 sm:gap-7">
          {/* Scratch */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <a
              href="#"
              className="group block h-full p-7 sm:p-9 transition-all hover:-translate-y-1.5"
              style={{
                background: '#fffaf0',
                border: `1.5px solid ${OCHRE_LIGHT}`,
                borderRadius: 22,
                boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 14px 30px -18px rgba(120, 78, 32, 0.35), 0 4px 0 -2px #ead7b1',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center"
                  style={{ width: 52, height: 52, background: FOREST, color: '#fffaf0', boxShadow: `inset 0 -4px 0 ${FOREST_DEEP}` }}
                >
                  <PenLine className="w-5 h-5" />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: '#eef5e9', color: FOREST_DEEP, border: `1px solid #cfe1c0` }}
                >
                  Full control
                </span>
              </div>
              <h2 className="text-2xl sm:text-[26px] leading-tight mb-2.5" style={{ fontFamily: HEAD, fontWeight: 600, color: INK }}>
                Start from scratch
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: COCOA }}>
                Open the full composer with live preview. Compose articles, news,
                or events block-by-block with complete control over layout, cover image
                and metadata.
              </p>
              <div className="flex flex-wrap gap-2 mb-7">
                <FeatureChip icon={<ListChecks className="w-3 h-3" />} label="Block editor" />
                <FeatureChip icon={<ImageIcon className="w-3 h-3" />} label="Image upload" />
                <FeatureChip icon={<Calendar className="w-3 h-3" />} label="Event details" />
                <FeatureChip icon={<Repeat className="w-3 h-3" />} label="Recurring events" />
              </div>
              <span
                className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-all group-hover:gap-3"
                style={{ background: FOREST, color: '#fffaf0', boxShadow: `0 3px 0 ${FOREST_DEEP}` }}
              >
                Open composer <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </motion.div>

          {/* AI */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
            <a
              href="#"
              className="group block h-full p-7 sm:p-9 transition-all hover:-translate-y-1.5 relative overflow-hidden"
              style={{
                background: `linear-gradient(160deg, #fff3d9 0%, #fffaf0 60%, #fde6c2 100%)`,
                border: `1.5px solid ${OCHRE}`,
                borderRadius: 22,
                boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 14px 30px -18px rgba(180, 110, 40, 0.4), 0 4px 0 -2px #e0bd7c',
              }}
            >
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-50" style={{ background: 'radial-gradient(circle, #f4c878 0%, transparent 70%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="rounded-2xl flex items-center justify-center"
                    style={{ width: 52, height: 52, background: `linear-gradient(135deg, ${OCHRE} 0%, ${FOREST} 100%)`, color: '#fffaf0', boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.18)' }}
                  >
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: '#fff', color: OCHRE, border: `1px solid ${OCHRE_LIGHT}` }}
                  >
                    AI assisted
                  </span>
                </div>
                <h2 className="text-2xl sm:text-[26px] leading-tight mb-2.5" style={{ fontFamily: HEAD, fontWeight: 600, color: INK }}>
                  Create my event faster with AI
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: COCOA }}>
                  Answer a handful of quick questions and Sika will draft a polished
                  event announcement — title, summary, agenda and tags ready to
                  publish or refine.
                </p>
                <div className="flex flex-wrap gap-2 mb-7">
                  <FeatureChip icon={<Sparkles className="w-3 h-3" />} label="Guided Q&A" />
                  <FeatureChip icon={<Wand2 className="w-3 h-3" />} label="AI-written copy" />
                  <FeatureChip icon={<Calendar className="w-3 h-3" />} label="Event-ready" />
                  <FeatureChip icon={<ListChecks className="w-3 h-3" />} label="Edit before publish" />
                </div>
                <span
                  className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-all group-hover:gap-3"
                  style={{ background: OCHRE, color: '#fffaf0', boxShadow: `0 3px 0 #9a5a18` }}
                >
                  Start the wizard <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </a>
          </motion.div>
        </div>

        <p className="text-center text-xs mt-10 max-w-md mx-auto leading-relaxed" style={{ color: COCOA }}>
          Whichever path you choose, you can always switch — drafts auto-save and
          AI-generated drafts open inside the same composer for editing.
        </p>
      </div>
    </div>
  );
}
