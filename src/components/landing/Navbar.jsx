import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown, ClipboardCheck, GraduationCap, Globe, Code2, Calculator, Megaphone, BookOpen, Shield, UserCircle, Sparkles } from "lucide-react";
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
      { label: "Support Coordination Training", href: "/services/support-coordination-training", icon: GraduationCap,  desc: "Level 1-3 NDIS-aligned courses" },
      { label: "Training Courses",              href: "/training-courses",                        icon: BookOpen,       desc: "Browse all online courses" },
    ],
  },
  {
    label: "Business Services",
    items: [
      { label: "Digital Marketing",             href: "/marketing-packages",                     icon: Megaphone,      desc: "SEO, social media & ads" },
      { label: "Website Development",           href: "/services/website-development",           icon: Globe,          desc: "Custom business websites" },
      { label: "Software & Automation",         href: "/services/software-automation",           icon: Code2,          desc: "Streamline your operations" },
      { label: "Accountancy",                   href: "/services/accountancy",                   icon: Calculator,     desc: "Finance operations support" },
    ],
  },
];

const NAV_LINKS = [
  { label: "Home",         href: "/" },
  { label: "About",        href: "/#about" },
  { label: "Compliance",   href: "/#compliance" },
  { label: "Pricing",      href: "/#pricing" },
  { label: "Blog",         href: "/blog" },
  { label: "Contact",      href: "/#contact" },
];

const TRACKED_SECTIONS = ["about", "services", "pricing", "compliance", "ndis", "contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(true);
  const [activeHash, setActiveHash] = useState("");
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveHash("");
      return undefined;
    }

    const updateActiveSection = () => {
      const current = TRACKED_SECTIONS
        .map((id) => ({ id, element: document.getElementById(id) }))
        .filter(({ element }) => element)
        .reverse()
        .find(({ element }) => element.getBoundingClientRect().top <= 140);

      setActiveHash(current ? `/#${current.id}` : "");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [location.pathname]);

  const isActiveLink = (href) => {
    if (href === "/") return location.pathname === "/" && !activeHash;
    if (href.startsWith("/#")) return location.pathname === "/" && activeHash === href;
    return location.pathname === href;
  };

  // The utility bar collapses once the user scrolls, so the nav stays compact.
  const showBar = barVisible && !scrolled;

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
      {/* Utility / announcement bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-ink text-white overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-9 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-harvest flex-shrink-0" />
                <span className="truncate">
                  Australian-owned NDIS & business consulting — audit-ready systems, end-to-end support.
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                <Link to="/readiness-quiz" className="font-semibold hover:text-harvest transition-colors flex items-center gap-1">
                  Free Readiness Quiz <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => setBarVisible(false)}
                  aria-label="Dismiss announcement"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

          <div className="hidden xl:flex items-center gap-4">
            {NAV_LINKS.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-sm font-medium transition-colors duration-300 relative group ${active ? "text-ink" : "text-slate_mist hover:text-ink"}`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-harvest transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              );
            })}
            {/* Mega-menu Services dropdown */}
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button
                aria-haspopup="true"
                aria-expanded={servicesOpen}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${servicesOpen ? "text-harvest" : "text-slate_mist hover:text-ink"}`}>
                Services <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className={`fixed left-1/2 ${showBar ? "top-28" : "top-20"} z-50 mt-3 grid w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 grid-cols-1 gap-2 rounded-2xl border border-border bg-white p-2 shadow-2xl max-h-[calc(100vh-7rem)] overflow-y-auto xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(220px,240px)] xl:w-[920px]`}
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <div key={cat.label} className="min-w-0 px-3 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate_mist">{cat.label}</p>
                          {cat.badge && <span className="text-[9px] font-bold bg-harvest/10 text-harvest px-1.5 py-0.5 rounded-full">{cat.badge}</span>}
                        </div>
                        {cat.items.map((item) => (
                          <Link key={item.href} to={item.href}
                            onClick={() => setServicesOpen(false)}
                            className="flex min-w-0 items-start gap-2.5 rounded-xl px-2 py-2 transition-colors group mb-0.5 hover:bg-slate-50 hover:text-harvest">
                            <div className="w-7 h-7 rounded-lg bg-harvest/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-harvest/20 transition-colors">
                              <item.icon className="w-3.5 h-3.5 text-harvest" />
                            </div>
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold leading-tight text-ink group-hover:text-harvest">{item.label}</p>
                              <p className="mt-0.5 break-words text-[11px] leading-tight text-slate_mist">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                    {/* Promo card (eploy-style right rail) */}
                    <div className="rounded-xl bg-gradient-to-br from-ink via-ink to-harvest/40 p-4 flex flex-col justify-between text-white">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider mb-3">
                          <Sparkles className="w-3 h-3 text-harvest" /> Get Started
                        </div>
                        <p className="font-display font-bold text-base leading-tight">Not sure where to start?</p>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
                          Take our 5-minute readiness quiz and get a tailored plan for your business.
                        </p>
                      </div>
                      <Link to="/readiness-quiz" onClick={() => setServicesOpen(false)} className="mt-4">
                        <Button size="sm" className="w-full bg-harvest hover:bg-harvest/90 text-white text-xs gap-1.5 h-8">
                          Free Readiness Quiz <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2">
            <Link to="/client-portal" className="text-sm font-medium text-slate_mist hover:text-harvest transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100">
              <UserCircle className="w-4 h-4" /> Portal
            </Link>
            <Link to="/student-dashboard" className="text-sm font-medium text-slate_mist hover:text-harvest transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100">
              <GraduationCap className="w-4 h-4" /> Student
            </Link>
            <Link to="/get-started">
              <Button variant="outline" className="text-sm border-border/60 h-8 px-3">Find My Plan</Button>
            </Link>
            <Link to="/#contact">
              <Button className="bg-ink hover:bg-ink/90 text-white font-display text-sm px-4 h-8 gap-1.5 group">
                Book Consultation
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <button
            className="xl:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="xl:hidden bg-white border-t border-border overflow-hidden">
            <div className="px-6 py-6 space-y-3">
              {NAV_LINKS.map((link) => {
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-base font-medium transition-colors py-1 ${active ? "text-harvest" : "text-ink hover:text-harvest"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <Link to="/get-started" onClick={() => setMobileOpen(false)} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">Find My Plan</Button>
                </Link>
                <Link to="/#contact" onClick={() => setMobileOpen(false)} className="w-full">
                  <Button className="w-full bg-harvest text-white" size="sm">Book Consultation</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
