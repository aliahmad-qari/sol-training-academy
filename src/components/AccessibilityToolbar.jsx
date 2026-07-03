import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility, Type, Sun, Eye, X } from "lucide-react";

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  useEffect(() => {
    if (dyslexiaFont) {
      document.documentElement.style.setProperty("--font-body", "Arial, sans-serif");
      document.documentElement.style.setProperty("--font-heading", "Arial, sans-serif");
      document.documentElement.style.letterSpacing = "0.05em";
    } else {
      document.documentElement.style.removeProperty("--font-body");
      document.documentElement.style.removeProperty("--font-heading");
      document.documentElement.style.letterSpacing = "";
    }
  }, [dyslexiaFont]);

  const resetAll = () => {
    setFontSize(100);
    setHighContrast(false);
    setDyslexiaFont(false);
  };

  return (
    <div className="fixed left-4 bottom-28 z-40 flex flex-col items-start gap-2">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        title="Accessibility Options"
        aria-label="Accessibility Options"
        className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-all"
      >
        <Accessibility className="w-5 h-5 text-white" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="bg-white rounded-2xl shadow-xl border border-border/60 p-4 w-60"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-semibold text-sm text-ink">Accessibility</p>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Font size */}
            <div className="mb-4">
              <p className="text-xs text-slate_mist mb-2 flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Text Size</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(f => Math.max(80, f - 10))}
                  className="w-8 h-8 rounded-lg border border-border text-sm font-bold text-ink hover:bg-muted transition-colors"
                  aria-label="Decrease text size"
                >A-</button>
                <div className="flex-1 text-center text-xs font-semibold text-ink">{fontSize}%</div>
                <button
                  onClick={() => setFontSize(f => Math.min(150, f + 10))}
                  className="w-8 h-8 rounded-lg border border-border text-sm font-bold text-ink hover:bg-muted transition-colors"
                  aria-label="Increase text size"
                >A+</button>
              </div>
            </div>

            {/* High contrast */}
            <button
              onClick={() => setHighContrast(v => !v)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-2 ${
                highContrast ? "bg-ink text-white" : "border border-border text-ink hover:bg-muted"
              }`}
              aria-pressed={highContrast}
            >
              <Sun className="w-4 h-4" />
              High Contrast
              {highContrast && <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">ON</span>}
            </button>

            {/* Dyslexia font */}
            <button
              onClick={() => setDyslexiaFont(v => !v)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-3 ${
                dyslexiaFont ? "bg-blue-600 text-white" : "border border-border text-ink hover:bg-muted"
              }`}
              aria-pressed={dyslexiaFont}
            >
              <Eye className="w-4 h-4" />
              Dyslexia-Friendly Font
              {dyslexiaFont && <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">ON</span>}
            </button>

            <button
              onClick={resetAll}
              className="w-full text-xs text-slate_mist hover:text-ink transition-colors text-center py-1"
            >
              Reset to defaults
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}