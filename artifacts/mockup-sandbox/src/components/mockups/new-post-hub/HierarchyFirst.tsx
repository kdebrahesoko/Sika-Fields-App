import './_group.css';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, PenLine, Sparkles, Wand2, LayoutDashboard, Sprout,
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

/**
 * USABILITY TRADEOFF: Information hierarchy.
 * One option is the recommended primary path; the other is an explicit
 * shortcut, smaller and demoted. We trade visual symmetry for a clear
 * answer to "what should I do first?".
 */
export function HierarchyFirst() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: `linear-gradient(180deg, ${CREAM} 0%, ${SAND} 100%)`,
      color: INK, fontFamily: SANS,
    }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 shrink-0" style={{
        background: 'rgba(247,239,225,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: `1.5px solid ${OCHRE_LIGHT}`,
      }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <a href="/admin/posts" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: COCOA }}>
            <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Posts</span>
          </a>
          <div className="w-px h-5 mx-1 hidden sm:block" style={{ background: OCHRE_LIGHT }} />
          <Sprout className="w-4 h-4" style={{ color: FOREST }} />
          <p className="text-sm font-semibold">
            <span style={{ color: FOREST_DEEP }}>Create</span>
            <span className="hidden sm:inline" style={{ color: COCOA }}> · Step 1 of 2 · Choose how to start</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <a href="/admin/posts" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: COCOA }}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All posts</span>
            </a>
          </div>
        </div>
        {/* Step indicator */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-2 max-w-md">
            <div className="flex-1 h-1 rounded-full" style={{ background: FOREST }} />
            <div className="flex-1 h-1 rounded-full" style={{ background: '#e9d8b6' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COCOA }}>1 / 2</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        {/* Header — single clear question */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="max-w-2xl mb-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: OCHRE }}>
            <Sparkles className="w-3 h-3" /> New Post · Step 1
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[1.05] mb-3"
            style={{ fontFamily: HEAD, fontWeight: 600, letterSpacing: '-0.015em' }}>
            How would you like to start?
          </h1>
          <p className="text-[15px] leading-relaxed max-w-xl" style={{ color: COCOA }}>
            Most editors start with the <strong style={{ color: FOREST_DEEP }}>AI wizard</strong> for events
            — it's faster and the result is fully editable. Use the manual composer if
            you already have copy ready.
          </p>
        </motion.div>

        {/* PRIMARY recommendation — large, single-column */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <a href="/admin/composer?ai=event"
            className="group block p-7 sm:p-9 mb-5 transition-all hover:-translate-y-1 relative overflow-hidden"
            style={{
              background: `linear-gradient(160deg, #fff3d9 0%, #fffaf0 60%, #fde6c2 100%)`,
              border: `2px solid ${OCHRE}`, borderRadius: 22,
              boxShadow: '0 18px 36px -18px rgba(180,110,40,0.5), 0 4px 0 -2px #d6a763',
            }}>
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-50"
              style={{ background: 'radial-gradient(circle, #f4c878 0%, transparent 70%)' }} />
            <div className="relative grid sm:grid-cols-[auto_1fr_auto] gap-5 items-center">
              <div className="rounded-2xl flex items-center justify-center"
                style={{ width: 64, height: 64, background: `linear-gradient(135deg, ${OCHRE} 0%, ${FOREST} 100%)`, color: '#fffaf0' }}>
                <Wand2 className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ background: FOREST, color: '#fffaf0' }}>Recommended</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: OCHRE }}>~ 90 seconds</span>
                </div>
                <h2 className="text-xl sm:text-2xl leading-tight mb-1.5" style={{ fontFamily: HEAD, fontWeight: 600 }}>
                  Create my event faster with AI
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: COCOA }}>
                  Answer a handful of quick questions; Sika drafts the title, summary,
                  agenda and tags. Edit before publishing.
                </p>
              </div>
              <span className="inline-flex items-center justify-center gap-2 text-base font-bold px-6 py-3 rounded-full sm:flex-none w-full sm:w-auto"
                style={{ background: OCHRE, color: '#fffaf0', boxShadow: `0 3px 0 #9a5a18` }}>
                Start wizard <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </a>
        </motion.div>

        {/* Visual demotion — divider */}
        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px" style={{ background: OCHRE_LIGHT }} />
          <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: COCOA }}>or</span>
          <span className="flex-1 h-px" style={{ background: OCHRE_LIGHT }} />
        </div>

        {/* SECONDARY — text link with icon, not a card */}
        <motion.a href="/admin/composer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="group flex items-center gap-4 px-5 py-4 rounded-xl transition-colors"
          style={{ background: '#fffaf0', border: `1px solid ${OCHRE_LIGHT}` }}>
          <div className="rounded-lg flex items-center justify-center shrink-0"
            style={{ width: 40, height: 40, background: '#eef5e9', color: FOREST_DEEP, border: `1px solid #cfe1c0` }}>
            <PenLine className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug" style={{ color: INK }}>
              Open the manual composer instead
            </p>
            <p className="text-xs leading-snug" style={{ color: COCOA }}>
              Block editor with live preview · articles, news, events · cover image · recurring schedule
            </p>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: COCOA }} />
        </motion.a>

        <p className="text-center text-xs mt-12 max-w-md mx-auto" style={{ color: COCOA }}>
          You can switch between the two at any time — drafts auto-save.
        </p>
      </div>
    </div>
  );
}
