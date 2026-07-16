"use client";

import type { Confidence } from "@/lib/types";

const COLORS: Record<Confidence, string> = {
  Low: "var(--conf-low)",
  Medium: "var(--conf-med)",
  High: "var(--conf-high)",
};

export default function ConfidenceButton({
  level,
  selected,
  onClick,
}: {
  level: Confidence;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 13,
        padding: "8px 16px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        background: selected ? COLORS[level] : "var(--surface-2)",
        color: selected ? "#fff" : "var(--ink-soft)",
      }}
    >
      {level}
    </button>
  );
}
