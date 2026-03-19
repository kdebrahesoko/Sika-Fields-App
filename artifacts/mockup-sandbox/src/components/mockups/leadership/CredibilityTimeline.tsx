const EVENTS = [
  {
    type: "company",
    year: "2014",
    title: "Esoko Founded",
    body: "The AgriTech platform that would become SikaFields' parent launches in Ghana, connecting smallholder farmers to markets.",
    color: "#16a34a",
  },
  {
    type: "person",
    year: "2016",
    name: "Daniel Asare-Kyei",
    suffix: "PhD",
    role: "Founder & CEO",
    bgPos: "0% 6%",
    bgSize: "320% 265%",
    img: "leadership",
    credential: "PhD Environmental Science",
    credentialSub: "Specialised in carbon sequestration models for smallholder agriculture",
    domains: ["Carbon Markets", "Climate Policy", "AgriTech"],
    color: "#16a34a",
    body: "Joins Esoko as climate lead; begins developing the carbon credit framework that will become SikaFields.",
  },
  {
    type: "person",
    year: "2018",
    name: "Vijay Palat",
    suffix: "",
    role: "Chief Strategy & Sustainability Officer",
    bgPos: "47% 82%",
    bgSize: "320% 265%",
    img: "leadership",
    credential: "ESG Strategy Expert",
    credentialSub: "18+ yrs in policy and sustainability frameworks",
    domains: ["ESG Strategy", "Sustainability", "Policy"],
    color: "#0f766e",
    body: "Leads development of SikaFields' ESG strategy framework and DIFC registration process.",
  },
  {
    type: "person",
    year: "2019",
    name: "William Osei Agyemang",
    suffix: "",
    role: "Chief Finance Officer",
    bgPos: "50% 6%",
    bgSize: "320% 265%",
    img: "leadership",
    credential: "ACCA Certified",
    credentialSub: "15+ yrs in investment banking and development finance",
    domains: ["Finance", "Investment", "African Markets"],
    color: "#ca8a04",
    body: "Structures SikaFields' financial architecture and investor relations framework.",
  },
  {
    type: "company",
    year: "2021",
    title: "DIFC Registration",
    body: "SikaFields incorporated in the Dubai International Financial Centre as a holding company — unlocking global institutional investor access.",
    color: "#0891b2",
  },
  {
    type: "person",
    year: "2021",
    name: "Valentijn Venus",
    suffix: "",
    role: "Chief Product & Research Officer",
    bgPos: "100% 6%",
    bgSize: "320% 265%",
    img: "leadership",
    credential: "MSc Environmental Economics",
    credentialSub: "Leads MRV framework design and product strategy",
    domains: ["Product Strategy", "Research", "MRV Design"],
    color: "#7c3aed",
    body: "Builds the MRV (Monitoring, Reporting, Verification) engine — the scientific core of every credit SikaFields issues.",
  },
  {
    type: "company",
    year: "2022",
    title: "Ghana Country Office",
    body: "First Africa operations base opens in Accra. First carbon farm pilot launches with 200 smallholder farmers in the Western Region.",
    color: "#16a34a",
  },
  {
    type: "person",
    year: "2022",
    name: "Charlotte Owusu-Ansah",
    suffix: "",
    role: "Chief Talent & Admin Officer",
    bgPos: "0% 82%",
    bgSize: "320% 265%",
    img: "leadership",
    credential: "HR Leadership",
    credentialSub: "Org development and talent acquisition specialist",
    domains: ["Talent", "Operations", "Culture"],
    color: "#db2777",
    body: "Builds the team infrastructure to support SikaFields' rapid expansion across four countries.",
  },
  {
    type: "company",
    year: "2023",
    title: "Advisory Board Formed",
    body: "Six domain specialists join as advisors: capital markets, policy research, agribusiness, legal, trade finance and environmental economics.",
    color: "#0f766e",
  },
  {
    type: "company",
    year: "2024",
    title: "10,000+ Farmers Enrolled",
    body: "SikaFields reaches its first major milestone — ten thousand smallholder farmers across Africa and India generating verified carbon credits.",
    color: "#16a34a",
  },
];

export function CredibilityTimeline() {
  return (
    <div className="min-h-screen bg-[#fafdf9] font-['Inter']">
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-14">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Credibility Timeline</p>
          <h2 className="text-3xl font-['Sora'] font-black text-[#0d1f12] leading-tight">How We Built This Team</h2>
          <p className="text-[#5a7a65] text-sm mt-2 max-w-xl">Trust isn't claimed — it's assembled over time. This is the story of how SikaFields came together.</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[88px] top-0 bottom-0 w-px bg-[#d1fae5]" />

          <div className="space-y-0">
            {EVENTS.map((event, i) => (
              <div key={i} className="relative flex gap-6 pb-8">
                {/* Year + dot */}
                <div className="shrink-0 w-[88px] text-right relative">
                  <span className="text-[#0d1f12] text-sm font-black font-['Sora']">{event.year}</span>
                  {/* Dot on the line */}
                  <div
                    className="absolute top-1 -right-[5px] w-[10px] h-[10px] rounded-full border-2 border-white"
                    style={{ backgroundColor: event.color }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  {event.type === "company" ? (
                    <div
                      className="rounded-2xl p-4 border"
                      style={{ backgroundColor: `${event.color}0d`, borderColor: `${event.color}30` }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: event.color }}>
                          Milestone
                        </span>
                      </div>
                      <p className="font-black text-[#0d1f12] text-base leading-snug mb-1">{event.title}</p>
                      <p className="text-[#5a7a65] text-sm leading-relaxed">{event.body}</p>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      {/* Photo */}
                      <div
                        className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                        style={{
                          backgroundImage: `url('/__mockup/images/${event.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                          backgroundSize: event.bgSize,
                          backgroundPosition: event.bgPos,
                          backgroundRepeat: "no-repeat",
                          outline: `2px solid ${event.color}60`,
                          outlineOffset: "2px",
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-[#0d1f12] text-sm leading-tight">
                              {event.name}
                              {event.suffix && <sup className="text-[10px] ml-0.5" style={{ color: event.color }}>{event.suffix}</sup>}
                            </p>
                            <p className="text-xs font-semibold mt-0.5" style={{ color: event.color }}>{event.role}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-[10px] font-bold text-[#8fa89a] uppercase tracking-wide">{event.credential}</span>
                          </div>
                        </div>
                        <p className="text-[#5a7a65] text-xs leading-relaxed mt-1.5">{event.body}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {event.domains?.map((d: string) => (
                            <span
                              key={d}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                              style={{ backgroundColor: `${event.color}18`, color: event.color }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* End dot */}
            <div className="relative flex gap-6">
              <div className="shrink-0 w-[88px] text-right">
                <span className="text-[#16a34a] text-sm font-black font-['Sora']">Now</span>
                <div className="absolute top-1 -right-[5px] w-[10px] h-[10px] rounded-full border-2 border-white bg-[#16a34a]" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="inline-flex items-center gap-2 bg-[#16a34a] text-white rounded-xl px-4 py-2">
                  <span className="text-sm font-bold">47,000+ Farmers · 2.3M tonnes CO₂ · DIFC Registered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
