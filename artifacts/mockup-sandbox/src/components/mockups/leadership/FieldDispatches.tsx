const DISPATCHES = [
  {
    id: "ceo",
    from: "Daniel Asare-Kyei",
    suffix: "PhD",
    role: "CEO",
    bgPos: "0% 6%",
    bgSize: "320% 265%",
    img: "leadership",
    color: "#16a34a",
    domain: "Carbon Markets",
    date: "Mar 19, 2026",
    subject: "Carbon Market Update — Q1 2026",
    body: "REDD+ pricing moved up 14% this quarter on renewed demand from European compliance buyers. Our Ghana farm pilots are now generating verified offsets at $24/tonne ex-farm — above our underwriting assumption of $18. The pipeline for additional 12,000 hectares in the Northern Region is on track for Q3 enrollment. DIFC registration is opening institutional conversations we couldn't have 18 months ago.",
    tag: "Market Intel",
    tagColor: "#16a34a",
  },
  {
    id: "cfo",
    from: "William Osei Agyemang",
    suffix: "",
    role: "CFO",
    bgPos: "50% 6%",
    bgSize: "320% 265%",
    img: "leadership",
    color: "#ca8a04",
    domain: "Finance & Capital",
    date: "Mar 17, 2026",
    subject: "Capital Structure Note — Series A Progress",
    body: "The Series A close is progressing well. Lead investor due diligence on our DIFC structure completed last week — no material issues raised. We're carrying a 2.1x coverage ratio on our current carbon receivables. Working capital is fully funded through Q4. I've engaged two development finance institutions for the blended finance tranche; term sheets expected by end of April.",
    tag: "Finance",
    tagColor: "#ca8a04",
  },
  {
    id: "cpro",
    from: "Valentijn Venus",
    suffix: "",
    role: "CPRO",
    bgPos: "100% 6%",
    bgSize: "320% 265%",
    img: "leadership",
    color: "#7c3aed",
    domain: "MRV & Research",
    date: "Mar 15, 2026",
    subject: "MRV Field Report — Q1 Satellite Validation",
    body: "Latest satellite validation pass confirms 98.7% accuracy across all 47,000 enrolled plots. We identified 340 plots with anomalous NDVI readings — field teams have been dispatched. Our new soil carbon algorithm (v3.1) is performing within ±2.3% of direct measurement in the Ghana pilot. This is the tightest variance we've achieved. Verra review of our updated PDD is scheduled for April 8.",
    tag: "Science",
    tagColor: "#7c3aed",
  },
  {
    id: "ctao",
    from: "Charlotte Owusu-Ansah",
    suffix: "",
    role: "CTAO",
    bgPos: "0% 82%",
    bgSize: "320% 265%",
    img: "leadership",
    color: "#db2777",
    domain: "Operations & Talent",
    date: "Mar 14, 2026",
    subject: "Ops Dispatch — Q1 Field Coordinator Training Complete",
    body: "127 community field coordinators across Ghana and India completed the updated enrollment protocol training. Completion rate: 94%. We've promoted 12 coordinators to senior field agent roles — all internal promotions. The WhatsApp-based farmer communication system now covers 89% of enrolled farmers with weekly carbon balance updates in local languages. Farmer satisfaction scores sit at 4.6/5.",
    tag: "Operations",
    tagColor: "#db2777",
  },
  {
    id: "csso",
    from: "Vijay Palat",
    suffix: "",
    role: "CSSO",
    bgPos: "47% 82%",
    bgSize: "320% 265%",
    img: "leadership",
    color: "#0f766e",
    domain: "ESG & Sustainability",
    date: "Mar 12, 2026",
    subject: "ESG Briefing — Paris Alignment Confirmed",
    body: "Third-party assessment of our portfolio confirms full alignment with Paris Agreement 1.5°C pathway. We've completed our first TCFD disclosure — no material climate risks identified in the operating model. GRI 305-1 and 305-2 reporting is filed. SDG alignment mapping covers SDGs 1, 2, 13, 15, and 17. I'm presenting our impact thesis at the IFC Climate Finance Summit in April.",
    tag: "ESG",
    tagColor: "#0f766e",
  },
];

export function FieldDispatches() {
  return (
    <div className="min-h-screen bg-[#f5f7f5] font-['Inter'] flex flex-col">
      {/* Header — bulletin board notice */}
      <div className="px-8 pt-8 pb-4 flex items-end justify-between">
        <div>
          <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Field Dispatches</p>
          <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">Straight From the People Doing the Work</h2>
          <p className="text-[#5a7a65] text-sm mt-1.5">Our leaders speak in specifics. We believe expertise proves itself through detail, not job titles.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[#8fa89a] text-xs">Last updated</p>
          <p className="text-[#0d1f12] font-bold text-sm">Mar 19, 2026</p>
        </div>
      </div>

      {/* Dispatch cards */}
      <div className="flex-1 px-8 pb-8 space-y-3">
        {DISPATCHES.map((d, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e8f0ec] p-5 hover:border-[#16a34a]/30 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-xl shrink-0 mt-0.5"
                style={{
                  backgroundImage: `url('/__mockup/images/leadership-team.png')`,
                  backgroundSize: d.bgSize,
                  backgroundPosition: d.bgPos,
                  backgroundRepeat: "no-repeat",
                  outline: `2px solid ${d.color}50`,
                  outlineOffset: "2px",
                }}
              />

              {/* Header */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-black text-[#0d1f12] text-sm">
                    {d.from}{d.suffix && <sup className="text-[10px] ml-0.5" style={{ color: d.color }}>{d.suffix}</sup>}
                  </span>
                  <span className="text-[#8fa89a] text-xs">·</span>
                  <span className="text-xs font-semibold" style={{ color: d.color }}>{d.role}</span>
                  <span className="text-[#8fa89a] text-xs">·</span>
                  <span className="text-[#8fa89a] text-xs">{d.date}</span>
                  <span
                    className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ color: d.tagColor, backgroundColor: `${d.tagColor}15` }}
                  >
                    {d.tag}
                  </span>
                </div>

                {/* Subject line */}
                <p className="font-bold text-[#0d1f12] text-sm mb-2">{d.subject}</p>

                {/* Body */}
                <p className="text-[#5a7a65] text-xs leading-relaxed">{d.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
