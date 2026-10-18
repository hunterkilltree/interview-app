"use client";

import { useMemo, useState } from "react";
import ConfidenceButton from "@/components/ConfidenceButton";
import ConfidenceDots from "@/components/ConfidenceDots";
import DifficultyBadge from "@/components/DifficultyBadge";
import { effectiveConfidence, effectiveNotes, useSession } from "@/lib/session";
import type { Confidence, Question } from "@/lib/types";

const LEVELS: Confidence[] = ["Low", "Medium", "High"];

export default function CodingView({ questions }: { questions: Question[] }) {
  const { state, setConfidence, setNotes } = useSession();
  const [openId, setOpenId] = useState<string | null>(null);

  const merged = useMemo(
    () =>
      questions.map((q) => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty,
        leetcode: q.leetcode,
        confidence: effectiveConfidence(q, state),
        notes: effectiveNotes(q, state),
      })),
    [questions, state]
  );

  const open = merged.find((r) => r.id === openId) ?? null;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 4, fontFamily: "var(--font-display)" }}>
        Coding — LeetCode Practice
      </h1>
      <div
        style={{
          color: "var(--ink-soft)",
          fontSize: 13.5,
          marginBottom: 16,
        }}
      >
        Track confidence and personal notes per problem. Deeper conceptual notes
        for the other tracks live in the Knowledge Base.
      </div>
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 22,
          border: "1px solid var(--line)",
        }}
      >
        {merged.map((q) => (
          <div
            key={q.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              borderTop: "1px solid var(--line)",
              cursor: "pointer",
            }}
            onClick={() => setOpenId(q.id)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{q.title}</div>
              {q.leetcode && (
                <a
                  href={q.leetcode}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 12,
                    color: "var(--ink-faint)",
                    textDecoration: "none",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View on LeetCode ↗
                </a>
              )}
            </div>
            <DifficultyBadge difficulty={q.difficulty} />
            <ConfidenceDots level={q.confidence} />
          </div>
        ))}
        {merged.length === 0 && (
          <div style={{ padding: 20, color: "var(--ink-faint)", fontSize: 13.5 }}>
            No coding questions yet — add some to data/questions.txt.
          </div>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(22,18,37,.45)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 20,
          }}
          onClick={() => setOpenId(null)}
        >
          <div
            style={{
              width: "min(460px, 100%)",
              height: "100%",
              background: "var(--surface)",
              padding: "28px 28px 40px",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-ghost"
              style={{ padding: "6px 14px", fontSize: 12, marginBottom: 20 }}
              onClick={() => setOpenId(null)}
            >
              Close ✕
            </button>
            <div>
              <DifficultyBadge difficulty={open.difficulty} />
            </div>
            <h2
              style={{
                fontSize: 22,
                margin: "10px 0 8px",
                fontFamily: "var(--font-display)",
              }}
            >
              {open.title}
            </h2>
            {open.leetcode && (
              <a href={open.leetcode} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                Open on LeetCode ↗
              </a>
            )}
            <div
              style={{
                marginTop: 22,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--ink-faint)",
                textTransform: "uppercase",
                letterSpacing: ".04em",
                marginBottom: 10,
              }}
            >
              Confidence
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {LEVELS.map((level) => (
                <ConfidenceButton
                  key={level}
                  level={level}
                  selected={open.confidence === level}
                  onClick={() => setConfidence(open.id, level)}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--ink-faint)",
                textTransform: "uppercase",
                letterSpacing: ".04em",
                marginBottom: 10,
              }}
            >
              Your notes
            </div>
            <textarea
              value={open.notes}
              onChange={(e) => setNotes(open.id, e.target.value)}
              style={{
                width: "100%",
                minHeight: 160,
                padding: 14,
                borderRadius: 14,
                border: "1px solid var(--line)",
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                resize: "vertical",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
