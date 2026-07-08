---
name: d3-geo Mercator winding-order bug
description: Real GeoJSON region boundaries rendering as one full-canvas blob (react-simple-maps / d3-geo geoMercator + fitSize)
---

When rendering per-feature GeoJSON polygons with `react-simple-maps` (or raw `d3-geo`) using `geoMercator` (or other clip-sensitive projections) combined with `.fitSize()`, every feature's computed `path.bounds()`/rendered `d` path can come out identical to the *entire* collection's bounds — visually showing one giant solid-colored rectangle covering the whole SVG instead of distinct region shapes.

**Root cause:** GeoJSON exterior rings following standard RFC7946 winding (CCW as seen from outside the sphere, i.e. positive planar shoelace area when x=lon, y=lat) can trigger d3-geo's default antimeridian/sphere clipping logic to treat the polygon's *interior* as the complement (nearly the whole globe) rather than the small local shape. The rendered path then includes an extra subpath tracing the clip-extent frame (recognizable by repeated coordinates at the clip boundary, e.g. a fixed x or y value repeated many times), and per-feature bounds collapse to that frame's extent for every feature.

**Confirming diagnosis:** Test with a trivial 2-feature FeatureCollection (two small non-overlapping squares) under the same projection+fitSize combo. If `path.bounds()` returns identical results for both features, and the raw `path(feature)` SVG string contains a large secondary subpath with many repeated coordinate values, this is the winding bug — not a data/simplification/scale issue. Reversing the ring's point order removes the artifact and produces correct, distinct bounds.

**Fix:** Rewind every exterior ring (and correspondingly interior/hole rings) to the opposite orientation from standard RFC7946 CCW before feeding the GeoJSON to d3-geo/react-simple-maps for this projection setup — i.e., flip rings so the planar shoelace area (x=lon,y=lat) is negative for exteriors. A manual shoelace-based rewind script is enough; no special library needed. `mapshaper -o rfc7946` did NOT fix this for a geoBoundaries-sourced ADM1 dataset — it targets a different concern and left the winding as-is.

**How to apply:** Whenever integrating third-party/downloaded regional GeoJSON (e.g. geoBoundaries, GADM) into a `react-simple-maps` component using `geoMercator`/similar with `fitSize`, always sanity-check per-feature `path.bounds()` differ from the whole-collection bounds before wiring up rendering. If they collapse to one shared value, rewind ring winding rather than debugging fill/opacity/scale math.
