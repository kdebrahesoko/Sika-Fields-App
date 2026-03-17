import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Leaf, Globe, Wind, Sprout, ArrowRight, X, Menu,
  CheckCircle2, LineChart, ShieldCheck, MapPin, 
  ChevronRight, Languages
} from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    location: "Senegal 🇸🇳",
    age: 34,
    quote: "I used to worry every harvest. Now with SikaFields, I earn carbon income even in dry seasons.",
    earnings: "$420/yr extra",
    initials: "AD",
    color: "bg-emerald-100 text-emerald-800"
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "Maharashtra 🇮🇳",
    age: 28,
    quote: "The offline app works even in my village with no internet. My earnings tripled this year.",
    earnings: "$650/yr extra",
    initials: "PS",
    color: "bg-amber-100 text-amber-800"
  },
  {
    id: 3,
    name: "Kofi Mensah",
    location: "Ghana 🇬🇭",
    age: 45,
    quote: "My cooperative registered 200 farmers in one day. Simple, fast, works on any basic smartphone.",
    earnings: "$3,200/yr (Co-op)",
    initials: "KM",
    color: "bg-teal-100 text-teal-800"
  }
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

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed w-full z-40 transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-lg shadow-sm border-b border-border/50 py-3" : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">SikaFields</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-foreground/80">
          <a href="#about" className="hover:text-primary transition-colors">About Us</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#impact" className="hover:text-primary transition-colors">Impact</a>
          <a href="#farmers" className="hover:text-primary transition-colors">Farmers</a>
          <a href="#buyers" className="hover:text-primary transition-colors">For Buyers</a>
          <a href="#resources" className="hover:text-primary transition-colors">Resources</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground cursor-pointer transition-colors px-2">
            <Languages className="w-4 h-4" />
            <span className="font-medium">EN</span>
          </div>
          <Button variant="ghost" className="font-semibold">Log In</Button>
          <Button className="font-bold">Get Started</Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
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
            className="absolute top-full left-0 w-full bg-background border-b border-border shadow-xl p-4 flex flex-col gap-4 md:hidden"
          >
            <a href="#about" className="p-3 hover:bg-muted rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a href="#how-it-works" className="p-3 hover:bg-muted rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#impact" className="p-3 hover:bg-muted rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>Impact</a>
            <a href="#farmers" className="p-3 hover:bg-muted rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>Farmers</a>
            <a href="#buyers" className="p-3 hover:bg-muted rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>For Buyers</a>
            <a href="#resources" className="p-3 hover:bg-muted rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>Resources</a>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full">Log In</Button>
              <Button className="w-full">Get Started</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden opacity-30 dark:opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-secondary blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Trusted by 47,000+ Farmers</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-[1.1] mb-6 text-foreground">
            Go from carbon goal to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">climate impact.</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
            Connect smallholder farmers across Africa and India to global carbon markets. Science-backed, community-powered, and strictly verified.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm">
              <MapPin className="mr-2 w-5 h-5" />
              Explore Impact Map
            </Button>
          </div>
          
          <div className="mt-12 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex text-amber-500 mb-1">
                {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p>Rated <span className="font-bold text-foreground">4.9/5</span> by farmers</p>
            </div>
          </div>
        </motion.div>

        {/* CSS Art Hero Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[500px] w-full hidden lg:block perspective-1000"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[3rem] transform rotate-3 shadow-2xl shadow-primary/10 border border-white/20 backdrop-blur-3xl overflow-hidden">
            
            {/* Sun */}
            <div className="absolute top-12 right-12 w-24 h-24 bg-gradient-to-br from-secondary to-amber-300 rounded-full blur-[2px] shadow-lg shadow-amber-500/50" />
            
            {/* Hills/Landscape using CSS shapes */}
            <div className="absolute -bottom-20 -left-10 w-[120%] h-64 bg-gradient-to-t from-primary to-green-500 rounded-[100%] opacity-90 transform -rotate-6" />
            <div className="absolute -bottom-10 -right-10 w-[110%] h-56 bg-gradient-to-t from-emerald-800 to-primary rounded-[100%] transform rotate-3" />
            
            {/* Floating Elements */}
            <motion.div className="absolute top-1/4 left-1/4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3"
              animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Credits Minted</p>
                <p className="text-lg font-bold text-gray-900">+12.5k Tonnes</p>
              </div>
            </motion.div>

            <motion.div className="absolute bottom-1/3 right-1/4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3"
              animate={{ y: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">New Region</p>
                <p className="text-lg font-bold text-gray-900">Kenya Active</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
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

function HowItWorks() {
  const steps = [
    {
      title: "Farmers Register",
      desc: "Simple mobile enrollment works entirely offline. Farmers map their land using our GPS tool.",
      icon: <MapPin className="w-6 h-6 text-white" />
    },
    {
      title: "Data Verified",
      desc: "Satellite imagery paired with ground-truth checks ensure 98% accuracy of carbon sequestered.",
      icon: <ShieldCheck className="w-6 h-6 text-white" />
    },
    {
      title: "Credits Sold",
      desc: "Verified credits hit the global market. 80% of revenue goes directly back to the farmers.",
      icon: <LineChart className="w-6 h-6 text-white" />
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">The Process</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">From soil to global markets in 3 steps.</h3>
          <p className="text-muted-foreground text-lg">We remove the middlemen so farmers get paid fairly for healing the planet.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />

          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20 mb-8 transform group-hover:-translate-y-2 transition-transform duration-300">
                {step.icon}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold border-4 border-background">
                  {idx + 1}
                </div>
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">{step.title}</h4>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
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

function FarmerStories() {
  return (
    <section id="farmers" className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Powered by community.</h2>
            <p className="text-lg text-muted-foreground">Hear from the farmers who are transforming their land and livelihoods.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full hidden sm:flex"><ChevronRight className="w-5 h-5 rotate-180" /></Button>
            <Button variant="outline" size="icon" className="rounded-full hidden sm:flex"><ChevronRight className="w-5 h-5" /></Button>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {FARMER_STORIES.map((story) => (
            <motion.div 
              key={story.id}
              whileHover={{ y: -5 }}
              className="min-w-[300px] md:min-w-[380px] flex-shrink-0 snap-center bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg", story.color)}>
                    {story.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{story.name}, {story.age}</h4>
                    <p className="text-sm text-muted-foreground">{story.location}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-foreground/80 text-lg leading-relaxed mb-8 italic">"{story.quote}"</p>
              
              <div className="pt-6 border-t border-border flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Impact Earnings</span>
                <span className="font-bold text-primary">{story.earnings}</span>
              </div>
            </motion.div>
          ))}
        </div>
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

function Footer() {
  return (
    <footer className="bg-background pt-20 pb-10 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">SikaFields</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
              Empowering smallholder farmers to participate in global carbon markets. Science-backed, community-powered.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Impact Map</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Registry</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6">Solutions</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">For Farmers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">For Co-ops</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">For Corporate Buyers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">For Governments</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 SikaFields. Helping farmers. Healing the planet.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
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
