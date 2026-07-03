import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Zap, TrendingUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const QUESTIONS = [
  {
    id: "business_size",
    question: "How big is your business?",
    options: [
      { label: "Solo / Just starting out", value: "solo", points: { starter: 3, growth: 1, enterprise: 0 } },
      { label: "Small team (2–10 staff)", value: "small", points: { starter: 1, growth: 3, enterprise: 1 } },
      { label: "Mid-size (11–50 staff)", value: "mid", points: { starter: 0, growth: 2, enterprise: 3 } },
      { label: "Large organisation (50+)", value: "large", points: { starter: 0, growth: 1, enterprise: 3 } },
    ],
  },
  {
    id: "primary_need",
    question: "What's your primary need right now?",
    options: [
      { label: "NDIS registration or compliance", value: "ndis", points: { starter: 2, growth: 2, enterprise: 2 } },
      { label: "Automating admin & workflows", value: "automation", points: { starter: 1, growth: 3, enterprise: 2 } },
      { label: "Bookkeeping & financial support", value: "accounting", points: { starter: 2, growth: 2, enterprise: 1 } },
      { label: "Website or digital presence", value: "website", points: { starter: 2, growth: 2, enterprise: 1 } },
    ],
  },
  {
    id: "budget",
    question: "What's your approximate monthly budget for business services?",
    options: [
      { label: "Under $500 / month", value: "low", points: { starter: 3, growth: 1, enterprise: 0 } },
      { label: "$500 – $1,500 / month", value: "mid", points: { starter: 1, growth: 3, enterprise: 1 } },
      { label: "$1,500 – $3,000 / month", value: "high", points: { starter: 0, growth: 2, enterprise: 3 } },
      { label: "$3,000+ / month", value: "premium", points: { starter: 0, growth: 0, enterprise: 3 } },
    ],
  },
  {
    id: "compliance",
    question: "How do you currently handle compliance?",
    options: [
      { label: "We're just getting started — need guidance", value: "new", points: { starter: 3, growth: 1, enterprise: 0 } },
      { label: "We have some processes but need improvement", value: "partial", points: { starter: 1, growth: 3, enterprise: 1 } },
      { label: "We have systems but they're manual", value: "manual", points: { starter: 0, growth: 2, enterprise: 3 } },
      { label: "We need full enterprise-level compliance management", value: "enterprise", points: { starter: 0, growth: 0, enterprise: 3 } },
    ],
  },
  {
    id: "timeline",
    question: "How urgently do you need support?",
    options: [
      { label: "Just exploring options", value: "exploring", points: { starter: 2, growth: 1, enterprise: 0 } },
      { label: "Within the next 1–2 months", value: "soon", points: { starter: 2, growth: 2, enterprise: 1 } },
      { label: "Immediately — we have a deadline", value: "urgent", points: { starter: 1, growth: 2, enterprise: 3 } },
    ],
  },
];

const PLANS = {
  starter: {
    name: "Starter",
    tagline: "Perfect for solo operators and new providers",
    price: "$297",
    period: "/month",
    color: "border-slate-300",
    badgeColor: "bg-slate-100 text-slate-700",
    Icon: Zap,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    features: [
      "NDIS registration support",
      "Policy & procedure pack (basic)",
      "1 compliance register",
      "Email support",
      "Monthly check-in call",
    ],
    cta: "Get Started with Starter",
    href: "/services/ndis-registration",
  },
  growth: {
    name: "Growth",
    tagline: "For growing teams ready to scale with confidence",
    price: "$697",
    period: "/month",
    color: "border-harvest",
    badgeColor: "bg-harvest/10 text-harvest",
    Icon: TrendingUp,
    iconBg: "bg-harvest/10",
    iconColor: "text-harvest",
    features: [
      "Everything in Starter",
      "Full policy & procedure library",
      "Workflow automation setup",
      "Website development (up to 10 pages)",
      "Bookkeeping + BAS lodgement",
      "Fortnightly strategy calls",
      "Priority email & phone support",
    ],
    cta: "Get Started with Growth",
    href: "/#contact",
    popular: true,
  },
  enterprise: {
    name: "Enterprise",
    tagline: "For large organisations needing end-to-end solutions",
    price: "Custom",
    period: "",
    color: "border-ink",
    badgeColor: "bg-ink text-white",
    Icon: Building2,
    iconBg: "bg-ink",
    iconColor: "text-white",
    features: [
      "Everything in Growth",
      "Dedicated account manager",
      "Custom software & integrations",
      "Full compliance management",
      "Unlimited staff training",
      "SLA-backed support",
      "Quarterly business reviews",
    ],
    cta: "Book an Enterprise Consultation",
    href: "/#contact",
  },
};

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function scoreAnswers(answers) {
  const scores = { starter: 0, growth: 0, enterprise: 0 };
  QUESTIONS.forEach((q) => {
    const chosen = q.options.find((o) => o.value === answers[q.id]);
    if (chosen) {
      scores.starter += chosen.points.starter;
      scores.growth += chosen.points.growth;
      scores.enterprise += chosen.points.enterprise;
    }
  });
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export default function GetStarted() {
  const [step, setStep] = useState(0); // 0 = intro, 1..N = questions, N+1 = result
  const [answers, setAnswers] = useState({});
  const [recommended, setRecommended] = useState(null);

  const totalSteps = QUESTIONS.length;
  const isIntro = step === 0;
  const isResult = step === totalSteps + 1;
  const currentQuestion = QUESTIONS[step - 1];

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (step === totalSteps) {
      setRecommended(scoreAnswers(newAnswers));
      setStep(totalSteps + 1);
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setRecommended(null);
  };

  const plan = recommended ? PLANS[recommended] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Progress bar (shown during questions) */}
          {!isIntro && !isResult && (
            <div className="mb-8">
              <div className="flex justify-between text-xs text-slate_mist mb-2">
                <span>Question {step} of {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}% complete</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-harvest rounded-full"
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* INTRO */}
            {isIntro && (
              <motion.div key="intro" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
                className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 bg-harvest/10 text-harvest text-sm font-semibold px-4 py-2 rounded-full">
                  <Zap className="w-4 h-4" /> Find Your Perfect Plan
                </div>
                <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight">
                  Not sure which plan<br />is right for you?
                </h1>
                <p className="text-slate_mist text-lg max-w-md mx-auto">
                  Answer 5 quick questions and we'll recommend the best SOL plan for your business — no pressure, no commitment.
                </p>
                <Button
                  onClick={() => setStep(1)}
                  className="bg-harvest hover:bg-harvest/90 text-white font-display px-8 py-6 text-base gap-2 group"
                >
                  Let's Find Your Plan
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-slate_mist">Takes about 1 minute</p>
              </motion.div>
            )}

            {/* QUESTIONS */}
            {!isIntro && !isResult && currentQuestion && (
              <motion.div key={`q-${step}`} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
                className="space-y-6">
                <h2 className="font-display font-bold text-2xl md:text-3xl text-ink">
                  {currentQuestion.question}
                </h2>
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                      className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-harvest hover:bg-harvest/5 transition-all group flex items-center justify-between"
                    >
                      <span className="font-medium text-ink">{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate_mist group-hover:text-harvest transition-colors" />
                    </button>
                  ))}
                </div>
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-slate_mist hover:text-ink transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
              </motion.div>
            )}

            {/* RESULT */}
            {isResult && plan && (
              <motion.div key="result" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
                className="space-y-6 text-center">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4" /> We have a recommendation!
                </div>
                <div>
                  <p className="text-slate_mist text-sm mb-1">Based on your answers, we recommend</p>
                  <h2 className="font-display font-bold text-4xl text-ink">The {plan.name} Plan</h2>
                  <p className="text-slate_mist mt-2">{plan.tagline}</p>
                </div>

                {/* Plan card */}
                <div className={`bg-white border-2 ${plan.color} rounded-2xl p-8 text-left shadow-lg relative`}>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-harvest text-white text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                      <plan.Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.badgeColor}`}>{plan.name}</span>
                      <div className="mt-0.5">
                        <span className="font-display font-bold text-2xl text-ink">{plan.price}</span>
                        <span className="text-slate_mist text-sm">{plan.period}</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate_mist">
                        <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.href}>
                    <Button className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-5 gap-2">
                      {plan.cta} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button onClick={restart} className="text-sm text-slate_mist hover:text-ink underline underline-offset-4 transition-colors">
                    Retake the quiz
                  </button>
                  <span className="hidden sm:inline text-slate_mist">·</span>
                  <Link to="/#contact" className="text-sm text-harvest hover:underline underline-offset-4">
                    Talk to an advisor instead
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}