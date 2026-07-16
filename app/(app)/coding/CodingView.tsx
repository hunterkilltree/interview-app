"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import ConfidenceButton from "@/components/ConfidenceButton";
import ConfidenceDots from "@/components/ConfidenceDots";
import DifficultyBadge from "@/components/DifficultyBadge";
import type { Confidence, Difficulty } from "@/lib/types";
import { setConfidence, setNotes } from "./actions";

export type CodingRow = {
  id: string;
  title: string;
  difficulty: Difficulty;
  leetcode: string;
  confidence: Confidence;
  notes: string;
};

const LEVELS: Confidence[] = ["Low", "Medium", "High"];

export default function CodingView({ rows }: { rows: CodingRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [localConf, setLocalConf] = useState<Record<string, Confidence>>({});
  const [draftNotes, setDraftNotes] = useState("");
  const [coach, setCoach] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [, startTransition] = useTransition();
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const merged = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        confidence: localConf[r.id] ?? r.confidence,
      })),
    [rows, localConf]
  );

  const open = merged.find((r) => r.id === openId) ?? null;

  function openDrawer(row: CodingRow) {
    setOpenId(row.id);
    setDraftNotes(localNotesFor(row));
    setCoach(null);
  }

  function localNotesFor(row: CodingRow) {
    return row.notes;
  }

  function pickConfidence(id: string, level: Confidence) {
    setLocalConf((m) => ({ ...m, [id]: level }));
    startTransition(() => {
      void setConfidence(id, level);
    });
  }

  function changeNotes(id: string, value: string) {
    setDraftNotes(value);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      startTransition(() => {
        void setNotes(id, value);
      });
    }, 600);
  }

  async function askCoach(row: CodingRow) {
    setCoachLoading(true);
    setCoach(null);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: row.id, notes: draftNotes }),
      });
      const data = await res.json();
      setCoach(
        res.ok ? data.advice : (data.error ?? "The AI coach is unavailable right now.")
      );
    } catch {
      setCoach("The AI coach is unavailable right now.");
    } finally {
      setCoachLoading(false);
    }
  }

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
            onClick={() => openDrawer(q)}
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
            No coding questions yet — an admin can add them on the Admin screen.
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
              width: 460,
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
                  onClick={() => pickConfidence(open.id, level)}
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
              value={draftNotes}
              onChange={(e) => changeNotes(open.id, e.target.value)}
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
              AI coach
            </div>
            <button
              className="btn btn-primary"
              style={{ fontSize: 13, padding: "10px 18px", opacity: coachLoading ? 0.7 : 1 }}
              disabled={coachLoading}
              onClick={() => askCoach(open)}
            >
              {coachLoading ? "Thinking…" : "Get coaching tips"}
            </button>
            {coach && (
              <div
                style={{
                  marginTop: 14,
                  background: "var(--surface-2)",
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  color: "var(--ink-soft)",
                }}
              >
                {coach}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
