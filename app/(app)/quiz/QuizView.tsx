"use client";

import { useMemo, useState } from "react";

export type Card = {
  id: string;
  /** Primary topic label shown on the card. */
  topic: string;
  /** Every topic filter this card appears under (defaults to [topic]). */
  topics?: string[];
  question: string;
  /** Free-text answer, revealed on demand (flashcards). */
  answer?: string;
  /** Multiple-choice options keyed by letter. */
  options?: Record<string, string>;
  /** Correct option letter, when the bank ships an answer key. */
  correct?: string;
  /** Why the correct option is right, shown after picking. */
  explanation?: string;
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
  const [topic, setTopic] = useState("All");
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [known, setKnown] = useState<string[]>([]);
  const [missed, setMissed] = useState<Card[]>([]);
  const [unscored, setUnscored] = useState(0);

  const topicsOf = (c: Card) => c.topics ?? [c.topic];

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: cards.length };
    for (const x of cards) for (const t of topicsOf(x)) c[t] = (c[t] ?? 0) + 1;
    return c;
  }, [cards]);

  function start(source: Card[]) {
    setDeck(shuffle(source));
    setIndex(0);
    setRevealed(false);
    setPicked(null);
    setKnown([]);
    setMissed([]);
    setUnscored(0);
  }

  function next(gotIt: boolean | null) {
    if (!deck) return;
    const c = deck[index];
    if (gotIt === true) setKnown((k) => [...k, c.id]);
    else if (gotIt === false) setMissed((m) => [...m, c]);
    else setUnscored((u) => u + 1);
    setIndex((i) => i + 1);
    setRevealed(false);
    setPicked(null);
  }

  const heading = (
    <h1 style={{ fontSize: 24, marginBottom: 4, fontFamily: "var(--font-display)" }}>
      Quiz — Review Session
    </h1>
  );

  // Setup screen
  if (!deck) {
    const pool = topic === "All" ? cards : cards.filter((c) => topicsOf(c).includes(topic));
    const tabs = Object.keys(counts);
    return (
      <div style={{ maxWidth: 720 }}>
        {heading}
        <div style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBottom: 20 }}>
          Flip through every question you have collected. Read the question, try to answer
          out loud or pick an option, then check yourself.
        </div>
        <div style={panel}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Pick a topic</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {tabs.map((t) => (
              <button
                key={t}
                className={topic === t ? "btn btn-primary" : "btn btn-ghost"}
                style={{ fontSize: 13, padding: "8px 16px" }}
                onClick={() => setTopic(t)}
              >
                {t} ({counts[t]})
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
    const scored = deck.length - unscored;
    const pct = scored ? Math.round((known.length / scored) * 100) : 0;
    return (
      <div style={{ maxWidth: 720 }}>
        {heading}
        <div style={{ ...panel, marginTop: 16, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 700 }}>
            {scored ? `${pct}%` : "Done"}
          </div>
          <div style={{ color: "var(--ink-soft)", marginBottom: 22 }}>
            {scored ? `You knew ${known.length} of ${scored}` : `You answered ${deck.length}`}
            {unscored > 0 && scored > 0 && ` · ${unscored} without an answer key`}
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
  const isChoice = !!c.options;
  const hasKey = isChoice && !!c.correct;
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
        <div
          style={{
            display: "inline-block",
            fontSize: 11.5,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 999,
            background: "var(--brand-soft)",
            color: "var(--brand)",
            marginBottom: 14,
          }}
        >
          {c.topic}
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

        {isChoice ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              {Object.entries(c.options!).map(([key, text]) => {
                const chosen = picked === key;
                const showRight = hasKey && picked !== null && key === c.correct;
                const showWrong = hasKey && chosen && key !== c.correct;
                return (
                  <button
                    key={key}
                    disabled={picked !== null}
                    onClick={() => setPicked(key)}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      borderRadius: 14,
                      border: `1.5px solid ${
                        showRight
                          ? "var(--conf-high)"
                          : showWrong
                            ? "var(--conf-low)"
                            : chosen
                              ? "var(--brand)"
                              : "var(--line)"
                      }`,
                      background: chosen ? "var(--brand-soft)" : "var(--surface)",
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      cursor: picked === null ? "pointer" : "default",
                      color: "var(--ink)",
                    }}
                  >
                    <strong>{key}.</strong> {text}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div style={{ marginTop: 16 }}>
                {hasKey ? (
                  <div style={{ fontSize: 13.5, marginBottom: 12 }}>
                    {picked === c.correct ? "Correct." : `Not quite — the answer is ${c.correct}.`}
                    {c.explanation && (
                      <div style={{ color: "var(--ink-soft)", marginTop: 6 }}>{c.explanation}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--ink-faint)", marginBottom: 12 }}>
                    You picked {picked}. This bank has no answer key yet, so it is not scored.
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => next(hasKey ? picked === c.correct : null)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : revealed ? (
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
              <button className="btn btn-primary" onClick={() => next(true)}>
                I knew it
              </button>
              <button className="btn btn-ghost" onClick={() => next(false)}>
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
