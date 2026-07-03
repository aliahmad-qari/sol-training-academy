import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_VIDEO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // replace with your video URL

const HERO_IMAGE = "https://media.base44.com/images/public/6a1e37de99aadfdb49a9ef0d/ce4b4d474_generated_ebcd4dde.png";

const stats = [
  { value: "300+", label: "Providers Registered" },
  { value: "98%", label: "First-Time Pass Rate" },
  { value: "100+", label: "Businesses Served" },
];

function getEmbedUrl(url) {
  if (!url) return url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return url;
}

export default function HeroSection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Sol Monolith */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] rounded-full border border-harvest/10 opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] rounded-full border border-harvest/5 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12 lg:py-0">
          {/* Left — Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/30 bg-harvest/5 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
                <CheckCircle className="w-3.5 h-3.5" />
                Australia's Trusted Consulting Partner
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-2"
            >
              <h1 className="font-display font-bold text-ink leading-[1.05] tracking-tight">
                <span className="block text-5xl md:text-6xl lg:text-7xl">STRUCTURE.</span>
                <span className="block text-5xl md:text-6xl lg:text-7xl">COMPLIANCE.</span>
                <span className="block text-5xl md:text-6xl lg:text-7xl text-harvest">SCALE.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-lg text-slate_mist max-w-lg leading-relaxed"
            >
              From NDIS registration to Easy Compliance and strategic business consulting — 
              we build the foundations that let your business thrive.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#contact">
                <Button className="bg-harvest hover:bg-harvest/90 text-white font-display text-base px-8 py-6 gap-2 group shadow-lg shadow-harvest/20">
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="#services">
                <Button variant="outline" className="font-display text-base px-8 py-6 border-ink/20 text-ink hover:bg-ink hover:text-white">
                  Explore Services
                </Button>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex gap-8 pt-6 border-t border-border/60"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display font-bold text-3xl text-ink">{s.value}</div>
                  <div className="text-xs text-slate_mist tracking-wide uppercase mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setLightboxOpen(true)}>
              <img
                src={HERO_IMAGE}
                alt="Modern architectural interior representing structural excellence"
                className="w-full h-[640px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-2xl">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-white/80 text-sm font-medium">▶ Watch our story</span>
              </div>
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-border/50 max-w-[240px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-display font-semibold text-sm text-ink">Audit Ready</span>
              </div>
              <p className="text-xs text-slate_mist">Your compliance system is configured and verified by Easy Compliance.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <iframe
                src={getEmbedUrl(HERO_VIDEO_URL)}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="Hero Video"
              />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}