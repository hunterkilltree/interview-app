import type { Difficulty } from "@/lib/types";

const STYLES: Record<Difficulty, { background: string; color: string }> = {
  Easy: { background: "#e7f7ec", color: "#16a34a" },
  Medium: { background: "#fef3e2", color: "#b4790a" },
  Hard: { background: "#fde8ea", color: "#e11d48" },
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        ...STYLES[difficulty],
      }}
    >
      {difficulty}
    </span>
  );
}
