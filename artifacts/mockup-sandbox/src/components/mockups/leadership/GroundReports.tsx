const REPORTS = [
  {
    territory: "Ghana",
    flag: "🇬🇭",
    region: "West Africa — Primary Hub",
    color: "#16a34a",
    bg: "#f0faf4",
    border: "#bbf7d0",
    headline: "The engine room. Where every carbon farm starts.",
    updates: [
      "47,000+ farmers enrolled across the Western, Northern, and Volta regions",
      "127 community field coordinators trained in Q1 2026",
      "Farm-level MRV audits running every 90 days with satellite + ground-truth checks",
    ],
    team: [
      { name: "Daniel Asare-Kyei", suffix: "PhD", role: "CEO", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership", focus: "Farmer policy & carbon markets" },
      { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership", focus: "Capital & financial reporting" },
      { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership", focus: "Field operations & talent" },
      { name: "Derrick Adu Gyamfi", role: "Advisor", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory", focus: "Capital markets guidance" },
      { name: "Festus W. Amoyaw", role: "Advisor", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory", focus: "Agribusiness & rural dev." },
      { name: "Nana Ama Boateng-Kagyah", role: "Advisor", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory", focus: "Legal & compliance" },
    ],
    suffix: "",
  },
  {
    territory: "India",
    flag: "🇮🇳",
    region: "South Asia — Growth Market",
    color: "#ca8a04",
    bg: "#fffbeb",
    border: "#fde68a",
    headline: "Expanding into South Asia's 100M+ smallholder farmer base.",
    updates: [
      "8,000+ farmers enrolled across Rajasthan and Maharashtra",
      "3 state-level carbon programs in active enrollment phase",
      "Partnering with FPOs (Farmer Producer Organisations) for bulk onboarding",
    ],
    team: [
      { name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership", focus: "Strategy & ESG framework" },
    ],
    suffix: "",
  },
  {
    territory: "UAE — DIFC",
    flag: "🇦🇪",
    region: "Gulf — Holding & Finance",
    color: "#0891b2",
    bg: "#f0f9ff",
    border: "#bae6fd",
    headline: "The DIFC entity that opens institutional investor doors globally.",
    updates: [
      "DIFC holding company incorporated 2021 — full regulatory compliance",
      "Series A investor due diligence completed Q1 2026 — no material issues",
      "Blended finance structure combining grants, equity, and carbon receivables",
    ],
    team: [
      { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership", focus: "DIFC entity management" },
      { name: "Olubgenga O. Awe", role: "Trade Advisor", bgPos: "100% 90%", bgSize: "320% 340%", img: "advisory", focus: "Structured trade finance" },
    ],
    suffix: "",
  },
  {
    territory: "Netherlands",
    flag: "🇳🇱",
    region: "Europe — Science & Product",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#e9d5ff",
    headline: "Where the science gets done and every credit gets verified.",
    updates: [
      "MRV algorithm v3.1 deployed — ±2.3% of direct measurement",
      "Verra PDD review scheduled April 2026 for updated methodology",
      "Satellite validation pass Q1: 98.7% accuracy across all plots",
    ],
    team: [
      { name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership", focus: "MRV & product strategy" },
      { name: "Dr. Cheryl Sterling", role: "Advisor", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory", focus: "Policy research & ESG" },
    ],
    suffix: "",
  },
];

export function GroundReports() {
  return (
    <div className="min-h-screen bg-[#f8faf8] font-['Inter'] flex flex-col">
      <div className="px-8 pt-8 pb-4">
        <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Ground Reports</p>
        <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">What's Actually Happening, Territory by Territory</h2>
        <p className="text-[#5a7a65] text-sm mt-1.5">Operations across 4 countries. Named team members accountable for each.</p>
      </div>

      <div className="flex-1 px-8 pb-8 grid grid-cols-2 gap-4">
        {REPORTS.map((r, ri) => {
          const isLarge = ri === 0;
          return (
            <div
              key={r.territory}
              className={`rounded-2xl border bg-white overflow-hidden flex flex-col ${isLarge ? "row-span-2" : ""}`}
              style={{ borderColor: r.border }}
            >
              {/* Header strip */}
              <div className="p-5 pb-4 border-b" style={{ borderColor: r.border, backgroundColor: r.bg }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{r.flag}</span>
                    <div>
                      <p className="font-black text-[#0d1f12] text-base font-['Sora']">{r.territory}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: r.color }}>{r.region}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black rounded-full px-2.5 py-1" style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                    {r.team.length} {r.team.length === 1 ? "person" : "people"}
                  </span>
                </div>
                <p className="text-[#0d1f12] font-semibold text-sm leading-snug">{r.headline}</p>
              </div>

              {/* Updates */}
              <div className="px-5 pt-4 pb-2 flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8fa89a] mb-2.5">On the Ground</p>
                <ul className="space-y-2">
                  {r.updates.map((u, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[#5a7a65] leading-relaxed">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Team members */}
              <div className="px-5 pb-5 pt-3 border-t" style={{ borderColor: r.border }}>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8fa89a] mb-2.5">Team Present</p>
                <div className="space-y-2.5">
                  {r.team.map((m, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg shrink-0"
                        style={{
                          backgroundImage: `url('/__mockup/images/${m.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                          backgroundSize: m.bgSize,
                          backgroundPosition: m.bgPos,
                          backgroundRepeat: "no-repeat",
                          outline: `2px solid ${r.color}40`,
                          outlineOffset: "1px",
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-[#0d1f12] text-[11px] font-bold truncate leading-tight">
                          {m.name.split(" ").slice(0, 2).join(" ")}
                          {(m as any).suffix && <sup className="text-[9px] ml-0.5" style={{ color: r.color }}>{(m as any).suffix}</sup>}
                        </p>
                        <p className="text-[10px] text-[#8fa89a] truncate">{m.role} · {m.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
