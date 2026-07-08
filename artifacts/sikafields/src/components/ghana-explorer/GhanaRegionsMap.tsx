import { useState, useId, useMemo, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoMercator } from "d3-geo";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { GHANA_REGIONS, STANDARD_META, type GhanaRegion, type StandardKey } from "./data";
import ghanaRegionsGeo from "./gha-regions.geo.json";

interface GhanaRegionsMapProps {
  selectedId: string | null;
  onSelect: (region: GhanaRegion) => void;
}

const MAP_WIDTH = 560;
const MAP_HEIGHT = 640;

function shapeNameToId(shapeName: string): string {
  return shapeName
    .replace(/\s+Region$/i, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function GhanaRegionsMap({ selectedId, onSelect }: GhanaRegionsMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const titleId = useId();

  const hovered = GHANA_REGIONS.find((r) => r.id === hoveredId) ?? null;

  const projection = useMemo(() => {
    const geo = ghanaRegionsGeo as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
    const padding = 16;
    const fitted = geoMercator().fitSize(
      [MAP_WIDTH - padding * 2, MAP_HEIGHT - padding * 2],
      geo,
    );
    const [tx, ty] = fitted.translate();
    fitted.translate([tx + padding, ty + padding]);
    return fitted;
  }, []);

  return (
    <div className="relative">
      <svg width={0} height={0} className="absolute" aria-hidden="true">
        <title id={titleId}>
          Spatial distribution of standards for the SikaFields project — interactive map of active
          and planned regions in Ghana
        </title>
      </svg>
      <ComposableMap
        role="group"
        aria-labelledby={titleId}
        projection={projection}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        className="w-full h-auto max-w-[520px] mx-auto"
      >
        <Geographies geography={ghanaRegionsGeo}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const id = shapeNameToId(String(geo.properties?.shapeName ?? ""));
              const region = GHANA_REGIONS.find((r) => r.id === id);
              if (!region) return null;
              const meta = STANDARD_META[region.standard];
              const isSelected = region.id === selectedId;
              const isHovered = region.id === hoveredId;
              return (
                <motion.g
                  key={geo.rsmKey}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <Geography
                    geography={geo}
                    fill={meta.color}
                    fillOpacity={region.standard === "future" ? 0.35 : isHovered || isSelected ? 1 : 0.82}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2 : 0.75}
                    filter={isHovered || isSelected ? `drop-shadow(0 0 10px ${meta.glow})` : undefined}
                    style={{
                      default: { outline: "none", cursor: "pointer", transition: "fill-opacity 150ms, filter 150ms" },
                      hover: { outline: "none", cursor: "pointer" },
                      pressed: { outline: "none", cursor: "pointer" },
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${region.name} — ${meta.label}${region.status === "Active" ? "" : " (planned)"}`}
                    aria-pressed={isSelected}
                    onMouseEnter={() => setHoveredId(region.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(region.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => onSelect(region)}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(region);
                      }
                    }}
                  />
                </motion.g>
              );
            })
          }
        </Geographies>
      </ComposableMap>

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
