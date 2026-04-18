import './_group.css';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, PenLine, Sparkles, Calendar,
  Image as ImageIcon, Repeat, ListChecks, Wand2, LayoutDashboard, Activity,
} from 'lucide-react';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "'Inter', -apple-system, sans-serif";

const BG = '#0a0e0c';
const SURFACE = '#10161330';
const PANEL = '#0d1411';
const LINE = '#1c2823';
const LINE_BRIGHT = '#2a3d34';
const TEXT = '#d6e3dc';
const DIM = '#6b7c74';
const NEON = '#3ee089';
const NEON_DIM = '#1f7f4d';
const AMBER = '#ffb547';

const grid =
  "linear-gradient(rgba(62,224,137,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(62,224,137,0.04) 1px, transparent 1px)";

function MetricChip({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col" style={{ borderLeft: `1px solid ${LINE_BRIGHT}`, paddingLeft: 10 }}>
      <span style={{ color: DIM, fontFamily: MONO, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        {k}
      </span>
      <span style={{ color: TEXT, fontFamily: MONO, fontSize: 12, fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function Tag({ children, color = NEON }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1"
      style={{ color, fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', border: `1px solid ${color}33`, background: `${color}10` }}
    >
      {children}
    </span>
  );
}

export function ClimateConsole() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `${grid}, ${BG}`,
        backgroundSize: '32px 32px, 32px 32px, auto',
        color: TEXT,
        fontFamily: SANS,
      }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-40 shrink-0"
        style={{ background: 'rgba(10,14,12,0.85)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${LINE_BRIGHT}` }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <a href="/admin/posts" className="flex items-center gap-1.5 text-[12px] shrink-0" style={{ color: DIM, fontFamily: MONO, letterSpacing: '0.05em' }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">cd ../posts</span>
          </a>
          <div className="w-px h-5 mx-1 hidden sm:block" style={{ background: LINE_BRIGHT }} />
          <div className="flex items-center gap-2 min-w-0">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: NEON, boxShadow: `0 0 8px ${NEON}` }} />
            <p className="text-[12px]" style={{ fontFamily: MONO, letterSpacing: '0.05em' }}>
              <span style={{ color: NEON }}>create</span>
              <span style={{ color: DIM }}>@sika</span>
              <span className="hidden sm:inline" style={{ color: DIM }}> :: choose-workflow</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span style={{ color: DIM, fontFamily: MONO, fontSize: 10 }}>● live</span>
            <a href="/admin/posts" className="flex items-center gap-1.5 text-[11px]" style={{ color: DIM, fontFamily: MONO }}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">all_posts</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <span style={{ color: NEON, fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em' }}>// CREATE</span>
            <span className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${LINE_BRIGHT}, transparent)` }} />
            <span style={{ color: DIM, fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em' }}>
              <Sparkles className="w-3 h-3 inline -mt-0.5 mr-1" style={{ color: AMBER }} />
              NEW POST
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-[56px] leading-[1.04] mb-5"
            style={{ fontFamily: SANS, fontWeight: 700, letterSpacing: '-0.025em', color: TEXT }}
          >
            How would you<br />
            <span style={{ color: NEON, textShadow: `0 0 30px ${NEON}40` }}>like to start?</span>
          </h1>
          <p className="text-[15px] leading-relaxed max-w-xl" style={{ color: DIM }}>
            Pick the workflow that suits you — full creative control, or let Sika ask
            a few quick questions and assemble a draft for you.
          </p>
        </motion.div>

        {/* Two cards as instrument panels */}
        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {/* Scratch */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <a
              href="/admin/posts"
              className="group block h-full transition-all hover:-translate-y-1"
              style={{ background: PANEL, border: `1px solid ${LINE_BRIGHT}`, position: 'relative' }}
            >
              {/* corner ticks */}
              <span style={{ position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderTop: `2px solid ${NEON}`, borderLeft: `2px solid ${NEON}` }} />
              <span style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: `2px solid ${NEON}`, borderRight: `2px solid ${NEON}` }} />
              <span style={{ position: 'absolute', bottom: -1, left: -1, width: 14, height: 14, borderBottom: `2px solid ${NEON}`, borderLeft: `2px solid ${NEON}` }} />
              <span style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderBottom: `2px solid ${NEON}`, borderRight: `2px solid ${NEON}` }} />

              <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${LINE}`, background: SURFACE }}>
                <span style={{ color: NEON, fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em' }}>01 / SCRATCH</span>
                <span style={{ color: DIM, fontFamily: MONO, fontSize: 10 }}>FULL_CONTROL</span>
              </div>
              <div className="p-7 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center" style={{ width: 44, height: 44, border: `1px solid ${NEON}`, color: NEON, background: `${NEON}10` }}>
                    <PenLine className="w-5 h-5" />
                  </div>
                  <Activity className="w-3.5 h-3.5" style={{ color: NEON_DIM }} />
                  <span style={{ color: DIM, fontFamily: MONO, fontSize: 10 }}>idle · ready</span>
                </div>
                <h2 className="text-2xl leading-tight mb-2.5" style={{ fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>
                  Start from scratch
                </h2>
                <p className="text-[13px] leading-relaxed mb-6" style={{ color: DIM }}>
                  Open the full composer with live preview. Compose articles, news,
                  or events block-by-block with complete control over layout, cover image
                  and metadata.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-7" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
                  <MetricChip k="Editor" v="block-based" />
                  <MetricChip k="Media" v="upload + lib" />
                  <MetricChip k="Event" v="full schema" />
                  <MetricChip k="Repeat" v="weekly · monthly" />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-7">
                  <Tag><ListChecks className="w-2.5 h-2.5" /> blocks</Tag>
                  <Tag><ImageIcon className="w-2.5 h-2.5" /> media</Tag>
                  <Tag><Calendar className="w-2.5 h-2.5" /> event</Tag>
                  <Tag><Repeat className="w-2.5 h-2.5" /> recur</Tag>
                </div>
                <span
                  className="inline-flex items-center gap-2 px-4 py-2.5 transition-all group-hover:gap-3"
                  style={{
                    background: NEON, color: BG, fontFamily: MONO, fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    boxShadow: `0 0 0 1px ${NEON}, 0 0 20px ${NEON}40`,
                  }}
                >
                  Run composer <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </a>
          </motion.div>

          {/* AI */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
            <a
              href="/admin/posts"
              className="group block h-full transition-all hover:-translate-y-1 relative"
              style={{ background: PANEL, border: `1px solid ${AMBER}55` }}
            >
              <span style={{ position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderTop: `2px solid ${AMBER}`, borderLeft: `2px solid ${AMBER}` }} />
              <span style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: `2px solid ${AMBER}`, borderRight: `2px solid ${AMBER}` }} />
              <span style={{ position: 'absolute', bottom: -1, left: -1, width: 14, height: 14, borderBottom: `2px solid ${AMBER}`, borderLeft: `2px solid ${AMBER}` }} />
              <span style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderBottom: `2px solid ${AMBER}`, borderRight: `2px solid ${AMBER}` }} />

              <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${LINE}`, background: SURFACE }}>
                <span style={{ color: AMBER, fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em' }}>02 / AI</span>
                <span style={{ color: DIM, fontFamily: MONO, fontSize: 10 }}>ASSISTED · DRAFT</span>
              </div>
              <div className="p-7 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center" style={{ width: 44, height: 44, border: `1px solid ${AMBER}`, color: AMBER, background: `${AMBER}10` }}>
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <Activity className="w-3.5 h-3.5" style={{ color: AMBER }} />
                  <span style={{ color: AMBER, fontFamily: MONO, fontSize: 10 }}>model · sika-1</span>
                </div>
                <h2 className="text-2xl leading-tight mb-2.5" style={{ fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>
                  Create my event faster with AI
                </h2>
                <p className="text-[13px] leading-relaxed mb-6" style={{ color: DIM }}>
                  Answer a handful of quick questions and Sika will draft a polished
                  event announcement — title, summary, agenda and tags ready to
                  publish or refine.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-7" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
                  <MetricChip k="Mode" v="guided Q&A" />
                  <MetricChip k="Output" v="event draft" />
                  <MetricChip k="Time" v="~ 90 sec" />
                  <MetricChip k="Edit" v="composer" />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-7">
                  <Tag color={AMBER}><Sparkles className="w-2.5 h-2.5" /> guided</Tag>
                  <Tag color={AMBER}><Wand2 className="w-2.5 h-2.5" /> ai-copy</Tag>
                  <Tag color={AMBER}><Calendar className="w-2.5 h-2.5" /> event</Tag>
                  <Tag color={AMBER}><ListChecks className="w-2.5 h-2.5" /> review</Tag>
                </div>
                <span
                  className="inline-flex items-center gap-2 px-4 py-2.5 transition-all group-hover:gap-3"
                  style={{
                    background: 'transparent', color: AMBER, fontFamily: MONO, fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    border: `1px solid ${AMBER}`,
                  }}
                >
                  Run wizard <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </a>
          </motion.div>
        </div>

        <div className="flex items-center gap-3 mt-12 max-w-2xl mx-auto">
          <span className="flex-1 h-px" style={{ background: LINE_BRIGHT }} />
          <p className="text-center text-[11px] leading-relaxed" style={{ color: DIM, fontFamily: MONO, letterSpacing: '0.05em' }}>
            // both paths feed the same composer · drafts persist
          </p>
          <span className="flex-1 h-px" style={{ background: LINE_BRIGHT }} />
        </div>
      </div>
    </div>
  );
}
