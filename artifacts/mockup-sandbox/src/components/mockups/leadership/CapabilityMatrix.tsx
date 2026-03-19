import { useState } from "react";

const DOMAINS = [
  "Carbon Markets", "Climate Policy", "Finance", "Investment",
  "Product / MRV", "Research", "ESG Strategy", "Legal", "Agribusiness", "Trade Finance",
];

const TEAM = [
  { name: "Daniel Asare-Kyei", suffix: "PhD", role: "CEO", bgPos: "0% 6%", img: "leadership", coverage: [1,1,0,0,0,1,1,0,1,0], tier: "C-Suite" },
  { name: "William Osei Agyemang", suffix: "", role: "CFO", bgPos: "50% 6%", img: "leadership", coverage: [0,0,1,1,0,0,0,0,0,1], tier: "C-Suite" },
  { name: "Valentijn Venus", suffix: "", role: "CPRO", bgPos: "100% 6%", img: "leadership", coverage: [1,0,0,0,1,1,0,0,0,0], tier: "C-Suite" },
  { name: "Charlotte Owusu-Ansah", suffix: "", role: "CTAO", bgPos: "0% 82%", img: "leadership", coverage: [0,0,0,0,0,0,0,0,0,0], tier: "C-Suite", note: "Talent & Org" },
  { name: "Vijay Palat", suffix: "", role: "CSSO", bgPos: "47% 82%", img: "leadership", coverage: [1,1,0,0,0,0,1,0,0,0], tier: "C-Suite" },
  { name: "Derrick Adu Gyamfi", suffix: "", role: "Advisor", bgPos: "0% 42%", img: "advisory", coverage: [0,0,1,1,0,0,0,0,0,0], tier: "Advisory" },
  { name: "Dr. Cheryl Sterling", suffix: "", role: "Advisor", bgPos: "50% 42%", img: "advisory", coverage: [0,1,0,0,0,1,1,0,0,0], tier: "Advisory" },
  { name: "Festus W. Amoyaw", suffix: "", role: "Advisor", bgPos: "100% 42%", img: "advisory", coverage: [0,0,0,0,0,0,0,0,1,0], tier: "Advisory" },
  { name: "Nana Ama Boateng-Kagyah", suffix: "", role: "Advisor", bgPos: "0% 90%", img: "advisory", coverage: [0,0,0,0,0,0,0,1,0,0], tier: "Advisory" },
  { name: "Valentijn Venus", suffix: "", role: "Advisor", bgPos: "50% 90%", img: "advisory", coverage: [1,0,0,0,1,1,0,0,0,0], tier: "Advisory" },
  { name: "Olubgenga O. Awe", suffix: "", role: "Advisor", bgPos: "100% 90%", img: "advisory", coverage: [0,0,1,0,0,0,0,0,0,1], tier: "Advisory" },
];

const DOMAIN_COLORS = [
  "#16a34a", "#059669", "#ca8a04", "#d97706",
  "#2563eb", "#7c3aed", "#0891b2", "#dc2626",
  "#b45309", "#0f766e",
];

export function CapabilityMatrix() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const domainCoverage = DOMAINS.map((_, di) => TEAM.filter(p => p.coverage[di]).length);
  const domainMax = Math.max(...domainCoverage);

  return (
    <div className="min-h-screen bg-white font-['Inter'] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-[#f0f7f2]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Capability Coverage</p>
            <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">11 People. Every Domain Covered.</h2>
            <p className="text-[#5a7a65] text-sm mt-1">Hover a column to see who covers that domain. Hover a row to see their full coverage.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#0d1f12] text-2xl font-black font-['Sora']">{DOMAINS.length}</p>
            <p className="text-[#5a7a65] text-xs">Domains covered</p>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="flex-1 overflow-auto px-8 py-5">
        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th className="w-44 text-left pb-3 text-xs font-bold text-[#8fa89a] uppercase tracking-widest">Person</th>
              {DOMAINS.map((domain, di) => (
                <th
                  key={di}
                  className="pb-3 text-center cursor-pointer transition-colors"
                  onMouseEnter={() => setHoveredCol(di)}
                  onMouseLeave={() => setHoveredCol(null)}
                  style={{ width: "72px" }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="rounded-lg px-1.5 py-0.5 transition-all"
                      style={{
                        background: hoveredCol === di ? DOMAIN_COLORS[di] : "#f0f7f2",
                        color: hoveredCol === di ? "white" : "#5a7a65",
                      }}
                    >
                      <span className="text-[10px] font-bold whitespace-nowrap">{domain.split(" ")[0]}</span>
                    </div>
                    {/* Coverage bar */}
                    <div className="w-full flex justify-center">
                      <div className="w-8 h-1 rounded-full bg-[#f0f7f2] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(domainCoverage[di] / domainMax) * 100}%`,
                            backgroundColor: DOMAIN_COLORS[di],
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-[#8fa89a] font-semibold">{domainCoverage[di]}/{TEAM.length}</span>
                  </div>
                </th>
              ))}
              <th className="w-16 pb-3 text-center text-[10px] font-bold text-[#8fa89a] uppercase tracking-widest">Score</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((person, pi) => {
              const coverageCount = person.coverage.filter(Boolean).length;
              const isCsuite = person.tier === "C-Suite";
              const isRowHighlighted = hoveredRow === pi;

              return (
                <tr
                  key={pi}
                  className="transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredRow(pi)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ backgroundColor: isRowHighlighted ? "#f0faf4" : pi % 2 === 0 ? "white" : "#fafcfa" }}
                >
                  {/* Person cell */}
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full overflow-hidden shrink-0"
                        style={{
                          backgroundImage: `url('/__mockup/images/${person.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                          backgroundSize: person.img === "advisory" ? "320% 340%" : "320% 265%",
                          backgroundPosition: person.bgPos,
                          backgroundRepeat: "no-repeat",
                          outline: isCsuite ? "2px solid #16a34a" : "2px solid #d1fae5",
                          outlineOffset: "1px",
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-[#0d1f12] text-xs font-bold truncate leading-tight">
                          {person.name.split(" ").slice(0, 2).join(" ")}
                          {person.suffix && <sup className="text-[#16a34a] text-[8px] ml-0.5">{person.suffix}</sup>}
                        </p>
                        <p className="text-[#8fa89a] text-[10px]">{person.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Domain dots */}
                  {DOMAINS.map((_, di) => {
                    const covered = person.coverage[di] === 1;
                    const isColHovered = hoveredCol === di;
                    return (
                      <td key={di} className="py-2 text-center">
                        <div className="flex justify-center">
                          {covered ? (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center transition-transform"
                              style={{
                                backgroundColor: (isColHovered || isRowHighlighted) ? DOMAIN_COLORS[di] : "#bbf7d0",
                                transform: (isColHovered || isRowHighlighted) ? "scale(1.3)" : "scale(1)",
                              }}
                            >
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="white"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: isColHovered ? `${DOMAIN_COLORS[di]}22` : "#f0f7f2" }} />
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Score */}
                  <td className="py-2 text-center">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black"
                      style={{
                        backgroundColor: coverageCount >= 3 ? "#16a34a" : coverageCount >= 2 ? "#86efac" : "#f0faf4",
                        color: coverageCount >= 3 ? "white" : "#166534",
                      }}
                    >
                      {person.note ? "★" : coverageCount}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer bar */}
        <div className="mt-6 flex gap-4 flex-wrap">
          {DOMAINS.map((domain, di) => (
            <div key={di} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[di] }} />
              <span className="text-xs text-[#5a7a65]">{domain} <span className="font-bold text-[#0d1f12]">({domainCoverage[di]})</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
