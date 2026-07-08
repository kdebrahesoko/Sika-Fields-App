---
name: Stylized region maps without geodata
description: How to build an interactive sub-country region map (e.g. Ghana regions) when no accurate GeoJSON/TopoJSON boundary data is available.
---

When a task asks for an interactive map of a country's internal regions/districts (not whole countries), don't assume `react-simple-maps` + a public topojson URL will have that granularity — country-level atlases (e.g. `world-atlas`) only go down to national borders. District/region-level files for a specific country are rarely available on public CDNs.

**Decision:** build a custom SVG grid-tile map instead — position each region as a rounded-rect tile at an approximate `(col, row)` reflecting its real relative geography (north/south, east/west), color/label it, and make tiles interactive (hover, click, keyboard). This is a common, accepted pattern for stylized dashboard maps and avoids depending on external geodata availability at runtime.

**Why:** Attempting pixel-accurate boundaries without a real data source produces either broken map fetches (404s from guessed CDN URLs) or hand-drawn paths that are wrong/misleading. A stylized grid map is honest about its abstraction level, fully self-contained (no runtime fetch dependency), and still satisfies "interactive SVG map" requirements.

**How to apply:** When source reference material (PDFs, spreadsheets) that would give per-district classification can't be parsed (e.g. scanned PDF where OCR loses color/legend associations), assign categories at a reasonable, clearly-documented granularity (e.g. per-region rather than per-district) and note in a code comment that the assignment is illustrative/representative, not surveyed data — consistent with "best effort" scope language.
