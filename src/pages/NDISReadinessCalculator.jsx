import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, AlertCircle, XCircle, ArrowRight, ArrowLeft,
  Shield, FileText, Users, ClipboardList, Building2, Calculator,
  BarChart3, ChevronDown, ChevronUp, Phone, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

// ─── Assessment Domains ──────────────────────────────────────────────────────

const DOMAINS = [
  {
    id: "legal",
    icon: Building2,
    label: "Legal & Business Structure",
    color: "blue",
    questions: [
      {
        id: "abn",
        text: "Does your organisation have a registered ABN?",
        options: [
          { label: "Yes — active ABN registered", score: 3 },
          { label: "Applied but not yet received", score: 1 },
          { label: "No ABN yet", score: 0 },
        ],
      },
      {
        id: "structure",
        text: "What is your registered business structure?",
        options: [
          { label: "Pty Ltd / Ltd / Incorporated Association", score: 3 },
          { label: "Sole trader or partnership", score: 1 },
          { label: "Not yet formally structured", score: 0 },
        ],
      },
      {
        id: "acnc",
        text: "If a charity/NFP, are you registered with ACNC or equivalent?",
        options: [
          { label: "Yes, registered", score: 3 },
          { label: "Not applicable — for-profit", score: 3 },
          { label: "In progress", score: 1 },
          { label: "No", score: 0 },
        ],
      },
    ],
  },
  {
    id: "governance",
    icon: Shield,
    label: "Governance & Leadership",
    color: "purple",
    questions: [
      {
        id: "key_personnel",
        text: "Have your Key Personnel (directors, managers) been identified and verified via NDIS Worker Screening?",
        options: [
          { label: "Yes — all screened and cleared", score: 3 },
          { label: "Partially — some screened", score: 1 },
          { label: "No — not yet started", score: 0 },
        ],
      },
      {
        id: "governance_board",
        text: "Does your organisation have a formal governance structure (board, committee, or designated management)?",
        options: [
          { label: "Yes — clearly defined with documented roles", score: 3 },
          { label: "Informally in place", score: 1 },
          { label: "Not yet established", score: 0 },
        ],
      },
      {
        id: "complaints",
        text: "Do you have a documented complaints and feedback management process?",
        options: [
          { label: "Yes — written policy with resolution steps", score: 3 },
          { label: "Basic informal process only", score: 1 },
          { label: "No process in place", score: 0 },
        ],
      },
    ],
  },
  {
    id: "policies",
    icon: FileText,
    label: "Policies & Procedures",
    color: "amber",
    questions: [
      {
        id: "policy_manual",
        text: "Do you have a policy and procedure manual aligned to NDIS Practice Standards?",
        options: [
          { label: "Yes — comprehensive and up to date", score: 3 },
          { label: "Some policies exist, significant gaps remain", score: 1 },
          { label: "No formal policies", score: 0 },
        ],
      },
      {
        id: "incident_mgmt",
        text: "Do you have an incident management and reportable incidents policy?",
        options: [
          { label: "Yes — documented and staff are trained", score: 3 },
          { label: "Draft in progress", score: 1 },
          { label: "Not yet developed", score: 0 },
        ],
      },
      {
        id: "rights",
        text: "Do you have participant rights, privacy, and consent documentation?",
        options: [
          { label: "Yes — written policies and consent forms ready", score: 3 },
          { label: "Partially developed", score: 1 },
          { label: "Not yet in place", score: 0 },
        ],
      },
    ],
  },
  {
    id: "workforce",
    icon: Users,
    label: "Workforce & Qualifications",
    color: "green",
    questions: [
      {
        id: "qualifications",
        text: "Do key staff hold relevant qualifications for the NDIS supports you plan to deliver?",
        options: [
          { label: "Yes — all required qualifications met", score: 3 },
          { label: "Some staff qualified, gaps exist", score: 1 },
          { label: "Building team from scratch", score: 0 },
        ],
      },
      {
        id: "worker_screening",
        text: "Are all workers subject to NDIS Worker Screening Checks?",
        options: [
          { label: "Yes — screening in place for all roles", score: 3 },
          { label: "In progress for some staff", score: 1 },
          { label: "Not yet initiated", score: 0 },
        ],
      },
      {
        id: "training",
        text: "Have staff completed mandatory training (e.g. NDIS orientation module, WHS, child safety)?",
        options: [
          { label: "Yes — all required training completed", score: 3 },
          { label: "Some completed, more needed", score: 1 },
          { label: "No training completed yet", score: 0 },
        ],
      },
    ],
  },
  {
    id: "compliance",
    icon: ClipboardList,
    label: "Compliance & Insurance",
    color: "red",
    questions: [
      {
        id: "insurance",
        text: "Do you hold professional indemnity AND public liability insurance at adequate levels?",
        options: [
          { label: "Yes — both in place and adequate", score: 3 },
          { label: "One in place, the other pending", score: 1 },
          { label: "Neither in place", score: 0 },
        ],
      },
      {
        id: "audit_awareness",
        text: "Are you prepared for a third-party quality audit (Certification or Verification)?",
        options: [
          { label: "Yes — auditor engaged, evidence compiled", score: 3 },
          { label: "Aware but not yet prepared", score: 1 },
          { label: "Not aware of this requirement", score: 0 },
        ],
      },
      {
        id: "registration_groups",
        text: "Have you identified your NDIS registration groups and support categories?",
        options: [
          { label: "Yes — fully mapped to practice standards", score: 3 },
          { label: "Partially identified", score: 1 },
          { label: "Not yet determined", score: 0 },
        ],
      },
    ],
  },
];

const DOMAIN_COLORS = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-600",   bar: "bg-blue-500",   badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", bar: "bg-purple-500", badge: "bg-purple-100 text-purple-700" },
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  icon: "text-amber-600",  bar: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  icon: "text-green-600",  bar: "bg-green-500",  badge: "bg-green-100 text-green-700" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    icon: "text-red-600",    bar: "bg-red-500",    badge: "bg-red-100 text-red-700" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MAX_SCORE_PER_DOMAIN = 9; // 3 questions × 3 max
const TOTAL_MAX = DOMAINS.length * MAX_SCORE_PER_DOMAIN; // 45

function getDomainScore(domainId, answers) {
  const domain = DOMAINS.find(d => d.id === domainId);
  return domain.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

function getTotalScore(answers) {
  return DOMAINS.reduce((sum, d) => sum + getDomainScore(d.id, answers), 0);
}

function getReadinessLevel(pct) {
  if (pct >= 85) return "excellent";
  if (pct >= 65) return "good";
  if (pct >= 40) return "fair";
  return "poor";
}

const READINESS_CONFIG = {
  excellent: {
    label: "Highly Prepared",
    sublabel: "You're ready to apply for NDIS registration",
    color: "text-green-600",
    bg: "bg-green-50 border-green-300",
    gaugeColor: "#22c55e",
    icon: CheckCircle2,
    cta: "Start Your Application",
    ctaHref: "/services/ndis-registration",
    message: "Your organisation demonstrates strong compliance foundations across all key domains. With the right support to navigate the NDIS Commission portal and audit process, you could be fully registered within 60–90 days.",
  },
  good: {
    label: "Good Progress",
    sublabel: "A few gaps to close before applying",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-300",
    gaugeColor: "#3b82f6",
    icon: CheckCircle2,
    cta: "Get a Readiness Plan",
    ctaHref: "/services/ndis-registration",
    message: "You have solid foundations in place but there are specific areas that need attention before submitting your application. SOL can help you address these gaps efficiently — most providers in your position achieve registration within 90–120 days.",
  },
  fair: {
    label: "Preparation Needed",
    sublabel: "Significant groundwork required before applying",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-300",
    gaugeColor: "#f59e0b",
    icon: AlertCircle,
    cta: "Book a Free Planning Session",
    ctaHref: "/#contact",
    message: "You're heading in the right direction but several key requirements are not yet in place. Applying now could result in delays or rejection. SOL specialises in preparing organisations like yours — typically within 2–3 months of engagement.",
  },
  poor: {
    label: "Not Yet Ready",
    sublabel: "Early-stage preparation — the right time to get expert help",
    color: "text-red-600",
    bg: "bg-red-50 border-red-300",
    gaugeColor: "#ef4444",
    icon: XCircle,
    cta: "Book Free Consultation",
    ctaHref: "/#contact",
    message: "Most successful NDIS providers start from exactly this position. The registration process is complex but entirely achievable with the right guidance. SOL offers end-to-end support — from business setup through to audit completion. Book a free consultation to get a clear roadmap.",
  },
};

// ─── Score Gauge (SVG arc) ────────────────────────────────────────────────────

function ScoreGauge({ pct, color }) {
  const r = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = -210;
  const sweepAngle = 240;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (start, sweep) => {
    const end = start + sweep;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const large = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const filledSweep = (pct / 100) * sweepAngle;

  return (
    <svg viewBox="0 0 200 160" className="w-52 h-40">
      {/* Track */}
      <path d={arcPath(startAngle, sweepAngle)} fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
      {/* Fill */}
      <motion.path
        d={arcPath(startAngle, filledSweep)}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {/* Score text */}
      <text x="100" y="105" textAnchor="middle" className="font-bold" style={{ fontSize: 32, fontFamily: "Space Grotesk, sans-serif", fill: "#0F172A", fontWeight: 700 }}>
        {Math.round(pct)}%
      </text>
      <text x="100" y="128" textAnchor="middle" style={{ fontSize: 11, fill: "#64748b", fontFamily: "Inter, sans-serif" }}>
        Readiness Score
      </text>
    </svg>
  );
}

// ─── Domain Result Card ───────────────────────────────────────────────────────

function DomainCard({ domain, score, expanded, onToggle }) {
  const pct = Math.round((score / MAX_SCORE_PER_DOMAIN) * 100);
  const c = DOMAIN_COLORS[domain.color];
  const DomainIcon = domain.icon;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
        <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <DomainIcon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm text-ink">{domain.label}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/70 rounded-full max-w-[120px]">
              <motion.div
                className={`h-1.5 rounded-full ${c.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.badge}`}>{pct}%</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-slate_mist">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 pb-4 border-t border-white/50 pt-3 space-y-2">
          {domain.questions.map(q => {
            const s = 0; // placeholder — passed via answers prop
            return null;
          })}
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NDISReadinessCalculator() {
  // Flatten all questions for wizard
  const ALL_QUESTIONS = DOMAINS.flatMap(d => d.questions.map(q => ({ ...q, domainId: d.id })));
  const TOTAL_Q = ALL_QUESTIONS.length;

  const [phase, setPhase] = useState("intro"); // intro | quiz | capture | results
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lead, setLead] = useState({ full_name: "", email: "", phone: "", business_name: "" });
  const [saving, setSaving] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState({});

  const currentQ = ALL_QUESTIONS[qIndex];
  const progress = ((qIndex) / TOTAL_Q) * 100;

  const handleAnswer = (score) => {
    const updated = { ...answers, [currentQ.id]: score };
    setAnswers(updated);
    if (qIndex + 1 < TOTAL_Q) {
      setQIndex(i => i + 1);
    } else {
      setPhase("capture");
    }
  };

  const handleBack = () => {
    if (qIndex > 0) setQIndex(i => i - 1);
  };

  const totalScore = getTotalScore(answers);
  const totalPct = Math.round((totalScore / TOTAL_MAX) * 100);
  const readinessKey = getReadinessLevel(totalPct);
  const readiness = READINESS_CONFIG[readinessKey];
  const ReadinessIcon = readiness.icon;

  const handleSubmit = async () => {
    if (!lead.email) return;
    setSaving(true);
    await base44.entities.ReadinessQuizLead.create({
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      score: totalScore,
      readiness_level: readinessKey,
      answers,
      recommendation: readiness.label,
    }).catch(() => {});

    base44.integrations.Core.SendEmail({
      to: lead.email,
      subject: "Your NDIS Readiness Calculator Results — SOL Business Consultant",
      body: `Hi ${lead.full_name || "there"},\n\nThank you for completing the NDIS Readiness Calculator.\n\n📊 YOUR RESULT: ${readiness.label} (${totalPct}%)\n\n${readiness.message}\n\n🚀 NEXT STEP: ${readiness.cta}\n\nBook a free consultation:\n📞 +61 460 003 494\n✉️ info@solbusinessconsultant.com.au\n\nWarm regards,\nSOL Business Consultant`,
    }).catch(() => {});

    base44.integrations.Core.SendEmail({
      to: "info@solbusinessconsultant.com.au",
      subject: `🎯 New Readiness Calculator Lead — ${readiness.label} | ${lead.full_name || lead.email}`,
      body: `Name: ${lead.full_name}\nBusiness: ${lead.business_name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nScore: ${totalScore}/${TOTAL_MAX} (${totalPct}%)\nLevel: ${readiness.label}\n\nDomain Scores:\n${DOMAINS.map(d => `  ${d.label}: ${getDomainScore(d.id, answers)}/${MAX_SCORE_PER_DOMAIN}`).join("\n")}`,
    }).catch(() => {});

    setSaving(false);
    setPhase("results");
  };

  const toggleDomain = (id) => setExpandedDomains(e => ({ ...e, [id]: !e[id] }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-2xl mx-auto">

          {/* ── INTRO ─────────────────────────────── */}
          {phase === "intro" && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Free Compliance Tool</span>
              <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight mb-4">
                NDIS Registration<br />Readiness Calculator
              </h1>
              <p className="text-lg text-slate_mist mb-8 max-w-xl mx-auto leading-relaxed">
                Answer {TOTAL_Q} questions across 5 compliance domains and receive an instant, personalised readiness score with specific recommendations.
              </p>

              {/* Domain pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {DOMAINS.map(d => {
                  const c = DOMAIN_COLORS[d.color];
                  const DIcon = d.icon;
                  return (
                    <span key={d.id} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${c.border} ${c.bg} ${c.icon}`}>
                      <DIcon className="w-3.5 h-3.5" /> {d.label}
                    </span>
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-center gap-5 text-sm text-slate_mist mb-10">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-harvest" /> {TOTAL_Q} questions</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-harvest" /> 5 domains assessed</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-harvest" /> Instant score</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-harvest" /> Free & confidential</span>
              </div>

              <Button onClick={() => setPhase("quiz")} className="bg-ink hover:bg-ink/90 text-white font-display px-10 py-6 text-lg gap-2 group">
                Start Calculator <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {/* ── QUIZ ──────────────────────────────── */}
          {phase === "quiz" && (
            <div>
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-slate_mist mb-2">
                  <span>Question {qIndex + 1} of {TOTAL_Q}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-2 bg-harvest rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                </div>
                {/* Domain indicator */}
                {(() => {
                  const domain = DOMAINS.find(d => d.id === currentQ.domainId);
                  const c = DOMAIN_COLORS[domain.color];
                  const DIcon = domain.icon;
                  return (
                    <div className={`flex items-center gap-1.5 mt-2 text-xs font-semibold ${c.icon}`}>
                      <DIcon className="w-3.5 h-3.5" /> {domain.label}
                    </div>
                  );
                })()}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white rounded-2xl border border-border/60 shadow-lg p-8"
                >
                  <h2 className="font-display font-bold text-xl text-ink mb-6">{currentQ.text}</h2>
                  <div className="space-y-3">
                    {currentQ.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt.score)}
                        className="w-full text-left px-5 py-4 rounded-xl border-2 border-border hover:border-harvest hover:bg-harvest/5 transition-all text-sm text-ink font-medium"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {qIndex > 0 && (
                    <button onClick={handleBack} className="mt-5 flex items-center gap-1.5 text-xs text-slate_mist hover:text-ink transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* ── LEAD CAPTURE ──────────────────────── */}
          {phase === "capture" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border/60 shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-harvest/10 flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-7 h-7 text-harvest" />
                </div>
                <h2 className="font-display font-bold text-2xl text-ink">Your Score Is Ready!</h2>
                <p className="text-slate_mist text-sm mt-1 max-w-sm mx-auto">Enter your details to unlock your full domain-by-domain readiness report and receive a copy by email.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Full Name</Label>
                    <Input value={lead.full_name} onChange={e => setLead(l => ({ ...l, full_name: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Business Name</Label>
                    <Input value={lead.business_name} onChange={e => setLead(l => ({ ...l, business_name: e.target.value }))} placeholder="Your business" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Email Address *</Label>
                  <Input required type="email" value={lead.email} onChange={e => setLead(l => ({ ...l, email: e.target.value }))} placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Phone (optional)</Label>
                  <Input value={lead.phone} onChange={e => setLead(l => ({ ...l, phone: e.target.value }))} placeholder="0400 000 000" />
                </div>
                <Button onClick={handleSubmit} disabled={!lead.email || saving} className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-6 text-base gap-2">
                  {saving ? "Processing…" : <><BarChart3 className="w-4 h-4" /> View My Full Report <ArrowRight className="w-4 h-4" /></>}
                </Button>
                <p className="text-xs text-center text-slate_mist">Your details are kept confidential and never shared or sold.</p>
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ───────────────────────────── */}
          {phase === "results" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

              {/* Score summary card */}
              <div className={`rounded-2xl border-2 p-6 ${readiness.bg}`}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreGauge pct={totalPct} color={readiness.gaugeColor} />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <ReadinessIcon className={`w-6 h-6 ${readiness.color}`} />
                      <h2 className={`font-display font-bold text-2xl ${readiness.color}`}>{readiness.label}</h2>
                    </div>
                    <p className="text-slate_mist text-sm mb-3">{readiness.sublabel}</p>
                    <p className="text-sm text-ink/80 leading-relaxed">{readiness.message}</p>
                    <p className="text-xs text-slate_mist mt-3">
                      Raw score: <strong className="text-ink">{totalScore} / {TOTAL_MAX}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Domain breakdown */}
              <div className="bg-white rounded-2xl border border-border/60 p-5">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-harvest" /> Domain Breakdown
                </h3>
                <div className="space-y-3">
                  {DOMAINS.map(domain => {
                    const ds = getDomainScore(domain.id, answers);
                    const dpct = Math.round((ds / MAX_SCORE_PER_DOMAIN) * 100);
                    const c = DOMAIN_COLORS[domain.color];
                    const DIcon = domain.icon;
                    const status = dpct >= 85 ? "Ready" : dpct >= 55 ? "Partial" : "Gap";
                    const statusColors = {
                      Ready: "bg-green-100 text-green-700",
                      Partial: "bg-amber-100 text-amber-700",
                      Gap: "bg-red-100 text-red-700",
                    };
                    return (
                      <div key={domain.id}>
                        <div className="flex items-center gap-3 mb-1">
                          <DIcon className={`w-4 h-4 flex-shrink-0 ${c.icon}`} />
                          <span className="text-sm font-medium text-ink flex-1">{domain.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[status]}`}>{status}</span>
                          <span className="text-xs text-slate_mist w-10 text-right">{dpct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full ml-7">
                          <motion.div
                            className={`h-2 rounded-full ${c.bar}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${dpct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * DOMAINS.indexOf(domain) }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Answer review */}
              <div className="bg-white rounded-2xl border border-border/60 p-5">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-ink mb-4">Detailed Answer Review</h3>
                <div className="space-y-4">
                  {DOMAINS.map(domain => {
                    const c = DOMAIN_COLORS[domain.color];
                    const DIcon = domain.icon;
                    return (
                      <div key={domain.id}>
                        <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${c.icon}`}>
                          <DIcon className="w-3.5 h-3.5" /> {domain.label}
                        </div>
                        <div className="space-y-2 ml-5">
                          {domain.questions.map(q => {
                            const score = answers[q.id] ?? 0;
                            const opt = q.options.find(o => o.score === score) || q.options[q.options.length - 1];
                            return (
                              <div key={q.id} className="flex items-start justify-between gap-2 text-xs">
                                <p className="text-slate_mist flex-1 leading-relaxed">{q.text}</p>
                                <span className={`flex-shrink-0 font-bold px-1.5 py-0.5 rounded-full ${
                                  score === 3 ? "bg-green-100 text-green-700" :
                                  score === 1 ? "bg-amber-100 text-amber-700" :
                                  "bg-red-100 text-red-700"
                                }`}>
                                  {score === 3 ? "✓" : score === 1 ? "~" : "✗"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-ink rounded-2xl p-8 text-center">
                <p className="font-display font-bold text-2xl text-white mb-2">Ready to Close Your Gaps?</p>
                <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Our NDIS registration specialists will create a step-by-step plan to get you registered — no matter where you're starting from.</p>
                <Link to={readiness.ctaHref}>
                  <Button className="bg-harvest hover:bg-harvest/90 text-white font-display px-8 py-5 text-base gap-2 group mb-4">
                    {readiness.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-white/40 text-xs">Free consultation — no obligation</p>
                <div className="flex flex-wrap justify-center gap-6 mt-5 text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +61 460 003 494</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> info@solbusinessconsultant.com.au</span>
                </div>
              </div>

              {/* Retake */}
              <p className="text-center text-xs text-slate_mist">
                <button onClick={() => { setPhase("intro"); setQIndex(0); setAnswers({}); }} className="hover:text-harvest underline transition-colors">
                  Retake the calculator
                </button>
              </p>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}