import { useState } from "react";

const TREE = [
  {
    id: "ceo",
    name: "Daniel Asare-Kyei",
    suffix: "PhD",
    role: "Chief Executive Officer",
    bgPos: "0% 6%",
    bgSize: "320% 265%",
    img: "leadership",
    credential: "PhD Environmental Science",
    credentialSub: "10+ yrs · Carbon Markets, Climate Policy, AgriTech",
    domains: ["Carbon Markets", "Climate Policy", "AgriTech"],
    quote: "Building the bridge between African land and global climate capital.",
    status: "Ghana · DIFC",
    color: "#16a34a",
    children: [
      {
        id: "cfo",
        name: "William Osei Agyemang",
        role: "CFO",
        bgPos: "50% 6%",
        bgSize: "320% 265%",
        img: "leadership",
        credential: "ACCA Certified",
        credentialSub: "15+ yrs · Finance, Investment, African Markets",
        domains: ["Finance", "Investment", "African Markets"],
        quote: "Sound capital structure turns climate missions into durable businesses.",
        status: "Ghana",
        color: "#ca8a04",
        children: [],
      },
      {
        id: "cpro",
        name: "Valentijn Venus",
        role: "CPRO",
        bgPos: "100% 6%",
        bgSize: "320% 265%",
        img: "leadership",
        credential: "MSc Env. Economics",
        credentialSub: "8+ yrs · Product Strategy, Research, MRV Design",
        domains: ["Product Strategy", "Research", "MRV Design"],
        quote: "Data integrity is the bedrock of every credit we issue.",
        status: "Netherlands",
        color: "#7c3aed",
        children: [],
      },
      {
        id: "ctao",
        name: "Charlotte Owusu-Ansah",
        role: "CTAO",
        bgPos: "0% 82%",
        bgSize: "320% 265%",
        img: "leadership",
        credential: "HR Leadership",
        credentialSub: "12+ yrs · Talent, Operations, Culture",
        domains: ["Talent", "Operations", "Culture"],
        quote: "Our people are the soil from which our impact grows.",
        status: "Ghana",
        color: "#db2777",
        children: [],
      },
      {
        id: "csso",
        name: "Vijay Palat",
        role: "CSSO",
        bgPos: "47% 82%",
        bgSize: "320% 265%",
        img: "leadership",
        credential: "ESG Strategy Expert",
        credentialSub: "18+ yrs · ESG, Sustainability, Policy",
        domains: ["ESG Strategy", "Sustainability", "Policy"],
        quote: "True sustainability means being here for the next generation.",
        status: "India",
        color: "#0f766e",
        children: [],
      },
    ],
  },
];

const ADVISORS = [
  { id: "a1", name: "Derrick Adu Gyamfi", role: "Advisor", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory", credential: "Capital Markets & Finance", credentialSub: "Advisory & Investment Strategy", domains: ["Capital Markets", "Advisory", "Governance"], quote: "Strong governance is the foundation of credible climate finance.", status: "Ghana", color: "#166534" },
  { id: "a2", name: "Dr. Cheryl Sterling", role: "Advisor", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory", credential: "Policy Research (PhD)", credentialSub: "Sustainability & ESG Frameworks", domains: ["Policy Research", "Sustainability", "ESG"], quote: "Evidence-based policy is how we scale real impact.", status: "International", color: "#0f766e" },
  { id: "a3", name: "Festus W. Amoyaw", role: "Advisor", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory", credential: "Agribusiness Development", credentialSub: "Agriculture & Rural Partnerships", domains: ["Agribusiness", "Rural Dev.", "Partnerships"], quote: "Farming communities are the backbone of every carbon project we build.", status: "Ghana", color: "#b45309" },
  { id: "a4", name: "Nana Ama Boateng-Kagyah", role: "Advisor", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory", credential: "Legal & Compliance", credentialSub: "Corporate Law & Governance", domains: ["Legal", "Compliance", "Governance"], quote: "Clear legal frameworks protect both farmers and investors.", status: "Ghana", color: "#166534" },
  { id: "a5", name: "Valentijn Venus", role: "Advisor", bgPos: "50% 90%", bgSize: "320% 340%", img: "advisory", credential: "MSc Env. Economics", credentialSub: "Research & Product Strategy", domains: ["Product Strategy", "Research", "MRV Design"], quote: "Data integrity is the bedrock of every credit we issue.", status: "Netherlands", color: "#0f766e" },
  { id: "a6", name: "Olubgenga O. Awe", role: "Advisor — The Alternative Bank", bgPos: "100% 90%", bgSize: "320% 340%", img: "advisory", credential: "Structured Trade Finance", credentialSub: "Commodities Finance & Banking", domains: ["Trade Finance", "Commodities", "Banking"], quote: "Structured finance connects climate projects to global capital.", status: "Nigeria", color: "#14532d" },
];

const ALL_FLAT: any[] = [TREE[0], ...TREE[0].children, ...ADVISORS];

function TreeNode({ person, depth, selected, onSelect }: { person: any; depth: number; selected: string | null; onSelect: (id: string) => void }) {
  const isSelected = selected === person.id;
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button
        onClick={() => onSelect(person.id)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all group"
        style={{
          backgroundColor: isSelected ? `${person.color}18` : "transparent",
          borderLeft: isSelected ? `2px solid ${person.color}` : "2px solid transparent",
        }}
      >
        <div
          className="w-7 h-7 rounded-lg overflow-hidden shrink-0 transition-transform group-hover:scale-110"
          style={{
            backgroundImage: `url('/__mockup/images/${person.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
            backgroundSize: person.bgSize,
            backgroundPosition: person.bgPos,
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="min-w-0">
          <p className="text-[#e2f0e8] text-xs font-bold truncate leading-tight">
            {person.name.split(" ").slice(0, 2).join(" ")}
            {person.suffix && <sup className="text-[10px] ml-0.5" style={{ color: person.color }}>{person.suffix}</sup>}
          </p>
          <p className="text-[#4a7a5a] text-[10px] truncate">{person.role}</p>
        </div>
        {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: person.color }} />}
      </button>
      {person.children?.map((child: any) => (
        <TreeNode key={child.id} person={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

export function CommandRoom() {
  const [selected, setSelected] = useState<string>("ceo");
  const person = ALL_FLAT.find(p => p.id === selected) ?? ALL_FLAT[0];

  return (
    <div className="min-h-screen bg-[#061208] text-[#e2f0e8] font-['Inter'] flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a3a22]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-[#4a7a5a]">SikaFields Operations</span>
          <span className="text-[#1a3a22]">·</span>
          <span className="text-xs text-[#4a7a5a]">Leadership Command</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#4a7a5a] font-mono">
          <span>DIFC-REG</span>
          <span>GH-OPS</span>
          <span>IN-OPS</span>
          <span className="text-[#16a34a] font-bold">● LIVE</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left: Org Tree */}
        <div className="w-56 border-r border-[#1a3a22] flex flex-col overflow-auto shrink-0">
          <div className="px-4 py-3 border-b border-[#1a3a22]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a7a5a]">Org Hierarchy</p>
          </div>
          <div className="flex-1 py-2 overflow-auto">
            {TREE.map(node => (
              <TreeNode key={node.id} person={node} depth={0} selected={selected} onSelect={setSelected} />
            ))}
            <div className="px-3 py-2 mt-1 border-t border-[#1a3a22]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a7a5a] mb-1">Advisory Board</p>
              {ADVISORS.map(a => (
                <TreeNode key={a.id} person={a} depth={1} selected={selected} onSelect={setSelected} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Person header */}
          <div className="flex gap-5 p-6 border-b border-[#1a3a22]">
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden shrink-0"
              style={{
                backgroundImage: `url('/__mockup/images/${person.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                backgroundSize: person.bgSize,
                backgroundPosition: person.bgPos,
                backgroundRepeat: "no-repeat",
                outline: `2px solid ${person.color}60`,
                outlineOffset: "2px",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-white font-black text-xl font-['Sora'] leading-tight">
                  {person.name}
                  {person.suffix && <sup className="text-base ml-1" style={{ color: person.color }}>{person.suffix}</sup>}
                </h3>
                <span className="text-[10px] font-mono text-[#4a7a5a] border border-[#1a3a22] rounded px-2 py-1 shrink-0">{person.status}</span>
              </div>
              <p className="font-semibold text-sm mb-2" style={{ color: person.color }}>{person.role}</p>
              <div className="flex gap-1.5 flex-wrap">
                {person.domains?.map((d: string) => (
                  <span key={d} className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ borderColor: `${person.color}40`, color: person.color, backgroundColor: `${person.color}12` }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-px bg-[#1a3a22] flex-1">
            <div className="bg-[#061208] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a7a5a] mb-2">Credential</p>
              <p className="text-white font-bold text-base mb-1">{person.credential}</p>
              <p className="text-[#4a7a5a] text-xs leading-relaxed">{person.credentialSub}</p>
            </div>
            <div className="bg-[#061208] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a7a5a] mb-2">Coverage · {person.domains?.length} domains</p>
              <div className="space-y-2">
                {person.domains?.map((d: string, i: number) => (
                  <div key={d} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[#1a3a22] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${85 - i * 12}%`, backgroundColor: person.color }} />
                    </div>
                    <span className="text-[10px] text-[#4a7a5a] w-24 truncate">{d}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#061208] p-5 col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a7a5a] mb-2">Statement</p>
              <p className="text-[#e2f0e8] text-sm italic leading-relaxed border-l-2 pl-4" style={{ borderColor: person.color }}>
                "{person.quote}"
              </p>
              <p className="text-[#4a7a5a] text-xs mt-2">— {person.name}, {person.role}</p>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[#1a3a22] text-[10px] text-[#4a7a5a] font-mono">
            <span>ENTITY: DIFC-REG · SikaFields Holding</span>
            <span>·</span>
            <span>TEAM: 5 C-Suite · 6 Advisory</span>
            <span>·</span>
            <span>OPS: GH · IN · UAE</span>
            <span className="ml-auto text-[#16a34a]">● ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
