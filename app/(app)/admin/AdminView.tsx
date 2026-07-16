"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import SectionChip from "@/components/SectionChip";
import { SECTIONS, sectionById } from "@/lib/sections";
import { DIFFICULTIES, DOC_TYPES, type Doc, type Question } from "@/lib/types";
import { deleteDoc, deleteQuestion, saveDoc, saveQuestion } from "./actions";

type Tab = "docs" | "questions";

type EditingDoc = {
  kind: "doc";
  id?: string;
  section: string;
  title: string;
  type: string;
  excerpt: string;
  body: string;
};

type EditingQuestion = {
  kind: "question";
  id?: string;
  section: string;
  title: string;
  difficulty: string;
  leetcode: string;
};

type Editing = EditingDoc | EditingQuestion;

export default function AdminView({
  questions,
  docs,
}: {
  questions: Question[];
  docs: Doc[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("docs");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isDocsTab = tab === "docs";
  const rows = isDocsTab
    ? docs.map((d) => ({
        id: d.id,
        section: d.section,
        title: d.title || "Untitled",
        subLabel: `${sectionById(d.section)?.name ?? d.section} · ${d.type}`,
        onEdit: () =>
          setEditing({
            kind: "doc",
            id: d.id,
            section: d.section,
            title: d.title,
            type: d.type,
            excerpt: d.excerpt,
            body: d.body,
          }),
        onDelete: () => remove("doc", d.id),
      }))
    : questions.map((q) => ({
        id: q.id,
        section: q.section,
        title: q.title || "Untitled",
        subLabel: `${sectionById(q.section)?.name ?? q.section} · ${q.difficulty}`,
        onEdit: () =>
          setEditing({
            kind: "question",
            id: q.id,
            section: q.section,
            title: q.title,
            difficulty: q.difficulty,
            leetcode: q.leetcode,
          }),
        onDelete: () => remove("question", q.id),
      }));

  function remove(kind: "doc" | "question", id: string) {
    setError(null);
    startTransition(async () => {
      const res = kind === "doc" ? await deleteDoc(id) : await deleteQuestion(id);
      if (res.error) setError(res.error);
      router.refresh();
    });
  }

  function save() {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const res =
        editing.kind === "doc"
          ? await saveDoc({
              id: editing.id,
              section: editing.section,
              title: editing.title,
              type: editing.type,
              excerpt: editing.excerpt,
              body: editing.body,
            })
          : await saveQuestion({
              id: editing.id,
              section: editing.section,
              title: editing.title,
              difficulty: editing.difficulty,
              leetcode: editing.leetcode,
            });
      if (res.error) {
        setError(res.error);
      } else {
        setEditing(null);
        router.refresh();
      }
    });
  }

  const newLabel = isDocsTab ? "Document" : "Question";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 24, fontFamily: "var(--font-display)" }}>
          Admin — Content Editor
        </h1>
        <button
          className="btn btn-primary"
          style={{ fontSize: 13 }}
          onClick={() =>
            setEditing(
              isDocsTab
                ? {
                    kind: "doc",
                    section: "coding",
                    title: "",
                    type: DOC_TYPES[0],
                    excerpt: "",
                    body: "",
                  }
                : {
                    kind: "question",
                    section: "coding",
                    title: "",
                    difficulty: "Medium",
                    leetcode: "",
                  }
            )
          }
        >
          + New {newLabel}
        </button>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
        {(
          [
            ["docs", "Documents"],
            ["questions", "Coding Questions"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setEditing(null);
            }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              border: "none",
              borderRadius: 999,
              padding: "9px 16px",
              fontSize: 14,
              cursor: "pointer",
              background: tab === id ? "var(--ink)" : "transparent",
              color: tab === id ? "#fff" : "var(--ink-soft)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <div style={{ color: "var(--conf-low)", fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 22,
          border: "1px solid var(--line)",
        }}
      >
        {rows.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 20px",
              borderTop: "1px solid var(--line)",
            }}
          >
            <SectionChip sectionId={item.section} size={26} fontSize={10} radius={7} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                {item.subLabel}
              </div>
            </div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: "6px 14px" }}
              onClick={item.onEdit}
            >
              Edit
            </button>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: "6px 14px", color: "var(--conf-low)" }}
              onClick={item.onDelete}
              disabled={pending}
            >
              Delete
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ padding: 20, color: "var(--ink-faint)", fontSize: 13.5 }}>
            Nothing here yet — create the first {newLabel.toLowerCase()}.
          </div>
        )}
      </div>

      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--bg)",
            zIndex: 30,
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 56px 100px" }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 13, padding: "8px 16px", marginBottom: 28 }}
              onClick={() => setEditing(null)}
            >
              ← Cancel
            </button>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 32,
                marginBottom: 28,
              }}
            >
              {editing.kind === "doc" ? "Document" : "Question"}
            </div>
            <label className="field-label">Track</label>
            <select
              className="input"
              style={{ margin: "8px 0 22px" }}
              value={editing.section}
              onChange={(e) => setEditing({ ...editing, section: e.target.value })}
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <label className="field-label">Title</label>
            <input
              className="input"
              style={{ margin: "8px 0 22px" }}
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            {editing.kind === "doc" ? (
              <>
                <label className="field-label">Type</label>
                <select
                  className="input"
                  style={{ margin: "8px 0 22px" }}
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <label className="field-label">Excerpt</label>
                <input
                  className="input"
                  style={{ margin: "8px 0 22px" }}
                  value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                />
                <label className="field-label">Body</label>
                <textarea
                  className="input"
                  style={{ margin: "8px 0 22px", minHeight: 340, lineHeight: 1.6 }}
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </>
            ) : (
              <>
                <label className="field-label">Difficulty</label>
                <select
                  className="input"
                  style={{ margin: "8px 0 22px" }}
                  value={editing.difficulty}
                  onChange={(e) =>
                    setEditing({ ...editing, difficulty: e.target.value })
                  }
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <label className="field-label">LeetCode link</label>
                <input
                  className="input"
                  style={{ margin: "8px 0 22px" }}
                  value={editing.leetcode}
                  onChange={(e) => setEditing({ ...editing, leetcode: e.target.value })}
                />
              </>
            )}
            <button
              className="btn btn-primary"
              style={{ fontSize: 14, padding: "14px 28px", opacity: pending ? 0.7 : 1 }}
              onClick={save}
              disabled={pending}
            >
              {pending ? "Saving…" : `Save ${editing.kind === "doc" ? "Document" : "Question"}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
