---
name: Verifying reference-source data before trusting existing placeholder values
description: A prior "illustrative"/best-effort data extraction from a source PDF or spreadsheet turned out wrong when re-checked pixel-by-pixel — always re-verify before reusing.
---

When a codebase contains a comment saying data was extracted from a reference document (PDF, spreadsheet, screenshot) but is "illustrative" or a "best effort" because exact values/colors "could not be extracted from text," treat that data as unverified, not merely imprecise. In one case, the color-to-category legend mapping was backwards (each category assigned to the wrong color, and per-region assignments were also structurally wrong) — not just approximate.

**Why:** OCR/text-extraction from a rendered chart or map PDF cannot see fill colors, so any color/category association inferred without visually inspecting the source is a guess dressed up as data. A code reviewer (or user) checking the deliverable against the real source document will catch this, so it must be fixed before shipping, not just labeled as an approximation.

**How to apply:** When a task explicitly says to source data from a reference file (PDF, spreadsheet, image), always:
1. Render the PDF to an image (`pdftoppm -png -r 200+`) and crop/zoom regions (`magick`/`convert -crop`) to read labels and legend swatches directly, rather than trusting prior OCR-derived text.
2. Sample exact legend swatch RGB values (`magick <crop> -resize 1x1! txt:-`) to get correct hex colors for category-to-color mappings, rather than guessing/reusing old placeholder colors.
3. For numeric stats (farmers, hectares, etc.), check for an accompanying spreadsheet/export — `.xlsx` files can be read without an `xlsx` npm package by unzipping them (`unzip -o file.xlsx`) and reading `xl/worksheets/sheet1.xml` + `xl/sharedStrings.xml` directly.
4. If the reference only gives aggregate totals (e.g. per-category, not per-region), don't fabricate fake precise per-region numbers — derive a clearly-labeled proportional estimate from the real totals and document the derivation method in a code comment, or use wording like "(est.)" in the UI so the number's provenance stays honest.
5. When the data model assumes one category per unit (e.g. one carbon-standard per region) but the real source shows a unit split across categories (e.g. one region with districts under two different standards), don't force a single (wrong) category — add a genuine "mixed" category rather than picking an arbitrary winner.
