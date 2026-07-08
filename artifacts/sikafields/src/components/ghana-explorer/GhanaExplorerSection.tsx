import { useState } from "react";
import { motion } from "framer-motion";
import GhanaRegionsMap from "./GhanaRegionsMap";
import RegionInfoPanel from "./RegionInfoPanel";
import MrvTimeline from "./MrvTimeline";
import LiveStats from "./LiveStats";
import type { GhanaRegion } from "./data";

export default function GhanaExplorerSection() {
  const [selected, setSelected] = useState<GhanaRegion | null>(null);

  return (
    <div className="relative">
      {/* Subtle background treatment */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[32px]">
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_20%_20%,theme(colors.primary.DEFAULT)_0,transparent_45%),radial-gradient(circle_at_80%_70%,theme(colors.accent.DEFAULT)_0,transparent_45%)]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
          <defs>
            <pattern id="contour-lines" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="16" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contour-lines)" className="text-primary" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="grid lg:grid-cols-5 gap-8 items-stretch mb-14"
      >
        <div className="lg:col-span-3 rounded-3xl border border-border/60 bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-lg p-6 md:p-8">
          <GhanaRegionsMap selectedId={selected?.id ?? null} onSelect={setSelected} />
        </div>
        <div className="lg:col-span-2">
          <RegionInfoPanel region={selected} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <h4 className="text-center text-sm font-bold uppercase tracking-wide text-muted-foreground mb-8">
          The MRV Workflow — From Farm to Credit
        </h4>
        <MrvTimeline />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <LiveStats />
      </motion.div>
    </div>
  );
}
