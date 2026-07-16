import { sectionById } from "@/lib/sections";

export default function SectionChip({
  sectionId,
  size = 30,
  fontSize = 12,
  radius = 9,
}: {
  sectionId: string;
  size?: number;
  fontSize?: number;
  radius?: number;
}) {
  const s = sectionById(sectionId);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: s?.accent ?? "var(--ink)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize,
        flexShrink: 0,
      }}
    >
      {s?.mono ?? "?"}
    </div>
  );
}
