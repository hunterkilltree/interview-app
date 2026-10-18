"use client";

import { useMemo, useState } from "react";
import SectionChip from "@/components/SectionChip";
import { SECTIONS, sectionById } from "@/lib/sections";

export type Card = {
  id: string;
  section: string;
  question: string;
  answer: string;
  link?: string;
};

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const panel: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: 22,
  border: "1px solid var(--line)",
  padding: "28px 32px",
};

export default function QuizView({ cards }: { cards: Card[] }) {
  const [section, setSection] = useState("all");
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [missed, setMissed] = useState<Card[]>([]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: cards.length };
    for (const x of cards) c[x.section] = (c[x.section] ?? 0) + 1;
    return c;
  }, [cards]);

  function start(source: Card[]) {
    setDeck(shuffle(source));
    setIndex(0);
    setRevealed(false);
    setKnown([]);
    setMissed([]);
  }

  function answer(gotIt: boolean) {
    if (!deck) return;
    const c = deck[index];
    if (gotIt) setKnown((k) => [...k, c.id]);
    else setMissed((m) => [...m, c]);
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  const heading = (
    <h1 style={{ fontSize: 24, marginBottom: 4, fontFamily: "var(--font-display)" }}>
      Quiz — Review Session
    </h1>
  );

  // Setup screen
  if (!deck) {
    const pool = section === "all" ? cards : cards.filter((c) => c.section === section);
    const tabs = [{ id: "all", name: "All topics" }, ...SECTIONS.filter((s) => counts[s.id])];
    return (
      <div style={{ maxWidth: 720 }}>
        {heading}
        <div style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBottom: 20 }}>
          Flip through every question you have collected. Read the question, try to answer
          out loud, then reveal the answer and mark whether you got it.
        </div>
        <div style={panel}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Pick a topic</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                className={section === t.id ? "btn btn-primary" : "btn btn-ghost"}
                style={{ fontSize: 13, padding: "8px 16px" }}
                onClick={() => setSection(t.id)}
              >
                {t.name} ({counts[t.id]})
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={{ fontSize: 14, padding: "12px 24px" }}
            disabled={pool.length === 0}
            onClick={() => start(pool)}
          >
            Start quiz · {pool.length} questions
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (index >= deck.length) {
    const pct = Math.round((known.length / deck.length) * 100);
    return (
      <div style={{ maxWidth: 720 }}>
        {heading}
        <div style={{ ...panel, marginTop: 16, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 700 }}>
            {pct}%
          </div>
          <div style={{ color: "var(--ink-soft)", marginBottom: 22 }}>
            You knew {known.length} of {deck.length}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {missed.length > 0 && (
              <button className="btn btn-primary" onClick={() => start(missed)}>
                Retry {missed.length} missed
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => start(deck)}>
              Restart all
            </button>
            <button className="btn btn-ghost" onClick={() => setDeck(null)}>
              Change topic
            </button>
          </div>
        </div>
        {missed.length > 0 && (
          <div style={{ ...panel, marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>To review again</div>
            {missed.map((m) => (
              <div
                key={m.id}
                style={{ fontSize: 13.5, padding: "6px 0", borderTop: "1px solid var(--line)" }}
              >
                {m.question}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Question screen
  const c = deck[index];
  return (
    <div style={{ maxWidth: 760 }}>
      {heading}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 14px" }}>
        <div
          style={{
            flex: 1,
            height: 7,
            borderRadius: 999,
            background: "var(--surface-2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(index / deck.length) * 100}%`,
              background: "var(--brand)",
            }}
          />
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>
          {index + 1} / {deck.length}
        </div>
      </div>
      <div style={panel}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <SectionChip sectionId={c.section} />
          <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>
            {sectionById(c.section)?.name}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {c.question}
        </div>
        {c.link && (
          <a href={c.link} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
            Open on LeetCode ↗
          </a>
        )}
        {revealed ? (
          <>
            <div
              style={{
                marginTop: 20,
                background: "var(--surface-2)",
                borderRadius: 14,
                padding: 18,
                fontSize: 13.5,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                color: "var(--ink-soft)",
                maxHeight: 420,
                overflowY: "auto",
              }}
            >
              {c.answer}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="btn btn-primary" onClick={() => answer(true)}>
                I knew it
              </button>
              <button className="btn btn-ghost" onClick={() => answer(false)}>
                Missed it
              </button>
            </div>
          </>
        ) : (
          <button
            className="btn btn-primary"
            style={{ marginTop: 22, fontSize: 14, padding: "12px 24px" }}
            onClick={() => setRevealed(true)}
          >
            Show answer
          </button>
        )}
      </div>
    </div>
  );
}
