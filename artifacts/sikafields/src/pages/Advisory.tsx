import { motion } from "framer-motion";
import { ArrowLeft, Linkedin, Building2, Globe, Users, MapPin } from "lucide-react";
import { Link } from "wouter";

const CSUITE = [
  {
    name: "Daniel Asare-Kyei",
    suffix: "PhD",
    role: "Chief Executive Officer",
    credential: "PhD Environmental Science · 10+ yrs Carbon Markets",
    domains: ["Carbon Markets", "Climate Policy", "AgriTech"],
    quote: "Building the bridge between African land and global climate capital.",
    bgPos: "0% 6%",
    bgSize: "320% 265%",
    img: "leadership-team",
    color: "#16a34a",
    territory: "Ghana",
    linkedin: "https://www.linkedin.com/in/dasarekyeiprofile/",
  },
  {
    name: "William Osei Agyemang",
    suffix: "",
    role: "Chief Finance Officer",
    credential: "ACCA Certified · Structured Finance & Investment",
    domains: ["Finance", "African Markets", "Investment"],
    quote: "Sound capital structure is what turns climate missions into durable businesses.",
    bgPos: "50% 6%",
    bgSize: "320% 265%",
    img: "leadership-team",
    color: "#0f766e",
    territory: "Ghana · UAE/DIFC",
    linkedin: "https://www.linkedin.com/in/william-osei-agyemang-35b79a22",
  },
  {
    name: "Valentijn Venus",
    suffix: "",
    role: "Chief Product & Research Officer",
    credential: "MSc Environmental Economics · MRV Design",
    domains: ["Product Strategy", "Research", "MRV Design"],
    quote: "Data integrity is the bedrock of every credit we issue.",
    bgPos: "100% 6%",
    bgSize: "320% 265%",
    img: "leadership-team",
    color: "#b45309",
    territory: "Netherlands",
    linkedin: "https://www.linkedin.com/in/valentijn-venus/",
  },
  {
    name: "Charlotte Owusu-Ansah",
    suffix: "",
    role: "Chief Talent & Administrative Officer",
    credential: "HR Leadership · Organisational Development",
    domains: ["Talent", "Operations", "Culture"],
    quote: "Our people are the soil from which our impact grows.",
    bgPos: "0% 82%",
    bgSize: "320% 265%",
    img: "leadership-team",
    color: "#16a34a",
    territory: "Ghana",
    linkedin: "https://www.linkedin.com/in/charlotte-owusu-ansah-a292391a6",
  },
  {
    name: "Vijay Palat",
    suffix: "",
    role: "Chief Strategy & Sustainability Officer",
    credential: "ESG Strategy Expert · Policy & Sustainability Frameworks",
    domains: ["ESG Strategy", "Sustainability", "Policy"],
    quote: "True sustainability means being here for the next generation of farmers.",
    bgPos: "47% 82%",
    bgSize: "320% 265%",
    img: "leadership-team",
    color: "#0f766e",
    territory: "India",
    linkedin: "",
  },
  {
    name: "Dr. Kwame Ofosu Debrah",
    suffix: "PhD",
    role: "Chief Technology Officer",
    credential: "PhD Technology & Innovation · Mobile-First Platform Architecture",
    domains: ["Mobile Tech", "Platform Architecture", "AgriTech"],
    quote: "Architect of our mobile-first platform, bridging technology gaps for smallholder farmers across emerging markets.",
    bgPos: "center 10%",
    bgSize: "cover",
    img: "dr-kwame",
    color: "#0f766e",
    territory: "Manchester, UK",
    linkedin: "https://www.linkedin.com/in/kwamefosu",
  },
];

const ADVISORS = [
  {
    name: "Derrick Adu Gyamfi",
    suffix: "",
    role: "Advisory Board Member",
    credential: "Capital Markets & Finance · Advisory & Investment Strategy",
    domains: ["Capital Markets", "Advisory", "Governance"],
    quote: "Strong governance is the foundation of credible climate finance.",
    bgPos: "0% 42%",
    bgSize: "320% 340%",
    img: "advisory-board",
    color: "#166534",
    focus: "Capital markets guidance",
    linkedin: "https://www.linkedin.com/in/derick-adu-gyamfi-esq-7011901b4/",
  },
  {
    name: "Dr. Cheryl Sterling",
    suffix: "",
    role: "Advisory Board Member",
    credential: "Doctorate — Policy Research · Sustainability & ESG Frameworks",
    domains: ["Policy Research", "Sustainability", "ESG"],
    quote: "Evidence-based policy is how we scale real impact.",
    bgPos: "50% 42%",
    bgSize: "320% 340%",
    img: "advisory-board",
    color: "#0f766e",
    focus: "Policy research & ESG",
    linkedin: "https://www.linkedin.com/in/cheryl-sterling-a33890aa/",
  },
  {
    name: "Festus William Amoyaw",
    suffix: "",
    role: "Advisory Board Member",
    credential: "Agribusiness Development · Agriculture & Rural Partnerships",
    domains: ["Agribusiness", "Rural Dev.", "Partnerships"],
    quote: "Farming communities are the backbone of every carbon project we build.",
    bgPos: "100% 42%",
    bgSize: "320% 340%",
    img: "advisory-board",
    color: "#b45309",
    focus: "Agribusiness & rural dev.",
    linkedin: "https://www.linkedin.com/in/festus-william-amoyaw-13152b7/",
  },
  {
    name: "Nana Ama Boateng-Kagyah",
    suffix: "",
    role: "Advisory Board Member",
    credential: "Legal & Compliance · Corporate Law & Governance",
    domains: ["Legal", "Compliance", "Governance"],
    quote: "Clear legal frameworks protect both farmers and investors.",
    bgPos: "0% 90%",
    bgSize: "320% 340%",
    img: "advisory-board",
    color: "#166534",
    focus: "Legal & compliance",
    linkedin: "https://www.linkedin.com/in/nana-ama-boateng-b7b1915/",
  },
  {
    name: "Valentijn Venus",
    suffix: "",
    role: "Advisory Board Member",
    credential: "MSc Environmental Economics · Research & Product Strategy",
    domains: ["Product Strategy", "Research", "MRV Design"],
    quote: "Data integrity is the bedrock of every credit we issue.",
    bgPos: "50% 90%",
    bgSize: "320% 340%",
    img: "advisory-board",
    color: "#0f766e",
    focus: "MRV methodology",
    linkedin: "https://www.linkedin.com/in/valentijn-venus/",
  },
  {
    name: "Olubgenga Olanrewaju Awe",
    suffix: "",
    role: "Group Head, Structured Trade & Commodities Finance",
    credential: "The Alternative Bank · Structured Trade Finance",
    domains: ["Trade Finance", "Commodities", "Banking"],
    quote: "Structured finance is the engine that connects climate projects to global capital.",
    bgPos: "100% 90%",
    bgSize: "320% 340%",
    img: "advisory-board",
    color: "#166534",
    focus: "Structured trade finance",
    linkedin: "",
  },
];

function PersonCard({
  person,
  index,
}: {
  person: typeof CSUITE[0] | typeof ADVISORS[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group"
    >
      {/* Photo + color bar */}
      <div className="relative">
        <div className="h-1.5 w-full" style={{ backgroundColor: person.color }} />
        <div className="p-6 pb-4 flex items-start gap-5">
          <div
            className="w-20 h-20 rounded-2xl shrink-0"
            style={{
              backgroundImage: `url('/${person.img}${person.img === "dr-kwame" ? ".jpeg" : ".png"}')`,
              backgroundSize: person.bgSize,
              backgroundPosition: person.bgPos,
              backgroundRepeat: "no-repeat",
              outline: `3px solid ${person.color}30`,
              outlineOffset: "2px",
            }}
          />
          <div className="flex-1 min-w-0 pt-1">
            <p className="font-bold text-foreground text-base leading-tight">
              {person.name}
              {person.suffix && (
                <sup className="text-[11px] ml-1" style={{ color: person.color }}>
                  {person.suffix}
                </sup>
              )}
            </p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: person.color }}>
              {person.role}
            </p>
            {"territory" in person && person.territory && (
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{person.territory}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pb-5 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">{person.credential}</p>

        <blockquote
          className="text-sm italic leading-relaxed border-l-2 pl-3"
          style={{ borderColor: person.color, color: "#374151" }}
        >
          "{person.quote}"
        </blockquote>

        <div className="flex flex-wrap gap-1.5">
          {person.domains.map((d) => (
            <span
              key={d}
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ color: person.color, backgroundColor: `${person.color}15` }}
            >
              {d}
            </span>
          ))}
        </div>

        {person.linkedin && (
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm"
            style={{
              color: person.color,
              borderColor: `${person.color}40`,
              backgroundColor: `${person.color}08`,
            }}
          >
            <Linkedin className="w-4 h-4" />
            View LinkedIn
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function AdvisoryPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Simple top bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to SikaFields
          </Link>
          <img src="/sikafields-logo.png" alt="SikaFields" className="h-8 object-contain" />
          <div className="w-28" />
        </div>
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[#0d2418] via-[#133d22] to-[#0d2418] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-semibold mb-6 border border-white/20">
              <Building2 className="w-4 h-4" />
              Our People
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-5 leading-tight">
              Leadership &<br />
              <span className="text-[#4ade80]">Advisory Board</span>
            </h1>
            <p className="text-white/75 text-lg max-w-2xl mx-auto leading-relaxed">
              Six C-Suite leaders and six domain advisors — every one of them named, reachable, and accountable for the outcomes we claim.
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            {[
              { label: "C-Suite Leaders", value: "6" },
              { label: "Advisors", value: "6" },
              { label: "Countries Represented", value: "4" },
              { label: "Combined Domain Experience", value: "80+ yrs" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-display font-black text-[#4ade80]">{s.value}</p>
                <p className="text-white/60 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* C-Suite section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Executive Team
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Six domain specialists leading operations across Ghana, India, the Netherlands, UAE/DIFC, and Manchester, UK.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CSUITE.map((person, i) => (
              <PersonCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-border" />
      </div>

      {/* Advisory Board section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Advisory Board
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Six senior advisors — spanning capital markets, policy, law, agribusiness, MRV science, and structured trade finance.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ADVISORS.map((person, i) => (
              <PersonCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="border-t border-border py-8 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 SikaFields. All rights reserved.</p>
          <Link href="/" className="hover:text-primary transition-colors font-semibold">← Back to homepage</Link>
        </div>
      </div>
    </div>
  );
}
