/**
 * Preloader — premium, colorful, Brevo-style animated brand splash.
 *
 * Designed to hold the screen for a configurable duration WITHOUT ever feeling
 * frozen: an aurora of drifting gradient orbs, a shimmering gradient wordmark,
 * a real progress bar + live percentage that fill across `durationMs`, and a
 * looping status line. It ends with the signature "jhatka" exit — a sudden
 * shrink then a sharp spring burst (scale: [1, 0.9, 1.25]) as it fades out.
 *
 * Reusable via props:
 *   <Preloader text="Sol Business Consultant" durationMs={60000} onComplete={...} />
 *
 * @param {string}   text        Wordmark to reveal (bold hero text).
 * @param {number}   durationMs  Total time on screen before the exit fires.
 * @param {string[]} statuses    Rotating status lines shown under the bar.
 * @param {Function} onComplete  Called once the exit animation finishes.
 */
import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Each WORD reveals on its OWN explicit delay (custom = word index), so the
// stagger never depends on fragile parent-variant propagation. The phrase
// types itself one clean word at a time: rise up, fade in, unblur.
const word = {
  hidden: { y: "0.9em", opacity: 0, filter: "blur(10px)" },
  visible: (i) => ({
    y: "0em",
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: 0.25 + i * 0.28, // clearly sequential, word after word
      type: "spring",
      damping: 14,
      stiffness: 200,
      mass: 0.7,
    },
  }),
};

// Colorful drifting orbs behind the wordmark (the "aurora").
const ORBS = [
  { color: "#D97706", size: 520, x: "-18%", y: "-12%", dur: 14 }, // harvest amber
  { color: "#6366F1", size: 460, x: "70%", y: "8%", dur: 18 },    // indigo
  { color: "#14B8A6", size: 420, x: "12%", y: "72%", dur: 16 },   // teal
  { color: "#F43F5E", size: 380, x: "78%", y: "68%", dur: 20 },   // rose
];

export default function Preloader({
  text = "Sol Business Consultant",
  durationMs = 3000,
  statuses = ["Preparing your experience", "Loading resources", "Almost ready"],
  onComplete,
}) {
  const reduceMotion = useReducedMotion();
  // "enter" → intro + progress running | "exit" → jhatka pop + fade.
  const [phase, setPhase] = useState("enter");
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const words = text.trim().split(/\s+/);
  const startRef = useRef(null);

  // Drive the progress bar + percentage across the full duration with rAF,
  // then trigger the exit. Time-based so it stays accurate on slow frames.
  useEffect(() => {
    let raf;
    const tick = (now) => {
      if (startRef.current == null) startRef.current = now;
      const pct = Math.min(100, ((now - startRef.current) / durationMs) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("exit");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);

  // Rotate the status line while loading.
  useEffect(() => {
    if (statuses.length <= 1) return undefined;
    const id = setInterval(
      () => setStatusIdx((i) => (i + 1) % statuses.length),
      Math.max(1400, durationMs / statuses.length)
    );
    return () => clearInterval(id);
  }, [statuses.length, durationMs]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0A0B0D] select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {/* ── Colorful aurora: drifting, blurred gradient orbs ───────────── */}
      {!reduceMotion &&
        ORBS.map((o, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: o.size,
              height: o.size,
              left: o.x,
              top: o.y,
              background: `radial-gradient(circle, ${o.color}55, transparent 70%)`,
              filter: "blur(60px)",
            }}
            animate={{
              x: [0, 40, -30, 0],
              y: [0, -35, 25, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: o.dur,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Fine vignette to deepen the edges and lift the center. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 45%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* ── Pop wrapper — owns the aggressive spring exit ("jhatka") ───── */}
      <motion.div
        className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8 px-6"
        initial={{ scale: 1, opacity: 1 }}
        animate={
          phase === "exit"
            ? { scale: [1, 0.9, 1.25], opacity: [1, 1, 0] }
            : { scale: 1, opacity: 1 }
        }
        transition={
          phase === "exit"
            ? { duration: 0.62, times: [0, 0.32, 1], ease: [0.16, 1, 0.3, 1] }
            : undefined
        }
        onAnimationComplete={() => {
          if (phase === "exit") onComplete?.();
        }}
      >
        {/* Wordmark inside rounded, continuously-alive glowing rings. */}
        <div className="relative flex items-center justify-center px-12 py-10 sm:px-16 sm:py-12">
          {/* Soft rounded glowing rings that breathe around the text. They sit
              OUTSIDE the text box (negative inset) so they read as full,
              organic rounded halos rather than thin ellipses hugging glyphs. */}
          {!reduceMotion && (
            <>
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-2 rounded-[999px]"
                style={{
                  border: "2px solid rgba(249,115,22,0.5)",
                  boxShadow:
                    "0 0 60px rgba(249,115,22,0.35), inset 0 0 40px rgba(99,102,241,0.2)",
                }}
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.45, 0.95, 0.45],
                  rotate: [0, 2, 0],
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-5 rounded-[999px]"
                style={{
                  border: "1.5px solid rgba(99,102,241,0.4)",
                  boxShadow: "0 0 50px rgba(99,102,241,0.25)",
                }}
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.7, 0.25] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          {/* Animated colorful wordmark — ALL CAPS, word-by-word, single line.
              Each word animates on its own delay via `custom={i}` (no reliance
              on parent stagger propagation). */}
          <motion.h1
            className="relative z-10 flex flex-nowrap items-baseline justify-center gap-x-[0.28em]
                       whitespace-nowrap uppercase font-extrabold leading-tight tracking-tight
                       text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            aria-label={text}
          >
            {words.map((w, i) => (
              <motion.span
                key={`${w}-${i}`}
                custom={i}
                variants={word}
                initial="hidden"
                animate="visible"
                className="inline-block bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent"
              >
                {w}
              </motion.span>
            ))}

            {/* Shimmer sweep across the wordmark. */}
            {!reduceMotion && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
                  backgroundSize: "200% 100%",
                  mixBlendMode: "overlay",
                }}
                animate={{ backgroundPositionX: ["150%", "-50%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.h1>
        </div>

        {/* Progress bar + live percentage. */}
        <motion.div
          className="flex w-full max-w-md flex-col items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #F59E0B, #F97316, #F43F5E, #6366F1)",
                backgroundSize: "300% 100%",
                boxShadow: "0 0 18px rgba(249,115,22,0.6)",
              }}
              animate={
                reduceMotion ? undefined : { backgroundPositionX: ["0%", "100%"] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 3, repeat: Infinity, ease: "linear" }
              }
            />
          </div>

          <div className="flex w-full items-center justify-between text-xs font-medium tracking-wide text-white/60">
            <motion.span
              key={statusIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {statuses[statusIdx]}
              <span className="ml-1 inline-flex">
                <Dot delay={0} />
                <Dot delay={0.2} />
                <Dot delay={0.4} />
              </span>
            </motion.span>
            <span className="tabular-nums text-white/80">
              {Math.round(progress)}%
            </span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Small pulsing dot for the "loading…" status line. */
function Dot({ delay }) {
  return (
    <motion.span
      className="mx-[1px] inline-block h-1 w-1 rounded-full bg-white/70"
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}
