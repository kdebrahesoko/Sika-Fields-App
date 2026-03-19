const LEADERS = [
  {
    name: "Daniel Asare-Kyei",
    suffix: "PhD",
    role: "CEO",
    bgPos: "0% 6%",
    credential: "PhD Env. Science",
    years: "10+ yrs",
    domains: ["Carbon Markets", "Climate Policy", "AgriTech"],
    domainColors: ["#bbf7d0", "#6ee7b7", "#34d399"],
    textColors: ["#14532d", "#065f46", "#065f46"],
    skills: [
      { name: "Carbon Market Design", score: 5 },
      { name: "Stakeholder Strategy", score: 4 },
      { name: "Research Leadership", score: 5 },
    ],
    signalColor: "#16a34a",
  },
  {
    name: "William Osei Agyemang",
    suffix: "",
    role: "CFO",
    bgPos: "50% 6%",
    credential: "ACCA Certified",
    years: "15+ yrs",
    domains: ["Structured Finance", "Investment", "Dev. Finance"],
    domainColors: ["#fef08a", "#fde68a", "#fcd34d"],
    textColors: ["#713f12", "#78350f", "#78350f"],
    skills: [
      { name: "Capital Structure", score: 5 },
      { name: "Financial Modelling", score: 5 },
      { name: "Investor Relations", score: 4 },
    ],
    signalColor: "#ca8a04",
  },
  {
    name: "Valentijn Venus",
    suffix: "",
    role: "CPRO",
    bgPos: "100% 6%",
    credential: "MSc Env. Economics",
    years: "8+ yrs",
    domains: ["MRV Design", "Product Strategy", "Research"],
    domainColors: ["#bae6fd", "#93c5fd", "#60a5fa"],
    textColors: ["#0c4a6e", "#1e3a8a", "#1e3a8a"],
    skills: [
      { name: "MRV Frameworks", score: 5 },
      { name: "Product Design", score: 4 },
      { name: "Econometric Analysis", score: 5 },
    ],
    signalColor: "#2563eb",
  },
  {
    name: "Charlotte Owusu-Ansah",
    suffix: "",
    role: "CTAO",
    bgPos: "0% 82%",
    credential: "HR Leadership",
    years: "12+ yrs",
    domains: ["Talent Acquisition", "Operations", "L&D"],
    domainColors: ["#f9a8d4", "#f0abfc", "#c4b5fd"],
    textColors: ["#881337", "#701a75", "#5b21b6"],
    skills: [
      { name: "Org Development", score: 5 },
      { name: "Operational Systems", score: 4 },
      { name: "Team Building", score: 5 },
    ],
    signalColor: "#9333ea",
  },
  {
    name: "Vijay Palat",
    suffix: "",
    role: "CSSO",
    bgPos: "47% 82%",
    credential: "ESG Strategy Expert",
    years: "18+ yrs",
    domains: ["ESG Strategy", "Sustainability", "Policy"],
    domainColors: ["#a7f3d0", "#6ee7b7", "#34d399"],
    textColors: ["#065f46", "#065f46", "#14532d"],
    skills: [
      { name: "ESG Reporting", score: 5 },
      { name: "Policy Engagement", score: 5 },
      { name: "Strategic Planning", score: 4 },
    ],
    signalColor: "#059669",
  },
];

function ScoreDots({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: i <= score ? color : "#e2e8f0" }}
        />
      ))}
    </div>
  );
}

function ScorecardCard({ person }: { person: typeof LEADERS[0] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e8f0ec] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

      {/* Top: Domain tags — the FIRST thing you see */}
      <div className="p-4 pb-3 border-b border-[#f0f7f2]">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {person.domains.map((d, i) => (
            <span
              key={d}
              className="px-2 py-0.5 rounded-md text-[11px] font-bold"
              style={{ backgroundColor: person.domainColors[i], color: person.textColors[i] }}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#1a3a25] font-bold text-sm">{person.credential}</span>
          <span className="w-1 h-1 rounded-full bg-[#ccd9d0]" />
          <span className="text-[#5a7a65] text-xs">{person.years}</span>
        </div>
      </div>

      {/* Photo row — secondary */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f7f2]">
        <div
          className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
          style={{
            backgroundImage: "url('/__mockup/images/leadership-team.png')",
            backgroundSize: "320% 265%",
            backgroundPosition: person.bgPos,
            backgroundRepeat: "no-repeat",
          }}
        />
        <div>
          <p className="font-bold text-[#0d1f12] text-sm leading-snug">
            {person.name}{person.suffix && <sup className="text-[10px] text-[#16a34a] ml-0.5">{person.suffix}</sup>}
          </p>
          <p className="text-[#5a7a65] text-xs mt-0.5">{person.role} · SikaFields</p>
        </div>
      </div>

      {/* Skill scores */}
      <div className="p-4 space-y-2.5">
        <p className="text-[#8fa89a] text-[10px] font-bold uppercase tracking-widest mb-2">Key Skills</p>
        {person.skills.map(skill => (
          <div key={skill.name} className="flex items-center justify-between gap-3">
            <span className="text-[#2d4a38] text-xs font-medium shrink-0">{skill.name}</span>
            <ScoreDots score={skill.score} color={person.signalColor} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExpertiseScorecard() {
  return (
    <div className="min-h-screen bg-[#f0f7f2] font-['Inter']">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Why Trust Us</p>
            <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12] leading-tight">Leadership by Expertise</h2>
            <p className="text-[#5a7a65] text-sm mt-2 max-w-sm">Each role filled by deep domain specialists — not generalists.</p>
          </div>

          {/* Legend */}
          <div className="shrink-0 bg-white rounded-xl border border-[#e8f0ec] px-4 py-3 text-right">
            <p className="text-[#8fa89a] text-[10px] font-bold uppercase tracking-widest mb-1.5">Proficiency</p>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[#5a7a65] text-xs">Expert</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#16a34a]" />)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <span className="text-[#5a7a65] text-xs">Strong</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= 4 ? "bg-[#16a34a]" : "bg-[#e2e8f0]"}`} />)}
              </div>
            </div>
          </div>
        </div>

        {/* 3-col grid: 3 top + 2 bottom */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {LEADERS.slice(0, 3).map((p, i) => <ScorecardCard key={i} person={p} />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div />
          {LEADERS.slice(3).map((p, i) => <ScorecardCard key={i} person={p} />)}
          <div />
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-center gap-6 text-center">
          <div className="bg-white rounded-xl border border-[#e8f0ec] px-5 py-3">
            <p className="text-2xl font-black text-[#0d1f12] font-['Sora']">5</p>
            <p className="text-[#5a7a65] text-xs mt-0.5">Domain Experts</p>
          </div>
          <div className="bg-white rounded-xl border border-[#e8f0ec] px-5 py-3">
            <p className="text-2xl font-black text-[#0d1f12] font-['Sora']">60+</p>
            <p className="text-[#5a7a65] text-xs mt-0.5">Combined Years</p>
          </div>
          <div className="bg-white rounded-xl border border-[#e8f0ec] px-5 py-3">
            <p className="text-2xl font-black text-[#0d1f12] font-['Sora']">4</p>
            <p className="text-[#5a7a65] text-xs mt-0.5">Countries</p>
          </div>
          <div className="bg-[#16a34a] rounded-xl px-5 py-3">
            <p className="text-2xl font-black text-white font-['Sora']">DIFC</p>
            <p className="text-green-100 text-xs mt-0.5">Registered</p>
          </div>
        </div>
      </div>
    </div>
  );
}
