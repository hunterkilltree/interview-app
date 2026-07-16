import { sectionById } from "@/lib/sections";

export default function SectionDot({ sectionId }: { sectionId: string }) {
  const s = sectionById(sectionId);
  return (
    <div
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: s?.accent ?? "var(--ink)",
      }}
    />
  );
}
