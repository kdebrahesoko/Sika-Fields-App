import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  MapPin, Phone, Mail, Send, CheckCircle2,
  ArrowLeft, Building2, Globe, Clock, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const offices = [
  {
    region: "Ghana",
    flag: "🇬🇭",
    color: "from-primary/10 to-emerald-50",
    border: "border-primary/20",
    icon: <MapPin className="w-5 h-5 text-primary" />,
    addresses: [
      { label: "Head Office", line1: "11 Potato Avenue, East Legon", line2: "Accra, Ghana" },
      { label: "Operations", line1: "Ejusu, Kumasi", line2: "" },
      { label: "Field Office", line1: "Jema, Bono East", line2: "" },
    ],
  },
  {
    region: "India",
    flag: "🇮🇳",
    color: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    icon: <Globe className="w-5 h-5 text-amber-500" />,
    addresses: [
      { label: "South Asia", line1: "South Asia Expansion", line2: "India Operations" },
    ],
  },
  {
    region: "Dubai",
    flag: "🇦🇪",
    color: "from-teal-50 to-cyan-50",
    border: "border-teal-200",
    icon: <Building2 className="w-5 h-5 text-teal-600" />,
    addresses: [
      { label: "Holding Company", line1: "Dubai International Financial Centre", line2: "DIFC — Registered Entity" },
      { label: "Regional Hub", line1: "Growing presence across", line2: "Africa & Asia subsidiaries" },
    ],
  },
];

const contactInfo = [
  { icon: <Phone className="w-5 h-5" />, label: "Phone", value: "+233 302 211 611", href: "tel:+233302211611", color: "text-primary" },
  { icon: <Mail className="w-5 h-5" />, label: "Email", value: "info@sikafield.net", href: "mailto:info@sikafield.net", color: "text-accent" },
  { icon: <Clock className="w-5 h-5" />, label: "Response Time", value: "Within 3–5 business days", href: null, color: "text-amber-500" },
];

const subjects = [
  "General Enquiry",
  "Farmer Onboarding",
  "Carbon Credit Purchase",
  "Partnership / Investment",
  "Press & Media",
  "Technical Support",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: subjects[0], message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Please enter a valid email.";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Message must be at least 10 characters.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 group">
              <img src="/sikafields-logo.png" alt="SikaFields" className="h-9 w-auto" />
            </a>
          </Link>
          <Link href="/">
            <a className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
          </Link>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(160_28%_6%)] via-[hsl(150_22%_10%)] to-[hsl(145_28%_14%)] py-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent/15 blur-[110px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              <Mail className="w-3.5 h-3.5" /> Contact Us
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white leading-tight mb-4"
          >
            We want to hear <span className="text-primary">from you!</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg max-w-xl mx-auto"
          >
            Write us a message. We will get back to you within 3–5 business days.
          </motion.p>
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

          {/* ── Left: Contact info + offices ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick contact */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Reach Us</h2>
              <div className="space-y-3">
                {contactInfo.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border shrink-0", c.color)}>
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className={cn("text-sm font-semibold hover:underline", c.color)}>{c.value}</a>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Offices */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Visit Us</h2>
              <div className="space-y-4">
                {offices.map((office, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={i + 2}
                    className={cn("rounded-2xl border p-5 bg-gradient-to-br", office.color, office.border)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{office.flag}</span>
                      <div className="flex items-center gap-1.5">
                        {office.icon}
                        <h3 className="font-display font-bold text-foreground">{office.region}</h3>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {office.addresses.map((addr, j) => (
                        <div key={j} className={cn("text-sm", j > 0 && "pt-3 border-t border-black/5")}>
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{addr.label}</p>
                          <p className="font-medium text-foreground leading-snug">{addr.line1}</p>
                          {addr.line2 && <p className="text-muted-foreground text-xs">{addr.line2}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Enquiry form ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl border border-border shadow-xl shadow-black/5 p-8 sm:p-10">
              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
                    Thank you for reaching out. Our team will get back to you within 3–5 business days.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: subjects[0], message: "" }); }}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold text-foreground">Send us a message</h2>
                    <p className="text-muted-foreground text-sm mt-1">All fields marked <span className="text-red-500">*</span> are required.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name + Email row */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField label="Full Name" required error={errors.name}>
                        <input
                          type="text"
                          placeholder="e.g. Kwame Mensah"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className={cn(inputCls, errors.name && errorInputCls)}
                        />
                      </FormField>
                      <FormField label="Email Address" required error={errors.email}>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className={cn(inputCls, errors.email && errorInputCls)}
                        />
                      </FormField>
                    </div>

                    {/* Subject */}
                    <FormField label="Subject">
                      <select
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className={cn(inputCls, "cursor-pointer")}
                      >
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FormField>

                    {/* Message */}
                    <FormField label="Your Message" required error={errors.message}>
                      <textarea
                        rows={6}
                        placeholder="Tell us how we can help you..."
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        className={cn(inputCls, "resize-none", errors.message && errorInputCls)}
                      />
                    </FormField>

                    {/* Privacy note */}
                    <p className="text-xs text-muted-foreground">
                      By submitting this form, you agree to SikaFields' privacy policy. We never share your information with third parties.
                    </p>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={status === "sending"}
                      className="w-full font-bold text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-2xl h-14"
                    >
                      {status === "sending" ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending…</>
                      ) : (
                        <><Send className="w-5 h-5 mr-2" /> Send Message</>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer strip ── */}
      <footer className="border-t border-border bg-muted/30 py-8 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SikaFields. All rights reserved. &nbsp;·&nbsp;
          <a href="mailto:info@sikafield.net" className="hover:text-primary transition-colors">info@sikafield.net</a>
        </p>
      </footer>
    </div>
  );
}

function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 font-medium">
          {error}
        </motion.p>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";
const errorInputCls = "border-red-400 focus:ring-red-400/30 focus:border-red-400";
