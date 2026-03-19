import { useState } from "react";

const ALL = [
  { id: "ceo", name: "Daniel Asare-Kyei", suffix: "PhD", role: "Founder & CEO", tier: "C-Suite", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership", credential: "PhD Environmental Science", credentialSub: "Specialised in carbon sequestration and climate policy for smallholder agriculture across sub-Saharan Africa. 10+ years building AgriTech platforms with measurable climate outcomes.", domains: ["Carbon Markets","Climate Policy","AgriTech","MRV"], quote: "Building the bridge between African land and global climate capital.", color: "#16a34a", location: "Ghana · DIFC" },
  { id: "cfo", name: "William Osei Agyemang", suffix: "", role: "Chief Finance Officer", tier: "C-Suite", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership", credential: "ACCA Certified", credentialSub: "15+ years in investment banking and development finance across African markets. Structures capital for complex multi-jurisdiction climate finance instruments.", domains: ["Finance","Investment","African Markets","Capital"], quote: "Sound capital structure turns climate missions into durable businesses.", color: "#ca8a04", location: "Ghana" },
  { id: "cpro", name: "Valentijn Venus", suffix: "", role: "Chief Product & Research Officer", tier: "C-Suite", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership", credential: "MSc Environmental Economics", credentialSub: "8+ years designing MRV (Monitoring, Reporting, Verification) frameworks and product strategy for voluntary carbon markets. Leads SikaFields' scientific integrity layer.", domains: ["Product Strategy","Research","MRV Design","Data"], quote: "Data integrity is the bedrock of every credit we issue.", color: "#7c3aed", location: "Netherlands" },
  { id: "ctao", name: "Charlotte Owusu-Ansah", suffix: "", role: "Chief Talent & Admin Officer", tier: "C-Suite", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership", credential: "HR Leadership", credentialSub: "12+ years in organizational development and talent acquisition. Leads people operations across Ghana, India, and UAE for a distributed, high-growth team.", domains: ["Talent","Operations","Culture","OKRs"], quote: "Our people are the soil from which our impact grows.", color: "#db2777", location: "Ghana" },
  { id: "csso", name: "Vijay Palat", suffix: "", role: "Chief Strategy & Sustainability Officer", tier: "C-Suite", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership", credential: "ESG Strategy Expert", credentialSub: "18+ years in sustainability frameworks, ESG policy, and strategy. Leads SikaFields' alignment with Paris Agreement targets and UN SDG reporting.", domains: ["ESG Strategy","Sustainability","Policy","SDGs"], quote: "True sustainability means being here for the next generation.", color: "#0f766e", location: "India" },
  { id: "a1", name: "Derrick Adu Gyamfi", suffix: "", role: "Advisor — Capital Markets", tier: "Advisory", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory", credential: "Capital Markets & Finance", credentialSub: "Advisory and investment strategy specialist with deep experience in capital markets across Africa. Provides governance and investor relations guidance.", domains: ["Capital Markets","Advisory","Governance"], quote: "Strong governance is the foundation of credible climate finance.", color: "#166534", location: "Ghana" },
  { id: "a2", name: "Dr. Cheryl Sterling", suffix: "", role: "Advisor — Policy Research", tier: "Advisory", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory", credential: "Doctorate — Policy Research", credentialSub: "Sustainability and ESG frameworks researcher. Advises on evidence-based policy design and international climate negotiation positioning.", domains: ["Policy Research","Sustainability","ESG"], quote: "Evidence-based policy is how we scale real impact.", color: "#0f766e", location: "International" },
  { id: "a3", name: "Festus William Amoyaw", suffix: "", role: "Advisor — Agribusiness", tier: "Advisory", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory", credential: "Agribusiness Development", credentialSub: "Agriculture and rural development specialist. Bridges the gap between smallholder farmer communities and institutional carbon market frameworks.", domains: ["Agribusiness","Rural Dev.","Partnerships"], quote: "Farming communities are the backbone of every carbon project we build.", color: "#b45309", location: "Ghana" },
  { id: "a4", name: "Nana Ama Boateng-Kagyah", suffix: "", role: "Advisor — Legal", tier: "Advisory", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory", credential: "Legal & Compliance", credentialSub: "Corporate law and governance specialist. Oversees SikaFields' legal framework across Ghana, India, and DIFC regulatory environments.", domains: ["Legal","Compliance","Governance"], quote: "Clear legal frameworks protect both farmers and investors.", color: "#166534", location: "Ghana" },
  { id: "a5", name: "Valentijn Venus", suffix: "", role: "Advisor — Env. Economics", tier: "Advisory", bgPos: "50% 90%", bgSize: "320% 340%", img: "advisory", credential: "MSc Environmental Economics", credentialSub: "Research and product strategy advisor. Contributes to MRV methodology validation and scientific peer review of SikaFields' carbon accounting models.", domains: ["Product Strategy","Research","MRV Design"], quote: "Data integrity is the bedrock of every credit we issue.", color: "#0f766e", location: "Netherlands" },
  { id: "a6", name: "Olubgenga O. Awe", suffix: "", role: "Advisor — Trade Finance", tier: "Advisory", bgPos: "100% 90%", bgSize: "320% 340%", img: "advisory", credential: "Structured Trade Finance", credentialSub: "Group Head, Structured Trade & Commodities Finance at The Alternative Bank. Advises on trade finance structures that connect carbon projects to institutional capital.", domains: ["Trade Finance","Commodities","Banking"], quote: "Structured finance connects climate projects to global capital.", color: "#14532d", location: "Nigeria" },
];

export function MasterDetail() {
  const [selected, setSelected] = useState("ceo");
  const person = ALL.find(p => p.id === selected) ?? ALL[0];
  const csuite = ALL.filter(p => p.tier === "C-Suite");
  const advisors = ALL.filter(p => p.tier === "Advisory");

  return (
    <div className="min-h-screen bg-white font-['Inter'] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#f0f7f2]">
        <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-0.5">Our Team</p>
        <h2 className="text-2xl font-['Sora'] font-black text-[#0d1f12]">Leadership Built for Scale</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: compact list */}
        <div className="w-64 border-r border-[#f0f7f2] flex flex-col overflow-auto shrink-0">
          <div className="px-3 py-2.5 border-b border-[#f0f7f2]">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#8fa89a]">C-Suite · {csuite.length}</p>
          </div>
          {csuite.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all border-l-2"
              style={{
                backgroundColor: selected === p.id ? `${p.color}0f` : "transparent",
                borderLeftColor: selected === p.id ? p.color : "transparent",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg shrink-0"
                style={{
                  backgroundImage: `url('/__mockup/images/${p.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                  backgroundSize: p.bgSize,
                  backgroundPosition: p.bgPos,
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="min-w-0">
                <p className="text-[#0d1f12] text-xs font-bold truncate leading-tight">{p.name.split(" ").slice(0,2).join(" ")}</p>
                <p className="text-[10px] truncate" style={{ color: p.color }}>{p.role.split(" ").slice(0,2).join(" ")}</p>
              </div>
            </button>
          ))}

          <div className="px-3 py-2.5 border-b border-t border-[#f0f7f2] mt-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#8fa89a]">Advisory · {advisors.length}</p>
          </div>
          {advisors.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all border-l-2"
              style={{
                backgroundColor: selected === p.id ? `${p.color}0f` : "transparent",
                borderLeftColor: selected === p.id ? p.color : "transparent",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg shrink-0"
                style={{
                  backgroundImage: `url('/__mockup/images/advisory-board.png')`,
                  backgroundSize: p.bgSize,
                  backgroundPosition: p.bgPos,
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="min-w-0">
                <p className="text-[#0d1f12] text-[11px] font-semibold truncate leading-tight">{p.name.split(" ").slice(0,2).join(" ")}</p>
                <p className="text-[9px] text-[#8fa89a] truncate">{p.role.replace("Advisor — ","")}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Right: expanded detail */}
        <div className="flex-1 overflow-auto">
          <div className="flex gap-6 p-7 border-b border-[#f0f7f2]">
            <div
              className="w-28 h-28 rounded-2xl shrink-0"
              style={{
                backgroundImage: `url('/__mockup/images/${person.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                backgroundSize: person.bgSize,
                backgroundPosition: person.bgPos,
                backgroundRepeat: "no-repeat",
                outline: `3px solid ${person.color}50`,
                outlineOffset: "3px",
              }}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <h3 className="text-[#0d1f12] font-black text-2xl font-['Sora'] leading-tight">
                    {person.name}
                    {person.suffix && <sup className="text-lg ml-1" style={{ color: person.color }}>{person.suffix}</sup>}
                  </h3>
                  <p className="font-semibold text-sm mt-0.5" style={{ color: person.color }}>{person.role}</p>
                </div>
                <span className="text-xs text-[#8fa89a] bg-[#f5f9f6] border border-[#e8f0ec] rounded-lg px-2.5 py-1 shrink-0">{person.location}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {person.domains.map(d => (
                  <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-bold border" style={{ borderColor: `${person.color}40`, color: person.color, backgroundColor: `${person.color}10` }}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-7 grid grid-cols-2 gap-5">
            <div className="col-span-2 bg-[#fafdf9] rounded-2xl p-5 border border-[#e8f0ec]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8fa89a] mb-2">Credential</p>
              <p className="text-[#0d1f12] font-bold text-base mb-2">{person.credential}</p>
              <p className="text-[#5a7a65] text-sm leading-relaxed">{person.credentialSub}</p>
            </div>
            <div className="bg-[#f0faf4] rounded-2xl p-5 border border-[#bbf7d0]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8fa89a] mb-3">Statement</p>
              <p className="text-[#0d1f12] text-sm italic leading-relaxed">"{person.quote}"</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#e8f0ec]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8fa89a] mb-3">Tier</p>
              <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-black" style={{ backgroundColor: `${person.color}18`, color: person.color }}>
                {person.tier}
              </span>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8fa89a] mt-4 mb-2">Based in</p>
              <p className="text-[#0d1f12] font-semibold text-sm">{person.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
