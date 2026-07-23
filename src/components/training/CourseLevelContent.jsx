import React, { useState } from "react";
import { CheckCircle, ChevronDown, ChevronUp, Play, Clock, BookOpen, ArrowRight, Star, Video } from "lucide-react";
import { Link } from "react-router-dom";

const COLOR_MAP = {
  blue: {
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-100",
    bg: "bg-blue-50",
    btn: "bg-blue-600 hover:bg-blue-700",
    text: "text-blue-600",
    dot: "bg-blue-600",
    // Level 1 — NDIS support worker with participant
    thumbnail: "/Images/courses/level-1-foundation-learning.webp",
    accentGrad: "from-slate-900/85 to-blue-800/50",
    levelColor: "bg-blue-600",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-100",
    bg: "bg-amber-50",
    btn: "bg-amber-500 hover:bg-amber-600",
    text: "text-amber-600",
    dot: "bg-amber-500",
    // Level 2 — professional team coordination meeting
    thumbnail: "/Images/courses/level-2-professional-coordination.webp",
    accentGrad: "from-slate-900/85 to-amber-800/50",
    levelColor: "bg-amber-500",
  },
  purple: {
    badge: "bg-purple-100 text-purple-700",
    border: "border-purple-100",
    bg: "bg-purple-50",
    btn: "bg-purple-600 hover:bg-purple-700",
    text: "text-purple-600",
    dot: "bg-purple-600",
    // Level 3 — senior leader mentoring / advanced practice
    thumbnail: "/Images/courses/level-3-advanced-mentoring.webp",
    accentGrad: "from-slate-900/85 to-purple-800/50",
    levelColor: "bg-purple-600",
  },
};

export default function CourseLevelContent({ course, enrollButton }) {
  const [openModule, setOpenModule] = useState(0);
  const c = COLOR_MAP[course.color];

  const totalTopics = course.curriculum.reduce((sum, m) => sum + m.topics.length, 0);

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Left — Course Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.badge}`}>
                  {course.level}
                </span>
                <span className={`text-sm font-semibold ${c.text}`}>{course.badge}</span>
                {course.popular && (
                  <span className="bg-harvest text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                )}
              </div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-ink mb-3">{course.title}</h2>
              <p className="text-slate_mist text-base leading-relaxed">{course.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-5 mt-5">
                <span className="flex items-center gap-1.5 text-sm text-slate_mist">
                  <Clock className="w-4 h-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate_mist">
                  <BookOpen className="w-4 h-4" /> {course.curriculum.length} Modules
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate_mist">
                  <Video className="w-4 h-4" /> {totalTopics} Video Topics
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate_mist">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Certificate Included
                </span>
              </div>
            </div>

            {/* What You'll Learn */}
            <div>
              <h3 className="font-display font-bold text-lg text-ink mb-4">What You'll Learn</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.outcomes.map((o) => (
                  <div key={o} className="flex items-start gap-2.5 text-sm text-ink">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.text}`} />
                    {o}
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div>
              <h3 className="font-display font-bold text-lg text-ink mb-1">Course Curriculum</h3>
              <p className="text-sm text-slate_mist mb-4">{course.curriculum.length} modules · {totalTopics} video topics · 10 min per topic</p>
              <div className="space-y-2">
                {course.curriculum.map((mod, idx) => (
                  <div key={idx} className={`border rounded-xl overflow-hidden ${c.border}`}>
                    <button
                      onClick={() => setOpenModule(openModule === idx ? null : idx)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${c.dot}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-medium text-ink text-sm">{mod.title}</span>
                          <span className="ml-2 text-xs text-slate_mist">{mod.topics.length} topics</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {openModule === idx ? (
                          <ChevronUp className="w-4 h-4 text-slate_mist" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate_mist" />
                        )}
                      </div>
                    </button>
                    {openModule === idx && (
                      <div className={`px-5 pb-4 ${c.bg} border-t ${c.border}`}>
                        <div className="mt-3 space-y-2">
                          {mod.topics.map((topic, ti) => (
                            <div key={ti} className="flex items-center gap-2.5 text-sm text-ink py-1">
                              <Play className={`w-3.5 h-3.5 flex-shrink-0 ${c.text}`} />
                              <span>{topic}</span>
                              <span className="ml-auto text-xs text-slate_mist whitespace-nowrap">10 min</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Sticky Enrol Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 rounded-2xl bg-white shadow-xl overflow-hidden border border-border/40">

              {/* ── Professional Thumbnail ── */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={c.thumbnail}
                  alt={course.title}
                  width="900"
                  height="600"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                />
                {/* gradient overlay — bottom heavy */}
                <div className={`absolute inset-0 bg-gradient-to-t ${c.accentGrad}`} />

                {/* Level pill — top left */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full text-white ${c.levelColor} shadow`}>
                    {course.level} · {course.badge}
                  </span>
                </div>

                {/* Popular badge — top right */}
                {course.popular && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold bg-harvest text-white px-2.5 py-1 rounded-full shadow">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                {/* Stats row — bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex gap-2">
                  {[
                    { val: course.curriculum.length, label: "Modules" },
                    { val: totalTopics, label: "Topics" },
                    { val: course.duration.split("–")[0] + "h+", label: "Duration" },
                  ].map(({ val, label }) => (
                    <div key={label} className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg py-1.5 text-center border border-white/10">
                      <div className="text-white font-bold text-sm leading-tight">{val}</div>
                      <div className="text-white/70 text-[9px] uppercase tracking-wide">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Card Body ── */}
              <div className="p-6">
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-display font-bold text-ink">AUD ${course.price}</span>
                </div>
                <p className="text-xs text-slate_mist mb-5">One-time payment · Lifetime access · No hidden fees</p>

                {/* ── Enrol Now button ── */}
                <div className="mb-3">
                  {enrollButton || (
                    <Link to={course.enrollUrl || "/services/support-coordination-training#training-pricing"}>
                      <button className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white font-display font-semibold text-base px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group">
                        Enrol Now <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Link>
                  )}
                </div>

                {/* Secondary — contact */}
                <Link to="/#contact" className="block">
                  <button className="w-full flex items-center justify-center gap-2 border border-border text-slate_mist hover:border-ink hover:text-ink font-medium text-sm px-6 py-2.5 rounded-xl transition-all duration-200">
                    Ask a Question
                  </button>
                </Link>

                {/* Divider */}
                <div className="border-t border-border/50 my-5" />

                {/* Inclusions */}
                <div className="space-y-2.5">
                  {[
                    "100% online, self-paced learning",
                    "Certificate of completion",
                    "Lifetime access to all content",
                    "Mobile-friendly LMS platform",
                    "NDIS-aligned curriculum",
                    "Knowledge assessments per module",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs text-slate_mist">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}