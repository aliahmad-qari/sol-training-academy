import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, XCircle, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const QUESTIONS = [
  {
    id: "abn",
    question: "Does your organisation have a registered ABN?",
    options: [
      { label: "Yes, we have an active ABN", score: 2 },
      { label: "No, but we're in the process of registering", score: 1 },
      { label: "No, we don't have an ABN yet", score: 0 },
    ],
  },
  {
    id: "structure",
    question: "What is your current business structure?",
    options: [
      { label: "Registered company (Pty Ltd, Ltd, Inc)", score: 2 },
      { label: "Sole trader or partnership", score: 1 },
      { label: "Not yet formally structured", score: 0 },
    ],
  },
  {
    id: "services",
    question: "Have you identified which NDIS support categories you will deliver?",
    options: [
      { label: "Yes — we know our specific registration groups", score: 2 },
      { label: "Partially — we have a rough idea", score: 1 },
      { label: "No — we're not sure what applies to us", score: 0 },
    ],
  },
  {
    id: "policies",
    question: "Do you have documented policies and procedures relevant to NDIS practice standards?",
    options: [
      { label: "Yes — we have comprehensive written policies", score: 2 },
      { label: "We have some basic documentation but it needs work", score: 1 },
      { label: "No formal policies exist yet", score: 0 },
    ],
  },
  {
    id: "staff",
    question: "Do your key staff hold relevant qualifications or experience in disability/allied health services?",
    options: [
      { label: "Yes — all key staff are qualified and experienced", score: 2 },
      { label: "Some staff are qualified but gaps exist", score: 1 },
      { label: "We're building our team from scratch", score: 0 },
    ],
  },
  {
    id: "insurance",
    question: "Do you have professional indemnity and public liability insurance?",
    options: [
      { label: "Yes — both are in place with adequate coverage", score: 2 },
      { label: "One is in place, working on the other", score: 1 },
      { label: "Neither is in place yet", score: 0 },
    ],
  },
  {
    id: "audit",
    question: "Are you aware that NDIS registration requires a third-party quality audit?",
    options: [
      { label: "Yes — we've already researched approved auditors", score: 2 },
      { label: "Yes, but we haven't looked into the process yet", score: 1 },
      { label: "No, we weren't aware of this requirement", score: 0 },
    ],
  },
  {
    id: "timeline",
    question: "What is your target timeline to become NDIS registered?",
    options: [
      { label: "Within 3 months", score: 2 },
      { label: "3–6 months", score: 1 },
      { label: "More than 6 months / not sure", score: 0 },
    ],
  },
];

const RESULTS = {
  very_ready: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    title: "You're Ready to Register!",
    subtitle: "Your organisation is well-positioned to begin the NDIS registration process.",
    description: "You have strong foundations in place. With the right support to navigate the NDIS Commission portal and audit process, you could be registered within 60–90 days.",
    cta: "Start Your Application",
    ctaLink: "/services/ndis-registration",
    urgency: "high",
  },
  ready: {
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    title: "Nearly Ready — A Few Gaps to Address",
    subtitle: "You're on the right track with some preparation needed.",
    description: "You have good foundations but there are key gaps to fill before applying. SOL can help you address these efficiently — most providers in your position achieve registration within 90–120 days.",
    cta: "Get a Readiness Assessment",
    ctaLink: "/services/ndis-registration",
    urgency: "medium",
  },
  partially_ready: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    title: "Preparation Required",
    subtitle: "You have the intent but need significant groundwork before applying.",
    description: "Several key requirements are not yet in place. Attempting to register now could result in delays or rejection. SOL specialises in getting organisations like yours fully prepared — typically within 2–3 months.",
    cta: "Book a Free Planning Session",
    ctaLink: "/#contact",
    urgency: "medium",
  },
  not_ready: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    title: "Not Yet Ready — But That's OK",
    subtitle: "You're at the beginning of your journey, and that's exactly where we can help most.",
    description: "Most successful NDIS providers start from this position. The NDIS registration process is complex, but with SOL's end-to-end support, we handle the entire process from business setup through to audit. Book a free consultation to get a clear roadmap.",
    cta: "Book Free Consultation",
    ctaLink: "/#contact",
    urgency: "high",
  },
};

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function ReadinessQuiz() {
  const [step, setStep] = useState(0); // 0 = intro, 1..N = questions, N+1 = lead capture, N+2 = results
  const [answers, setAnswers] = useState({});
  const [lead, setLead] = useState({ full_name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [resultKey, setResultKey] = useState(null);

  const totalSteps = QUESTIONS.length;
  const qIndex = step - 1;
  const currentQ = QUESTIONS[qIndex];

  const computeResult = () => {
    const total = Object.values(answers).reduce((s, v) => s + v, 0);
    const max = QUESTIONS.length * 2;
    const pct = total / max;
    if (pct >= 0.85) return "very_ready";
    if (pct >= 0.6) return "ready";
    if (pct >= 0.35) return "partially_ready";
    return "not_ready";
  };

  const handleAnswer = (score) => {
    setAnswers(a => ({ ...a, [currentQ.id]: score }));
    if (qIndex + 1 < totalSteps) {
      setStep(s => s + 1);
    } else {
      setStep(totalSteps + 1); // go to lead capture
    }
  };

  const handleSubmitLead = async () => {
    if (!lead.email) { return; }
    setSaving(true);
    const key = computeResult();
    setResultKey(key);
    const result = RESULTS[key];

    await base44.entities.ReadinessQuizLead.create({
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      score: Object.values(answers).reduce((s, v) => s + v, 0),
      readiness_level: key,
      answers,
      recommendation: result.title,
    });

    base44.integrations.Core.SendEmail({
      to: lead.email,
      subject: "Your NDIS Registration Readiness Results — SOL Business Consultant",
      body: `Hi ${lead.full_name || "there"},\n\nThank you for completing the NDIS Registration Readiness Quiz.\n\n📊 YOUR RESULT: ${result.title}\n\n${result.description}\n\nYour Score: ${Object.values(answers).reduce((s, v) => s + v, 0)} / ${QUESTIONS.length * 2}\n\n🚀 NEXT STEPS:\n${result.cta}\n\nBook a free consultation with our NDIS registration specialists:\n📞 +61 460 003 494\n✉️ info@solbusinessconsultant.com.au\n🌐 www.solbusinessconsultant.com.au\n\nWarm regards,\nSOL Business Consultant`,
    }).catch(() => {});

    base44.integrations.Core.SendEmail({
      to: "info@solbusinessconsultant.com.au",
      subject: `🎯 New Readiness Quiz Lead — ${result.title} | ${lead.full_name || lead.email}`,
      body: `New NDIS readiness quiz completed.\n\nName: ${lead.full_name || "—"}\nEmail: ${lead.email}\nPhone: ${lead.phone || "—"}\nResult: ${result.title}\nScore: ${Object.values(answers).reduce((s, v) => s + v, 0)} / ${QUESTIONS.length * 2}\nReadiness: ${key}\n\nAnswers:\n${QUESTIONS.map(q => `  ${q.question}: ${answers[q.id] ?? "—"}`).join('\n')}`,
    }).catch(() => {});

    setSaving(false);
    setStep(totalSteps + 2);
  };

  const result = resultKey ? RESULTS[resultKey] : null;
  const ResultIcon = result?.icon;
  const progress = step > 0 && step <= totalSteps ? (step / totalSteps) * 100 : step > totalSteps ? 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Intro */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Free Assessment Tool</span>
              <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight mb-4">
                Am I Ready to Register<br />as an NDIS Provider?
              </h1>
              <p className="text-lg text-slate_mist mb-8 max-w-xl mx-auto">
                Answer 8 quick questions to find out your current readiness level and get a personalised recommendation — takes less than 2 minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm text-slate_mist">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-harvest" /> 8 questions</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-harvest" /> 2 minutes</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-harvest" /> Instant personalised results</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-harvest" /> Free, no obligation</span>
              </div>
              <Button onClick={() => setStep(1)} className="bg-ink hover:bg-ink/90 text-white font-display px-10 py-6 text-lg gap-2 group">
                Start Assessment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {/* Questions */}
          {step >= 1 && step <= totalSteps && (
            <div>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-slate_mist mb-2">
                  <span>Question {step} of {totalSteps}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <motion.div
                    className="h-2 bg-harvest rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl border border-border/60 shadow-lg p-8"
                >
                  <h2 className="font-display font-bold text-xl text-ink mb-6">{currentQ?.question}</h2>
                  <div className="space-y-3">
                    {currentQ?.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt.score)}
                        className="w-full text-left px-5 py-4 rounded-xl border-2 border-border hover:border-harvest hover:bg-harvest/5 transition-all text-sm text-ink font-medium"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {step > 1 && (
                    <button onClick={() => setStep(s => s - 1)} className="mt-5 flex items-center gap-1.5 text-xs text-slate_mist hover:text-ink transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous question
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Lead Capture */}
          {step === totalSteps + 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border/60 shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-harvest/10 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-harvest" />
                </div>
                <h2 className="font-display font-bold text-2xl text-ink">Your Results Are Ready!</h2>
                <p className="text-slate_mist text-sm mt-1">Enter your details to view your personalised readiness report and receive a copy via email.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Full Name</Label>
                  <Input value={lead.full_name} onChange={e => setLead(l => ({ ...l, full_name: e.target.value }))} placeholder="Your full name" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Email Address *</Label>
                  <Input required type="email" value={lead.email} onChange={e => setLead(l => ({ ...l, email: e.target.value }))} placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Phone (optional)</Label>
                  <Input value={lead.phone} onChange={e => setLead(l => ({ ...l, phone: e.target.value }))} placeholder="0400 000 000" />
                </div>
                <Button onClick={handleSubmitLead} disabled={!lead.email || saving} className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-6 gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <>View My Results <ArrowRight className="w-4 h-4" /></>}
                </Button>
                <p className="text-xs text-center text-slate_mist">Your details are kept confidential and never sold.</p>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {step === totalSteps + 2 && result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`rounded-2xl border-2 p-8 mb-6 ${result.bg}`}>
                <div className="flex items-center gap-3 mb-4">
                  <ResultIcon className={`w-8 h-8 ${result.color}`} />
                  <div>
                    <h2 className="font-display font-bold text-2xl text-ink">{result.title}</h2>
                    <p className="text-sm text-slate_mist">{result.subtitle}</p>
                  </div>
                </div>
                <p className="text-slate_mist leading-relaxed">{result.description}</p>

                {/* Score bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate_mist mb-1">
                    <span>Your Readiness Score</span>
                    <span>{Object.values(answers).reduce((s, v) => s + v, 0)} / {QUESTIONS.length * 2}</span>
                  </div>
                  <div className="h-3 bg-white/70 rounded-full">
                    <div
                      className="h-3 bg-harvest rounded-full transition-all"
                      style={{ width: `${(Object.values(answers).reduce((s, v) => s + v, 0) / (QUESTIONS.length * 2)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Answer breakdown */}
              <div className="bg-white rounded-2xl border border-border/60 p-6 mb-6">
                <h3 className="font-display font-semibold text-ink mb-4 text-sm uppercase tracking-wider">Your Answers</h3>
                <div className="space-y-3">
                  {QUESTIONS.map(q => {
                    const score = answers[q.id] ?? 0;
                    const opt = q.options.find(o => o.score === score);
                    return (
                      <div key={q.id} className="flex items-start justify-between gap-3 text-sm">
                        <p className="text-slate_mist flex-1">{q.question}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            score === 2 ? "bg-green-100 text-green-700" :
                            score === 1 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>{score === 2 ? "Ready" : score === 1 ? "Partial" : "Gap"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-ink rounded-2xl p-8 text-center">
                <p className="font-display font-bold text-xl text-white mb-2">Ready to Take the Next Step?</p>
                <p className="text-white/60 text-sm mb-5">Our NDIS registration specialists are ready to help you close any gaps and get registered.</p>
                <Link to={result.ctaLink}>
                  <Button className="bg-harvest hover:bg-harvest/90 text-white font-display px-8 py-5 gap-2 group">
                    {result.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-white/40 text-xs mt-3">Free consultation — no obligation</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}