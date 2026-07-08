import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Sparkles, Radar, Gift, Layers } from "lucide-react";
import { STANDARD_META, type GhanaRegion } from "./data";

interface RegionInfoPanelProps {
  region: GhanaRegion | null;
}

export default function RegionInfoPanel({ region }: RegionInfoPanelProps) {
  return (
    <div
      className="relative rounded-3xl border border-border/60 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-6 md:p-7 min-h-[360px] overflow-hidden"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {!region ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full flex flex-col items-center justify-center text-center py-16"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <p className="text-foreground font-semibold mb-1">Select a region to explore active projects.</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Hover or tap a tile on the map to preview it, then click to see full project details.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={region.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: STANDARD_META[region.standard].color }}
              >
                <Layers className="w-3 h-3" /> {STANDARD_META[region.standard].shortLabel}
              </span>
              <span
                className={
                  region.status === "Active"
                    ? "text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full"
                    : "text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                }
              >
                {region.status}
              </span>
            </div>

            <h4 className="text-2xl font-display font-bold text-foreground mt-3 mb-1">{region.name} Region</h4>
            <p className="text-sm text-muted-foreground mb-5">{STANDARD_META[region.standard].label}</p>

            {(region.farmers || region.hectares) && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                {region.farmers && (
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-lg font-bold text-foreground tabular-nums">{region.farmers}</p>
                    <p className="text-xs text-muted-foreground">Estimated Farmers</p>
                  </div>
                )}
                {region.hectares && (
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-lg font-bold text-foreground tabular-nums">{region.hectares}</p>
                    <p className="text-xs text-muted-foreground">Estimated Hectares</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Activities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {region.activities.map((a) => (
                    <span key={a} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground mb-2">
                  <Radar className="w-3.5 h-3.5 text-accent" /> AI Monitoring
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {region.monitoring.map((m) => (
                    <span key={m} className="text-xs font-medium bg-accent/10 text-accent px-2.5 py-1 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground mb-2">
                  <Gift className="w-3.5 h-3.5 text-secondary" /> Expected Benefits
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {region.benefits.map((b) => (
                    <span key={b} className="text-xs font-medium bg-secondary/10 text-secondary-foreground px-2.5 py-1 rounded-full">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {region.districts && region.districts.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground mb-2">Districts</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{region.districts.join(", ")}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
