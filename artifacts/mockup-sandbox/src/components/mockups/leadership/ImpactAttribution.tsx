import { useState } from "react";

const METRICS = [
  {
    id: "m1",
    category: "Farmer Reach",
    value: "47,000+",
    label: "Smallholder farmers enrolled",
    sub: "Across Ghana, Kenya, India & Nigeria — with 94% annual re-enrollment",
    color: "#16a34a",
    bg: "from-[#f0faf4] to-white",
    accent: "#bbf7d0",
    owners: [
      { name: "Daniel Asare-Kyei", suffix: "PhD", role: "CEO · strategy & vision", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership", credential: "PhD Environmental Science" },
      { name: "Charlotte Owusu-Ansah", suffix: "", role: "CTAO · field operations", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership", credential: "HR Leadership" },
    ],
  },
  {
    id: "m2",
    category: "Climate Impact",
    value: "2.3M",
    label: "Tonnes CO₂ sequestered",
    sub: "VCS + CCB verified by Verra — retiring credits with full chain-of-custody",
    color: "#0f766e",
    bg: "from-[#f0fdfa] to-white",
    accent: "#99f6e4",
    owners: [
      { name: "Valentijn Venus", suffix: "", role: "CPRO · MRV design", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership", credential: "MSc Environmental Economics" },
      { name: "Vijay Palat", suffix: "", role: "CSSO · ESG framework", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership", credential: "ESG Strategy Expert" },
    ],
  },
  {
    id: "m3",
    category: "Scientific Accuracy",
    value: "98.7%",
    label: "MRV satellite validation accuracy",
    sub: "Q1 2026 pass — ±2.3% of direct measurement across all enrolled plots",
    color: "#7c3aed",
    bg: "from-[#faf5ff] to-white",
    accent: "#e9d5ff",
    owners: [
      { name: "Valentijn Venus", suffix: "", role: "CPRO · measurement", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership", credential: "MSc Environmental Economics" },
      { name: "Dr. Cheryl Sterling", suffix: "", role: "Policy Advisor · peer review", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory", credential: "Doctorate — Policy Research" },
    ],
  },
  {
    id: "m4",
    category: "Capital Raised",
    value: "$12M+",
    label: "Across development finance & impact investors",
    sub: "Blended finance structure combining grants, equity, and carbon receivables",
    color: "#ca8a04",
    bg: "from-[#fefce8] to-white",
    accent: "#fde68a",
    owners: [
      { name: "William Osei Agyemang", suffix: "", role: "CFO · capital structuring", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership", credential: "ACCA Certified" },
      { name: "Derrick Adu Gyamfi", suffix: "", role: "Capital Advisor · investor relations", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory", credential: "Capital Markets & Finance" },
    ],
  },
  {
    id: "m5",
    category: "Regulatory Status",
    value: "DIFC",
    label: "Regulated holding entity",
    sub: "Dubai International Financial Centre — unlocking institutional-grade investor access globally",
    color: "#0891b2",
    bg: "from-[#f0f9ff] to-white",
    accent: "#bae6fd",
    owners: [
      { name: "Vijay Palat", suffix: "", role: "CSSO · compliance", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership", credential: "ESG Strategy Expert" },
      { name: "Nana Ama Boateng-Kagyah", suffix: "", role: "Legal Advisor · entity structure", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory", credential: "Legal & Compliance" },
    ],
  },
  {
    id: "m6",
    category: "Farmer Retention",
    value: "94%",
    label: "Annual re-enrollment rate",
    sub: "The highest trust signal in the industry — farmers choose to stay, year after year",
    color: "#db2777",
    bg: "from-[#fff0f8] to-white",
    accent: "#fbcfe8",
    owners: [
      { name: "Charlotte Owusu-Ansah", suffix: "", role: "CTAO · farmer relations", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership", credential: "HR Leadership" },
      { name: "Festus William Amoyaw", suffix: "", role: "Agribiz Advisor · community trust", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory", credential: "Agribusiness Development" },
    ],
  },
];

export function ImpactAttribution() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white font-['Inter'] flex flex-col">
      <div className="px-8 pt-8 pb-4 border-b border-[#f0f7f2]">
        <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Impact Attribution</p>
        <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">Numbers That Have Owners</h2>
        <p className="text-[#5a7a65] text-sm mt-1.5">Every metric we publish has a named team member accountable for it. Click any card to see who.</p>
      </div>

      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-3 gap-4">
          {METRICS.map((m) => {
            const isOpen = expanded === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setExpanded(isOpen ? null : m.id)}
                className={`rounded-2xl border cursor-pointer transition-all overflow-hidden bg-gradient-to-b ${m.bg}`}
                style={{ borderColor: isOpen ? m.color : m.accent }}
              >
                <div className="p-5">
                  {/* Category */}
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 inline-block" style={{ color: m.color, backgroundColor: `${m.color}15` }}>
                    {m.category}
                  </span>

                  {/* Value */}
                  <p className="font-black text-[#0d1f12] text-4xl font-['Sora'] leading-none mb-1">{m.value}</p>
                  <p className="text-[#0d1f12] font-bold text-sm mb-1.5">{m.label}</p>
                  <p className="text-[#5a7a65] text-xs leading-relaxed">{m.sub}</p>

                  {/* Compact owner previews */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {m.owners.map((o, oi) => (
                        <div
                          key={oi}
                          className="w-7 h-7 rounded-full border-2 border-white"
                          style={{
                            backgroundImage: `url('/__mockup/images/${o.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                            backgroundSize: o.bgSize,
                            backgroundPosition: o.bgPos,
                            backgroundRepeat: "no-repeat",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#8fa89a] font-medium">{isOpen ? "Hide" : "See"} accountable owners</span>
                    <svg className="w-3 h-3 text-[#8fa89a] ml-auto transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "none" }} viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded owners */}
                {isOpen && (
                  <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: m.accent, backgroundColor: `${m.color}06` }}>
                    {m.owners.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl shrink-0"
                          style={{
                            backgroundImage: `url('/__mockup/images/${o.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                            backgroundSize: o.bgSize,
                            backgroundPosition: o.bgPos,
                            backgroundRepeat: "no-repeat",
                            outline: `2px solid ${m.color}50`,
                            outlineOffset: "2px",
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-[#0d1f12] text-xs font-black leading-tight">
                            {o.name}{o.suffix && <sup className="text-[9px] ml-0.5" style={{ color: m.color }}>{o.suffix}</sup>}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: m.color }}>{o.role}</p>
                          <p className="text-[#8fa89a] text-[9px]">{o.credential}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
