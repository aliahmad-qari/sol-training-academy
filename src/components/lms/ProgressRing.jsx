import React from "react";

export default function ProgressRing({ progress = 0, size = 48, strokeWidth = 4 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={progress === 100 ? "#22C55E" : "#D97706"}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: size < 50 ? "10px" : "12px", fill: "#0F172A", fontWeight: 600 }}>
        {progress}%
      </text>
    </svg>
  );
}