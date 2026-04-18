
// ─────────────────────────────────────────────────────────────────────────────
// SikaFields — Articles & Updates content store
//
// HOW TO ADD A NEW POST:
//   1. Copy one of the existing objects below
//   2. Give it a unique `id` and `slug` (URL-friendly, lowercase, hyphens)
//   3. Set `kind` to "article" (educational) or "news" (announcement/update)
//   4. Fill in the content blocks:
//        { type: "h2", text: "Section heading" }
//        { type: "p",  text: "A paragraph of text." }
//        { type: "quote", text: "A pull quote.", attribution: "— Name" }
//        { type: "list", items: ["Item 1", "Item 2"] }
//   5. Set `publishedAt` to today's date (e.g. "Mar 19, 2026")
//   6. Save the file — the site rebuilds automatically.
// ─────────────────────────────────────────────────────────────────────────────

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; items: string[] };

export type ArticleAuthor = {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  bgPos?: string;
  bgSize?: string;
  imgFile?: "leadership-team" | "advisory-board" | "dr-kwame";
};

export type EventDetails = {
  date: string;
  endDate?: string;
  location?: string;
  virtualLink?: string;
  recurrence?: "none" | "weekly" | "monthly";
  recurrenceEnd?: string;
};

export type Article = {
  id: string;
  slug: string;
  kind: "article" | "news" | "event";
  template?: "standard" | "hero" | "visual";
  title: string;
  excerpt: string;
  content: ArticleBlock[];
  coverImage?: string;
  coverColor?: string;
  author: ArticleAuthor;
  tags: string[];
  newsCategory?: "announcement" | "market" | "regulation" | "press";
  event?: EventDetails;
  publishedAt: string;
  readTime: number;
  featured?: boolean;
  lastEdited?: { at: string; byName?: string };
};

export const ARTICLES: Article[] = [
  {
    id: "1",
    slug: "how-carbon-credits-work-farmers-guide",
    kind: "article",
    template: "standard",
    title: "How Carbon Credits Work: A Complete Guide for Smallholder Farmers",
    excerpt:
      "If you farm land that absorbs carbon dioxide — trees, cover crops, restored soil — you are already part of the climate solution. Carbon credits turn that invisible work into income.",
    coverColor: "#16a34a",
    author: {
      name: "Daniel Asare-Kyei",
      role: "CEO",
      bgPos: "0% 6%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Education", "Carbon Markets", "Farmers"],
    publishedAt: "Mar 15, 2026",
    readTime: 6,
    featured: true,
    content: [
      {
        type: "p",
        text: "A carbon credit is a certificate representing one tonne of carbon dioxide (CO₂) removed from — or prevented from entering — the atmosphere. When a company needs to offset its emissions, it buys these certificates from projects that have proven, measurable climate impact. Smallholder farmers in Africa and India are sitting on some of the most valuable land for this work.",
      },
      {
        type: "h2",
        text: "Why Farmers Are Perfectly Positioned",
      },
      {
        type: "p",
        text: "Unlike large industrial carbon capture projects, smallholder farms offer something irreplaceable: co-benefits. When a Ghanaian farmer plants trees between their crops (agroforestry), they are not only sequestering carbon — they are increasing biodiversity, preventing soil erosion, and improving their family's long-term food security. These co-benefits attract a premium from buyers who need to demonstrate genuine ESG value, not just tonnage.",
      },
      {
        type: "h2",
        text: "How the Earning Process Works",
      },
      {
        type: "list",
        items: [
          "Enrollment: A SikaFields field coordinator visits your farm, maps your land using GPS, and explains the eligible practices (tree planting, reduced tillage, cover crops).",
          "Baseline measurement: We photograph and document the current state of your land using satellite imagery and soil sampling.",
          "Annual MRV: Every year, our system measures how much carbon your land has absorbed using satellite data cross-checked by field visits.",
          "Credit issuance: Verified tonnes are issued as credits under the Verra VCS standard — the global gold standard for voluntary carbon markets.",
          "Payment: Credits are sold to corporate buyers, and your share arrives via mobile money, typically within 60 days of credit issuance.",
        ],
      },
      {
        type: "quote",
        text: "The carbon market does not ask farmers to stop farming. It pays them more for farming better.",
        attribution: "— Daniel Asare-Kyei, PhD, CEO of SikaFields",
      },
      {
        type: "h2",
        text: "How Much Can a Farmer Earn?",
      },
      {
        type: "p",
        text: "On average, enrolled SikaFields farmers earn between $300 and $700 per year in supplemental carbon income, depending on land size and practice adoption. For a household earning $1,200 per year from crops alone, this represents a 25–60% income uplift — meaningful enough to fund a child's school fees or invest in better seeds for the next season.",
      },
      {
        type: "p",
        text: "The market price for carbon credits fluctuated between $18 and $28 per tonne in Q1 2026, driven largely by demand from European compliance buyers and voluntary ESG commitments from corporations. Our DIFC-registered holding structure allows us to access institutional-grade buyers who typically pay premiums of 15–30% above spot prices for credits with verified co-benefits.",
      },
    ],
  },
  {
    id: "2",
    slug: "understanding-mrv-science-behind-carbon-credits",
    kind: "article",
    template: "standard",
    title: "Understanding MRV: The Science Behind Every Carbon Credit We Issue",
    excerpt:
      "MRV — Measurement, Reporting, and Verification — is not jargon. It is the proof. Without it, a carbon credit is worthless. Here is how our science team makes sure every credit counts.",
    coverColor: "#7c3aed",
    author: {
      name: "Valentijn Venus",
      role: "Chief Product & Research Officer",
      bgPos: "100% 6%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Technology", "MRV", "Science"],
    publishedAt: "Mar 10, 2026",
    readTime: 7,
    content: [
      {
        type: "p",
        text: "Every carbon credit issued by SikaFields begins with a simple question: how do we know the carbon is actually there? The answer is MRV — Measurement, Reporting, and Verification — a rigorous three-step process that ensures every tonne of CO₂ we claim has been genuinely sequestered, is accurately documented, and has been independently verified.",
      },
      {
        type: "h2",
        text: "Measurement: Combining Satellites and Soil",
      },
      {
        type: "p",
        text: "Our MRV system runs two parallel measurement tracks. The first is remote sensing: we use Sentinel-2 satellite imagery (updated every five days) to compute NDVI — Normalized Difference Vegetation Index — across all 47,000 enrolled plots. A rising NDVI over time is a strong proxy for biomass growth and carbon sequestration. Our soil carbon algorithm v3.1, validated in the Ghana pilot, achieves ±2.3% accuracy compared to direct soil measurement — the tightest variance we have achieved to date.",
      },
      {
        type: "p",
        text: "The second track is ground-truth verification. Our 127 community field coordinators conduct quarterly plot visits, collecting soil samples, photographing canopy cover, and recording any land-use changes. Any plot showing an anomalous NDVI reading — a potential sign of deforestation or land clearing — triggers an immediate field dispatch. In Q1 2026, we identified and investigated 340 such anomalies from a total pool of 47,000 plots.",
      },
      {
        type: "h2",
        text: "Reporting: Audit-Ready Documentation",
      },
      {
        type: "p",
        text: "Every measurement, observation, and calculation is logged in our MRV platform with a timestamp, GPS coordinate, and the name of the field agent who collected it. The result is a Project Design Document (PDD) submitted to Verra — the global standard body — that contains a provenance chain for every individual tonne of CO₂ claimed. Our current PDD review with Verra is scheduled for April 2026.",
      },
      {
        type: "h2",
        text: "Verification: The Independent Check",
      },
      {
        type: "list",
        items: [
          "Third-party auditors visit a random 10% sample of enrolled plots each year.",
          "Satellite data is cross-referenced against independent commercial satellite providers.",
          "Our methodologies are assessed against Verra's VCS Standard and the CCB (Climate, Community & Biodiversity) co-benefits framework.",
          "Credits are only issued after Verra approves the verification report — typically 60–90 days after the audit.",
        ],
      },
      {
        type: "quote",
        text: "Data integrity is not an aspiration at SikaFields. It is the product.",
        attribution: "— Valentijn Venus, CPRO",
      },
    ],
  },
  {
    id: "3",
    slug: "esg-buyers-guide-african-smallholder-carbon-credits",
    kind: "article",
    template: "standard",
    title: "ESG Buyers' Guide: Why African Smallholder Credits Command a Premium",
    excerpt:
      "Not all carbon credits are equal. Institutional ESG buyers are increasingly prioritising credits that deliver verified co-benefits — and smallholder African projects sit at the top of that ranking.",
    coverColor: "#0f766e",
    author: {
      name: "Vijay Palat",
      role: "Chief Strategy & Sustainability Officer",
      bgPos: "47% 82%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["ESG", "Buyers", "Investment"],
    publishedAt: "Mar 5, 2026",
    readTime: 5,
    content: [
      {
        type: "p",
        text: "The voluntary carbon market has matured significantly over the past three years. As corporate ESG commitments have deepened under TCFD and GRI frameworks, procurement teams are no longer buying the cheapest available credit. They are buying the most defensible credit — one that will withstand scrutiny from NGOs, investors, and regulators alike.",
      },
      {
        type: "h2",
        text: "The Co-Benefits Premium",
      },
      {
        type: "p",
        text: "A SikaFields credit is not just a tonne of CO₂. It comes with verified co-benefits under the CCB standard: SDG alignment across SDGs 1 (No Poverty), 2 (Zero Hunger), 13 (Climate Action), 15 (Life on Land), and 17 (Partnerships for the Goals). Our third-party impact assessment, completed in Q1 2026, confirms full alignment with the Paris Agreement's 1.5°C pathway. Buyers incorporating our credits into TCFD disclosures can reference independent verification — not just self-reported data.",
      },
      {
        type: "h2",
        text: "Additionality: Why These Credits Are Real",
      },
      {
        type: "p",
        text: "Additionality is the carbon market's most contested concept: would the emission reduction have happened without the carbon credit revenue? For our enrolled farmers, the answer is demonstrably yes. Smallholder farmers in the Western, Northern, and Volta regions of Ghana face intense pressure to clear land for charcoal production — a primary income source when crop prices fall. The carbon credit income replaces that incentive. Without it, tree cover would be lost.",
      },
      {
        type: "h2",
        text: "Permanence and Our Risk Buffer",
      },
      {
        type: "list",
        items: [
          "5% of issued credits are held in a buffer pool to cover reversal events (e.g., fire, drought).",
          "Multi-year farmer contracts with exit penalties protect permanence.",
          "Annual re-enrollment rate of 94% — the highest in-class signal of farmer commitment.",
          "Legal framework spanning Ghana, India, Nigeria, and UAE/DIFC ensures multi-jurisdictional enforceability.",
        ],
      },
      {
        type: "quote",
        text: "When an institutional investor asks us to prove our impact, we hand them 47,000 names, plot coordinates, and a satellite time-series. Most carbon projects cannot come close to that.",
        attribution: "— Vijay Palat, CSSO",
      },
    ],
  },
  {
    id: "4",
    slug: "economic-case-carbon-farming-ghana",
    kind: "article",
    template: "standard",
    title: "The Economic Case for Carbon Farming in Ghana",
    excerpt:
      "Ghana's agricultural sector employs over 40% of the workforce, yet average farm incomes remain below $1,500 per year. Carbon farming is not a charity — it is the most compelling economic upgrade available to smallholder farmers today.",
    coverColor: "#ca8a04",
    author: {
      name: "William Osei Agyemang",
      role: "Chief Finance Officer",
      bgPos: "50% 6%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Finance", "Ghana", "Impact"],
    publishedAt: "Feb 28, 2026",
    readTime: 5,
    content: [
      {
        type: "p",
        text: "Ghana's 3.5 million smallholder farmers produce 70% of the country's food supply. Yet per capita farm income has stagnated at around $1,200–$1,500 per year across most of the Northern, Volta, and Western regions. The challenge is structural: small plot sizes (typically 1–5 hectares), limited market access, price volatility for staple crops, and no mechanism to be paid for the environmental services their land already provides.",
      },
      {
        type: "h2",
        text: "Carbon Income as a Structural Supplement",
      },
      {
        type: "p",
        text: "A enrolled SikaFields farmer with 2 hectares of agroforestry plots can generate 8–15 carbon credits per year, depending on tree species, spacing, and soil type. At current market prices of $22–$26 per credit (ex-farm, after our fee structure), that represents $176–$390 per year in supplemental income. Across a portfolio of 5 hectares, the range rises to $440–$975. On top of existing crop income, this is transformative.",
      },
      {
        type: "h2",
        text: "The Capital-Efficient Model",
      },
      {
        type: "list",
        items: [
          "No upfront capital required from farmers — SikaFields funds enrollment, MRV, and credit issuance.",
          "No land-use change required — farmers continue growing food crops alongside carbon-sequestering trees.",
          "Payment via mobile money (MTN MoMo, Vodafone Cash) — accessible to 93% of enrolled farmers.",
          "Carbon income is independent of crop price cycles — a natural hedge for farm households.",
        ],
      },
      {
        type: "quote",
        text: "Our economic model is designed so that a farmer who earns nothing from carbon in year one still earns enough in years two and three to fund their children's secondary school education.",
        attribution: "— William Osei Agyemang, CFO",
      },
      {
        type: "p",
        text: "At the portfolio level, we are now carrying a 2.1x coverage ratio on our current carbon receivables. Working capital is fully funded through Q4 2026, and we have engaged two development finance institutions for a blended finance tranche to support expansion into Nigeria and Kenya. The economics work — not just for farmers, but for institutional investors seeking inflation-linked, ESG-verified returns.",
      },
    ],
  },
  {
    id: "5",
    slug: "sikafields-q1-2026-47000-farmers-enrolled",
    kind: "news",
    template: "standard",
    newsCategory: "announcement",
    title: "SikaFields Reaches 47,000+ Enrolled Farmers — Q1 2026 Milestone",
    excerpt:
      "SikaFields has crossed 47,000 enrolled smallholder farmers across Ghana and India, marking our largest quarterly growth milestone to date and keeping us on track for 100,000 enrollments by end of 2027.",
    coverColor: "#16a34a",
    author: {
      name: "Charlotte Owusu-Ansah",
      role: "Chief Talent & Administrative Officer",
      bgPos: "0% 82%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Announcement", "Growth", "Farmers"],
    publishedAt: "Mar 19, 2026",
    readTime: 3,
    featured: false,
    content: [
      {
        type: "p",
        text: "We are pleased to confirm that SikaFields has reached 47,000 enrolled smallholder farmers as of the close of Q1 2026. This milestone represents a 31% year-on-year increase and confirms that our model scales without compromising the data integrity that underpins every credit we issue.",
      },
      {
        type: "h2",
        text: "Q1 2026 By the Numbers",
      },
      {
        type: "list",
        items: [
          "47,000+ total enrolled farmers (Ghana: 39,000 / India: 8,000)",
          "127 community field coordinators trained and active",
          "94% annual re-enrollment rate — no change from prior year",
          "340 anomalous NDVI plots identified and investigated",
          "Satellite validation accuracy: 98.7% across all enrolled plots",
        ],
      },
      {
        type: "h2",
        text: "India Expansion Update",
      },
      {
        type: "p",
        text: "Our India operations, led from New Delhi and focused on Rajasthan and Maharashtra, reached 8,000 enrolled farmers in Q1 — three months ahead of our internal target. We are partnering with Farmer Producer Organisations (FPOs) in both states for bulk enrollment in Q2 and Q3. Three state-level carbon programs are in active enrollment phase.",
      },
      {
        type: "quote",
        text: "Our field coordinators are the backbone of this program. Their work in some of the most rural and remote communities is what makes these numbers real.",
        attribution: "— Charlotte Owusu-Ansah, CTAO",
      },
    ],
  },
  {
    id: "6",
    slug: "difc-registration-institutional-investor-access",
    kind: "news",
    template: "standard",
    newsCategory: "announcement",
    title: "DIFC Registration Unlocks Institutional Investor Access — Series A Update",
    excerpt:
      "SikaFields' DIFC holding company structure has cleared lead investor due diligence with no material issues raised. We explain what the DIFC registration means for institutional buyers of both carbon credits and equity.",
    coverColor: "#0891b2",
    author: {
      name: "William Osei Agyemang",
      role: "Chief Finance Officer",
      bgPos: "50% 6%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Finance", "Regulatory", "Announcement"],
    publishedAt: "Mar 17, 2026",
    readTime: 4,
    content: [
      {
        type: "p",
        text: "SikaFields is incorporated as a holding company under the Dubai International Financial Centre (DIFC), with subsidiary entities in Ghana, India, Nigeria, and the Netherlands. The DIFC structure was selected for three reasons: regulatory credibility with GCC sovereign wealth funds and European family offices, access to the DIFC Courts for contract enforcement, and the centre's favourable treatment of carbon credit receivables as financial instruments.",
      },
      {
        type: "h2",
        text: "Series A Progress",
      },
      {
        type: "p",
        text: "Lead investor due diligence on our DIFC structure completed last week with no material issues raised. We are carrying a 2.1x coverage ratio on current carbon receivables and working capital is fully funded through Q4 2026. Two development finance institutions have been engaged for a blended finance tranche, with term sheets expected by end of April.",
      },
      {
        type: "h2",
        text: "What This Means for Carbon Credit Buyers",
      },
      {
        type: "list",
        items: [
          "DIFC-registered counterparty on all offtake agreements — enforceable under DIFC Courts.",
          "Credits can be denominated and settled in USD, EUR, or AED.",
          "Access to DIFC's regulated carbon market infrastructure as it matures.",
          "Full TCFD and GRI 305 disclosure support for buyers' ESG reporting.",
        ],
      },
      {
        type: "quote",
        text: "The DIFC structure is not just about access to Gulf capital — it is about giving institutional buyers the counterparty they need to write a large check with confidence.",
        attribution: "— William Osei Agyemang, CFO",
      },
    ],
  },
  {
    id: "7",
    slug: "carbon-credit-prices-q1-2026-market-update",
    kind: "news",
    template: "standard",
    newsCategory: "market",
    title: "Carbon Credit Prices Rise 14% in Q1 2026: What It Means for Farmers",
    excerpt:
      "REDD+ and VCS carbon credit prices moved up 14% in Q1 2026 on renewed demand from European compliance buyers. SikaFields' Ghana pilots are generating verified offsets at $24/tonne — above our $18 underwriting assumption.",
    coverColor: "#b45309",
    author: {
      name: "Daniel Asare-Kyei",
      role: "CEO",
      bgPos: "0% 6%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Market", "Carbon Prices", "Ghana"],
    publishedAt: "Mar 12, 2026",
    readTime: 3,
    content: [
      {
        type: "p",
        text: "The voluntary carbon market opened Q1 2026 with its strongest quarter since 2022. REDD+ pricing moved up 14% quarter-on-quarter, driven by three converging forces: accelerating EU CBAM (Carbon Border Adjustment Mechanism) implementation, renewed net-zero commitments from Japanese and Korean conglomerates, and supply constraints from delayed project registrations across the Amazon basin.",
      },
      {
        type: "h2",
        text: "What It Means for SikaFields Farmers",
      },
      {
        type: "p",
        text: "Our Ghana farm pilots are generating verified offsets at $24 per tonne ex-farm — 33% above our underwriting assumption of $18. The additional margin strengthens our ability to pay farmers a higher per-credit price at next disbursement and to fund the expansion of our Q3 enrollment pipeline (12,000 additional hectares in Ghana's Northern Region, on track).",
      },
      {
        type: "h2",
        text: "Outlook for Q2 2026",
      },
      {
        type: "list",
        items: [
          "Demand from European compliance buyers expected to remain elevated through CBAM phase-in.",
          "New supply from Africa likely to be absorbed by ESG-first buyers seeking co-benefits premiums.",
          "SikaFields' Verra PDD review in April could unlock an additional 8,000 credits for market.",
          "India pilots entering first verification cycle — first India credits expected Q3.",
        ],
      },
    ],
  },
  // ── Dr. Kwame Ofosu Debrah articles ─────────────────────────────────────────
  {
    id: "8",
    slug: "why-africa-is-the-future-of-carbon-removal",
    kind: "article",
    template: "hero",
    title: "Why Africa Is the Future of Carbon Removal",
    excerpt:
      "Africa is uniquely positioned to lead the next generation of carbon removal — but unlocking that potential requires infrastructure, access, and trust.",
    coverImage: "/hero-farmers.jpg",
    coverColor: "#16a34a",
    author: {
      name: "Dr. Kwame Ofosu Debrah",
      role: "Chief Technology Officer",
      bgPos: "center 10%",
      bgSize: "cover",
      imgFile: "dr-kwame",
    },
    tags: ["Africa", "Carbon Markets", "Impact"],
    publishedAt: "Mar 19, 2026",
    readTime: 5,
    featured: false,
    content: [
      {
        type: "p",
        text: "Africa holds more than 60% of the world's uncultivated arable land — an untapped resource with the potential to become one of the most powerful carbon sinks on the planet. From large-scale reforestation to regenerative agriculture, the continent offers natural, scalable solutions to remove carbon while restoring ecosystems.",
      },
      {
        type: "p",
        text: "Yet despite this potential, Africa remains significantly underrepresented in global carbon markets. Most carbon finance flows to projects in developed regions, leaving smallholder farmers — who are already practising low-impact, nature-based farming — excluded from the economic upside.",
      },
      {
        type: "quote",
        text: "This is not a resource problem. It is an access and infrastructure problem.",
        attribution: "— Dr. Kwame Ofosu Debrah, CTO",
      },
      {
        type: "h2",
        text: "How SikaFields Closes the Gap",
      },
      {
        type: "list",
        items: [
          "Enabling smallholder farmers to participate in carbon markets with zero upfront capital.",
          "Connecting projects directly to global ESG buyers through our DIFC-registered holding structure.",
          "Providing transparent, traceable carbon credit generation powered by satellite MRV and blockchain anchoring.",
        ],
      },
      {
        type: "p",
        text: "By aligning climate finance with local communities, SikaFields transforms carbon removal into a scalable economic opportunity. This is more than climate action. It is a shift toward inclusive climate economics — where those restoring the planet are directly rewarded for their contribution.",
      },
    ],
  },
  {
    id: "9",
    slug: "regenerative-agriculture-more-than-just-farming",
    kind: "article",
    template: "visual",
    title: "Regenerative Agriculture: More Than Just Farming",
    excerpt:
      "Regenerative agriculture is not just sustainable — it is one of the most effective and scalable tools for carbon removal available today.",
    coverImage: "/about-farming.jpg",
    coverColor: "#15803d",
    author: {
      name: "Dr. Kwame Ofosu Debrah",
      role: "Chief Technology Officer",
      bgPos: "center 10%",
      bgSize: "cover",
      imgFile: "dr-kwame",
    },
    tags: ["Regenerative Agriculture", "Technology", "Farmers"],
    publishedAt: "Mar 18, 2026",
    readTime: 5,
    content: [
      {
        type: "p",
        text: "Modern agriculture has degraded soil, reduced biodiversity, and contributed significantly to global emissions. Regenerative agriculture offers a fundamentally different model — one that restores rather than extracts. It focuses on rebuilding soil health, improving water retention, and increasing ecosystem resilience.",
      },
      {
        type: "h2",
        text: "Core Practices",
      },
      {
        type: "list",
        items: [
          "Cover cropping to protect and enrich soil between planting cycles.",
          "Reduced or zero tillage to preserve existing soil carbon stores.",
          "Agroforestry to integrate productive trees into farming systems, increasing carbon storage per hectare.",
        ],
      },
      {
        type: "p",
        text: "These practices do more than improve yields. They turn farmland into active carbon sinks — capturing and storing atmospheric carbon in soil and biomass over multi-decade timescales. A single hectare of well-managed agroforestry can sequester between 2 and 9 tonnes of CO₂ per year, depending on species mix and climate zone.",
      },
      {
        type: "h2",
        text: "From Necessity to Opportunity",
      },
      {
        type: "p",
        text: "The challenge is not adoption — it's incentivisation and monetisation. Farmers who already practise low-input farming have little financial reason to invest in the additional steps needed to generate verifiable carbon. SikaFields bridges this gap by enabling farmers to measure and track their carbon impact, convert sustainable practices into verified carbon credits, and access new income streams through global markets. Regenerative agriculture becomes not just environmentally necessary — but economically viable.",
      },
      {
        type: "quote",
        text: "The farmer who plants a tree today is funding a carbon credit that will be sold three years from now. That time gap is the problem we solve.",
        attribution: "— Dr. Kwame Ofosu Debrah, CTO",
      },
    ],
  },
  {
    id: "10",
    slug: "blockchain-carbon-credit-transparency",
    kind: "article",
    template: "hero",
    title: "The Role of Blockchain in Carbon Credit Transparency",
    excerpt:
      "Trust is the biggest challenge in carbon markets. Blockchain is how you solve it — turning unverifiable claims into immutable, auditable proof.",
    coverImage: "/hero-carbon.png",
    coverColor: "#7c3aed",
    author: {
      name: "Dr. Kwame Ofosu Debrah",
      role: "Chief Technology Officer",
      bgPos: "center 10%",
      bgSize: "cover",
      imgFile: "dr-kwame",
    },
    tags: ["Technology", "Blockchain", "MRV"],
    publishedAt: "Mar 16, 2026",
    readTime: 5,
    content: [
      {
        type: "p",
        text: "Carbon markets have long struggled with credibility. Issues such as double-counting, unverifiable claims, and lack of traceability have undermined confidence among buyers and regulators alike. Without trust, the market cannot scale. And without scale, it cannot deliver the climate impact the world requires.",
      },
      {
        type: "h2",
        text: "What Blockchain Changes",
      },
      {
        type: "p",
        text: "Blockchain technology introduces a new standard of accountability by enabling immutable records that cannot be altered after creation, end-to-end traceability of each individual credit from farm to buyer, and transparent transactions visible to all authorised stakeholders — including regulators and auditors.",
      },
      {
        type: "h2",
        text: "SikaFields' Implementation",
      },
      {
        type: "p",
        text: "At SikaFields, blockchain is not a buzzword — it is core infrastructure. We anchor each credit issuance to a verifiable on-chain record, ensuring that each carbon credit is uniquely issued and cannot be duplicated or retired twice. Buyers can trace credits back to specific farms and specific plots. Farmers receive a transparent payment record they can verify independently.",
      },
      {
        type: "list",
        items: [
          "Each credit carries a unique hash tied to its MRV dataset — satellite images, soil samples, field-agent timestamps.",
          "Credit retirement is recorded on-chain, eliminating double-counting across registries.",
          "Buyers receive a verifiable chain of custody — from field to credit certificate.",
        ],
      },
      {
        type: "quote",
        text: "The result is a system where trust is not assumed — it is verifiable by design.",
        attribution: "— Dr. Kwame Ofosu Debrah, CTO",
      },
    ],
  },
  {
    id: "11",
    slug: "empowering-farmers-through-carbon-markets",
    kind: "article",
    template: "visual",
    title: "Empowering Farmers Through Carbon Markets",
    excerpt:
      "Carbon markets can become one of the most powerful financial tools for rural communities — if farmers are genuinely included, not just used as a data source.",
    coverImage: "/hero-farmers.jpg",
    coverColor: "#ca8a04",
    author: {
      name: "Dr. Kwame Ofosu Debrah",
      role: "Chief Technology Officer",
      bgPos: "center 10%",
      bgSize: "cover",
      imgFile: "dr-kwame",
    },
    tags: ["Farmers", "Impact", "Africa"],
    publishedAt: "Mar 14, 2026",
    readTime: 4,
    content: [
      {
        type: "p",
        text: "For smallholder farmers, climate change is not theoretical. It directly affects crop yields, water availability, and long-term livelihoods. Increasingly unpredictable rainfall patterns, prolonged droughts, and soil degradation are tangible daily realities for the 47,000+ farmers enrolled in the SikaFields programme.",
      },
      {
        type: "p",
        text: "Yet these same farmers are among the most important contributors to climate solutions. Their land, their practices, and their stewardship of ecosystems represent some of the highest-potential carbon sinks on earth. The question is whether the global carbon economy is designed to include them.",
      },
      {
        type: "h2",
        text: "How SikaFields Includes Farmers",
      },
      {
        type: "list",
        items: [
          "Registering land and farming activities through a mobile-first enrollment process accessible without a smartphone.",
          "Tracking environmental impact through measurable satellite and ground-truth data — without requiring farmers to manage the process themselves.",
          "Generating and distributing carbon credit revenue directly to farmers via mobile money, within 60 days of credit issuance.",
        ],
      },
      {
        type: "p",
        text: "This creates a new, sustainable income stream — one that rewards climate-positive practices rather than extractive ones. More importantly, it shifts farmers from being passive subjects of climate policy to active participants in climate solutions. They are not data points. They are partners.",
      },
      {
        type: "quote",
        text: "When a farmer in Ghana's Northern Region earns $400 from carbon credits, that is not a statistic. It is a child's school year, a new seed variety, a water pump. That is what climate finance is supposed to do.",
        attribution: "— Dr. Kwame Ofosu Debrah, CTO",
      },
    ],
  },
  {
    id: "12",
    slug: "what-esg-buyers-should-look-for-carbon-credits",
    kind: "article",
    template: "standard",
    title: "What ESG Buyers Should Look for in Carbon Credits",
    excerpt:
      "High-quality carbon credits are defined by integrity, not volume. Here is how institutional buyers can distinguish meaningful impact from greenwashing.",
    coverImage: "/hero-invest.png",
    coverColor: "#0f766e",
    author: {
      name: "Dr. Kwame Ofosu Debrah",
      role: "Chief Technology Officer",
      bgPos: "center 10%",
      bgSize: "cover",
      imgFile: "dr-kwame",
    },
    tags: ["ESG", "Buyers", "Investment"],
    publishedAt: "Mar 11, 2026",
    readTime: 5,
    content: [
      {
        type: "p",
        text: "As demand for carbon offsets grows, so does the risk of low-quality or misleading credits entering the market. For ESG buyers, the challenge is not access — it's selection. The voluntary carbon market is not uniformly reliable. Buyers who fail to apply rigorous selection criteria expose their organisations to reputational risk, regulatory scrutiny, and potential TCFD disclosure failures.",
      },
      {
        type: "h2",
        text: "Key Factors to Prioritise",
      },
      {
        type: "list",
        items: [
          "Verified impact: is the carbon removal backed by credible, third-party-audited data and methodologies?",
          "Transparency: can you trace exactly how each credit was generated, from which farm, using which practice?",
          "Community co-benefits: does the project deliver verified economic and social impact beyond carbon tonnage?",
          "Long-term sustainability: is there a permanence and risk buffer mechanism that protects against reversal events?",
        ],
      },
      {
        type: "h2",
        text: "The SikaFields Standard",
      },
      {
        type: "p",
        text: "SikaFields focuses on delivering high-integrity carbon credits by combining on-the-ground project validation by 127 active field coordinators, transparent satellite-based tracking updated every five days, and direct engagement with farming communities that creates genuine additionality. Every credit we issue is verifiable down to a specific GPS plot and a specific date. That is the standard institutional buyers should demand from any provider.",
      },
      {
        type: "quote",
        text: "High-quality carbon credits are defined by integrity, not volume. Ask your provider to show you the farm.",
        attribution: "— Dr. Kwame Ofosu Debrah, CTO",
      },
    ],
  },
  {
    id: "13",
    slug: "nature-based-vs-tech-based-carbon-removal",
    kind: "article",
    template: "visual",
    title: "Nature-Based vs Tech-Based Carbon Removal",
    excerpt:
      "The future of carbon removal is not a single solution — it is a balance. But today, nature leads. Here is why, and what it means for the market.",
    coverImage: "/hero-carbon.png",
    coverColor: "#0891b2",
    author: {
      name: "Dr. Kwame Ofosu Debrah",
      role: "Chief Technology Officer",
      bgPos: "center 10%",
      bgSize: "cover",
      imgFile: "dr-kwame",
    },
    tags: ["Carbon Markets", "Technology", "Science"],
    publishedAt: "Mar 8, 2026",
    readTime: 6,
    content: [
      {
        type: "p",
        text: "Carbon removal technologies fall into two broad categories: nature-based solutions — reforestation, soil carbon sequestration, wetland restoration — and technology-based solutions such as Direct Air Capture (DAC) and industrial carbon capture and storage. Both have a role. But they are not equivalent, and treating them as such leads to poor policy and poor investment decisions.",
      },
      {
        type: "h2",
        text: "The Technology Argument",
      },
      {
        type: "p",
        text: "Proponents of DAC and industrial CCS point to their permanence and scalability at high volumes. A tonne of CO₂ injected into geological storage is, by most assessments, more permanent than a tonne sequestered in a tree. The challenge is cost and energy. Current DAC costs range from $300 to $1,000 per tonne — compared to $20–$50 for high-quality nature-based credits. At that price differential, tech-based removal cannot lead the near-term market.",
      },
      {
        type: "h2",
        text: "The Nature Case — Today",
      },
      {
        type: "list",
        items: [
          "Immediately deployable at scale — no new technology required.",
          "Cost-effective: $20–$50 per tonne for verified, high-quality credits.",
          "Rich in co-benefits: biodiversity, watershed protection, community economic development.",
          "Broadly verifiable using existing satellite MRV infrastructure.",
        ],
      },
      {
        type: "p",
        text: "SikaFields prioritises nature-based approaches because they deliver impact at scale today, not decades from now. Our agroforestry and cover-cropping methodology is deployable across millions of hectares of African and Indian farmland using existing farming knowledge and practice.",
      },
      {
        type: "h2",
        text: "The Future Is Both",
      },
      {
        type: "p",
        text: "The most effective carbon removal portfolio will combine nature-based projects for immediate, high-volume, cost-effective impact with technology-based projects for long-term, high-permanence removal. But in the present, nature remains the most practical and scalable path forward. Buyers who wait for tech to become affordable risk missing a decade of cost-effective, high-integrity nature-based opportunity.",
      },
      {
        type: "quote",
        text: "We do not have the luxury of waiting for technology to catch up. Nature is ready now.",
        attribution: "— Dr. Kwame Ofosu Debrah, CTO",
      },
    ],
  },
  {
    id: "evt-1",
    slug: "field-day-northern-region-may-2026",
    kind: "event",
    template: "standard",
    title: "Field Day: MRV in the Northern Region",
    excerpt:
      "Spend a day in the field with our MRV team — see soil sampling, satellite ground-truth, and farmer onboarding live across enrolled plots near Tamale.",
    coverColor: "#16a34a",
    author: {
      name: "SikaFields Field Operations",
      role: "Ghana Team",
      bgPos: "0% 6%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Ghana", "MRV", "Farmers"],
    publishedAt: "Apr 10, 2026",
    readTime: 2,
    event: {
      date: "2026-05-22T08:30:00Z",
      endDate: "2026-05-22T15:30:00Z",
      location: "Tamale, Northern Region, Ghana",
      recurrence: "none",
    },
    content: [
      {
        type: "p",
        text: "Walk a working SikaFields plot with the field team. We will demonstrate the full MRV workflow — soil sampling, satellite cross-verification, farmer onboarding, and plot mapping — across our enrolled landscape near Tamale.",
      },
    ],
  },
  {
    id: "evt-2",
    slug: "buyer-briefing-webinar-april-2026",
    kind: "event",
    template: "standard",
    title: "Buyer Briefing: Verra-Aligned Removal Credits From Africa",
    excerpt:
      "A 45-minute live briefing for ESG procurement teams on what makes our African removal credits high-integrity, with live Q&A.",
    coverColor: "#0891b2",
    author: {
      name: "SikaFields Commercial Team",
      role: "Buyer Relations",
      bgPos: "47% 82%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Buyers", "ESG", "Verra"],
    publishedAt: "Mar 28, 2026",
    readTime: 2,
    event: {
      date: "2026-04-23T15:00:00Z",
      endDate: "2026-04-23T15:45:00Z",
      virtualLink: "https://sikafields.com/webinars/buyer-briefing-april-2026",
      recurrence: "none",
    },
    content: [
      {
        type: "p",
        text: "Join our commercial team for a 45-minute walkthrough of our removal-credit pipeline, methodology stack, and offtake terms — followed by open Q&A.",
      },
    ],
  },
  {
    id: "evt-3",
    slug: "weekly-farmer-office-hours",
    kind: "event",
    template: "standard",
    title: "Weekly Farmer Office Hours",
    excerpt:
      "Open call every Thursday for enrolled farmers to ask the field team about plot status, payments, and the next MRV visit.",
    coverColor: "#15803d",
    author: {
      name: "SikaFields Field Operations",
      role: "Ghana Team",
      bgPos: "0% 6%",
      bgSize: "320% 265%",
      imgFile: "leadership-team",
    },
    tags: ["Farmers", "Ghana"],
    publishedAt: "Apr 02, 2026",
    readTime: 1,
    event: {
      date: "2026-04-30T13:00:00Z",
      endDate: "2026-04-30T14:00:00Z",
      virtualLink: "https://sikafields.com/office-hours",
      recurrence: "weekly",
      recurrenceEnd: "2026-12-31T14:00:00Z",
    },
    content: [
      {
        type: "p",
        text: "Drop in any Thursday afternoon. The field team answers live questions on plot status, payments, MRV visits, and onboarding timelines.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(current: Article, count = 3): Article[] {
  return ARTICLES.filter(
    (a) =>
      a.id !== current.id &&
      a.tags.some((t) => current.tags.includes(t))
  )
    .slice(0, count)
    .concat(
      ARTICLES.filter(
        (a) =>
          a.id !== current.id &&
          !a.tags.some((t) => current.tags.includes(t))
      ).slice(0, Math.max(0, count - ARTICLES.filter((a) => a.id !== current.id && a.tags.some((t) => current.tags.includes(t))).length))
    )
    .slice(0, count);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  ARTICLES.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet);
}
