import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown, ClipboardCheck, GraduationCap, Globe, Code2, Calculator, Megaphone, BookOpen, Shield, LayoutDashboard, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const SERVICE_CATEGORIES = [
  {
    label: "NDIS Services",
    badge: "⭐ Most Popular",
    items: [
      { label: "NDIS Registration",             href: "/services/ndis-registration",             icon: Shield,         desc: "Full registration & audit support" },
      { label: "Readiness Quiz",                href: "/readiness-quiz",                         icon: ClipboardCheck, desc: "Check your NDIS readiness in 5 min" },
      { label: "NDIS Readiness Calculator",     href: "/ndis-readiness-calculator",              icon: ClipboardCheck, desc: "Estimate your compliance score" },
    ],
  },
  {
    label: "Training",
    items: [
      { label: "Support Coordination Training", href: "/services/support-coordination-training", icon: GraduationCap,  desc: "Level 1–3 accredited courses" },
      { label: "Training Courses",              href: "/training-courses",                        icon: BookOpen,       desc: "Browse all online courses" },
    ],
  },
  {
    label: "Business Services",
    items: [
      { label: "Digital Marketing",             href: "/marketing-packages",                     icon: Megaphone,      desc: "SEO, social media & ads" },
      { label: "Website Development",           href: "/services/website-development",           icon: Globe,          desc: "Custom business websites" },
      { label: "Software & Automation",         href: "/services/software-automation",           icon: Code2,          desc: "Streamline your operations" },
      { label: "Accountancy",                   href: "/services/accountancy",                   icon: Calculator,     desc: "Tax, BAS & compliance" },
    ],
  },
];

const NAV_LINKS = [
  { label: "Home",         href: "/" },
  { label: "About",        href: "/#about" },
  { label: "Compliance",   href: "/services/ndis-registration" },
  { label: "Pricing",      href: "/#pricing" },
  { label: "Blog",         href: "/blog" },
  { label: "Contact",      href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || location.pathname !== "/"
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-harvest flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-ink text-lg leading-tight tracking-tight">SOL</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-slate_mist font-medium leading-tight">Business Consultant</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href}
                className="text-sm font-medium text-slate_mist hover:text-ink transition-colors duration-300 relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-harvest transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            {/* Mega-menu Services dropdown */}
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${servicesOpen ? "text-harvest" : "text-slate_mist hover:text-ink"}`}>
                Services <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full -left-4 mt-3 w-[620px] bg-white rounded-2xl border border-border shadow-2xl py-5 px-2 z-50 grid grid-cols-3 gap-1"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <div key={cat.label} className="px-3">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate_mist">{cat.label}</p>
                          {cat.badge && <span className="text-[9px] font-bold bg-harvest/10 text-harvest px-1.5 py-0.5 rounded-full">{cat.badge}</span>}
                        </div>
                        {cat.items.map((item) => (
                          <Link key={item.href} to={item.href}
                            onClick={() => setServicesOpen(false)}
                            className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 hover:text-harvest transition-colors group mb-0.5">
                            <div className="w-7 h-7 rounded-lg bg-harvest/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-harvest/20 transition-colors">
                              <item.icon className="w-3.5 h-3.5 text-harvest" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink group-hover:text-harvest leading-tight">{item.label}</p>
                              <p className="text-[11px] text-slate_mist leading-tight mt-0.5">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                    {/* CTA strip */}
                    <div className="col-span-3 mt-2 pt-3 border-t border-border/50 px-3 flex items-center justify-between">
                      <p className="text-xs text-slate_mist">Not sure where to start?</p>
                      <Link to="/readiness-quiz" onClick={() => setServicesOpen(false)}>
                        <Button size="sm" className="bg-harvest text-white text-xs gap-1.5 h-7">
                          Take Free Readiness Quiz <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/client-portal" className="text-sm font-medium text-slate_mist hover:text-harvest transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100">
              <UserCircle className="w-4 h-4" /> Portal
            </Link>
            <Link to="/student-dashboard" className="text-sm font-medium text-slate_mist hover:text-harvest transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100">
              <GraduationCap className="w-4 h-4" /> Student
            </Link>
            <Link to="/get-started">
              <Button variant="outline" className="text-sm border-border/60 h-8 px-3">Find My Plan</Button>
            </Link>
            <a href="/#contact">
              <Button className="bg-ink hover:bg-ink/90 text-white font-display text-sm px-4 h-8 gap-1.5 group">
                Book Consultation
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>

          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t border-border overflow-hidden">
            <div className="px-6 py-6 space-y-3">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                  className="block text-base font-medium text-ink hover:text-harvest transition-colors py-1">
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-border/50">
                {SERVICE_CATEGORIES.map(cat => (
                  <div key={cat.label} className="mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate_mist mb-1.5">{cat.label}</p>
                    {cat.items.map(item => (
                      <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 py-1.5 text-sm text-ink hover:text-harvest transition-colors">
                        <item.icon className="w-3.5 h-3.5 text-harvest flex-shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border/50 space-y-2">
                <Link to="/client-portal" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-sm font-medium text-ink hover:text-harvest transition-colors">
                  <UserCircle className="w-4 h-4 text-harvest" /> Client Portal
                </Link>
                <Link to="/student-dashboard" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-sm font-medium text-ink hover:text-harvest transition-colors">
                  <GraduationCap className="w-4 h-4 text-harvest" /> Student Dashboard
                </Link>
              </div>
              <div className="flex gap-2 pt-2">
                <Link to="/get-started" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm">Find My Plan</Button>
                </Link>
                <a href="/#contact" onClick={() => setMobileOpen(false)}>
                  <Button className="bg-harvest text-white" size="sm">Book Consultation</Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}