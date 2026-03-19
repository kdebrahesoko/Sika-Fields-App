const CEO = { name: "Daniel Asare-Kyei", suffix: "PhD", role: "Founder & Chief Executive Officer", bgPos: "0% 6%", credential: "PhD Environmental Science", credentialSub: "Carbon sequestration & climate policy", domains: ["Carbon Markets","Climate Policy","AgriTech"], quote: "Building the bridge between African land and global climate capital.", color: "#16a34a" };

const CSUITE = [
  { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", credential: "ACCA Certified", credentialSub: "15+ yrs investment banking", domains: ["Finance","Investment"], color: "#ca8a04" },
  { name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", credential: "MSc Env. Economics", credentialSub: "MRV & product strategy", domains: ["Product","MRV"], color: "#7c3aed" },
  { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", credential: "HR Leadership", credentialSub: "Org development & talent", domains: ["Talent","Ops"], color: "#db2777" },
  { name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", credential: "ESG Strategy Expert", credentialSub: "18+ yrs sustainability", domains: ["ESG","Policy"], color: "#0f766e" },
];

const ADVISORS = [
  { name: "Derrick Adu Gyamfi", bgPos: "0% 42%", domain: "Capital Markets" },
  { name: "Dr. Cheryl Sterling", bgPos: "50% 42%", domain: "Policy Research" },
  { name: "Festus W. Amoyaw", bgPos: "100% 42%", domain: "Agribusiness" },
  { name: "Nana Ama Boateng-Kagyah", bgPos: "0% 90%", domain: "Legal" },
  { name: "Valentijn Venus", bgPos: "50% 90%", domain: "Env. Economics" },
  { name: "Olubgenga O. Awe", bgPos: "100% 90%", domain: "Trade Finance" },
];

function LaneLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="w-32 shrink-0 flex flex-col justify-center">
      <p className="text-xs font-black uppercase tracking-widest text-[#0d1f12]">{label}</p>
      <p className="text-[10px] text-[#8fa89a] mt-0.5">{count} {count === 1 ? "person" : "people"}</p>
    </div>
  );
}

export function SwimLanes() {
  return (
    <div className="min-h-screen bg-white font-['Inter'] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-[#f0f7f2]">
        <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Our Team</p>
        <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">Leadership Built for Scale</h2>
      </div>

      <div className="flex-1 flex flex-col divide-y divide-[#f0f7f2]">

        {/* Lane 1: CEO */}
        <div className="flex items-stretch px-8 py-6 gap-6 bg-[#fafdf9] hover:bg-[#f0faf4] transition-colors group">
          <LaneLabel label="Chief Executive" count={1} />
          <div className="w-px bg-[#e8f0ec] shrink-0" />
          <div className="flex-1 flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl shrink-0"
              style={{
                backgroundImage: "url('/__mockup/images/leadership-team.png')",
                backgroundSize: "320% 265%",
                backgroundPosition: CEO.bgPos,
                backgroundRepeat: "no-repeat",
                outline: "3px solid #16a34a",
                outlineOffset: "3px",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap mb-1">
                <p className="text-[#0d1f12] font-black text-lg font-['Sora']">
                  {CEO.name} <sup className="text-[#16a34a] text-sm">{CEO.suffix}</sup>
                </p>
                <span className="text-[#5a7a65] text-sm">{CEO.role}</span>
              </div>
              <p className="text-[#16a34a] text-xs font-bold">{CEO.credential} <span className="text-[#8fa89a] font-normal">· {CEO.credentialSub}</span></p>
            </div>
            <div className="hidden group-hover:flex gap-1.5 flex-wrap max-w-xs">
              {CEO.domains.map(d => (
                <span key={d} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f0faf4] text-[#16a34a] border border-[#bbf7d0]">{d}</span>
              ))}
            </div>
            <div className="ml-auto hidden group-hover:block">
              <p className="text-[#5a7a65] text-xs italic max-w-52 leading-relaxed">"{CEO.quote}"</p>
            </div>
          </div>
        </div>

        {/* Lane 2: C-Suite */}
        <div className="flex items-stretch px-8 py-6 gap-6">
          <LaneLabel label="C-Suite" count={4} />
          <div className="w-px bg-[#e8f0ec] shrink-0" />
          <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar">
            {CSUITE.map((p, i) => (
              <div
                key={i}
                className="flex-1 min-w-[180px] rounded-2xl border border-[#e8f0ec] bg-white hover:border-[#16a34a]/30 hover:shadow-md transition-all p-4 flex flex-col gap-3 group/card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl shrink-0"
                    style={{
                      backgroundImage: "url('/__mockup/images/leadership-team.png')",
                      backgroundSize: "320% 265%",
                      backgroundPosition: p.bgPos,
                      backgroundRepeat: "no-repeat",
                      outline: `2px solid ${p.color}50`,
                      outlineOffset: "1px",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-[#0d1f12] text-xs font-black truncate">{p.name.split(" ")[0]} {p.name.split(" ").slice(-1)[0]}</p>
                    <p className="text-[10px] font-bold mt-0.5" style={{ color: p.color }}>{p.role}</p>
                  </div>
                </div>
                <p className="text-[#5a7a65] text-[10px]">{p.credential}</p>
                <div className="flex gap-1 flex-wrap mt-auto">
                  {p.domains.map(d => (
                    <span key={d} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: `${p.color}15`, color: p.color }}>{d}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lane 3: Advisory */}
        <div className="flex items-stretch px-8 py-5 gap-6 bg-[#fafdf9]">
          <LaneLabel label="Advisory Board" count={6} />
          <div className="w-px bg-[#e8f0ec] shrink-0" />
          <div className="flex-1 flex items-center gap-3 flex-wrap">
            {ADVISORS.map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-[#e8f0ec] bg-white px-3 py-2 hover:border-[#86efac] hover:bg-[#f0faf4] transition-all">
                <div
                  className="w-9 h-9 rounded-lg shrink-0"
                  style={{
                    backgroundImage: "url('/__mockup/images/advisory-board.png')",
                    backgroundSize: "320% 340%",
                    backgroundPosition: a.bgPos,
                    backgroundRepeat: "no-repeat",
                  }}
                />
                <div>
                  <p className="text-[#0d1f12] text-[11px] font-bold leading-tight whitespace-nowrap">{a.name.split(" ").slice(0,2).join(" ")}</p>
                  <p className="text-[#8fa89a] text-[9px]">{a.domain}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
