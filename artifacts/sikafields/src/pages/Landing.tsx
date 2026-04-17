import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Leaf, Globe, Wind, Sprout, ArrowRight, X, Menu,
  CheckCircle2, LineChart, ShieldCheck, MapPin,
  ChevronRight, Languages, BarChart2, Users, BookOpen,
  Newspaper, Radio, FileText, CalendarDays,
  Target, TreePine, DollarSign, Building2, Smartphone,
  SatelliteDish, HeartHandshake, TrendingUp, AlertTriangle,
  Lightbulb, Info, Phone, Mail, Clock, Send, Loader2, Linkedin, Images,
  LayoutDashboard
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Show, useUser, useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/lib/auth";
import { LogOut, UserCircle } from "lucide-react";
import HeroCanvas from "@/components/HeroCanvas";
import RotatingGlobe from "@/components/RotatingGlobe";
import GallerySection from "@/components/GallerySection";
import EventsSection from "@/components/EventsSection";

// Constants & Data
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const ACTIVE_REGIONS = [
  { name: "Nigeria", coordinates: [8.6753, 9.082], farmers: "8,400", co2: "450k" },
  { name: "Kenya", coordinates: [37.9062, -0.0236], farmers: "12,100", co2: "620k" },
  { name: "Ghana", coordinates: [-1.0232, 7.9465], farmers: "5,200", co2: "290k" },
  { name: "Tanzania", coordinates: [34.8888, -6.369], farmers: "7,800", co2: "410k" },
  { name: "Maharashtra, India", coordinates: [75.7139, 19.7515], farmers: "9,500", co2: "380k" },
  { name: "Rajasthan, India", coordinates: [74.2179, 27.0238], farmers: "4,000", co2: "180k" },
];

const FARMER_STORIES = [
  {
    id: 1,
    name: "Amara Diop",
    location: "Senegal",
    flag: "🇸🇳",
    age: 34,
    crop: "Millet & Groundnuts",
    farmSize: "3.2 hectares",
    co2: "18 tonnes/yr",
    pullQuote: "I earn carbon income even in dry seasons.",
    quote: "Before SikaFields, every dry season felt like a gamble. Now I have a second income stream from the carbon credits on my land. I planted cover crops as they suggested, and not only has my soil improved — I earned more last year than my entire previous harvest combined. My children can stay in school.",
    earnings: "$420/yr extra",
    initials: "AD",
    gradient: "from-emerald-600 to-teal-700",
    bg: "bg-emerald-50",
    tag: "Soil Carbon",
    image: "/farmer-amara.png",
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "Maharashtra",
    flag: "🇮🇳",
    age: 28,
    crop: "Cotton & Soybean",
    farmSize: "1.8 hectares",
    co2: "11 tonnes/yr",
    pullQuote: "My earnings tripled. The app works even without internet.",
    quote: "The offline mode was the game-changer for me. I live 40 km from the nearest town and our signal is unreliable. The SikaFields app records everything locally and syncs when I reach town. I went from struggling to pay school fees to putting money aside every month. Other women in my village now want to join.",
    earnings: "$650/yr extra",
    initials: "PS",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    tag: "Agroforestry",
    image: "/farmer-priya.png",
  },
  {
    id: 3,
    name: "Kofi Mensah",
    location: "Ashanti Region",
    flag: "🇬🇭",
    age: 45,
    crop: "Cocoa & Plantain",
    farmSize: "Cooperative – 200 farms",
    co2: "980 tonnes/yr",
    pullQuote: "We registered 200 farmers in one day.",
    quote: "As a co-op leader I had doubts — would this be too complicated for our members? But the SikaFields team came to us in person, spoke our language, and we onboarded 200 farmers in a single day. The collective credit revenue has funded a community borehole and a farm storage facility. This is what impact looks like.",
    earnings: "$3,200/yr (Co-op)",
    initials: "KM",
    gradient: "from-teal-600 to-cyan-700",
    bg: "bg-teal-50",
    tag: "Co-op Leader",
    image: "/farmer-kofi.png",
  },
  {
    id: 4,
    name: "Aisha Bello",
    location: "Kano State",
    flag: "🇳🇬",
    age: 31,
    crop: "Sesame & Sorghum",
    farmSize: "2.5 hectares",
    co2: "14 tonnes/yr",
    pullQuote: "For the first time, I own something that earns while I sleep.",
    quote: "Carbon credits were completely new to me. But SikaFields explained everything in Hausa. I now understand that by protecting the trees on my land and using better farming methods, I'm creating value the whole world needs. For the first time, I feel like my small farm matters on a global stage.",
    earnings: "$510/yr extra",
    initials: "AB",
    gradient: "from-violet-600 to-purple-700",
    bg: "bg-violet-50",
    tag: "REDD+ Project",
    image: "/farmer-aisha.png",
  },
  {
    id: 5,
    name: "Grace Wanjiku",
    location: "Nyeri County",
    flag: "🇰🇪",
    age: 39,
    crop: "Tea & Vegetables",
    farmSize: "1.2 hectares",
    co2: "9 tonnes/yr",
    pullQuote: "SikaFields turned my land into a living investment.",
    quote: "I was always told small farms can't compete. SikaFields proved that wrong. My land is certified, my credits are traded on the international market, and I get a fair share of the revenue. My husband jokes that our tea farm is now also a carbon farm. I tell him — it's both, and it's the future.",
    earnings: "$380/yr extra",
    initials: "GW",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    tag: "Forest Carbon",
    image: "/farmer-grace.png",
  },
  {
    id: 6,
    name: "Ravi Kumar",
    location: "Rajasthan",
    flag: "🇮🇳",
    age: 52,
    crop: "Wheat & Mustard",
    farmSize: "4.1 hectares",
    co2: "22 tonnes/yr",
    pullQuote: "My dry land is now worth something to the whole world.",
    quote: "Rajasthan is harsh land — drought is our companion. I never thought my farm could help fight climate change, but now I'm planting drought-resistant trees recommended by SikaFields' agronomists, sequestering carbon, and earning credits. My two sons who had moved to the city are thinking about coming back to farm.",
    earnings: "$740/yr extra",
    initials: "RK",
    gradient: "from-sky-600 to-blue-700",
    bg: "bg-sky-50",
    tag: "Dryland Carbon",
    image: "/farmer-ravi.png",
  },
];

const TRUST_LOGOS = [
  "Verified Carbon Standard",
  "Gold Standard",
  "UN REDD+",
  "World Bank Group",
  "UNFCCC",
  "Climate Action Reserve",
  "Plan Vivo"
];

// --- Subcomponents ---

function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  return (
    <div className="bg-accent text-accent-foreground px-4 py-3 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm font-medium">
        <div className="flex-1 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
          <span className="bg-accent-foreground/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider hidden sm:inline-block">New</span>
          <span>The 2026 Voluntary Carbon Market Report is here. <a href="#" className="underline underline-offset-2 hover:text-white/80 transition-colors font-bold">Read the insights →</a></span>
        </div>
        <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-accent-foreground/10 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const IMPACT_LINKS = [
  { label: "Our Impact", href: "#impact", icon: <BarChart2 className="w-4 h-4 text-primary" />, desc: "Working at a global scale" },
  { label: "Client Impact", href: "#impact", icon: <Users className="w-4 h-4 text-accent" />, desc: "Stories of transformation" },
  { label: "Case Studies", href: "#impact", icon: <BookOpen className="w-4 h-4 text-secondary" />, desc: "Deep-dive project results" },
  { label: "Carbon Projects", href: "#impact", icon: <Leaf className="w-4 h-4 text-primary" />, desc: "Live carbon initiatives" },
];

const RESOURCES_LINKS = [
  { label: "Articles & Updates", href: "/articles", icon: <Newspaper className="w-4 h-4 text-primary" />, desc: "Guides, insights and platform announcements" },
  { label: "Events Calendar", href: "/events", icon: <CalendarDays className="w-4 h-4 text-accent" />, desc: "Upcoming field days, buyer briefings and webinars by date" },
  { label: "Webinars & Podcasts", href: "#resources", icon: <Radio className="w-4 h-4 text-accent" />, desc: "Live sessions and audio episodes from the field" },
  { label: "Regulations & Standards", href: "#resources", icon: <FileText className="w-4 h-4 text-secondary" />, desc: "MRV frameworks and compliance guides" },
  { label: "Newsletters", href: "#resources", icon: <Radio className="w-4 h-4 text-accent" />, desc: "Monthly market insights to your inbox" },
];

const RESOURCES_FAQ_LINKS = [
  { label: "FAQ — Farmers & Landowners", href: "/faq?tab=farmers", icon: <Sprout className="w-4 h-4 text-primary" />, desc: "Carbon credits, joining, payments & more" },
  { label: "FAQ — Corporate Buyers", href: "/faq?tab=buyers", icon: <Building2 className="w-4 h-4 text-accent" />, desc: "ESG alignment, verification & pricing" },
];

const ABOUT_COMPANY_LINKS = [
  { label: "Our Mission", href: "#about", icon: <Target className="w-4 h-4 text-primary" />, desc: "Reducing emissions, empowering farmers" },
  { label: "Company Overview", href: "#about", icon: <BookOpen className="w-4 h-4 text-accent" />, desc: "Esoko spinout · 17 years of field infrastructure" },
  { label: "Gallery", href: "#gallery", icon: <Images className="w-4 h-4 text-primary" />, desc: "Our impact in photos — field, farm & community" },
  { label: "Market Opportunity", href: "#market-opportunity", icon: <TrendingUp className="w-4 h-4 text-secondary" />, desc: "Africa holds 30%+ of global removal potential" },
  { label: "Partners & Certifications", href: "#about", icon: <HeartHandshake className="w-4 h-4 text-primary" />, desc: "Open Forest Protocol & Verra" },
];

const ABOUT_TEAM_LINKS = [
  { label: "Our Leadership", href: "#leadership", icon: <Users className="w-4 h-4 text-accent" />, desc: "Meet the team driving our mission" },
  { label: "Advisory Board", href: "/advisory", icon: <Building2 className="w-4 h-4 text-secondary" />, desc: "Meet our full leadership & advisory board" },
  { label: "Contact Us", href: "#contact", icon: <Mail className="w-4 h-4 text-primary" />, desc: "Get in touch — we'd love to hear from you" },
];

const ABOUT_LINKS = [...ABOUT_COMPANY_LINKS, ...ABOUT_TEAM_LINKS];

function DesktopDropdown({ label, children, isOpen, setOpen, wide = false, buttonClassName }: {
  label: string;
  children: React.ReactNode;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  wide?: boolean;
  buttonClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        className={cn("flex items-center gap-1 hover:text-primary transition-colors", buttonClassName)}
        onClick={() => setOpen(!isOpen)}
      >
        {label}
        <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute top-full left-0 mt-2 bg-background border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden",
              wide ? "w-[480px]" : "min-w-[230px]"
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileAccordion({ label, children, isOpen, setOpen }: {
  label: string;
  children: React.ReactNode;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div>
      <button
        className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-xl font-medium text-left"
        onClick={() => setOpen(!isOpen)}
      >
        {label}
        <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavbarAuthSlot({ scrolled, isOpen, setOpen }: {
  scrolled: boolean;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useIsAdmin();
  const [, navigate] = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setOpen]);

  return (
    <>
      <Show when="signed-out">
        <button
          onClick={() => navigate("/sign-in")}
          className={cn(
            "font-semibold px-3 py-2 text-sm transition-colors",
            scrolled ? "text-foreground/70 hover:text-foreground" : "text-white hover:text-white/80"
          )}
        >
          Log In
        </button>
      </Show>
      <Show when="signed-in">
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!isOpen)}
            className={cn(
              "flex items-center gap-2 rounded-full transition-all",
              scrolled ? "hover:ring-2 hover:ring-primary/30" : "hover:ring-2 hover:ring-white/30"
            )}
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user.firstName ?? "User"} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                {(user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? "U").toUpperCase()}
              </div>
            )}
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white border border-border rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border bg-muted/40">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Signed in"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Admin
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => { setOpen(false); navigate("/admin/posts"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted hover:text-primary transition-colors text-left"
                    >
                      <Newspaper className="w-4 h-4 text-primary" />
                      Manage Posts
                    </button>
                    <button
                      onClick={() => { setOpen(false); navigate("/admin/users"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted hover:text-primary transition-colors text-left border-t border-border"
                    >
                      <UserCircle className="w-4 h-4 text-accent" />
                      Manage Users
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setOpen(false); void signOut({ redirectUrl: import.meta.env.BASE_URL || "/" }); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-600 transition-colors text-left border-t border-border"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Show>
    </>
  );
}

function MobileAuthSlot({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useIsAdmin();
  const [, navigate] = useLocation();

  return (
    <>
      <Show when="signed-out">
        <button
          onClick={() => { onClose(); navigate("/sign-in"); }}
          className="w-full p-3 hover:bg-muted rounded-xl font-medium text-left flex items-center gap-2"
        >
          <UserCircle className="w-4 h-4 text-primary" />
          Log In
        </button>
      </Show>
      <Show when="signed-in">
        <div className="px-3 py-3 border border-border rounded-xl bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {(user?.firstName?.[0] ?? "U").toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="space-y-1 mt-2">
              <button onClick={() => { onClose(); navigate("/admin/posts"); }} className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-white text-sm font-medium">
                <Newspaper className="w-4 h-4 text-primary" /> Manage Posts
              </button>
              <button onClick={() => { onClose(); navigate("/admin/users"); }} className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-white text-sm font-medium">
                <UserCircle className="w-4 h-4 text-accent" /> Manage Users
              </button>
            </div>
          )}
          <button
            onClick={() => { onClose(); void signOut({ redirectUrl: import.meta.env.BASE_URL || "/" }); }}
            className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </Show>
    </>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [mobileImpactOpen, setMobileImpactOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeAll = () => setMobileMenuOpen(false);

  const openDropdown = (name: "about" | "solutions" | "impact" | "resources" | "login") => {
    setAboutOpen(name === "about");
    setSolutionsOpen(name === "solutions");
    setImpactOpen(name === "impact");
    setResourcesOpen(name === "resources");
    setLoginOpen(name === "login");
  };

  return (
    <nav className={cn(
      "fixed w-full z-40 transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-lg shadow-sm border-b border-border/50 py-3" : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img
            src="/sikafields-logo-new.png"
            alt="SikaFields"
            className="h-9 w-auto object-contain transition-all duration-300"
            style={{
              filter: scrolled
                ? "drop-shadow(0 1px 2px rgba(0,0,0,0.5)) brightness(0.9)"
                : "drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
            }}
          />
        </a>

        {/* Desktop Nav */}
        <div className={cn("hidden md:flex items-center gap-8 font-medium text-sm transition-colors duration-300", scrolled ? "text-foreground/80" : "text-white/80")}>
          {/* About Us — two-column mega dropdown */}
          <DesktopDropdown label="About Us" isOpen={aboutOpen} setOpen={(v) => { if (v) openDropdown("about"); else setAboutOpen(false); }} wide>
            {/* Header strip */}
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">SikaFields</p>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">Empowering farmers. Healing the planet.</p>
              </div>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* Left: Company */}
              <div className="py-2">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Company</p>
                {ABOUT_COMPANY_LINKS.map((item, i) => (
                  <a key={i} href={item.href}
                    className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-muted hover:text-primary transition-colors group"
                    onClick={() => setAboutOpen(false)}
                  >
                    <span className="mt-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                    <div>
                      <div className="font-medium leading-none mb-0.5">{item.label}</div>
                      <div className="text-xs text-muted-foreground leading-snug">{item.desc}</div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Right: Team & Contact */}
              <div className="py-2">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Team & Contact</p>
                {ABOUT_TEAM_LINKS.map((item, i) => (
                  <a key={i} href={item.href}
                    className={cn(
                      "flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-muted hover:text-primary transition-colors group",
                      item.label === "Contact Us" && "mt-1 border-t border-border"
                    )}
                    onClick={() => setAboutOpen(false)}
                  >
                    <span className="mt-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                    <div>
                      <div className="font-medium leading-none mb-0.5">{item.label}</div>
                      <div className="text-xs text-muted-foreground leading-snug">{item.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">DIFC-registered · Ghana-based · India operations</span>
              <a href="#about" onClick={() => setAboutOpen(false)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Learn more <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </DesktopDropdown>

          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>

          {/* Impact dropdown */}
          <DesktopDropdown label="Impact" isOpen={impactOpen} setOpen={(v) => { if (v) openDropdown("impact"); else setImpactOpen(false); }}>
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our Impact</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Working with organisations to deliver sustainable performance at a global scale.</p>
            </div>
            {IMPACT_LINKS.map((item, i) => (
              <a key={i} href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted hover:text-primary transition-colors border-t border-border/50 first:border-t-0"
                onClick={() => setImpactOpen(false)}
              >
                {item.icon}
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </a>
            ))}
          </DesktopDropdown>

          {/* Solutions dropdown */}
          <DesktopDropdown label="Solutions" isOpen={solutionsOpen} setOpen={(v) => { if (v) openDropdown("solutions"); else setSolutionsOpen(false); }}>
            <a href="#farmers" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted hover:text-primary transition-colors"
              onClick={() => setSolutionsOpen(false)}>
              <Sprout className="w-4 h-4 text-primary" /> Farmers
            </a>
            <a href="#buyers" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted hover:text-primary transition-colors border-t border-border"
              onClick={() => setSolutionsOpen(false)}>
              <Globe className="w-4 h-4 text-accent" /> For Buyers
            </a>
          </DesktopDropdown>

          {/* Resources dropdown */}
          <DesktopDropdown label="Resources" isOpen={resourcesOpen} setOpen={(v) => { if (v) openDropdown("resources"); else setResourcesOpen(false); }} wide>
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Explore</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Latest news, insights and industry developments.</p>
            </div>
            {RESOURCES_LINKS.map((item, i) => (
              <a key={i} href={item.href}
                className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted hover:text-primary transition-colors border-t border-border/50 first:border-t-0"
                onClick={() => setResourcesOpen(false)}
              >
                <span className="mt-0.5">{item.icon}</span>
                <span>
                  <span className="font-medium block">{item.label}</span>
                  {item.desc && <span className="text-xs text-muted-foreground">{item.desc}</span>}
                </span>
              </a>
            ))}
            <div className="px-4 py-2 border-t border-border bg-primary/5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQs</p>
            </div>
            {RESOURCES_FAQ_LINKS.map((item, i) => (
              <a key={i} href={item.href}
                className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted hover:text-primary transition-colors border-t border-border/50 first:border-t-0"
                onClick={() => setResourcesOpen(false)}
              >
                <span className="mt-0.5">{item.icon}</span>
                <span>
                  <span className="font-medium block">{item.label}</span>
                  {item.desc && <span className="text-xs text-muted-foreground">{item.desc}</span>}
                </span>
              </a>
            ))}
            {isAdmin && (
              <>
                <div className="px-4 py-2 border-t border-border bg-accent/5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">Admin</p>
                </div>
                <Link href="/admin/posts"
                  className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted hover:text-primary transition-colors border-t border-border/50"
                  onClick={() => setResourcesOpen(false)}
                >
                  <span className="mt-0.5"><LayoutDashboard className="w-4 h-4 text-accent" /></span>
                  <span>
                    <span className="font-medium block">Manage posts</span>
                    <span className="text-xs text-muted-foreground">Author and publish articles, podcasts and webinars</span>
                  </span>
                </Link>
              </>
            )}
          </DesktopDropdown>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className={cn("flex items-center gap-1 text-sm cursor-pointer transition-colors px-2", scrolled ? "text-foreground/60 hover:text-foreground" : "text-white/60 hover:text-white")}>
            <Languages className="w-4 h-4" />
            <span className="font-medium">EN</span>
          </div>
          <NavbarAuthSlot
            scrolled={scrolled}
            isOpen={loginOpen}
            setOpen={(v) => { if (v) openDropdown("login"); else setLoginOpen(false); }}
          />
          <Button className="font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">Get Started</Button>
        </div>

        {/* Mobile Toggle */}
        <button className={cn("md:hidden p-2 transition-colors", scrolled ? "text-foreground" : "text-white")} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-background border-b border-border shadow-xl p-4 flex flex-col gap-1 md:hidden max-h-[80vh] overflow-y-auto"
          >
            {/* About Us accordion */}
            <MobileAccordion label="About Us" isOpen={mobileAboutOpen} setOpen={setMobileAboutOpen}>
              {ABOUT_LINKS.map((item, i) => (
                <a key={i} href={item.href}
                  className="flex items-center gap-2 p-3 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-primary"
                  onClick={closeAll}
                >
                  {item.icon} {item.label}
                </a>
              ))}
            </MobileAccordion>

            <a href="#how-it-works" className="p-3 hover:bg-muted rounded-xl font-medium" onClick={closeAll}>How It Works</a>

            {/* Impact accordion */}
            <MobileAccordion label="Impact" isOpen={mobileImpactOpen} setOpen={setMobileImpactOpen}>
              {IMPACT_LINKS.map((item, i) => (
                <a key={i} href={item.href}
                  className="flex items-center gap-2 p-3 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-primary"
                  onClick={closeAll}
                >
                  {item.icon} {item.label}
                </a>
              ))}
            </MobileAccordion>

            {/* Solutions accordion */}
            <MobileAccordion label="Solutions" isOpen={mobileSolutionsOpen} setOpen={setMobileSolutionsOpen}>
              <a href="#farmers" className="flex items-center gap-2 p-3 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-primary" onClick={closeAll}>
                <Sprout className="w-4 h-4 text-primary" /> Farmers
              </a>
              <a href="#buyers" className="flex items-center gap-2 p-3 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-primary" onClick={closeAll}>
                <Globe className="w-4 h-4 text-accent" /> For Buyers
              </a>
            </MobileAccordion>

            {/* Resources accordion */}
            <MobileAccordion label="Resources" isOpen={mobileResourcesOpen} setOpen={setMobileResourcesOpen}>
              {RESOURCES_LINKS.map((item, i) => (
                <a key={i} href={item.href}
                  className="flex items-center gap-2 p-3 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-primary"
                  onClick={closeAll}
                >
                  {item.icon} {item.label}
                </a>
              ))}
              <div className="px-3 pt-2 pb-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">FAQs</p>
              </div>
              {RESOURCES_FAQ_LINKS.map((item, i) => (
                <a key={i} href={item.href}
                  className="flex items-center gap-2 p-3 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-primary"
                  onClick={closeAll}
                >
                  {item.icon} {item.label}
                </a>
              ))}
              {isAdmin && (
                <>
                  <div className="px-3 pt-2 pb-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-accent">Admin</p>
                  </div>
                  <Link href="/admin/posts"
                    className="flex items-start gap-3 p-3 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-primary"
                    onClick={closeAll}
                  >
                    <LayoutDashboard className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span>
                      <span className="font-medium block text-foreground">Manage posts</span>
                      <span className="text-xs text-muted-foreground">Author and publish articles, podcasts and webinars</span>
                    </span>
                  </Link>
                </>
              )}
            </MobileAccordion>

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <MobileAuthSlot onClose={closeAll} />
              <Button className="w-full">Get Started</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  const floatingBadges = [
    { icon: <Leaf className="w-5 h-5 text-primary" />, label: "Credits Minted", value: "+12.5k Tonnes", bg: "bg-emerald-50", delay: 0, pos: "top-[18%] left-[-5%]" },
    { icon: <Globe className="w-5 h-5 text-amber-500" />, label: "Active Countries", value: "14 Regions", bg: "bg-amber-50", delay: 1.2, pos: "bottom-[22%] right-[-4%]" },
    { icon: <ShieldCheck className="w-5 h-5 text-accent" />, label: "Verified Credits", value: "98% Accuracy", bg: "bg-teal-50", delay: 2, pos: "top-[55%] left-[-8%]" },
  ];

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-[#050d08]">
      {/* Animated canvas background */}
      <HeroCanvas containerRef={heroRef} />

      {/* Subtle grid overlay on top of canvas */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.6) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center min-h-screen lg:min-h-0 lg:py-28">

          {/* ── Left: Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 self-start px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold mb-8 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Growing Carbon, Growing Communities
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl font-display font-black leading-[1.05] text-white mb-6"
            >
              Transform Farming
              <br />
              Into{" "}
              <span className="text-gradient-green">Climate Action.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-base sm:text-lg text-white/65 leading-relaxed mb-10 max-w-lg"
            >
              Built on Esoko's 17-year field infrastructure and access to <strong className="text-white/90 font-semibold">2M+ verified farmers</strong>, we deliver registry-grade carbon credits while returning <strong className="text-white/90 font-semibold">60% of revenue</strong> directly to smallholders across Africa and India.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 mb-12"
            >
              <Button size="lg" className="group bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 border-0 px-7 py-3.5 text-base font-semibold rounded-xl">
                <Sprout className="mr-2.5 w-5 h-5" />
                Start Farming Carbon
                <ArrowRight className="ml-2.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline"
                className="border-white/20 text-white bg-white/8 hover:bg-white/15 backdrop-blur-sm px-7 py-3.5 text-base font-semibold rounded-xl"
              >
                <DollarSign className="mr-2 w-5 h-5 text-secondary" />
                Buy Verified Credits
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-wrap items-center gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {[11,12,13,14,15].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden shadow-md">
                      <img src={`https://i.pravatar.cc/80?img=${i}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-white/60">
                  <span className="font-bold text-white">47,000+</span> farmers enrolled
                </div>
              </div>

              <div className="h-8 w-px bg-white/15 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-white/60"><strong className="text-white">4.9</strong> / 5 rating</span>
              </div>

              <div className="h-8 w-px bg-white/15 hidden sm:block" />

              <div className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>OFP validation pathway active</span>
              </div>

              <div className="h-8 w-px bg-white/15 hidden sm:block" />

              <div className="flex items-center gap-2 text-sm text-white/60">
                <DollarSign className="w-4 h-4 text-secondary" />
                <span><strong className="text-white">60%</strong> revenue to farmers</span>
              </div>

              <div className="h-8 w-px bg-white/15 hidden sm:block" />

              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-white/40" />
                <span>HQ Dubai · Operations Accra</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Rotating Globe ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Atmospheric glow behind globe */}
            <div className="absolute inset-8 rounded-full bg-primary/15 blur-3xl animate-glow pointer-events-none" />

            {/* Globe container */}
            <div
              className="relative rounded-full overflow-hidden border border-primary/20 shadow-2xl shadow-black/60 w-full"
              style={{ aspectRatio: "1/1" }}
            >
              <RotatingGlobe className="absolute inset-0" />
            </div>

            {/* Floating badges */}
            {floatingBadges.map((badge, i) => (
              <motion.div
                key={i}
                className={cn("absolute glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl shadow-black/10 min-w-[170px]", badge.pos)}
                animate={{ y: [0, i % 2 === 0 ? -10 : 10, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: badge.delay }}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", badge.bg)}>
                  {badge.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium leading-none mb-1">{badge.label}</p>
                  <p className="text-sm font-bold text-gray-900">{badge.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}

function LiveStats() {
  const stats = [
    { label: "Farmers Enrolled", value: 47000, suffix: "+", icon: <Sprout className="w-5 h-5 text-primary" /> },
    { label: "Tonnes CO₂ Sequestered", value: 2.3, suffix: "M", decimals: 1, icon: <Wind className="w-5 h-5 text-accent" /> },
    { label: "Farmer Earnings", prefix: "$", value: 18.4, suffix: "M", decimals: 1, icon: <LineChart className="w-5 h-5 text-secondary" /> },
    { label: "Verification Rate", value: 98, suffix: "%", icon: <ShieldCheck className="w-5 h-5 text-primary" /> },
  ];

  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-muted rounded-lg">{stat.icon}</div>
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                {stat.prefix}
                <CountUp end={stat.value} duration={2.5} decimals={stat.decimals || 0} enableScrollSpy scrollSpyOnce />
                {stat.suffix}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const counters = [
    { label: "Trees Planted", value: 2.5, suffix: "M+", icon: <TreePine className="w-6 h-6" />, color: "text-primary" },
    { label: "Farmers Empowered", value: 10000, suffix: "+", icon: <Users className="w-6 h-6" />, color: "text-accent" },
    { label: "CO₂ Removed (tons)", value: 500, suffix: "K+", icon: <Wind className="w-6 h-6" />, color: "text-secondary" },
    { label: "Communities Impacted", value: 200, suffix: "+", icon: <HeartHandshake className="w-6 h-6" />, color: "text-primary" },
  ];

  const partners = ["Open Forest Protocol", "Treeeconomy", "Esoko", "Google Earth"];

  return (
    <section id="about" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <Info className="w-4 h-4" /> About SikaFields
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              Our mission is to <span className="text-primary">reduce greenhouse gas emissions</span> while creating economic empowerment.
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              For farmers and rural communities across Africa, we bridge the gap between the fields and global carbon markets — bringing science-backed impact where it matters most.
            </p>
            <div className="space-y-4 mb-8">
              <div className="p-5 bg-muted/60 rounded-2xl border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">A spin-off from Esoko</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      As a spin-off from Esoko — a pioneer in leveraging mobile and web technologies for agricultural innovation — SikaFields brings a decade of expertise and impact in the AgriTech sector to the forefront of climate action.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/15">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">DIFC Registered · Ghana-Based</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      SikaFields, a proud member of the Esoko family, is registered under the prestigious <strong className="text-foreground">Dubai International Financial Centre (DIFC)</strong> as a holding company with subsidiaries across Africa. Our journey begins in <strong className="text-foreground">Ghana</strong>, home to our first Africa country office, where we are developing pioneering carbon farms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group">
                <Sprout className="mr-2 w-5 h-5" />
                Start Farming Carbon
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                <DollarSign className="mr-2 w-5 h-5" />
                Buy Verified Credits
              </Button>
            </div>
          </motion.div>

          {/* Visual: real farming photo + floating stat cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[480px]"
          >
            {/* Photo */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/about-farming.jpg"
                alt="Farmer planting a seedling in Ghana"
                className="w-full h-full object-cover"
              />
              {/* Soft dark gradient at top and bottom for card readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 rounded-3xl" />
            </div>

            {/* Bottom caption strip */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">Smallholder farmer, Ghana</p>
                <p className="text-white/60 text-xs">Planting carbon-sequestering trees on enrolled land</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs font-semibold">Live Program</span>
              </div>
            </div>

            {/* Floating stat — top-left */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-5 left-5 bg-white/95 backdrop-blur p-3 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Operations</p>
                <p className="font-bold text-gray-900 text-sm">4 Countries</p>
              </div>
            </motion.div>

            {/* Floating stat — top-right */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute top-5 right-5 bg-white/95 backdrop-blur p-3 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Registered Under</p>
                <p className="font-bold text-gray-900 text-sm">DIFC · Dubai</p>
              </div>
            </motion.div>

            {/* Floating stat — mid-right */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 0.7 }}
              className="absolute top-1/2 -translate-y-1/2 right-5 bg-white/95 backdrop-blur p-3 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Farmer Earn</p>
                <p className="font-bold text-gray-900 text-sm">+$520/year</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {counters.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background rounded-2xl p-6 border border-border text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn("flex justify-center mb-3", c.color)}>{c.icon}</div>
              <div className="text-3xl font-display font-bold text-foreground mb-1 tabular-nums">
                <CountUp end={c.value} duration={2.5} decimals={c.value < 100 ? 1 : 0} enableScrollSpy scrollSpyOnce />{c.suffix}
              </div>
              <p className="text-sm text-muted-foreground font-medium">{c.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">Certified & Powered By</p>
          <div className="flex flex-wrap justify-center gap-3">
            {partners.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-sm font-semibold text-foreground/70 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" /> {p}
              </div>
            ))}
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-semibold text-primary">
              <Smartphone className="w-4 h-4" /> Mobile-first · Offline-capable
            </div>
          </div>
        </div>

        {/* ── Company Overview ── */}
        <div className="mt-28 pt-24 border-t border-border">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <Sprout className="w-4 h-4" /> Company Overview
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">
              Full-lifecycle credits backed by{" "}
              <span className="text-primary">17 years of field infrastructure</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              A spinout of Esoko, SikaFields leverages 17 years of digital agri-infrastructure and direct access to 2 million verified smallholder farmers to manage the complete carbon credit lifecycle — from enrollment through MRV, registry issuance, and transparent benefit distribution.
            </p>
          </motion.div>

          {/* 4 feature pillars */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {[
              {
                icon: <SatelliteDish className="w-5 h-5" />,
                color: "bg-primary/10 text-primary border-primary/15",
                title: "Esoko Foundation",
                body: "Built on 17 years of mobile field infrastructure with direct access to 2M+ verified smallholder farmers across Africa and India.",
              },
              {
                icon: <Smartphone className="w-5 h-5" />,
                color: "bg-accent/10 text-accent border-accent/15",
                title: "SikaFields App",
                body: "Biometric identity, GPS plot mapping, mobile field logging, satellite-aligned data capture, and mobile wallet integration — all in one platform.",
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                color: "bg-teal-50 text-teal-700 border-teal-200",
                title: "Dual Registry Track",
                body: "Plots verified under Open Forest Protocol (OFP, Q4 2026 target) and Verra VM0047 methodology (Q4 2027 target) for maximum market coverage.",
              },
              {
                icon: <DollarSign className="w-5 h-5" />,
                color: "bg-secondary/10 text-secondary border-secondary/20",
                title: "Farmer-First Revenue",
                body: "60% of carbon revenue goes directly to farmers — 32% as mobile cash payments and 28% as in-kind seedlings and agronomic services.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-background rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center mb-4", f.color)}>
                  {f.icon}
                </div>
                <h4 className="font-bold text-foreground mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Revenue model + Video side by side */}
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Revenue split */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background rounded-3xl border border-border p-8 shadow-sm"
            >
              <h3 className="text-xl font-bold text-foreground mb-1">How Farmer Revenue Works</h3>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Of every carbon credit sold, farmers receive 60% of the revenue — split between direct mobile payments and practical in-kind support.
              </p>

              {/* Stacked bar */}
              <div className="flex h-10 rounded-xl overflow-hidden mb-4 shadow-inner">
                <div className="bg-primary flex items-center justify-center transition-all" style={{ width: "32%" }}>
                  <span className="text-white text-xs font-bold">32%</span>
                </div>
                <div className="bg-accent flex items-center justify-center transition-all" style={{ width: "28%" }}>
                  <span className="text-white text-xs font-bold">28%</span>
                </div>
                <div className="bg-muted flex items-center justify-center transition-all" style={{ width: "40%" }}>
                  <span className="text-muted-foreground text-xs font-medium">40%</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    pct: "32%",
                    label: "Mobile Cash Payments",
                    desc: "Disbursed directly to farmer wallets via SikaFields App",
                    cls: "bg-primary/8 border-primary/20 text-primary",
                    dot: "bg-primary",
                  },
                  {
                    pct: "28%",
                    label: "In-Kind Benefits",
                    desc: "Seedlings, agronomic services, training, and MRV support via DigiMakt",
                    cls: "bg-accent/8 border-accent/20 text-accent",
                    dot: "bg-accent",
                  },
                  {
                    pct: "40%",
                    label: "Operations & MRV",
                    desc: "Field teams, satellite monitoring, registry management, and platform costs",
                    cls: "bg-muted border-border text-muted-foreground",
                    dot: "bg-muted-foreground/40",
                  },
                ].map((row, i) => (
                  <div key={i} className={cn("flex items-start gap-4 p-4 rounded-xl border", row.cls)}>
                    <div className="shrink-0 font-display font-black text-lg leading-none pt-0.5">{row.pct}</div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{row.label}</p>
                      <p className="text-xs opacity-70 leading-relaxed">{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Video embed + caption */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <div className="rounded-3xl overflow-hidden border border-border shadow-lg bg-black" style={{ aspectRatio: "16/9" }}>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/jDBGpNDeRr8?autoplay=1&mute=1&loop=1&playlist=jDBGpNDeRr8&playsinline=1&rel=0&modestbranding=1&controls=1"
                  title="SikaFields Company Overview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ display: "block", width: "100%", height: "100%", border: 0 }}
                />
              </div>

              <div className="bg-muted/40 rounded-2xl p-6 border border-border">
                <h4 className="font-bold text-foreground mb-2">Auditable from Field to Registry</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every seedling, agronomic visit, and payment is logged in the SikaFields App and linked to the plot-level MRV record — creating a continuous, audit-ready chain from farmer enrollment through independent validator review and registry issuance.
                </p>
              </div>

              {/* Registry timeline */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { registry: "Open Forest Protocol", code: "OFP", target: "Q4 2026", color: "bg-primary/10 border-primary/25 text-primary" },
                  { registry: "Verra VM0047", code: "VCS", target: "Q4 2027", color: "bg-accent/10 border-accent/25 text-accent" },
                ].map((r, i) => (
                  <div key={i} className={cn("rounded-2xl border p-4", r.color)}>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{r.code}</p>
                    <p className="font-bold text-sm mb-1">{r.registry}</p>
                    <p className="text-xs opacity-70">Target issuance</p>
                    <p className="font-bold text-base">{r.target}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <GallerySection />

        {/* ── Market Opportunity ── */}
        <div id="market-opportunity" className="mt-28 pt-24 border-t border-border">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-6 border border-secondary/20">
              <TrendingUp className="w-4 h-4" /> Market Opportunity
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">
              Surging global demand meets Africa's{" "}
              <span className="text-primary">untapped supply</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Remaining within a 1.5°C pathway requires a 43% reduction in global emissions by 2030. Regulators and institutional buyers are shifting to verified removal credits as the credible instrument for balancing residual emissions — and Africa holds the majority of the world's available supply.
            </p>
          </motion.div>

          {/* 3 stat pillars */}
          <div className="grid md:grid-cols-3 gap-8 mb-14">
            {[
              {
                value: "43%",
                label: "Global Emissions Cut Required by 2030",
                sub: "Remaining within a 1.5°C pathway demands this reduction — creating immediate, large-scale demand for verified nature-based carbon removals at institutional quality.",
                gradient: "from-primary to-emerald-800",
                icon: <Wind className="w-6 h-6" />,
              },
              {
                value: "2036",
                label: "EU Compliance Window Opens",
                sub: "The EU has adopted a 90% emissions reduction target for 2040 and will accept credits from developing nations for compliance from 2036 — with agroforestry and restoration credits preferred by institutional buyers.",
                gradient: "from-blue-700 to-blue-900",
                icon: <Globe className="w-6 h-6" />,
              },
              {
                value: "$100B+",
                label: "Gulf Net-Zero Commitments",
                sub: "Across Gulf national net-zero plans, corporate procurement is actively shifting toward verified removal credits — and African agroforestry credits command the premium prices these buyers seek.",
                gradient: "from-amber-600 to-orange-800",
                icon: <Building2 className="w-6 h-6" />,
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={cn("relative overflow-hidden rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br", p.gradient)}
              >
                <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-black/10 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                    {p.icon}
                  </div>
                  <p className="text-4xl sm:text-5xl font-display font-black mb-2 tracking-tight">{p.value}</p>
                  <p className="font-bold text-base mb-3">{p.label}</p>
                  <p className="text-white/65 text-sm leading-relaxed">{p.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Africa supply gap narrative */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-primary/5 border border-primary/15 rounded-3xl p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <TreePine className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-foreground">Africa's Untapped Removal Capacity</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Africa holds more than <strong className="text-foreground">30% of the world's nature-based removal potential</strong> yet currently issues only a small fraction of what it could each year. The Congo Basin alone absorbs ~1.2 billion tonnes of CO₂ annually across 674 million hectares of forest.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { stat: "$6–30B", label: "African carbon market potential by 2030" },
                  { stat: "$250B", label: "Projected scale by 2050" },
                  { stat: "22M→300M", label: "ACMI issuance target (tonnes/yr)" },
                  { stat: "30%+", label: "Of global nature-based potential in Africa" },
                ].map((s, i) => (
                  <div key={i} className="bg-background rounded-xl p-3 border border-border">
                    <p className="font-black text-foreground font-display text-lg leading-tight">{s.stat}</p>
                    <p className="text-muted-foreground text-[11px] leading-snug mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-amber-50 border border-amber-200 rounded-3xl p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-foreground">The Structural Barrier SikaFields Solves</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Despite enormous demand, structural barriers prevent rural smallholders from participating. The principal constraint is the <strong className="text-foreground">absence of continuous, auditable, plot-level data</strong> acceptable to registries. Without it, registries will not issue credits and buyers will not transact.
              </p>
              <ul className="space-y-2.5">
                {[
                  "High monitoring costs and complexity of verification standards",
                  "Land tenure uncertainty and historical integrity concerns",
                  "No MRV infrastructure scaled to smallholder plots",
                  "Ghana and Kenya policy reforms create frameworks — but supply needs operational MRV",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Closing statement */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 border border-primary/15 rounded-3xl p-8 md:p-10 text-center max-w-4xl mx-auto"
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              SikaFields is the infrastructure layer that closes this gap — with registry-grade MRV rooted in Esoko's 17-year field network, biometric plot-level data from the SikaFields App, and transparent farmer payment rails — delivering the{" "}
              <strong className="text-foreground">high-integrity African agroforestry credits</strong> that EU, Gulf, and global corporate buyers are actively seeking and cannot yet source at scale.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

type PersonCard = {
  name: string;
  role: string;
  initials: string;
  color: string;
  bgImage?: string;
  bgPos?: string;
  bgSize?: string;
  placeholder?: boolean;
  credential?: string;
  credentialSub?: string;
  domains?: string[];
  quote?: string;
  flipColor?: string;
  linkedin?: string;
};

function LeaderFlipCard({ person, delay = 0 }: { person: PersonCard; delay?: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="cursor-pointer select-none"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onTouchStart={() => setFlipped(f => !f)}
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
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-md"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as React.CSSProperties}
        >
          {person.bgImage ? (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url('${person.bgImage}')`,
                backgroundSize: person.bgSize ?? "320% 265%",
                backgroundPosition: person.bgPos ?? "50% 50%",
                backgroundRepeat: "no-repeat",
              }}
            />
          ) : (
            <div className={cn("w-full h-full bg-gradient-to-br flex flex-col items-center justify-center gap-3", person.color)}>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-3xl font-display font-bold text-white">{person.initials}</span>
              </div>
              {person.placeholder && (
                <span className="text-xs text-white/60 font-medium tracking-wide uppercase">Open Position</span>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-bold text-white text-base leading-snug">{person.name}</p>
            <p className="text-white/60 text-sm mt-0.5">{person.role}</p>
          </div>
          {person.credential && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1">
              <TrendingUp className="w-3 h-3 text-white/70" />
              <span className="text-white/70 text-[10px] font-semibold tracking-wide">flip</span>
            </div>
          )}
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: person.flipColor
              ? `linear-gradient(135deg, ${person.flipColor} 0%, #052e16 100%)`
              : "linear-gradient(135deg, #166534 0%, #052e16 100%)",
          } as React.CSSProperties}
        >
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Credential</p>
              <p className="text-white font-bold text-lg leading-tight">{person.credential}</p>
              <p className="text-white/60 text-xs mt-0.5">{person.credentialSub}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {person.domains?.map(d => (
                  <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white/90">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              {person.quote && (
                <p className="text-white/40 text-[11px] italic mb-2 leading-relaxed">"{person.quote}"</p>
              )}
              <p className="text-white font-semibold text-sm">{person.name}</p>
              <p className="text-white/50 text-xs mb-3">{person.role}</p>
              {person.linkedin && (
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white text-[11px] font-semibold"
                >
                  <Linkedin className="w-3 h-3" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileCard({ person, delay = 0 }: { person: PersonCard; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden">
        {person.bgImage ? (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url('${person.bgImage}')`,
              backgroundSize: person.bgSize ?? "310% 260%",
              backgroundPosition: person.bgPos ?? "50% 50%",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-br flex flex-col items-center justify-center gap-3", person.color)}>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-3xl font-display font-bold text-white">{person.initials}</span>
            </div>
            {person.placeholder && (
              <span className="text-xs text-white/60 font-medium tracking-wide uppercase">Photo coming soon</span>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>
      <div className="p-5">
        <h4 className="font-bold text-foreground text-base leading-snug mb-1">{person.name}</h4>
        <p className="text-sm text-muted-foreground">{person.role}</p>
      </div>
    </motion.div>
  );
}

function LeadershipSection() {
  const leaders: PersonCard[] = [
    {
      name: "Daniel Asare-Kyei PhD",
      role: "Chief Executive Officer",
      initials: "DA",
      color: "from-primary to-accent",
      bgImage: "/leadership-team.png",
      bgSize: "320% 265%",
      bgPos: "0% 6%",
      credential: "PhD Environmental Science",
      credentialSub: "10+ yrs in Carbon Markets",
      domains: ["Carbon Markets", "Climate Policy", "AgriTech"],
      quote: "Building the bridge between African land and global climate capital.",
      flipColor: "#166534",
      linkedin: "https://www.linkedin.com/in/dasarekyeiprofile/",
    },
    {
      name: "William Osei Agyemang",
      role: "Chief Finance Officer",
      initials: "WO",
      color: "from-accent to-teal-600",
      bgImage: "/leadership-team.png",
      bgSize: "320% 265%",
      bgPos: "50% 6%",
      credential: "ACCA Certified",
      credentialSub: "Structured Finance & Investment",
      domains: ["Finance", "African Markets", "Investment"],
      quote: "Sound capital structure is what turns climate missions into durable businesses.",
      flipColor: "#0f766e",
      linkedin: "https://www.linkedin.com/in/william-osei-agyemang-35b79a22",
    },
    {
      name: "Valentijn Venus",
      role: "Chief Product & Research Officer",
      initials: "VV",
      color: "from-secondary to-amber-600",
      bgImage: "/leadership-team.png",
      bgSize: "320% 265%",
      bgPos: "100% 6%",
      credential: "MSc Environmental Economics",
      credentialSub: "Research & Product Strategy",
      domains: ["Product Strategy", "Research", "MRV Design"],
      quote: "Data integrity is the bedrock of every credit we issue.",
      flipColor: "#b45309",
      linkedin: "https://www.linkedin.com/in/valentijn-venus/",
    },
    {
      name: "Charlotte Owusu-Ansah",
      role: "Chief Talent and Administrative Officer",
      initials: "CO",
      color: "from-primary to-emerald-800",
      bgImage: "/leadership-team.png",
      bgSize: "320% 265%",
      bgPos: "0% 82%",
      credential: "HR Leadership",
      credentialSub: "Organisational Development",
      domains: ["Talent", "Operations", "Culture"],
      quote: "Our people are the soil from which our impact grows.",
      flipColor: "#166534",
      linkedin: "https://www.linkedin.com/in/charlotte-owusu-ansah-a292391a6",
    },
    {
      name: "Vijay Palat",
      role: "Chief Strategy & Sustainability Officer",
      initials: "VP",
      color: "from-teal-700 to-primary",
      bgImage: "/leadership-team.png",
      bgSize: "320% 265%",
      bgPos: "47% 82%",
      credential: "ESG Strategy Expert",
      credentialSub: "Policy & Sustainability Frameworks",
      domains: ["ESG Strategy", "Sustainability", "Policy"],
      quote: "True sustainability means being here for the next generation of farmers.",
      flipColor: "#0f766e",
    },
    {
      name: "Dr. Kwame Ofosu Debrah",
      role: "Chief Technology Officer",
      initials: "KD",
      color: "from-primary to-teal-700",
      bgImage: "/dr-kwame.jpeg",
      bgSize: "cover",
      bgPos: "center 10%",
      credential: "PhD Technology & Innovation",
      credentialSub: "Mobile-First Platform · Manchester, UK",
      domains: ["Mobile Tech", "Platform Architecture", "AgriTech"],
      quote: "Architect of our mobile-first platform, bridging technology gaps for smallholder farmers across emerging markets.",
      flipColor: "#0f766e",
      linkedin: "https://www.linkedin.com/in/kwamefosu",
    },
    {
      name: "Hope Jr. Mbakadi",
      role: "Strategic Partnerships & Capital",
      initials: "HM",
      color: "from-amber-600 to-orange-800",
      bgImage: "/hope-jr-mbakadi.png",
      bgSize: "cover",
      bgPos: "center 12%",
      credential: "Capital & Partnerships",
      credentialSub: "Investor Relations · Strategic Growth",
      domains: ["Capital Raising", "Strategic Partnerships", "Investor Relations"],
      quote: "Advancing the company's capital relationships and strategic partnerships to drive long-term alignment and sustainable opportunity for SikaFields.",
      flipColor: "#92400e",
      linkedin: "https://www.linkedin.com/in/hope-mbakadi/",
    },
    {
      name: "Peace Mbakadi",
      role: "Business Development",
      initials: "PM",
      color: "from-primary to-teal-600",
      bgImage: "/peace-mbakadi.jpg",
      bgSize: "cover",
      bgPos: "center 5%",
      credential: "Business Development",
      credentialSub: "Partnership Coordination · Operations",
      domains: ["Business Development", "Partnerships", "Operations"],
      quote: "Coordinating partnership projects and aligning operational efforts with partnership initiatives to ensure relationships are effectively maintained and progress.",
      flipColor: "#166534",
      linkedin: "https://www.linkedin.com/in/peace-mbakadi/",
    },
  ];

  const groundReports = [
    {
      territory: "Ghana",
      flag: "🇬🇭",
      region: "West Africa — Primary Hub",
      color: "#16a34a",
      bg: "#f0faf4",
      border: "#bbf7d0",
      headline: "The engine room. Where every carbon farm starts.",
      updates: [
        "47,000+ farmers enrolled across the Western, Northern, and Volta regions",
        "127 community field coordinators trained in Q1 2026",
        "Farm-level MRV audits running every 90 days with satellite + ground-truth checks",
      ],
      team: [
        { name: "Daniel Asare-Kyei", suffix: "PhD", role: "CEO", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership", focus: "Farmer policy & carbon markets" },
        { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership", focus: "Capital & financial reporting" },
        { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership", focus: "Field operations & talent" },
        { name: "Derrick Adu Gyamfi", role: "Advisor", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory", focus: "Capital markets guidance" },
        { name: "Festus W. Amoyaw", role: "Advisor", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory", focus: "Agribusiness & rural dev." },
        { name: "Nana Ama Boateng-Kagyah", role: "Advisor", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory", focus: "Legal & compliance" },
      ],
    },
    {
      territory: "India",
      flag: "🇮🇳",
      region: "South Asia — Growth Market",
      color: "#ca8a04",
      bg: "#fffbeb",
      border: "#fde68a",
      headline: "Expanding into South Asia's 100M+ smallholder farmer base.",
      updates: [
        "8,000+ farmers enrolled across Rajasthan and Maharashtra",
        "3 state-level carbon programs in active enrollment phase",
        "Partnering with FPOs (Farmer Producer Organisations) for bulk onboarding",
      ],
      team: [
        { name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership", focus: "Strategy & ESG framework" },
      ],
    },
    {
      territory: "UAE — DIFC",
      flag: "🇦🇪",
      region: "Gulf — Holding & Finance",
      color: "#0891b2",
      bg: "#f0f9ff",
      border: "#bae6fd",
      headline: "The DIFC entity that opens institutional investor doors globally.",
      updates: [
        "DIFC holding company incorporated 2021 — full regulatory compliance",
        "Series A investor due diligence completed Q1 2026 — no material issues",
        "Blended finance structure combining grants, equity, and carbon receivables",
      ],
      team: [
        { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership", focus: "DIFC entity management" },
        { name: "Olubgenga O. Awe", role: "Trade Advisor", bgPos: "100% 90%", bgSize: "320% 340%", img: "advisory", focus: "Structured trade finance" },
      ],
    },
    {
      territory: "Netherlands",
      flag: "🇳🇱",
      region: "Europe — Science & Product",
      color: "#7c3aed",
      bg: "#faf5ff",
      border: "#e9d5ff",
      headline: "Where the science gets done and every credit gets verified.",
      updates: [
        "MRV algorithm v3.1 deployed — ±2.3% of direct measurement",
        "Verra PDD review scheduled for updated methodology",
        "Satellite validation pass Q1: 98.7% accuracy across all plots",
      ],
      team: [
        { name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership", focus: "MRV & product strategy" },
        { name: "Dr. Cheryl Sterling", role: "Advisor", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory", focus: "Policy research & ESG" },
      ],
    },
  ];

  return (
    <section id="leadership" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Leadership header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4 border border-accent/20">
            <Users className="w-4 h-4" /> Our Team
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Our Leadership</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Eight domain specialists, one mission. Hover any card to reveal the credential and expertise behind the title.
          </p>
        </motion.div>

        {/* Leadership grid — 3 cols desktop, flip reveal on hover */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {leaders.map((person, i) => (
            <LeaderFlipCard key={i} person={person} delay={i * 0.07} />
          ))}
        </div>

        {/* Advisory Board */}
        {(() => {
          const advisors = [
            { name: "Derrick Adu Gyamfi", credential: "Capital Markets & Finance", credentialSub: "Advisory & Investment Strategy", focus: "Capital markets guidance", domains: ["Capital Markets", "Advisory", "Governance"], bgPos: "0% 42%", bgSize: "320% 340%", color: "#166534", linkedin: "https://www.linkedin.com/in/derick-adu-gyamfi-esq-7011901b4/" },
            { name: "Dr. Cheryl Sterling", credential: "Doctorate — Policy Research", credentialSub: "Sustainability & ESG Frameworks", focus: "Policy research & ESG", domains: ["Policy Research", "Sustainability", "ESG"], bgPos: "50% 42%", bgSize: "320% 340%", color: "#0f766e", linkedin: "https://www.linkedin.com/in/cheryl-sterling-a33890aa/" },
            { name: "Festus William Amoyaw", credential: "Agribusiness Development", credentialSub: "Agriculture & Rural Partnerships", focus: "Agribusiness & rural dev.", domains: ["Agribusiness", "Rural Dev.", "Partnerships"], bgPos: "100% 42%", bgSize: "320% 340%", color: "#b45309", linkedin: "https://www.linkedin.com/in/festus-william-amoyaw-13152b7/" },
            { name: "Nana Ama Boateng-Kagyah", credential: "Legal & Compliance", credentialSub: "Corporate Law & Governance", focus: "Legal & compliance", domains: ["Legal", "Compliance", "Governance"], bgPos: "0% 90%", bgSize: "320% 340%", color: "#166534", linkedin: "https://www.linkedin.com/in/nana-ama-boateng-b7b1915/" },
            { name: "Olubgenga Olanrewaju Awe", credential: "The Alternative Bank", credentialSub: "Structured Trade & Commodities Finance", focus: "Structured trade finance", domains: ["Trade Finance", "Commodities", "Banking"], bgPos: "100% 90%", bgSize: "320% 340%", color: "#166534", linkedin: "" },
          ];
          return (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              {/* Section header */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-px bg-border" />
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Advisory Board</span>
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                Domain experts advising on capital markets, legal frameworks, agribusiness, policy research, and structured finance.
              </p>

              {/* Advisor cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {advisors.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="h-1.5 w-full" style={{ backgroundColor: a.color }} />
                    <div className="p-5 flex items-start gap-4">
                      <div
                        className="w-16 h-16 rounded-xl shrink-0"
                        style={{
                          backgroundImage: "url('/advisory-board.png')",
                          backgroundSize: a.bgSize,
                          backgroundPosition: a.bgPos,
                          backgroundRepeat: "no-repeat",
                          outline: `3px solid ${a.color}25`,
                          outlineOffset: "2px",
                        }}
                      />
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-bold text-foreground text-sm leading-snug">{a.name}</p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: a.color }}>{a.credential}</p>
                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{a.credentialSub}</p>
                      </div>
                    </div>
                    <div className="px-5 pb-4">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {a.domains.map((d, di) => (
                          <span
                            key={di}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${a.color}15`, color: a.color }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{a.focus}</span>
                        {a.linkedin && (
                          <a
                            href={a.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: a.color }}
                            aria-label={`${a.name} on LinkedIn`}
                          >
                            <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View full advisory board CTA */}
              <div className="mt-8 text-center">
                <Link
                  href="/advisory"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors border border-primary/30 px-5 py-2.5 rounded-full hover:bg-primary/5"
                >
                  View Full Advisory Board
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          );
        })()}

        {/* Ground Reports — Advisory Board by Territory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-border" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Ground Reports — Operations by Territory</span>
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Operations across 4 countries. Named team members accountable for each territory.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groundReports.map((r, ri) => (
            <motion.div
              key={r.territory}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ri * 0.08 }}
              className={`rounded-2xl border bg-white overflow-hidden flex flex-col ${ri === 0 ? "md:row-span-2" : ""}`}
              style={{ borderColor: r.border }}
            >
              {/* Territory header */}
              <div className="p-6 pb-4 border-b" style={{ borderColor: r.border, backgroundColor: r.bg }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.flag}</span>
                    <div>
                      <p className="font-bold text-foreground text-base font-display">{r.territory}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: r.color }}>{r.region}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold rounded-full px-2.5 py-1" style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                    {r.team.length} {r.team.length === 1 ? "person" : "people"}
                  </span>
                </div>
                <p className="text-foreground font-medium text-sm leading-snug">{r.headline}</p>
              </div>

              {/* On the ground updates */}
              <div className="px-6 pt-4 pb-3 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">On the Ground</p>
                <ul className="space-y-2">
                  {r.updates.map((u, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Team present */}
              <div className="px-6 pb-6 pt-4 border-t" style={{ borderColor: r.border }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Team Present</p>
                <div className="space-y-3">
                  {r.team.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl shrink-0"
                        style={{
                          backgroundImage: `url('/${m.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                          backgroundSize: m.bgSize,
                          backgroundPosition: m.bgPos,
                          backgroundRepeat: "no-repeat",
                          outline: `2px solid ${r.color}40`,
                          outlineOffset: "1px",
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-foreground text-sm font-semibold leading-tight truncate">
                          {m.name.split(" ").slice(0, 2).join(" ")}
                          {(m as any).suffix && <sup className="text-[10px] ml-0.5" style={{ color: r.color }}>{(m as any).suffix}</sup>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{m.role} · {m.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function TrustWallSection() {
  const proofs = [
    { type: "stat", category: "Farmers Enrolled", headline: "47,000+", sub: "Verified smallholder farmers enrolled — primarily across Ghana's Ashanti, Brong-Ahafo, Northern and Upper East regions", color: "#16a34a", bg: "#f0faf4", border: "#bbf7d0", owners: [{ name: "Daniel Asare-Kyei", role: "CEO", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership" }, { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership" }] },
    { type: "stat", category: "Tonnes CO₂ Sequestered", headline: "47,000+", sub: "Verified tonnes of CO₂ sequestered across enrolled plots — measured by satellite and validated by independent verifiers", color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4", owners: [{ name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership" }, { name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership" }] },
    { type: "stat", category: "Farmer Earnings", headline: "2.3M", sub: "GHS 2.3M disbursed directly to farmer wallets via MTN MoMo and Vodafone Cash — 60% of carbon revenue returned to growers", color: "#b45309", bg: "#fffbeb", border: "#fde68a", owners: [{ name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership" }, { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership" }] },
    { type: "stat", category: "Carbon Revenue", headline: "$18.4M", sub: "Carbon revenue generated across verified agroforestry projects — distributed to farmers, operations, and reinvested in expansion", color: "#ca8a04", bg: "#fefce8", border: "#fde68a", owners: [{ name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership" }, { name: "Derrick Adu Gyamfi", role: "Capital Advisor", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory" }] },
    { type: "cert", category: "Verification Rate", headline: "98%", sub: "Plot-level verification accuracy confirmed across 47,000+ enrolled plots — satellite cross-referenced with field agent ground-truth data", color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff", owners: [{ name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership" }, { name: "Dr. Cheryl Sterling", role: "Policy Advisor", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory" }] },
    { type: "cert", category: "Regulatory", headline: "DIFC Registered", sub: "Dubai International Financial Centre entity — enabling institutional access to Gulf and EU compliance buyers", color: "#0891b2", bg: "#f0f9ff", border: "#bae6fd", owners: [{ name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership" }, { name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership" }] },
    { type: "cert", category: "Farmer Retention", headline: "96%", sub: "Annual farmer re-enrollment rate in Ghana — driven by consistent mobile money payments and visible income uplift", color: "#16a34a", bg: "#f0faf4", border: "#bbf7d0", owners: [{ name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership" }, { name: "Festus W. Amoyaw", role: "Agribiz Advisor", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory" }] },
    { type: "cert", category: "Legal Framework", headline: "Multi-Jurisdiction", sub: "Legal structure spanning Ghana, India, Nigeria, and UAE/DIFC — covering full farmer-to-registry-to-buyer chain", color: "#dc2626", bg: "#fff5f5", border: "#fecaca", owners: [{ name: "Nana Ama Boateng-Kagyah", role: "Legal Advisor", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory" }, { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership" }] },
  ];

  return (
    <section className="py-20 bg-[#f8faf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Evidence of Impact</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">The Proof Behind Every Claim</h2>
          <p className="text-muted-foreground text-lg max-w-2xl">Each metric and certification is backed by a named accountable team member.</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {proofs.map((proof, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border p-4 flex flex-col hover:shadow-lg transition-all"
              style={{ backgroundColor: proof.bg, borderColor: proof.border }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: proof.color, backgroundColor: `${proof.color}18` }}>
                  {proof.category}
                </span>
                {proof.type === "cert" && (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke={proof.color} strokeWidth="1.5" />
                    <path d="M5 8l2 2 4-4" stroke={proof.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p className="font-black text-foreground text-2xl font-display leading-tight mb-1.5">{proof.headline}</p>
              <p className="text-muted-foreground text-xs leading-relaxed flex-1">{proof.sub}</p>
              <div className="mt-3 mb-3 h-px" style={{ backgroundColor: proof.border }} />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Accountable</p>
              <div className="space-y-1.5">
                {proof.owners.map((owner, oi) => (
                  <div key={oi} className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full shrink-0"
                      style={{
                        backgroundImage: `url('/${owner.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                        backgroundSize: owner.bgSize,
                        backgroundPosition: owner.bgPos,
                        backgroundRepeat: "no-repeat",
                        outline: "1.5px solid white",
                      }}
                    />
                    <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap truncate">
                      {owner.name.split(" ")[0]} · {owner.role}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FieldDispatchesSection() {
  const dispatches = [
    { from: "Daniel Asare-Kyei", suffix: "PhD", role: "CEO", bgPos: "0% 6%", bgSize: "320% 265%", color: "#16a34a", date: "Mar 19, 2026", subject: "Ghana Field Update — Brong-Ahafo Agroforestry Expansion", body: "Our Brong-Ahafo region cocoa-shade agroforestry cluster has enrolled an additional 4,200 smallholders this quarter, bringing the Ghanaian total to over 28,000 active farmers. Kofi Mensah's plot in Techiman North recorded 1.4 tCO₂ sequestered in the first 90 days — above our baseline projection. Community field days in Sunyani and Kintampo are driving organic referrals at a 32% rate. Northern Region pipeline is on track for Q3 enrollment.", tag: "Field Report" },
    { from: "William Osei Agyemang", suffix: "", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", color: "#ca8a04", date: "Mar 17, 2026", subject: "Farmer Revenue Distribution — Q1 Ghana Payments", body: "Cumulative mobile money disbursements to Ghanaian farmers have reached GHS 2.3M, paid via MTN MoMo and Vodafone Cash across Ashanti, Brong-Ahafo, Northern and Upper East regions. Average farmer payout: GHS 101 per quarter — a 34% income supplement above baseline. In-kind seedlings and agronomic inputs delivered to 6,400 households in Tamale and Wa districts. Working capital for Q2 disbursements is fully secured.", tag: "Finance" },
    { from: "Valentijn Venus", suffix: "", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", color: "#7c3aed", date: "Mar 15, 2026", subject: "MRV Validation — Ashanti & Northern Region Plots", body: "Satellite validation pass across 47,000+ enrolled plots confirms 98% accuracy. Ghana-specific: our shea belt plots in the Upper East (Bolgatanga cluster) are showing ±1.9% variance from direct soil measurement — our best result yet. Millet and cassava intercropping in Northern Region adds measurable biomass accumulation beyond baseline. Field teams dispatched to 212 flagged NDVI anomalies in Kumasi peri-urban zone. Verra PDD review scheduled for April.", tag: "Science" },
    { from: "Charlotte Owusu-Ansah", suffix: "", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", color: "#db2777", date: "Mar 14, 2026", subject: "Ops Update — Community Field Coordinator Network, Ghana", body: "84 community field coordinators across Ashanti, Brong-Ahafo, Northern and Upper East regions completed our Q1 refresher training in Kumasi and Tamale. 11 coordinators promoted to Senior Field Agent — all drawn from enrolled farming communities. The SikaFields App WhatsApp integration now delivers weekly carbon balance updates in Twi, Dagbani, and Hausa. Farmer satisfaction across Ghana sits at 4.7/5; re-enrollment rate 96%.", tag: "Operations" },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Field Dispatches</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Straight From the People Doing the Work</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">Our leaders speak in specifics. Expertise proves itself through detail, not job titles.</p>
          </div>
          <div className="shrink-0 text-right hidden md:block">
            <p className="text-muted-foreground text-xs">Last updated</p>
            <p className="text-foreground font-bold text-sm">Mar 19, 2026</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {dispatches.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl shrink-0 mt-0.5"
                  style={{
                    backgroundImage: "url('/leadership-team.png')",
                    backgroundSize: d.bgSize,
                    backgroundPosition: d.bgPos,
                    backgroundRepeat: "no-repeat",
                    outline: `2px solid ${d.color}50`,
                    outlineOffset: "2px",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-foreground text-sm">
                      {d.from}{d.suffix && <sup className="text-[10px] ml-0.5" style={{ color: d.color }}>{d.suffix}</sup>}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs font-semibold" style={{ color: d.color }}>{d.role}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-muted-foreground text-xs">{d.date}</span>
                    <span
                      className="ml-auto text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                      style={{ color: d.color, backgroundColor: `${d.color}15` }}
                    >
                      {d.tag}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-2">{d.subject}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{d.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const challenges = [
    { text: "2 billion smallholder farmers face intensifying climate impacts", icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
    { text: "Limited access to global carbon credit markets", icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
    { text: "Complex, expensive verification (MRV) processes", icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
    { text: "Lack of technical support and local guidance", icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
  ];

  const solutions = [
    { text: "Direct farmer access to global carbon markets", icon: <CheckCircle2 className="w-5 h-5 text-primary" /> },
    { text: "AI-powered guidance in local languages", icon: <CheckCircle2 className="w-5 h-5 text-primary" /> },
    { text: "Simplified MRV through mobile technology", icon: <CheckCircle2 className="w-5 h-5 text-primary" /> },
    { text: "Community-based support networks", icon: <CheckCircle2 className="w-5 h-5 text-primary" /> },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">The Opportunity</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Climate Crisis Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Economic Opportunity.</span>
          </h3>
          <p className="text-muted-foreground text-lg">The same communities most vulnerable to climate change are also the most powerful force to reverse it.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* The Challenge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-orange-50 border border-orange-100 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-xl font-bold text-foreground">The Challenge</h4>
            </div>
            <ul className="space-y-5">
              {challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5">{c.icon}</span>
                  <span className="text-foreground/80 leading-relaxed">{c.text}</span>
                </li>
              ))}
            </ul>
            {/* Visual: split income comparison */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 text-center border border-orange-100">
                <p className="text-xs text-muted-foreground font-medium mb-1">Traditional Farming</p>
                <p className="text-2xl font-display font-bold text-orange-600">$320<span className="text-sm font-normal">/yr</span></p>
              </div>
              <div className="bg-primary/10 rounded-2xl p-4 text-center border border-primary/20">
                <p className="text-xs text-muted-foreground font-medium mb-1">With SikaFields</p>
                <p className="text-2xl font-display font-bold text-primary">$840<span className="text-sm font-normal">/yr</span></p>
              </div>
            </div>
          </motion.div>

          {/* The Solution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 border border-primary/20 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground">The SikaFields Solution</h4>
            </div>
            <ul className="space-y-5">
              {solutions.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5">{s.icon}</span>
                  <span className="text-foreground/80 leading-relaxed">{s.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-5 bg-primary/10 rounded-2xl border border-primary/20">
              <p className="text-sm font-semibold text-primary mb-1">Result</p>
              <p className="text-foreground/80 text-sm leading-relaxed">Farmers who join SikaFields see an average <strong>2.6× increase</strong> in annual income while actively restoring their land and local ecosystems.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"farmers" | "buyers">("farmers");

  const farmerSteps = [
    {
      emoji: "📱",
      title: "Register & Assess",
      items: ["Download mobile app (works offline)", "Land eligibility assessment via satellite", "Personalised project recommendations"],
      icon: <Smartphone className="w-6 h-6 text-white" />,
    },
    {
      emoji: "🌱",
      title: "Plant & Practice",
      items: ["Receive seedlings and training", "Implement agroforestry & regenerative practices", "Get AI guidance in local language"],
      icon: <Sprout className="w-6 h-6 text-white" />,
    },
    {
      emoji: "📊",
      title: "Monitor & Report",
      items: ["Track progress via mobile app", "Automated satellite verification", "Regular field agent support"],
      icon: <SatelliteDish className="w-6 h-6 text-white" />,
    },
    {
      emoji: "💰",
      title: "Earn & Grow",
      items: ["Receive payments via mobile money", "Earn from carbon credits + co-benefits", "Scale operations over time"],
      icon: <TrendingUp className="w-6 h-6 text-white" />,
    },
  ];

  const buyerSteps = [
    { title: "Browse Projects", desc: "Explore verified agroforestry projects across Africa & India with full transparency.", icon: <Globe className="w-6 h-6 text-white" /> },
    { title: "Purchase Credits", desc: "Buy Gold Standard-certified credits with instant registry confirmation.", icon: <DollarSign className="w-6 h-6 text-white" /> },
    { title: "Track Impact", desc: "Live dashboard showing farm-level data, satellite imagery, and farmer earnings.", icon: <BarChart2 className="w-6 h-6 text-white" /> },
    { title: "Report Results", desc: "Auto-generate ESG reports and retirement certificates for compliance.", icon: <FileText className="w-6 h-6 text-white" /> },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">How It Works</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">From Seedling to Carbon Credit<br className="hidden md:block" /> in 4 Simple Steps.</h3>
          <p className="text-muted-foreground text-lg">Whether you're a farmer or a corporate buyer, SikaFields makes participation straightforward.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab("farmers")}
              className={cn("px-6 py-2.5 rounded-lg font-semibold text-sm transition-all",
                activeTab === "farmers" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🌱 For Farmers
            </button>
            <button
              onClick={() => setActiveTab("buyers")}
              className={cn("px-6 py-2.5 rounded-lg font-semibold text-sm transition-all",
                activeTab === "buyers" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🏢 For Buyers
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "farmers" ? (
            <motion.div key="farmers"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid lg:grid-cols-[280px_1fr] gap-10 items-start"
            >
              {/* Phone mockup — desktop sidebar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="hidden lg:flex flex-col items-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-primary/20 to-accent/10 blur-2xl scale-110 pointer-events-none" />
                  <div className="relative bg-[#0a0a0a] rounded-[2.5rem] p-2 shadow-2xl border border-white/10 w-[230px]">
                    <img
                      src="/mobile-app.jpeg"
                      alt="SikaFields mobile app"
                      className="rounded-[2rem] w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-black rounded-full opacity-30 blur-sm" />
                </div>
                <p className="mt-5 text-center text-xs text-muted-foreground font-medium">SikaFields App — works offline</p>
              </motion.div>

              {/* Steps grid (includes mobile app banner on smaller screens) */}
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Mobile/tablet app screenshot banner */}
                <div className="sm:col-span-2 lg:hidden flex items-center gap-4 bg-background rounded-2xl border border-border p-4 shadow-sm mb-1">
                  <img src="/mobile-app.jpeg" alt="SikaFields mobile app" className="w-16 h-28 object-cover rounded-xl shadow-md shrink-0" />
                  <div>
                    <p className="font-bold text-foreground text-sm mb-1">SikaFields App</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Log farm activities, track carbon points, and receive payments — all from your phone. Works offline in low-connectivity areas.</p>
                  </div>
                </div>
                {farmerSteps.map((step, idx) => (
                  <motion.div key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative bg-background rounded-3xl p-6 border border-border shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:-translate-y-1 transition-transform">
                        {step.icon}
                      </div>
                      <span className="text-3xl">{step.emoji}</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-secondary text-white text-xs font-bold flex items-center justify-center mb-3">{idx + 1}</div>
                    <h4 className="text-lg font-bold text-foreground mb-3">{step.title}</h4>
                    <ul className="space-y-2">
                      {step.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="buyers"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {buyerSteps.map((step, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative bg-background rounded-3xl p-6 border border-border shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-foreground to-foreground/70 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
                      {step.icon}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {idx < buyerSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center mb-3">{idx + 1}</div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ImpactMapSection() {
  return (
    <section id="impact" className="py-24 bg-card overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">Real impact, right where it matters most.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We operate in regions heavily impacted by climate change, equipping smallholders to become the world's most powerful climate defense force.
            </p>
            
            <div className="space-y-6">
              {[
                { label: "Total Farmers", value: "47,000+", color: "bg-primary" },
                { label: "Active Countries", value: "14", color: "bg-accent" },
                { label: "Hectares Restored", value: "1.2M", color: "bg-secondary" }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${stat.color}`} />
                  <div>
                    <div className="text-3xl font-display font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="mt-8">View Live Registry</Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-muted/30 rounded-3xl p-4 border border-border relative min-h-[400px] flex items-center justify-center"
          >
            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ scale: 140, center: [40, 10] }}
              className="w-full h-auto drop-shadow-xl"
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "hsl(var(--border))", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
              {ACTIVE_REGIONS.map((region, idx) => (
                <Marker key={idx} coordinates={region.coordinates as [number, number]}>
                  <circle r={4} fill="hsl(var(--primary))" className="drop-shadow-md" />
                  <circle r={12} fill="hsl(var(--primary))" opacity={0.3} className="animate-pulse-slow" />
                </Marker>
              ))}
            </ComposableMap>
            
            {/* Map Legend Overlay */}
            <div className="absolute bottom-6 right-6 bg-background/90 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-border text-xs">
              <div className="flex items-center gap-2 mb-2 font-semibold">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                Active Regions
              </div>
              <div className="text-muted-foreground">Hover nodes for stats</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StoryCard({ story, index }: { story: typeof FARMER_STORIES[0]; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const hasPhoto = ["/farmer-amara.png", "/farmer-priya.png", "/farmer-kofi.png"].includes(story.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-[320px] md:min-w-[360px] flex-shrink-0 snap-center cursor-pointer perspective-1000"
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        className="relative w-full h-[460px] rounded-3xl"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ── FRONT ── */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden bg-card border border-border shadow-lg shadow-black/5 backface-hidden flex flex-col">
          {/* Image / Avatar header */}
          <div className={cn("relative h-48 bg-gradient-to-br shrink-0", story.gradient)}>
            {hasPhoto ? (
              <img src={story.image} alt={story.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-display font-black text-white/20 select-none">{story.initials}</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Tag */}
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-bold border border-white/20">
              {story.tag}
            </span>
            {/* Name overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{story.flag}</span>
                <div>
                  <p className="text-white font-bold text-base leading-none">{story.name}, {story.age}</p>
                  <p className="text-white/60 text-xs mt-0.5">{story.location} · {story.crop}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-6">
            {/* Pull quote */}
            <div className="flex-1">
              <div className="text-4xl text-primary/20 font-serif leading-none mb-1 select-none">"</div>
              <p className="text-foreground font-semibold text-base leading-snug italic">
                {story.pullQuote}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-border">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Earnings</p>
                <p className="text-sm font-bold text-primary">{story.earnings}</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">CO₂</p>
                <p className="text-sm font-bold text-foreground">{story.co2}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Land</p>
                <p className="text-sm font-bold text-foreground leading-none">{story.farmSize.split(" ")[0]}</p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center mt-3 opacity-50">Tap to read full story →</p>
          </div>
        </div>

        {/* ── BACK (full quote) ── */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden border border-border shadow-xl flex flex-col p-7 backface-hidden"
          style={{ transform: "rotateY(180deg)", background: `linear-gradient(135deg, hsl(160 28% 6%), hsl(150 22% 12%))` }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white font-bold text-lg", story.gradient)}>
              {story.initials}
            </div>
            <div>
              <p className="text-white font-bold leading-none">{story.name}</p>
              <p className="text-white/50 text-xs mt-0.5">{story.flag} {story.location}</p>
            </div>
            <span className="ml-auto px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/20">{story.tag}</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="text-5xl text-primary/30 font-serif leading-none mb-2 select-none">"</div>
            <p className="text-white/80 text-sm leading-relaxed">{story.quote}</p>
            <div className="text-5xl text-primary/30 font-serif leading-none text-right mt-2 select-none">"</div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-4">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-0.5">Additional income</p>
              <p className="text-primary font-bold text-lg">{story.earnings}</p>
            </div>
            <p className="text-[10px] text-white/30">Tap to flip back</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FarmerStories() {
  const [activeIdx, setActiveIdx] = useState(0);
  const featured = FARMER_STORIES[0];
  const rest = FARMER_STORIES.slice(1);

  const communityStats = [
    { label: "Farmers Enrolled", value: "47,000+", icon: <Users className="w-5 h-5 text-primary" /> },
    { label: "CO₂ Sequestered", value: "2.3M tonnes", icon: <Leaf className="w-5 h-5 text-emerald-400" /> },
    { label: "Countries Active", value: "14 regions", icon: <Globe className="w-5 h-5 text-accent" /> },
    { label: "Avg Extra Income", value: "$520 / yr", icon: <TrendingUp className="w-5 h-5 text-amber-400" /> },
  ];

  return (
    <section id="farmers" className="relative py-28 overflow-hidden bg-gradient-to-b from-[hsl(160_20%_97%)] to-[hsl(160_28%_6%)]">

      {/* Ambient background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-[-10%] w-[700px] h-[700px] rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[140px]" />
        {/* Subtle grid overlay on the dark portion */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-5">
            <HeartHandshake className="w-3.5 h-3.5" /> Powered by Community
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-black text-foreground mb-5 leading-tight">
            Voices from<br />
            <span className="text-primary">the Field</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Real farmers sharing their success stories and the impact SikaFields has made on their lives and communities.
          </p>
        </motion.div>

        {/* ── Feature story ── */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl shadow-black/20"
          style={{ minHeight: 420 }}
        >
          {/* Background image */}
          <img src="/hero-farmers.jpg" alt="Farmers in the field" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-end gap-10">
            <div className="flex-1 max-w-2xl">
              {/* Tag */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                <Sprout className="w-3 h-3" /> Featured Story
              </span>
              {/* Quote mark */}
              <div className="text-7xl text-primary/40 font-serif leading-none -mb-3 select-none">"</div>
              <blockquote className="text-white text-2xl md:text-3xl font-display font-bold leading-snug mb-6">
                {featured.pullQuote}
              </blockquote>
              <p className="text-white/65 text-base leading-relaxed mb-8 max-w-lg">
                {featured.quote}
              </p>
              {/* Farmer identity */}
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0", featured.gradient)}>
                  {featured.initials}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{featured.name}, {featured.age}</p>
                  <p className="text-white/50 text-sm">{featured.flag} {featured.location} · {featured.crop}</p>
                </div>
              </div>
            </div>

            {/* Stats panel */}
            <div className="grid grid-cols-2 gap-3 shrink-0 md:w-52">
              {[
                { label: "Extra income", value: featured.earnings, color: "text-primary" },
                { label: "CO₂ / yr", value: featured.co2, color: "text-emerald-400" },
                { label: "Farm size", value: featured.farmSize, color: "text-white" },
                { label: "Specialty", value: featured.tag, color: "text-accent" },
              ].map((s, i) => (
                <div key={i} className="glass-dark rounded-2xl p-4 text-center">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-1">{s.label}</p>
                  <p className={cn("text-sm font-bold leading-snug", s.color)}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Story cards carousel ── */}
        <div className="relative mb-16">
          <div className="flex overflow-x-auto gap-5 pb-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {rest.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute top-0 right-0 bottom-6 w-24 bg-gradient-to-l from-[hsl(160_28%_6%)] to-transparent pointer-events-none" />
        </div>

        {/* ── Community stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {communityStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-center gap-3 hover:bg-white/8 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

function BuyersSection() {
  return (
    <section id="buyers" className="py-24 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white font-semibold text-sm mb-6 border border-white/20">
              For Corporate Buyers
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Premium Carbon Credits. <br />
              <span className="text-primary">Verified. Traceable.</span>
            </h2>
            <p className="text-xl text-white/70 mb-10 leading-relaxed">
              Meet your net-zero targets with absolute confidence. Our credits are rigorously verified, high-permanence, and directly empower vulnerable communities.
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                "ICVCM Core Carbon Principles aligned",
                "Real-time satellite monitoring dashboard",
                "Full financial transparency (80% to farmers)"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg text-white/90">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14 px-8">
              Request Credit Portfolio
            </Button>
          </div>

          <div className="grid gap-6">
            {[
              { title: "Gold Standard Certified", desc: "Highest level of environmental integrity.", icon: <ShieldCheck className="w-8 h-8 text-secondary" /> },
              { title: "Live Dashboard", desc: "Track every tonne you purchase down to the farm level.", icon: <LineChart className="w-8 h-8 text-accent" /> },
              { title: "API Integration", desc: "Automate retirements via our robust API.", icon: <Wind className="w-8 h-8 text-primary" /> }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex gap-6 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="p-4 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                  <p className="text-white/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MultilingualSection() {
  return (
    <section className="py-20 bg-muted/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-2xl font-bold mb-10">Accessible everywhere, in 6+ languages</h3>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          {["English", "Swahili", "Hindi", "French", "Portuguese", "Amharic"].map((lang) => (
            <div key={lang} className="flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm border border-border font-medium text-foreground/80 hover:border-primary hover:text-primary transition-colors cursor-pointer">
              <Languages className="w-4 h-4" />
              {lang}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustTicker() {
  return (
    <section className="py-12 border-b border-border bg-background overflow-hidden flex flex-col items-center">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8 text-center">Certified & Supported By</p>
      <div className="w-full relative flex items-center">
        {/* Gradients to hide edges */}
        <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite]">
          {[...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, idx) => (
            <div key={idx} className="mx-8 text-2xl font-display font-bold text-foreground/20 hover:text-foreground/40 transition-colors">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/10 -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/20 -z-10" />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Join the movement.</h2>
        <p className="text-xl text-muted-foreground mb-10">
          Be part of a community of 5,000+ farmers, buyers, and climate advocates. Get updates on new projects and market insights.
        </p>
        
        <form 
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          onSubmit={(e) => { e.preventDefault(); alert("Thanks for joining!"); setEmail(""); }}
        >
          <input 
            type="email" 
            placeholder="Enter your email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg"
          />
          <Button size="lg" type="submit" className="h-[60px] text-lg px-8">Join Waitlist</Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/sikafields",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com/sikafields",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/sikafields",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/sikafields",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@sikafields",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/233302211611",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
  },
];

const ENQUIRY_SUBJECTS = [
  "General Enquiry",
  "Farmer Onboarding",
  "Carbon Credit Purchase",
  "Partnership / Investment",
  "Press & Media",
  "Technical Support",
  "Other",
];

function Footer() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: ENQUIRY_SUBJECTS[0], message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const validateContact = () => {
    const e: Record<string, string> = {};
    if (!contactForm.name.trim()) e.name = "Name is required.";
    if (!contactForm.email.trim() || !/\S+@\S+\.\S+/.test(contactForm.email)) e.email = "Valid email required.";
    if (!contactForm.message.trim() || contactForm.message.trim().length < 10) e.message = "Please write at least 10 characters.";
    return e;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateContact();
    if (Object.keys(errs).length) { setContactErrors(errs); return; }
    setContactErrors({});
    setContactStatus("sending");
    setTimeout(() => setContactStatus("sent"), 1600);
  };

  const fInputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all";
  const fErrorCls = "border-red-400/60 focus:ring-red-400/30";

  return (
    <footer id="contact" className="bg-gradient-to-b from-[hsl(160_28%_6%)] to-[hsl(150_30%_4%)] text-white">

      {/* ── Contact Us Section ── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
              <Mail className="w-3.5 h-3.5" /> Contact Us
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-3">We want to hear from you!</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Write us a message. We will get back to you within <span className="text-white/80 font-medium">3–5 business days</span>.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">

            {/* ── Left: Info columns ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Reach us */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-4">Reach Us</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Phone className="w-4 h-4" />, label: "Phone", value: "+233 302 211 611", href: "tel:+233302211611" },
                    { icon: <Mail className="w-4 h-4" />, label: "Email", value: "info@sikafield.net", href: "mailto:info@sikafield.net" },
                    { icon: <Clock className="w-4 h-4" />, label: "Response", value: "3–5 business days", href: null },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/8">
                      <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">{c.icon}</div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">{c.label}</p>
                        {c.href
                          ? <a href={c.href} className="text-sm font-semibold text-white/90 hover:text-primary transition-colors">{c.value}</a>
                          : <p className="text-sm font-semibold text-white/90">{c.value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visit us */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-4">Visit Us</h3>
                <div className="space-y-3">

                  {/* Ghana */}
                  <div className="rounded-2xl bg-white/5 border border-white/8 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🇬🇭</span>
                      <span className="font-display font-bold text-white text-sm">Ghana Office</span>
                    </div>
                    <div className="space-y-2.5 text-sm text-white/60">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-0.5">Head Office</p>
                        <p className="text-white/80 font-medium leading-snug">11 Potato Avenue, East Legon<br />Accra, Ghana</p>
                      </div>
                      <div className="border-t border-white/8 pt-2.5">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-1">Field Offices</p>
                        <p className="text-white/70">Ejusu, Kumasi</p>
                        <p className="text-white/70">Jema, Bono East</p>
                      </div>
                    </div>
                  </div>

                  {/* India */}
                  <div className="rounded-2xl bg-white/5 border border-white/8 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇮🇳</span>
                      <span className="font-display font-bold text-white text-sm">India</span>
                    </div>
                    <p className="text-sm text-white/60">South Asia Expansion</p>
                  </div>

                  {/* Dubai */}
                  <div className="rounded-2xl bg-white/5 border border-white/8 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇦🇪</span>
                      <span className="font-display font-bold text-white text-sm">Dubai</span>
                    </div>
                    <div className="text-sm text-white/60 space-y-1">
                      <p className="text-white/80 font-medium">Dubai International Financial Centre (DIFC)</p>
                      <p>Holding company with subsidiaries across Africa</p>
                      <p className="text-white/40 text-xs">DIFC Registered — Growing presence</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── Right: Enquiry form ── */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-white/10 bg-white/4 backdrop-blur-sm p-8 sm:p-10">
                {contactStatus === "sent" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-14"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-white/50 text-sm max-w-xs mx-auto mb-7">
                      Thank you for reaching out. Our team will be in touch within 3–5 business days.
                    </p>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => { setContactStatus("idle"); setContactForm({ name: "", email: "", subject: ENQUIRY_SUBJECTS[0], message: "" }); }}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-xl font-display font-bold text-white mb-1">Send us a message</h3>
                    <p className="text-white/40 text-sm mb-7">Fields marked <span className="text-red-400">*</span> are required.</p>

                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Full Name <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            placeholder="e.g. Kwame Mensah"
                            value={contactForm.name}
                            onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                            className={cn(fInputCls, contactErrors.name && fErrorCls)}
                          />
                          {contactErrors.name && <p className="text-xs text-red-400">{contactErrors.name}</p>}
                        </div>
                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Email Address <span className="text-red-400">*</span></label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={contactForm.email}
                            onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                            className={cn(fInputCls, contactErrors.email && fErrorCls)}
                          />
                          {contactErrors.email && <p className="text-xs text-red-400">{contactErrors.email}</p>}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Subject</label>
                        <select
                          value={contactForm.subject}
                          onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                          className={cn(fInputCls, "cursor-pointer")}
                        >
                          {ENQUIRY_SUBJECTS.map(s => <option key={s} value={s} className="bg-[#0d1f16] text-white">{s}</option>)}
                        </select>
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Message <span className="text-red-400">*</span></label>
                        <textarea
                          rows={5}
                          placeholder="Tell us how we can help you…"
                          value={contactForm.message}
                          onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                          className={cn(fInputCls, "resize-none", contactErrors.message && fErrorCls)}
                        />
                        {contactErrors.message && <p className="text-xs text-red-400">{contactErrors.message}</p>}
                      </div>

                      <p className="text-xs text-white/25">By submitting, you agree to SikaFields' privacy policy. We never share your data.</p>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={contactStatus === "sending"}
                        className="w-full font-bold text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 rounded-2xl h-13"
                      >
                        {contactStatus === "sending"
                          ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending…</>
                          : <><Send className="w-5 h-5 mr-2" /> Send Message</>
                        }
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer links + social ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand + social */}
          <div className="col-span-2 lg:col-span-2">
            <img src="/sikafields-logo-new.png" alt="SikaFields" className="h-10 w-auto mb-5" />
            <p className="text-white/40 text-sm max-w-xs mb-7 leading-relaxed">
              Empowering smallholder farmers to participate in global carbon markets. Science-backed, community-powered.
            </p>
            {/* Social icons */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Follow Us</p>
              <div className="flex items-center flex-wrap gap-2">
                {SOCIAL_LINKS.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white/80 mb-5 text-sm">Platform</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {["Impact Map","Methodology","Pricing","Registry"].map(l => (
                <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white/80 mb-5 text-sm">Solutions</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {["For Farmers","For Co-ops","For Corporate Buyers","For Governments"].map(l => (
                <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white/80 mb-5 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#leadership" className="hover:text-primary transition-colors">Leadership</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <p>© {new Date().getFullYear()} SikaFields. Helping farmers. Healing the planet.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white/60 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      <AnnouncementBanner />
      <Navbar />
      <main>
        <HeroSection />
        <LiveStats />
        <AboutSection />
        <LeadershipSection />
        <TrustWallSection />
        <FieldDispatchesSection />
        <EventsSection />
        <ProblemSection />
        <HowItWorks />
        <ImpactMapSection />
        <FarmerStories />
        <BuyersSection />
        <MultilingualSection />
        <TrustTicker />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
