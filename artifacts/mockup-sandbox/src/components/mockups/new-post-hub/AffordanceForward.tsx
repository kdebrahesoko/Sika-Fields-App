import './_group.css';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, PenLine, Sparkles, Calendar,
  Image as ImageIcon, Repeat, ListChecks, Wand2, LayoutDashboard, Sprout,
  MousePointer2, Eye, Clock,
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

function FauxQuestion() {
  return (
    <div className="rounded-lg p-3 mt-3 text-left" style={{ background: '#fff', border: `1.5px dashed ${OCHRE_LIGHT}` }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: OCHRE }}>
        Q 1 of 5 · Preview
      </p>
      <p className="text-[12px] font-semibold mb-2" style={{ color: INK, fontFamily: HEAD }}>
        What's the event about?
      </p>
      <div className="flex flex-wrap gap-1.5">
        {['Carbon credits', 'Field day', 'Webinar', 'Podcast'].map(t => (
          <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: '#fff7e7', color: FOREST_DEEP, border: `1px solid ${OCHRE_LIGHT}` }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function FauxComposer() {
  return (
    <div className="rounded-lg p-3 mt-3 text-left" style={{ background: '#fff', border: `1.5px dashed ${OCHRE_LIGHT}` }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: FOREST }}>
        Composer · Preview
      </p>
      <div className="space-y-1.5">
        <div className="h-2 rounded" style={{ background: '#eef5e9', width: '70%' }} />
        <div className="h-1.5 rounded" style={{ background: '#f0e6d0', width: '90%' }} />
        <div className="h-1.5 rounded" style={{ background: '#f0e6d0', width: '60%' }} />
        <div className="flex gap-1.5 pt-1">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#eef5e9', color: FOREST_DEEP }}>+ block</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#eef5e9', color: FOREST_DEEP }}>+ image</span>
        </div>
      </div>
    </div>
  );
}

/**
 * USABILITY TRADEOFF: Affordance & interaction visibility.
 * Trade visual minimalism for unmistakable interactive surfaces:
 * giant click targets, hover lift, "preview what's behind the door"
 * mini-mockups, explicit click cursors, time/result hints.
 */
export function AffordanceForward() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: `linear-gradient(180deg, ${CREAM} 0%, ${SAND} 100%)`,
      color: INK, fontFamily: SANS,
    }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 shrink-0" style={{
        background: 'rgba(247,239,225,0.94)', backdropFilter: 'blur(8px)',
        borderBottom: `1.5px solid ${OCHRE_LIGHT}`,
      }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <a href="/admin/posts" className="flex items-center gap-1.5 text-sm font-semibold rounded-md px-2 py-1 hover:bg-white/60" style={{ color: COCOA }}>
            <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Posts</span>
          </a>
          <div className="w-px h-5 mx-1 hidden sm:block" style={{ background: OCHRE_LIGHT }} />
          <Sprout className="w-4 h-4" style={{ color: FOREST }} />
          <p className="text-sm font-semibold"><span style={{ color: FOREST_DEEP }}>Create</span>
            <span className="hidden sm:inline" style={{ color: COCOA }}> · Pick a path</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <a href="/admin/posts" className="flex items-center gap-1.5 text-xs font-semibold rounded-md px-2 py-1 hover:bg-white/60" style={{ color: COCOA }}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All posts</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl leading-tight mb-3" style={{ fontFamily: HEAD, fontWeight: 600 }}>
            Pick a path to start writing
          </h1>
          <p className="text-sm" style={{ color: COCOA }}>
            <MousePointer2 className="w-3.5 h-3.5 inline mb-0.5" /> Click anywhere on a card — both options preview what's inside.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Scratch */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <a href="/admin/composer"
              className="group block h-full p-6 transition-all hover:-translate-y-2 hover:shadow-[0_24px_40px_-20px_rgba(120,78,32,0.5)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 cursor-pointer"
              style={{
                background: '#fffaf0', border: `2px solid ${OCHRE_LIGHT}`, borderRadius: 22,
                boxShadow: '0 14px 30px -18px rgba(120,78,32,0.35), 0 4px 0 -2px #ead7b1',
              }}>
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-[-6deg]"
                  style={{ width: 56, height: 56, background: FOREST, color: '#fffaf0', boxShadow: `inset 0 -4px 0 ${FOREST_DEEP}` }}>
                  <PenLine className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                  style={{ background: '#eef5e9', color: FOREST_DEEP, border: `1px solid #cfe1c0` }}>
                  Full control
                </span>
              </div>
              <h2 className="text-2xl leading-tight mb-1.5" style={{ fontFamily: HEAD, fontWeight: 600 }}>
                Start from scratch
              </h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color: COCOA }}>
                Open the block-based composer with live preview.
              </p>
              <div className="flex flex-wrap gap-3 text-xs mb-2" style={{ color: COCOA }}>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~ 5–15 min</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Live preview</span>
                <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" /> Blocks</span>
                <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Cover image</span>
              </div>

              <FauxComposer />

              <div className="mt-5 flex items-center gap-3">
                <span className="inline-flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 rounded-full flex-1 transition-all group-hover:gap-3"
                  style={{ background: FOREST, color: '#fffaf0', boxShadow: `0 3px 0 ${FOREST_DEEP}` }}>
                  Open composer <ArrowRight className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COCOA }}>
                  ⏎
                </span>
              </div>
            </a>
          </motion.div>

          {/* AI */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
            <a href="/admin/composer?ai=event"
              className="group block h-full p-6 transition-all hover:-translate-y-2 hover:shadow-[0_24px_40px_-20px_rgba(180,110,40,0.55)] focus-visible:outline-none focus-visible:ring-4 cursor-pointer relative overflow-hidden"
              style={{
                background: `linear-gradient(160deg, #fff3d9 0%, #fffaf0 60%, #fde6c2 100%)`,
                border: `2px solid ${OCHRE}`, borderRadius: 22,
                boxShadow: '0 14px 30px -18px rgba(180,110,40,0.4), 0 4px 0 -2px #e0bd7c',
              }}>
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-50"
                style={{ background: 'radial-gradient(circle, #f4c878 0%, transparent 70%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6"
                    style={{ width: 56, height: 56, background: `linear-gradient(135deg, ${OCHRE} 0%, ${FOREST} 100%)`, color: '#fffaf0' }}>
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                    style={{ background: '#fff', color: OCHRE, border: `1px solid ${OCHRE_LIGHT}` }}>
                    AI assisted
                  </span>
                </div>
                <h2 className="text-2xl leading-tight mb-1.5" style={{ fontFamily: HEAD, fontWeight: 600 }}>
                  Create my event faster with AI
                </h2>
                <p className="text-sm leading-relaxed mb-3" style={{ color: COCOA }}>
                  Answer 5 quick questions; Sika drafts the rest.
                </p>
                <div className="flex flex-wrap gap-3 text-xs mb-2" style={{ color: COCOA }}>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~ 90 sec</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Guided Q&A</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Event-ready</span>
                  <span className="flex items-center gap-1"><Repeat className="w-3 h-3" /> Editable after</span>
                </div>

                <FauxQuestion />

                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 rounded-full flex-1 transition-all group-hover:gap-3"
                    style={{ background: OCHRE, color: '#fffaf0', boxShadow: `0 3px 0 #9a5a18` }}>
                    Start the wizard <ArrowRight className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COCOA }}>
                    ⌥ ⏎
                  </span>
                </div>
              </div>
            </a>
          </motion.div>
        </div>

        <p className="text-center text-xs mt-8 max-w-md mx-auto" style={{ color: COCOA }}>
          Both paths open the same composer — switch any time, drafts auto-save.
        </p>
      </div>
    </div>
  );
}
