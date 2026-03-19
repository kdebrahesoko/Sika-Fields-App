const LEADERS = [
  { name: "William Osei Agyemang", role: "Chief Finance Officer", bgPos: "50% 6%", credential: "ACCA Certified · 15+ yrs Investment Banking", domains: ["Finance","Investment","African Markets"], color: "#ca8a04" },
  { name: "Valentijn Venus", role: "Chief Product & Research Officer", bgPos: "100% 6%", credential: "MSc Environmental Economics", domains: ["Product","Research","MRV"], color: "#7c3aed" },
  { name: "Charlotte Owusu-Ansah", role: "Chief Talent & Admin Officer", bgPos: "0% 82%", credential: "HR Leadership · Org Development", domains: ["Talent","Operations","Culture"], color: "#db2777" },
  { name: "Vijay Palat", role: "Chief Strategy & Sustainability Officer", bgPos: "47% 82%", credential: "ESG Strategy Expert · 18+ yrs", domains: ["ESG Strategy","Sustainability","Policy"], color: "#0f766e" },
];

const ADVISORS = [
  { name: "Derrick Adu Gyamfi", bgPos: "0% 42%", role: "Capital Markets" },
  { name: "Dr. Cheryl Sterling", bgPos: "50% 42%", role: "Policy Research" },
  { name: "Festus W. Amoyaw", bgPos: "100% 42%", role: "Agribusiness" },
  { name: "Nana Ama Boateng-Kagyah", bgPos: "0% 90%", role: "Legal & Compliance" },
  { name: "Valentijn Venus", bgPos: "50% 90%", role: "Env. Economics" },
  { name: "Olubgenga O. Awe", bgPos: "100% 90%", role: "Trade Finance" },
];

export function MastheadSatellites() {
  return (
    <div className="min-h-screen bg-[#f5f9f6] font-['Inter'] flex flex-col">
      <div className="px-8 pt-8 pb-5">
        <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Our Team</p>
        <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">Leadership Built for Scale</h2>
      </div>

      {/* Top section: CEO masthead + C-suite satellites */}
      <div className="px-8 flex gap-5 flex-1">
        {/* CEO — large anchor card */}
        <div className="w-80 shrink-0 rounded-3xl overflow-hidden relative bg-[#0d1f12]" style={{ minHeight: 420 }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/__mockup/images/leadership-team.png')",
              backgroundSize: "320% 265%",
              backgroundPosition: "0% 6%",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f12] via-[#0d1f12]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block bg-[#16a34a] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">Founder & CEO</span>
            <p className="text-white font-black text-xl font-['Sora'] leading-tight mb-1">Daniel Asare-Kyei <sup className="text-[#86efac] text-sm">PhD</sup></p>
            <p className="text-[#86efac] text-xs font-semibold mb-3">PhD Environmental Science</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Carbon Markets","Climate Policy","AgriTech"].map(d => (
                <span key={d} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white border border-white/20">{d}</span>
              ))}
            </div>
            <p className="text-white/70 text-xs italic leading-relaxed">"Building the bridge between African land and global climate capital."</p>
          </div>
        </div>

        {/* C-suite 2x2 satellite grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {LEADERS.map((l, i) => (
            <div key={i} className="rounded-2xl bg-white border border-[#e8f0ec] p-4 flex flex-col gap-3 hover:shadow-lg hover:border-[#16a34a]/30 transition-all">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl shrink-0"
                  style={{
                    backgroundImage: "url('/__mockup/images/leadership-team.png')",
                    backgroundSize: "320% 265%",
                    backgroundPosition: l.bgPos,
                    backgroundRepeat: "no-repeat",
                    outline: `2px solid ${l.color}40`,
                    outlineOffset: "2px",
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[#0d1f12] text-xs font-black leading-tight truncate">{l.name.split(" ").slice(0,2).join(" ")}</p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: l.color }}>{l.role.split(" ").slice(0,2).join(" ")}</p>
                </div>
              </div>
              <div className="h-px bg-[#f0f7f2]" />
              <p className="text-[#5a7a65] text-[11px] leading-snug">{l.credential}</p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {l.domains.map(d => (
                  <span key={d} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: `${l.color}18`, color: l.color }}>{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory row — compact chips */}
      <div className="px-8 pb-8 mt-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-[#e8f0ec]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8fa89a]">Advisory Board</span>
          <div className="h-px flex-1 bg-[#e8f0ec]" />
        </div>
        <div className="flex gap-3 flex-wrap">
          {ADVISORS.map((a, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border border-[#e8f0ec] rounded-full px-3 py-2 hover:border-[#86efac] transition-colors">
              <div
                className="w-8 h-8 rounded-full shrink-0"
                style={{
                  backgroundImage: "url('/__mockup/images/advisory-board.png')",
                  backgroundSize: "320% 340%",
                  backgroundPosition: a.bgPos,
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div>
                <p className="text-[#0d1f12] text-[11px] font-bold leading-tight whitespace-nowrap">{a.name.split(" ").slice(0,2).join(" ")}</p>
                <p className="text-[#8fa89a] text-[9px]">{a.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
