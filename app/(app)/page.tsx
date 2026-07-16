import Link from "next/link";
import ConfidenceDots from "@/components/ConfidenceDots";
import DifficultyBadge from "@/components/DifficultyBadge";
import SectionChip from "@/components/SectionChip";
import {
  effectiveConfidence,
  getDocs,
  getProfile,
  getQuestions,
  getQuestionState,
} from "@/lib/data";
import { SECTIONS, sectionById } from "@/lib/sections";
import { confPct } from "@/lib/types";

export default async function DashboardPage() {
  const [questions, docs, state, profile] = await Promise.all([
    getQuestions(),
    getDocs(),
    getQuestionState(),
    getProfile(),
  ]);

  const withConf = questions.map((q) => ({
    ...q,
    confidence: effectiveConfidence(q, state),
  }));
  const overall = withConf.length
    ? Math.round(
        (withConf.reduce((a, q) => a + confPct(q.confidence), 0) /
          withConf.length) *
          100
      )
    : 0;

  const first = (profile?.full_name || "there").split(/\s+/)[0];

  const sectionRows = SECTIONS.map((s) => {
    if (s.id === "coding") {
      const qs = withConf.filter((q) => q.section === s.id);
      const pct = qs.length
        ? Math.round(
            (qs.reduce((a, q) => a + confPct(q.confidence), 0) / qs.length) * 100
          )
        : 0;
      return {
        ...s,
        href: "/coding",
        statLabel: `${pct}% ready`,
        width: `${pct}%`,
        opacity: 1,
      };
    }
    const count = docs.filter((d) => d.section === s.id).length;
    return {
      ...s,
      href: `/knowledge?section=${s.id}`,
      statLabel: `${count}${count === 1 ? " note" : " notes"}`,
      width: "100%",
      opacity: 0.55,
    };
  });

  const recent = withConf.slice(0, 4);

  return (
    <div>
      <h1
        style={{
          fontSize: 30,
          marginBottom: 4,
          fontFamily: "var(--font-display)",
        }}
      >
        Welcome back, {first}
      </h1>
      <div style={{ color: "var(--ink-soft)", marginBottom: 28 }}>
        Here&apos;s where your prep stands across all tracks.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: "var(--ink)",
            color: "#fff",
            borderRadius: 22,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `conic-gradient(var(--brand) ${overall * 3.6}deg, rgba(255,255,255,.12) 0deg)`,
            }}
          >
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: "50%",
                background: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                {overall}%
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 13,
              opacity: 0.75,
              textAlign: "center",
            }}
          >
            Overall readiness
          </div>
        </div>
        <div
          style={{
            background: "var(--surface)",
            borderRadius: 22,
            border: "1px solid var(--line)",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Coding readiness + track reference
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "16px 22px",
            }}
          >
            {sectionRows.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                style={{ cursor: "pointer", textDecoration: "none", color: "var(--ink)" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{s.name}</span>
                  <span style={{ color: "var(--ink-faint)" }}>{s.statLabel}</span>
                </div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 999,
                    background: "var(--surface-2)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: s.width,
                      background: s.accent,
                      borderRadius: 999,
                      opacity: s.opacity,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 22,
          border: "1px solid var(--line)",
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Recently touched — LeetCode questions
        </div>
        <div>
          {recent.map((q) => (
            <div
              key={q.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 0",
                borderTop: "1px solid var(--line)",
              }}
            >
              <SectionChip sectionId={q.section} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{q.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                  {sectionById(q.section)?.name}
                </div>
              </div>
              <DifficultyBadge difficulty={q.difficulty} />
              <ConfidenceDots level={q.confidence} />
            </div>
          ))}
          {recent.length === 0 && (
            <div style={{ color: "var(--ink-faint)", fontSize: 13, padding: "12px 0" }}>
              No questions yet — add some in the Admin screen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
