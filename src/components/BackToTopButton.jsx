import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed right-4 bottom-52 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-ink shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-harvest hover:text-harvest sm:bottom-56"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
