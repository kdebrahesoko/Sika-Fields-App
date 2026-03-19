const PROOFS = [
  {
    type: "stat",
    category: "Farmer Impact",
    headline: "47,000+",
    sub: "Smallholder farmers enrolled across Africa & India",
    color: "#16a34a",
    bg: "#f0faf4",
    border: "#bbf7d0",
    owners: [
      { name: "Daniel Asare-Kyei", role: "CEO", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership" },
      { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership" },
    ],
  },
  {
    type: "stat",
    category: "Climate Outcome",
    headline: "2.3M tCO₂",
    sub: "Verified carbon credits sequestered to date",
    color: "#0f766e",
    bg: "#f0fdfa",
    border: "#99f6e4",
    owners: [
      { name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership" },
      { name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership" },
    ],
  },
  {
    type: "cert",
    category: "Regulatory",
    headline: "DIFC Registered",
    sub: "Dubai International Financial Centre entity — global institutional access",
    color: "#0891b2",
    bg: "#f0f9ff",
    border: "#bae6fd",
    owners: [
      { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership" },
      { name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership" },
    ],
  },
  {
    type: "stat",
    category: "Geographical Reach",
    headline: "4 Countries",
    sub: "Active operations in Ghana, Kenya, India, and Nigeria",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    owners: [
      { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership" },
      { name: "Daniel Asare-Kyei", role: "CEO", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership" },
    ],
  },
  {
    type: "cert",
    category: "Scientific Integrity",
    headline: "VCS + CCB Standards",
    sub: "Verra Verified Carbon Standard with Climate, Community & Biodiversity co-benefits",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#e9d5ff",
    owners: [
      { name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership" },
      { name: "Dr. Cheryl Sterling", role: "Policy Advisor", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory" },
    ],
  },
  {
    type: "stat",
    category: "Financial Structure",
    headline: "$12M+",
    sub: "Capital raised across development finance and climate impact investors",
    color: "#ca8a04",
    bg: "#fefce8",
    border: "#fde68a",
    owners: [
      { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership" },
      { name: "Derrick Adu Gyamfi", role: "Capital Advisor", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory" },
    ],
  },
  {
    type: "cert",
    category: "Farmer Retention",
    headline: "94%",
    sub: "Annual farmer re-enrollment rate — the highest in-class retention signal",
    color: "#16a34a",
    bg: "#f0faf4",
    border: "#bbf7d0",
    owners: [
      { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership" },
      { name: "Festus W. Amoyaw", role: "Agribiz Advisor", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory" },
    ],
  },
  {
    type: "cert",
    category: "Legal Framework",
    headline: "Multi-Jurisdiction",
    sub: "Legal framework covering Ghana, India, Nigeria, and UAE/DIFC",
    color: "#dc2626",
    bg: "#fff5f5",
    border: "#fecaca",
    owners: [
      { name: "Nana Ama Boateng-Kagyah", role: "Legal Advisor", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory" },
      { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership" },
    ],
  },
];

function OwnerChip({ owner }: { owner: typeof PROOFS[0]["owners"][0] }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-6 h-6 rounded-full shrink-0"
        style={{
          backgroundImage: `url('/__mockup/images/${owner.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
          backgroundSize: owner.bgSize,
          backgroundPosition: owner.bgPos,
          backgroundRepeat: "no-repeat",
          outline: "1.5px solid white",
          outlineOffset: "0px",
        }}
      />
      <span className="text-[10px] font-semibold text-[#5a7a65] whitespace-nowrap">{owner.name.split(" ")[0]} · {owner.role}</span>
    </div>
  );
}

export function TrustWall() {
  return (
    <div className="min-h-screen bg-[#f8faf8] font-['Inter'] flex flex-col">
      <div className="px-8 pt-8 pb-4">
        <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Evidence of Impact</p>
        <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12]">The Proof Behind Every Claim</h2>
        <p className="text-[#5a7a65] text-sm mt-1.5">Each metric and certification is backed by a named accountable team member.</p>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="grid grid-cols-4 gap-4 h-full">
          {PROOFS.map((proof, i) => (
            <div
              key={i}
              className="rounded-2xl border p-4 flex flex-col group hover:shadow-lg transition-all cursor-default"
              style={{ backgroundColor: proof.bg, borderColor: proof.border }}
            >
              {/* Category badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: proof.color, backgroundColor: `${proof.color}18` }}>
                  {proof.category}
                </span>
                {proof.type === "cert" && (
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke={proof.color} strokeWidth="1.5" />
                    <path d="M5 8l2 2 4-4" stroke={proof.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Main claim */}
              <p className="font-black text-[#0d1f12] text-2xl font-['Sora'] leading-tight mb-1.5">{proof.headline}</p>
              <p className="text-[#5a7a65] text-xs leading-relaxed flex-1">{proof.sub}</p>

              {/* Separator */}
              <div className="mt-3 mb-3 h-px" style={{ backgroundColor: proof.border }} />

              {/* Accountability owners */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8fa89a] mb-2">Accountable</p>
                <div className="space-y-1.5">
                  {proof.owners.map((owner, oi) => (
                    <OwnerChip key={oi} owner={owner} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
