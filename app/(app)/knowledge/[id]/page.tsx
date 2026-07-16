import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc } from "@/lib/data";
import { sectionById } from "@/lib/sections";

export default async function DocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDoc(id);
  if (!doc) notFound();

  const section = sectionById(doc.section);
  const paragraphs = (doc.body ?? "").split("\n\n");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 0 100px" }}>
      <Link
        href="/knowledge"
        className="btn btn-ghost"
        style={{
          display: "inline-block",
          fontSize: 13,
          padding: "8px 16px",
          marginBottom: 28,
          textDecoration: "none",
        }}
      >
        ← Back to Knowledge Base
      </Link>
      <div>
        <span
          style={{
            display: "inline-flex",
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            background: "var(--surface-2)",
            color: "var(--ink-soft)",
          }}
        >
          {doc.type}
        </span>
      </div>
      <h1
        style={{
          fontSize: 44,
          margin: "20px 0 10px",
          fontFamily: "var(--font-display)",
          lineHeight: 1.08,
        }}
      >
        {doc.title}
      </h1>
      <div
        style={{
          fontSize: 13,
          color: section?.accent ?? "var(--ink)",
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        {section?.name}
      </div>
      {doc.has_image && (
        <div
          style={{
            width: "100%",
            height: 440,
            borderRadius: 20,
            overflow: "hidden",
            margin: "28px 0",
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink-faint)",
            fontSize: 14,
            border: "1px dashed var(--line)",
          }}
        >
          Diagram or screenshot placeholder
        </div>
      )}
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: 18,
            lineHeight: 1.75,
            color: "var(--ink-soft)",
            whiteSpace: "pre-line",
            marginTop: 22,
          }}
        >
          {p}
        </p>
      ))}
    </div>
  );
}
