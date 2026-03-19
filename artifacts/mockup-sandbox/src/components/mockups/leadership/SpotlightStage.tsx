import { useState } from "react";

const LEADERS = [
  {
    name: "Daniel Asare-Kyei",
    suffix: "PhD",
    role: "Chief Executive Officer",
    bgPos: "0% 6%",
    credential: "PhD Environmental Science",
    tagline: "Carbon market pioneer across Africa & Asia.",
    highlight: "Founded SikaFields as a spin-off from Esoko, Ghana's leading AgriTech.",
    domains: ["Carbon Markets", "Climate Policy", "AgriTech"],
    country: "🇬🇭 Ghana",
  },
  {
    name: "William Osei Agyemang",
    suffix: "",
    role: "Chief Finance Officer",
    bgPos: "50% 6%",
    credential: "ACCA Certified",
    tagline: "Structuring capital flows that serve smallholder farmers.",
    highlight: "15+ years across investment banking and development finance.",
    domains: ["Finance", "Investment", "African Capital Markets"],
    country: "🇬🇭 Ghana",
  },
  {
    name: "Valentijn Venus",
    suffix: "",
    role: "Chief Product & Research Officer",
    bgPos: "100% 6%",
    credential: "MSc Environmental Economics",
    tagline: "The architect of SikaFields' MRV integrity layer.",
    highlight: "Leads research, product design, and scientific verification frameworks.",
    domains: ["Product Strategy", "MRV", "Research"],
    country: "🇳🇱 Netherlands",
  },
  {
    name: "Charlotte Owusu-Ansah",
    suffix: "",
    role: "Chief Talent & Admin Officer",
    bgPos: "0% 82%",
    credential: "HR Leadership",
    tagline: "Building the human infrastructure for climate impact.",
    highlight: "Drives culture, talent acquisition, and operational excellence.",
    domains: ["Talent", "Operations", "Culture"],
    country: "🇬🇭 Ghana",
  },
  {
    name: "Vijay Palat",
    suffix: "",
    role: "Chief Strategy & Sustainability Officer",
    bgPos: "47% 82%",
    credential: "ESG Strategy Expert",
    tagline: "Translating global sustainability frameworks into local action.",
    highlight: "Leads SikaFields' ESG strategy, investor relations, and policy engagement.",
    domains: ["ESG Strategy", "Sustainability", "Policy"],
    country: "🇮🇳 India",
  },
];

const DOMAIN_COLORS: Record<string, string> = {
  "Carbon Markets": "#dcfce7",
  "Climate Policy": "#d1fae5",
  "AgriTech": "#bbf7d0",
  "Finance": "#fef9c3",
  "Investment": "#fef08a",
  "African Capital Markets": "#fde68a",
  "Product Strategy": "#e0f2fe",
  "MRV": "#bae6fd",
  "Research": "#93c5fd",
  "Talent": "#fce7f3",
  "Operations": "#f3e8ff",
  "Culture": "#e9d5ff",
  "ESG Strategy": "#d1fae5",
  "Sustainability": "#a7f3d0",
  "Policy": "#6ee7b7",
};

export function SpotlightStage() {
  const [active, setActive] = useState(0);
  const person = LEADERS[active];

  return (
    <div className="min-h-screen bg-[#040d07] font-['Inter'] flex flex-col">

      {/* Main spotlight */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: "580px" }}>

        {/* Full-bleed photo */}
        {LEADERS.map((p, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/__mockup/images/leadership-team.png')",
                backgroundSize: "320% 265%",
                backgroundPosition: p.bgPos,
                backgroundRepeat: "no-repeat",
                filter: "brightness(0.6) saturate(0.9)",
              }}
            />
          </div>
        ))}

        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(4,13,7,0.92) 0%, rgba(4,13,7,0.3) 55%, rgba(4,13,7,0.0) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, #040d07, transparent)" }} />

        {/* Content pane — left side */}
        <div className="absolute inset-0 flex flex-col justify-end p-10 pb-6 max-w-[55%]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {person.domains.map(d => (
                <span
                  key={d}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: DOMAIN_COLORS[d] || "#dcfce7", color: "#14532d" }}
                >
                  {d}
                </span>
              ))}
            </div>

            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">{person.credential}</p>
            <h2 className="font-['Sora'] font-black text-white leading-tight mb-0.5" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              {person.name}
            </h2>
            {person.suffix && <sup className="text-emerald-400 text-lg font-bold -mt-3 block">{person.suffix}</sup>}
            <p className="text-emerald-300/80 text-base font-semibold mb-3">{person.role}</p>
            <p className="text-white/60 text-sm leading-relaxed mb-1 max-w-sm">{person.tagline}</p>
            <p className="text-white/40 text-xs leading-relaxed max-w-sm">{person.highlight}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-white/40 text-xs">{person.country}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-emerald-400 text-xs font-medium">SikaFields Leadership</span>
            </div>
          </div>
        </div>

        {/* Slide index top-right */}
        <div className="absolute top-6 right-8 flex items-center gap-1">
          <span className="text-white text-2xl font-black font-['Sora']">0{active + 1}</span>
          <span className="text-white/30 text-2xl font-bold">/</span>
          <span className="text-white/30 text-2xl font-bold">0{LEADERS.length}</span>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-3 px-10 py-5 bg-[#040d07] border-t border-white/5 overflow-x-auto">
        {LEADERS.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="flex-shrink-0 group flex flex-col items-center gap-1.5 transition-all duration-200"
            style={{ opacity: i === active ? 1 : 0.45 }}
          >
            <div
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{
                width: "60px",
                height: "60px",
                backgroundImage: "url('/__mockup/images/leadership-team.png')",
                backgroundSize: "320% 265%",
                backgroundPosition: p.bgPos,
                backgroundRepeat: "no-repeat",
                outline: i === active ? "2px solid #4ade80" : "2px solid transparent",
                outlineOffset: "2px",
              }}
            />
            <p className="text-white/70 text-[9px] font-semibold text-center leading-tight max-w-[70px]">
              {p.name.split(" ")[0]}
            </p>
          </button>
        ))}

        <div className="flex-1" />

        {/* Nav arrows */}
        <div className="flex items-center gap-2 self-start mt-1">
          <button
            onClick={() => setActive(a => Math.max(0, a - 1))}
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors text-sm font-bold"
          >
            ←
          </button>
          <button
            onClick={() => setActive(a => Math.min(LEADERS.length - 1, a + 1))}
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors text-sm font-bold"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
