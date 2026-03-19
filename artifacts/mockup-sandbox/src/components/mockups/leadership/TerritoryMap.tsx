import { useState } from "react";

const TERRITORIES = [
  {
    id: "africa",
    label: "West Africa",
    flag: "🇬🇭",
    countries: "Ghana · Nigeria",
    color: "#16a34a",
    bg: "#f0faf4",
    border: "#bbf7d0",
    context: "Primary operations hub. Farm enrollment, field coordination, and carbon methodology design.",
    stats: [{ v: "47,000+", l: "Farmers enrolled" }, { v: "12", l: "Field coordinators" }],
    members: [
      { name: "Daniel Asare-Kyei", suffix: "PhD", role: "CEO", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership", city: "Accra, GH" },
      { name: "William Osei Agyemang", suffix: "", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership", city: "Accra, GH" },
      { name: "Charlotte Owusu-Ansah", suffix: "", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership", city: "Accra, GH" },
      { name: "Derrick Adu Gyamfi", suffix: "", role: "Advisor", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory", city: "Ghana" },
      { name: "Festus W. Amoyaw", suffix: "", role: "Advisor", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory", city: "Ghana" },
      { name: "Nana Ama Boateng-Kagyah", suffix: "", role: "Advisor", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory", city: "Ghana" },
      { name: "Olubgenga O. Awe", suffix: "", role: "Advisor", bgPos: "100% 90%", bgSize: "320% 340%", img: "advisory", city: "Lagos, NG" },
    ],
  },
  {
    id: "europe",
    label: "Europe",
    flag: "🇳🇱",
    countries: "Netherlands",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#e9d5ff",
    context: "MRV research & product. Leads scientific methodology and carbon accounting validation.",
    stats: [{ v: "98.7%", l: "Satellite accuracy" }, { v: "v3.1", l: "Carbon algorithm" }],
    members: [
      { name: "Valentijn Venus", suffix: "", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership", city: "Amsterdam, NL" },
      { name: "Dr. Cheryl Sterling", suffix: "", role: "Advisor", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory", city: "Europe" },
    ],
  },
  {
    id: "gulf",
    label: "Gulf / MENA",
    flag: "🇦🇪",
    countries: "UAE — DIFC",
    color: "#0891b2",
    bg: "#f0f9ff",
    border: "#bae6fd",
    context: "Holding entity. DIFC registration unlocks institutional-grade global investor access.",
    stats: [{ v: "DIFC", l: "Regulated entity" }, { v: "2021", l: "Registration year" }],
    members: [
      { name: "Vijay Palat", suffix: "", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership", city: "Dubai, AE" },
      { name: "Valentijn Venus", suffix: "", role: "Advisor", bgPos: "50% 90%", bgSize: "320% 340%", img: "advisory", city: "UAE" },
    ],
  },
  {
    id: "asia",
    label: "South Asia",
    flag: "🇮🇳",
    countries: "India",
    color: "#ca8a04",
    bg: "#fffbeb",
    border: "#fde68a",
    context: "Farmer enrollment and carbon program expansion across smallholder farming communities.",
    stats: [{ v: "8,000+", l: "Indian farmers" }, { v: "3", l: "State programs" }],
    members: [
      { name: "Vijay Palat", suffix: "", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership", city: "India" },
    ],
  },
];

function MemberPip({ m, color }: { m: typeof TERRITORIES[0]["members"][0]; color: string }) {
  return (
    <div className="flex items-center gap-2 group/m">
      <div
        className="w-8 h-8 rounded-lg shrink-0"
        style={{
          backgroundImage: `url('/__mockup/images/${m.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
          backgroundSize: m.bgSize,
          backgroundPosition: m.bgPos,
          backgroundRepeat: "no-repeat",
          outline: `2px solid ${color}40`,
          outlineOffset: "1px",
        }}
      />
      <div className="min-w-0">
        <p className="text-[#0d1f12] text-[11px] font-bold leading-tight truncate">{m.name.split(" ").slice(0, 2).join(" ")}{m.suffix && <sup style={{ color }} className="text-[9px]"> {m.suffix}</sup>}</p>
        <p className="text-[10px]" style={{ color }}>{m.role} · {m.city}</p>
      </div>
    </div>
  );
}

export function TerritoryMap() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white font-['Inter'] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-[#f0f7f2]">
        <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Global Operations</p>
        <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">The Team Is Already on the Ground</h2>
        <p className="text-[#5a7a65] text-sm mt-1.5">11 people across 4 territories — not a headquarters, a distributed presence.</p>
      </div>

      {/* Territory cards */}
      <div className="flex-1 px-8 py-6 flex gap-4">
        {TERRITORIES.map((t) => {
          const isActive = active === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setActive(isActive ? null : t.id)}
              className="flex-1 rounded-2xl border transition-all cursor-pointer flex flex-col overflow-hidden"
              style={{
                backgroundColor: t.bg,
                borderColor: isActive ? t.color : t.border,
                boxShadow: isActive ? `0 0 0 2px ${t.color}40` : undefined,
                minWidth: t.id === "africa" ? "260px" : "180px",
                flex: t.id === "africa" ? "2.2" : "1",
              }}
            >
              {/* Territory header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-3xl">{t.flag}</span>
                    <p className="font-black text-[#0d1f12] text-base font-['Sora'] mt-1">{t.label}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t.color }}>{t.countries}</p>
                  </div>
                  <span
                    className="text-[10px] font-black rounded-full px-2 py-0.5 mt-1"
                    style={{ backgroundColor: `${t.color}20`, color: t.color }}
                  >
                    {t.members.length} {t.members.length === 1 ? "person" : "people"}
                  </span>
                </div>
                <p className="text-[#5a7a65] text-xs leading-relaxed">{t.context}</p>
              </div>

              {/* Stats */}
              <div className="mx-5 mb-4 flex gap-3">
                {t.stats.map((s, i) => (
                  <div key={i} className="flex-1 rounded-xl p-3" style={{ backgroundColor: `${t.color}12` }}>
                    <p className="font-black text-lg font-['Sora']" style={{ color: t.color }}>{s.v}</p>
                    <p className="text-[10px] text-[#5a7a65]">{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Member pips */}
              <div className="flex-1 px-5 pb-5 space-y-2.5">
                <div className="h-px mb-3" style={{ backgroundColor: t.border }} />
                {t.members.map((m, i) => (
                  <MemberPip key={i} m={m} color={t.color} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: timezone spread */}
      <div className="px-8 pb-6">
        <div className="rounded-2xl border border-[#f0f7f2] bg-[#fafdf9] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8fa89a] mb-3">Timezone Spread — UTC offset</p>
          <div className="relative h-4 bg-[#f0f7f2] rounded-full overflow-hidden">
            {[{ label: "GMT (Ghana)", pct: 27, color: "#16a34a" }, { label: "CET (Netherlands)", pct: 36, color: "#7c3aed" }, { label: "GST (Dubai)", pct: 58, color: "#0891b2" }, { label: "IST (India)", pct: 70, color: "#ca8a04" }].map((z, i) => (
              <div key={i} className="absolute top-0 bottom-0 w-2 rounded-full" style={{ left: `${z.pct}%`, backgroundColor: z.color }} title={z.label} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-[#8fa89a]">UTC-12</span>
            <span className="text-[9px] text-[#5a7a65] font-semibold">6-hour team coverage spread · someone is always online</span>
            <span className="text-[9px] text-[#8fa89a]">UTC+12</span>
          </div>
        </div>
      </div>
    </div>
  );
}
