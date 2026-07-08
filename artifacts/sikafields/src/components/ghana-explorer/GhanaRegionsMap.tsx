import { useState, useId } from "react";
import { motion } from "framer-motion";
import { GHANA_REGIONS, STANDARD_META, type GhanaRegion, type StandardKey } from "./data";

const TILE = 74;
const GAP = 10;
const STEP = TILE + GAP;

interface GhanaRegionsMapProps {
  selectedId: string | null;
  onSelect: (region: GhanaRegion) => void;
}

export default function GhanaRegionsMap({ selectedId, onSelect }: GhanaRegionsMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const titleId = useId();

  const maxCol = Math.max(...GHANA_REGIONS.map((r) => r.col));
  const maxRow = Math.max(...GHANA_REGIONS.map((r) => r.row));
  const width = (maxCol + 1) * STEP + GAP;
  const height = (maxRow + 1) * STEP + GAP;

  const hovered = GHANA_REGIONS.find((r) => r.id === hoveredId) ?? null;

  return (
    <div className="relative">
      <svg
        role="group"
        aria-labelledby={titleId}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-w-[520px] mx-auto"
      >
        <title id={titleId}>Interactive map of SikaFields active and planned regions in Ghana</title>
        {GHANA_REGIONS.map((region, idx) => {
          const meta = STANDARD_META[region.standard];
          const isSelected = region.id === selectedId;
          const isHovered = region.id === hoveredId;
          const x = GAP + region.col * STEP;
          const y = GAP + region.row * STEP;
          return (
            <motion.g
              key={region.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.03, duration: 0.35 }}
            >
              <motion.rect
                x={x}
                y={y}
                width={TILE}
                height={TILE}
                rx={16}
                fill={meta.color}
                fillOpacity={region.standard === "future" ? 0.35 : isHovered || isSelected ? 1 : 0.85}
                stroke={isSelected ? "#ffffff" : "transparent"}
                strokeWidth={isSelected ? 3 : 0}
                style={{ cursor: "pointer", transformBox: "fill-box", transformOrigin: "center" }}
                animate={{
                  scale: isHovered || isSelected ? 1.08 : 1,
                  filter: isHovered || isSelected
                    ? `drop-shadow(0 0 14px ${meta.glow})`
                    : "drop-shadow(0 0 0px transparent)",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                tabIndex={0}
                role="button"
                aria-label={`${region.name} — ${meta.label}${region.status === "Active" ? "" : " (planned)"}`}
                aria-pressed={isSelected}
                onMouseEnter={() => setHoveredId(region.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(region.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => onSelect(region)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(region);
                  }
                }}
              />
              <text
                x={x + TILE / 2}
                y={y + TILE / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none"
                fill="#ffffff"
                fontSize={9.5}
                fontWeight={700}
              >
                {region.name.length > 11 ? `${region.name.slice(0, 10)}…` : region.name}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full bg-foreground text-background text-xs font-medium rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-10"
          role="tooltip"
        >
          <span className="font-bold">{hovered.name}</span>
          <span className="opacity-70"> — {STANDARD_META[hovered.standard].shortLabel}</span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
        {(Object.keys(STANDARD_META) as StandardKey[]).map((key) => (
          <div key={key} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: STANDARD_META[key].color, opacity: key === "future" ? 0.5 : 1 }}
            />
            {STANDARD_META[key].label}
          </div>
        ))}
      </div>
    </div>
  );
}
