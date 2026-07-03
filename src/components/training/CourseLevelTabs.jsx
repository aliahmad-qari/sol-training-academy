import React from "react";

const COLOR_MAP = {
  blue: { active: "bg-blue-600 text-white border-blue-600", dot: "bg-blue-600" },
  amber: { active: "bg-amber-500 text-white border-amber-500", dot: "bg-amber-500" },
  purple: { active: "bg-purple-600 text-white border-purple-600", dot: "bg-purple-600" },
};

export default function CourseLevelTabs({ activeLevel, setActiveLevel, levels }) {
  return (
    <div className="sticky top-20 z-30 bg-white border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-2 py-4 overflow-x-auto">
          {levels.map((lvl) => {
            const isActive = activeLevel === lvl.id;
            const colors = COLOR_MAP[lvl.color];
            return (
              <button
                key={lvl.id}
                onClick={() => setActiveLevel(lvl.id)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 font-display font-semibold text-sm whitespace-nowrap transition-all ${
                  isActive ? colors.active : "border-border text-slate_mist hover:border-border/80 bg-white"
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-white" : colors.dot}`} />
                {lvl.level} — {lvl.badge}
                {lvl.popular && (
                  <span className="bg-harvest text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}