import { useState } from "react";

const CEO = {
  id: "ceo",
  name: "Daniel Asare-Kyei",
  suffix: "PhD",
  role: "Chief Executive Officer",
  bgPos: "0% 6%",
  credential: "PhD Environmental Science",
  domains: ["Carbon Markets", "Climate Policy", "AgriTech"],
  quote: "Building the bridge between African land and global climate capital.",
  color: "#16a34a",
  ring: 0,
};

const LEADERS = [
  { id: "cfo", name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", credential: "ACCA Certified", domains: ["Finance", "Investment", "African Markets"], quote: "Sound capital structure turns missions into durable businesses.", color: "#0f766e", ring: 1 },
  { id: "cpro", name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", credential: "MSc Env. Economics", domains: ["Product", "Research", "MRV"], quote: "Data integrity is the bedrock of every credit we issue.", color: "#b45309", ring: 1 },
  { id: "ctao", name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", credential: "HR Leadership", domains: ["Talent", "Operations", "Culture"], quote: "Our people are the soil from which our impact grows.", color: "#166534", ring: 1 },
  { id: "csso", name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", credential: "ESG Strategy Expert", domains: ["ESG", "Sustainability", "Policy"], quote: "True sustainability means being here for the next generation.", color: "#0f766e", ring: 1 },
];

const ADVISORS = [
  { id: "a1", name: "Derrick Adu Gyamfi", role: "Advisor", bgPos: "0% 42%", credential: "Capital Markets", domains: ["Markets", "Advisory"], color: "#166534", ring: 2, img: "advisory" },
  { id: "a2", name: "Dr. Cheryl Sterling", role: "Advisor", bgPos: "50% 42%", credential: "Policy Research", domains: ["Policy", "ESG"], color: "#0f766e", ring: 2, img: "advisory" },
  { id: "a3", name: "Festus W. Amoyaw", role: "Advisor", bgPos: "100% 42%", credential: "Agribusiness", domains: ["Agriculture", "Partnerships"], color: "#b45309", ring: 2, img: "advisory" },
  { id: "a4", name: "Nana Ama Boateng-Kagyah", role: "Advisor", bgPos: "0% 90%", credential: "Legal & Compliance", domains: ["Legal", "Governance"], color: "#166534", ring: 2, img: "advisory" },
  { id: "a5", name: "Valentijn Venus", role: "Advisor", bgPos: "50% 90%", credential: "Environmental Econ.", domains: ["Research", "MRV"], color: "#0f766e", ring: 2, img: "advisory" },
  { id: "a6", name: "Olubgenga O. Awe", role: "Advisor", bgPos: "100% 90%", credential: "Trade Finance", domains: ["Finance", "Commodities"], color: "#14532d", ring: 2, img: "advisory" },
];

const ALL = [CEO, ...LEADERS, ...ADVISORS] as any[];

function getPos(ring: number, index: number, total: number, cx: number, cy: number) {
  const radii = [0, 165, 280];
  const r = radii[ring];
  if (ring === 0) return { x: cx, y: cy };
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export function OrgConstellation() {
  const [selected, setSelected] = useState<string | null>(null);
  const cx = 420, cy = 390;
  const leaderPositions = LEADERS.map((p, i) => ({ ...p, ...getPos(1, i, LEADERS.length, cx, cy) }));
  const advisorPositions = ADVISORS.map((p, i) => ({ ...p, ...getPos(2, i, ADVISORS.length, cx, cy) }));
  const ceoPos = { ...CEO, x: cx, y: cy };
  const allPositioned = [ceoPos, ...leaderPositions, ...advisorPositions];
  const selectedPerson = selected ? allPositioned.find(p => p.id === selected) : null;

  return (
    <div className="min-h-screen bg-[#f5f9f6] font-['Inter'] flex flex-col">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-4 w-full">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Org Constellation</p>
            <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">The Team That Backs Every Credit</h2>
          </div>
          <div className="flex gap-4 text-xs text-[#5a7a65] shrink-0 mt-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#16a34a] inline-block" />C-Suite</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#d1fae5] border border-[#86efac] inline-block" />Advisory</span>
          </div>
        </div>
        <p className="text-[#5a7a65] text-sm mb-3">Click any node to see credentials.</p>
      </div>

      <div className="flex-1 flex">
        {/* Constellation SVG */}
        <div className="relative flex-1" style={{ minHeight: "640px" }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
            {/* Orbit rings */}
            <circle cx={cx} cy={cy} r={165} fill="none" stroke="#e2ede7" strokeWidth="1" strokeDasharray="6 4" />
            <circle cx={cx} cy={cy} r={280} fill="none" stroke="#e2ede7" strokeWidth="1" strokeDasharray="6 4" />
            {/* Lines: CEO to C-suite */}
            {leaderPositions.map(p => (
              <line key={p.id} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#86efac" strokeWidth="1.5" opacity="0.6" />
            ))}
            {/* Lines: C-suite to advisors (CEO to advisors) */}
            {advisorPositions.map(p => (
              <line key={p.id} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#bbf7d0" strokeWidth="1" opacity="0.35" />
            ))}
          </svg>

          {/* Nodes */}
          {allPositioned.map((p) => {
            const isCEO = p.ring === 0;
            const isAdvisor = p.ring === 2;
            const isSelected = selected === p.id;
            const size = isCEO ? 90 : isAdvisor ? 52 : 70;
            const imgFile = (p as any).img === "advisory" ? "advisory-board" : "leadership-team";
            const bgSize = isCEO ? "320% 265%" : isAdvisor ? "320% 340%" : "320% 265%";

            return (
              <button
                key={p.id}
                onClick={() => setSelected(s => s === p.id ? null : p.id)}
                className="absolute flex flex-col items-center group"
                style={{
                  left: (p as any).x - size / 2,
                  top: (p as any).y - size / 2,
                  width: size,
                  zIndex: isSelected ? 20 : 10,
                }}
              >
                <div
                  className="rounded-full overflow-hidden transition-all duration-200"
                  style={{
                    width: size,
                    height: size,
                    backgroundImage: `url('/__mockup/images/${imgFile}.png')`,
                    backgroundSize: bgSize,
                    backgroundPosition: (p as any).bgPos,
                    backgroundRepeat: "no-repeat",
                    outline: isSelected ? `3px solid ${p.color}` : isCEO ? "3px solid #16a34a" : "2px solid #d1fae5",
                    outlineOffset: "3px",
                    boxShadow: isSelected ? `0 0 0 6px ${p.color}22` : undefined,
                  }}
                />
                {isCEO && (
                  <span className="mt-1 bg-[#16a34a] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">CEO</span>
                )}
                {!isCEO && (
                  <span className="mt-1 text-[9px] font-bold text-[#166534] bg-white/80 px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.role}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="w-72 bg-white border-l border-[#e8f0ec] flex flex-col">
          {selectedPerson ? (
            <div className="p-6 flex flex-col gap-4 h-full">
              <div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  height: "180px",
                  backgroundImage: `url('/__mockup/images/${(selectedPerson as any).img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                  backgroundSize: selectedPerson.ring === 2 ? "320% 340%" : "320% 265%",
                  backgroundPosition: selectedPerson.bgPos,
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div>
                <p className="font-black text-[#0d1f12] text-base leading-tight">
                  {selectedPerson.name}{(selectedPerson as any).suffix && <sup className="text-[#16a34a] text-[10px] ml-0.5">{(selectedPerson as any).suffix}</sup>}
                </p>
                <p className="text-[#5a7a65] text-xs mt-0.5">{selectedPerson.role}</p>
              </div>
              <div>
                <p className="text-[#16a34a] text-[10px] font-bold uppercase tracking-widest mb-1">Credential</p>
                <p className="text-[#0d1f12] font-semibold text-sm">{selectedPerson.credential}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedPerson.domains?.map((d: string) => (
                  <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f0faf4] text-[#14532d] border border-[#bbf7d0]">{d}</span>
                ))}
              </div>
              {(selectedPerson as any).quote && (
                <p className="text-[#5a7a65] text-xs italic leading-relaxed border-l-2 border-[#86efac] pl-3">"{(selectedPerson as any).quote}"</p>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-full bg-[#f0faf4] flex items-center justify-center mb-3">
                <span className="text-2xl">👆</span>
              </div>
              <p className="text-[#5a7a65] text-sm font-medium">Select any node to see their credentials & expertise</p>
              <div className="mt-6 space-y-2 text-left w-full">
                <div className="flex items-center gap-2 text-xs text-[#5a7a65]"><span className="w-2 h-2 rounded-full bg-[#16a34a]" />5 C-Suite Leaders</div>
                <div className="flex items-center gap-2 text-xs text-[#5a7a65]"><span className="w-2 h-2 rounded-full bg-[#86efac]" />6 Advisory Board Members</div>
                <div className="flex items-center gap-2 text-xs text-[#5a7a65]"><span className="w-2 h-2 rounded-full bg-[#d1fae5]" />DIFC Registered Entity</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
