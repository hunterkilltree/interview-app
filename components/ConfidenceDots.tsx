import type { Confidence } from "@/lib/types";

export default function ConfidenceDots({ level }: { level: Confidence }) {
  const filled = level === "High" ? 3 : level === "Medium" ? 2 : 1;
  const color =
    level === "High"
      ? "var(--conf-high)"
      : level === "Medium"
        ? "var(--conf-med)"
        : "var(--conf-low)";
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: i < filled ? color : "var(--line)",
          }}
        />
      ))}
    </div>
  );
}
