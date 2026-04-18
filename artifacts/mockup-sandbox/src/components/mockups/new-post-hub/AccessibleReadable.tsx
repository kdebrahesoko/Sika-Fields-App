import './_group.css';
import {
  ArrowLeft, ArrowRight, PenLine, Wand2, LayoutDashboard,
} from 'lucide-react';

const HEAD = "'Fraunces', 'Source Serif 4', Georgia, serif";
const SANS = "'Inter', -apple-system, sans-serif";

/**
 * USABILITY TRADEOFF: Accessibility & readability.
 * Trade decoration for legibility: WCAG-AA contrast, ≥18px body text,
 * 1.7 line-height, persistent focus rings, no motion, plain language,
 * generous spacing, semantic structure. The design is utilitarian on
 * purpose.
 */
export function AccessibleReadable() {
  // High-contrast palette tuned for WCAG AA on light cream
  const BG = '#fbf6ec';     // warm but very light
  const TEXT = '#181410';   // near-black ink, > 14:1 contrast on BG
  const LABEL = '#3d342a';  // > 9:1 contrast on BG
  const FOREST = '#1f4f2e'; // > 7:1 on white
  const OCHRE = '#8a4a17';  // > 6:1 on BG (darker than warm-fieldnotes)
  const RULE = '#c9bfa9';
  const SURFACE = '#ffffff';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, color: TEXT, fontFamily: SANS }}>
      {/* Skip link — visible on focus */}
      <a href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded focus:font-bold"
        style={{ background: TEXT, color: BG, outline: `3px solid ${OCHRE}`, outlineOffset: 2 }}>
        Skip to main content
      </a>

      {/* Top bar */}
      <header className="sticky top-0 z-40 shrink-0" style={{ background: BG, borderBottom: `2px solid ${RULE}` }}>
        <div className="max-w-screen-xl mx-auto px-5 sm:px-7 h-16 flex items-center gap-4">
          <a href="/admin/posts"
            className="flex items-center gap-2 text-base font-semibold rounded-md px-2 py-1.5 focus:outline-none focus:ring-4"
            style={{ color: TEXT, ['--tw-ring-color' as string]: OCHRE }}
            aria-label="Back to all posts">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" /><span className="hidden sm:inline">Posts</span>
          </a>
          <span className="hidden sm:block w-px h-6" style={{ background: RULE }} aria-hidden="true" />
          <p className="text-base font-semibold">
            <span>Create a new post</span>
          </p>
          <div className="ml-auto">
            <a href="/admin/posts"
              className="flex items-center gap-2 text-sm font-semibold rounded-md px-2 py-1.5 focus:outline-none focus:ring-4"
              style={{ color: LABEL, ['--tw-ring-color' as string]: OCHRE }}>
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">All posts</span>
            </a>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-7 py-10 sm:py-14">
        <h1 className="text-[34px] sm:text-[44px] leading-[1.15] mb-5"
          style={{ fontFamily: HEAD, fontWeight: 700, letterSpacing: '-0.01em', color: TEXT }}>
          How would you like to start?
        </h1>
        <p className="text-[18px] leading-[1.7] mb-10" style={{ color: LABEL, maxWidth: '60ch' }}>
          Choose one of the two options below. You can change your mind later —
          your work is saved automatically.
        </p>

        <fieldset className="space-y-4 border-0 p-0 m-0">
          <legend className="sr-only">Choose how to start your post</legend>

          {/* Option 1 — manual */}
          <a href="/admin/composer"
            className="group flex flex-col sm:flex-row sm:items-center gap-5 p-6 rounded-xl focus:outline-none focus:ring-4"
            style={{
              background: SURFACE, border: `2px solid ${RULE}`,
              ['--tw-ring-color' as string]: OCHRE,
            }}
            aria-describedby="opt1-desc">
            <span aria-hidden="true"
              className="rounded-xl flex items-center justify-center shrink-0 self-start"
              style={{ width: 56, height: 56, background: FOREST, color: '#fff' }}>
              <PenLine className="w-7 h-7" />
            </span>
            <span className="flex-1">
              <span className="block text-[22px] sm:text-[24px] font-bold leading-tight mb-2"
                style={{ fontFamily: HEAD, color: TEXT }}>
                Option 1. Start from scratch
              </span>
              <span id="opt1-desc" className="block text-[17px] leading-[1.6]" style={{ color: LABEL, maxWidth: '52ch' }}>
                Open the full editor. Write articles, news, or events with complete
                control over the layout. Best when you already have your text ready.
              </span>
            </span>
            <span className="inline-flex items-center justify-center gap-2 text-base font-bold px-5 py-3 rounded-lg shrink-0"
              style={{ background: TEXT, color: BG, minWidth: 180 }}>
              Open editor
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </span>
          </a>

          {/* Option 2 — AI */}
          <a href="/admin/composer?ai=event"
            className="group flex flex-col sm:flex-row sm:items-center gap-5 p-6 rounded-xl focus:outline-none focus:ring-4"
            style={{
              background: SURFACE, border: `2px solid ${RULE}`,
              ['--tw-ring-color' as string]: OCHRE,
            }}
            aria-describedby="opt2-desc">
            <span aria-hidden="true"
              className="rounded-xl flex items-center justify-center shrink-0 self-start"
              style={{ width: 56, height: 56, background: OCHRE, color: '#fff' }}>
              <Wand2 className="w-7 h-7" />
            </span>
            <span className="flex-1">
              <span className="block text-[22px] sm:text-[24px] font-bold leading-tight mb-2"
                style={{ fontFamily: HEAD, color: TEXT }}>
                Option 2. Answer questions and let Sika draft an event
              </span>
              <span id="opt2-desc" className="block text-[17px] leading-[1.6]" style={{ color: LABEL, maxWidth: '52ch' }}>
                Sika will ask five short questions, then write a first draft of an event
                announcement for you. You can edit every word before it is published.
              </span>
            </span>
            <span className="inline-flex items-center justify-center gap-2 text-base font-bold px-5 py-3 rounded-lg shrink-0"
              style={{ background: TEXT, color: BG, minWidth: 180 }}>
              Start questions
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </span>
          </a>
        </fieldset>

        <section className="mt-10 p-5 rounded-lg" style={{ background: '#fff7e7', border: `2px solid ${RULE}` }}>
          <h2 className="text-[16px] font-bold mb-2" style={{ color: TEXT }}>Good to know</h2>
          <ul className="text-[16px] leading-[1.7] space-y-1.5 list-disc pl-5" style={{ color: LABEL }}>
            <li>Drafts save automatically every few seconds.</li>
            <li>You can switch between the two options at any time.</li>
            <li>Nothing is published until you press the Publish button.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
