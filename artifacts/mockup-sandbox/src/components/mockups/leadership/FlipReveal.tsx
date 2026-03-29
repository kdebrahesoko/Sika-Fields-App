import { useState } from "react";

const LEADERS = [
  {
    name: "Daniel Asare-Kyei PhD",
    role: "Chief Executive Officer",
    bgPos: "0% 6%",
    credential: "PhD Environmental Science",
    credentialSub: "10+ yrs in Carbon Markets",
    domains: ["Carbon Markets", "Climate Policy", "AgriTech"],
    quote: "Building the bridge between African land and global climate capital.",
    color: "#166534",
  },
  {
    name: "William Osei Agyemang",
    role: "Chief Finance Officer",
    bgPos: "50% 6%",
    credential: "ACCA Certified",
    credentialSub: "Structured Finance & Investment",
    domains: ["Finance", "African Markets", "Investment"],
    quote: "Sound capital structure is what turns climate missions into durable businesses.",
    color: "#0f766e",
  },
  {
    name: "Valentijn Venus",
    role: "Chief Product & Research Officer",
    bgPos: "100% 6%",
    credential: "MSc Environmental Economics",
    credentialSub: "Research & Product Strategy",
    domains: ["Product Strategy", "Research", "MRV Design"],
    quote: "Data integrity is the bedrock of every credit we issue.",
    color: "#b45309",
  },
  {
    name: "Charlotte Owusu-Ansah",
    role: "Chief Talent & Admin Officer",
    bgPos: "0% 82%",
    credential: "HR Leadership",
    credentialSub: "Organisational Development",
    domains: ["Talent", "Operations", "Culture"],
    quote: "Our people are the soil from which our impact grows.",
    color: "#166534",
  },
  {
    name: "Vijay Palat",
    role: "Chief Strategy & Sustainability Officer",
    bgPos: "47% 82%",
    credential: "ESG Strategy Expert",
    credentialSub: "Policy & Sustainability Frameworks",
    domains: ["ESG Strategy", "Sustainability", "Policy"],
    quote: "True sustainability means being here for the next generation of farmers.",
    color: "#0f766e",
  },
];

function FlipCard({ person }: { person: typeof LEADERS[0] }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          height: "320px",
        }}
      >
        {/* Front face */}
        <div
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-md"
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "url('/__mockup/images/leadership-team.png')",
              backgroundSize: "320% 265%",
              backgroundPosition: person.bgPos,
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-bold text-white text-base leading-snug">{person.name}</p>
            <p className="text-white/60 text-sm mt-0.5">{person.role}</p>
          </div>
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-white/80 text-[10px] font-semibold tracking-wide">
            HOVER
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: person.color,
            background: `linear-gradient(135deg, ${person.color} 0%, #052e16 100%)`,
          }}
        >
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Credential</p>
              <p className="text-white font-bold text-lg leading-tight">{person.credential}</p>
              <p className="text-white/60 text-xs mt-0.5">{person.credentialSub}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {person.domains.map(d => (
                  <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/40 text-[10px] mb-1.5">"{person.quote}"</p>
              <p className="text-white font-semibold text-sm">{person.name}</p>
              <p className="text-white/50 text-xs">{person.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlipReveal() {
  return (
    <div className="min-h-screen bg-[#f8faf7] font-['Inter']">
      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-5">
            ↕ Hover each card
          </span>
          <h2 className="text-4xl font-['Sora'] font-black text-[#0d1f12] mb-3">Our Leadership</h2>
          <p className="text-[#5a7a65] text-base max-w-xl mx-auto leading-relaxed">
            Five specialists, one mission. Hover any card to see the credential behind the title.
          </p>
        </div>

        {/* 5-card grid — 3 top, 2 bottom centred */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          {LEADERS.slice(0, 3).map((p, i) => <FlipCard key={i} person={p} />)}
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div />
          {LEADERS.slice(3).map((p, i) => <FlipCard key={i} person={p} />)}
          <div />
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <span className="text-[#5a7a65] text-sm">
            Registered in the{" "}
            <strong className="text-[#0d1f12]">Dubai International Financial Centre (DIFC)</strong>{" "}
            · Ghana Country Office · Member of the <strong className="text-[#0d1f12]">Esoko family</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
