/**
 * Preloader — premium dark-minimalist animated splash.
 *
 * Lifecycle:
 *   1. ENTER  — letters reveal one-by-one with a clean staggered spring
 *               (rise + blur clear), under a slim animated accent line.
 *   2. HOLD   — brief pause so the wordmark reads.
 *   3. EXIT   — the "jhatka": a sudden shrink then a sharp spring burst
 *               (scale: [1, 0.9, 1.25]) as the whole splash fades out, then
 *               `onComplete` fires so the parent can unmount it.
 *
 * Reusable via the `text` prop, e.g. "SOL ACADEMY" or
 * "SOL BUSINESS TRAINING ACADEMY".
 *
 * @param {string}   text        Wordmark to reveal.
 * @param {Function} onComplete  Called once the exit animation finishes.
 * @param {number}   holdMs      Pause (ms) between entry finishing and exit firing.
 */
import { useState } from "react";
import { motion } from "framer-motion";

// Parent orchestrates the per-letter stagger.
const wordmark = {
  hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  visible: {
    transition: { delayChildren: 0.15, staggerChildren: 0.055 },
  },
};

// Each letter: rise up, fade in, and resolve out of a soft blur — spring driven.
const letter = {
  hidden: { y: "0.9em", opacity: 0, filter: "blur(10px)" },
  visible: {
    y: "0em",
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 12, stiffness: 220, mass: 0.6 },
  },
};

export default function Preloader({
  text = "SOL Business Consultant",
  onComplete,
  holdMs = 650,
}) {
  // "enter" → letters revealing | "exit" → jhatka pop + fade.
  const [phase, setPhase] = useState("enter");
  const letters = Array.from(text);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0B0D0F] select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {/* Ambient radial glow — subtle amber depth behind the wordmark. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(600px circle at 50% 45%, rgba(217,119,6,0.10), transparent 70%)",
        }}
      />
      {/* Fine vignette to deepen the edges. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Pop wrapper — owns the aggressive spring exit ("jhatka"). */}
      <motion.div
        className="relative flex flex-col items-center gap-5 px-6"
        initial={{ scale: 1, opacity: 1 }}
        animate={
          phase === "exit"
            ? { scale: [1, 0.9, 1.25], opacity: [1, 1, 0] }
            : { scale: 1, opacity: 1 }
        }
        transition={
          phase === "exit"
            ? {
                duration: 0.62,
                times: [0, 0.32, 1],
                ease: [0.16, 1, 0.3, 1], // snappy overshoot on the burst
              }
            : undefined
        }
        onAnimationComplete={() => {
          if (phase === "exit") onComplete?.();
        }}
      >
        {/* Animated wordmark. */}
        <motion.h1
          className="flex flex-wrap justify-center text-center font-extrabold tracking-[0.18em] text-white
                     text-3xl sm:text-4xl md:text-5xl"
          variants={wordmark}
          initial="hidden"
          animate="visible"
          onAnimationComplete={() => {
            // Fired when the last letter settles — hold, then trigger the exit.
            if (phase === "enter") {
              window.setTimeout(() => setPhase("exit"), holdMs);
            }
          }}
          aria-label={text}
        >
          {letters.map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              variants={letter}
              className="inline-block"
              style={{ whiteSpace: "pre" }}
            >
              {/* Keep spaces from collapsing while preserving the layout. */}
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Slim accent line that sweeps open beneath the wordmark. */}
        <motion.div
          className="h-[2px] w-40 origin-center rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #D97706 50%, transparent)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
        />
      </motion.div>
    </motion.div>
  );
}
