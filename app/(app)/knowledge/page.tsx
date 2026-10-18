import Link from "next/link";
import SectionChip from "@/components/SectionChip";
import SectionDot from "@/components/SectionDot";
import { getDocs } from "@/lib/data";
import { SECTIONS } from "@/lib/sections";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const docs = await getDocs();
  const activeSection = section ?? null;
  const filtered = docs.filter((d) => !activeSection || d.section === activeSection);

  const trackBtn = (
    active: boolean,
    href: string,
    label: string,
    dot?: string
  ) => (
    <Link
      key={href}
      href={href}
      style={{
        justifyContent: "flex-start",
        textAlign: "left",
        padding: "8px 12px",
        display: "flex",
        gap: 8,
        alignItems: "center",
        background: active ? "var(--brand-soft)" : "transparent",
        color: active ? "var(--brand)" : "var(--ink-soft)",
        fontSize: 13.5,
        border: "none",
        borderRadius: 999,
        textDecoration: "none",
        fontFamily: "var(--font-body)",
      }}
    >
      {dot && (
        <span style={{ width: 7, height: 7, flexShrink: 0, display: "inline-flex" }}>
          <SectionDot sectionId={dot} />
        </span>
      )}
      {label}
    </Link>
  );

  return (
    <div className="kb-layout" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24 }}>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink-faint)",
            textTransform: "uppercase",
            letterSpacing: ".04em",
            marginBottom: 10,
          }}
        >
          Tracks
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {trackBtn(!activeSection, "/knowledge", "All docs")}
          {SECTIONS.map((s) =>
            trackBtn(
              activeSection === s.id,
              `/knowledge?section=${s.id}`,
              s.name,
              s.id
            )
          )}
        </div>
      </div>
      <div>
        <h1 style={{ fontSize: 24, marginBottom: 16, fontFamily: "var(--font-display)" }}>
          Knowledge Base
        </h1>
        <div className="kb-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {filtered.map((d) => (
            <Link
              key={d.id}
              href={`/knowledge/${d.id}`}
              style={{
                background: "var(--surface)",
                borderRadius: 22,
                border: "1px solid var(--line)",
                padding: "20px 22px",
                cursor: "pointer",
                textDecoration: "none",
                color: "var(--ink)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: "5px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "var(--surface-2)",
                    color: "var(--ink-soft)",
                  }}
                >
                  {d.type}
                </span>
                <SectionChip sectionId={d.section} size={22} fontSize={10} radius={6} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                {d.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-faint)", lineHeight: 1.5 }}>
                {d.excerpt}
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div style={{ color: "var(--ink-faint)", fontSize: 13.5 }}>
              No docs in this track yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
