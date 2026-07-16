import { apiFetch } from "@/lib/api";
import type { Confidence, Doc, Profile, Question } from "./types";

type PageEnvelope<T> = { content: T[] };

type ApiQuestion = {
  id: string;
  section: string;
  title: string;
  difficulty: Question["difficulty"];
  leetcode: string;
  defaultConfidence: Confidence;
  defaultNotes: string;
};

type ApiDoc = {
  id: string;
  section: string;
  title: string;
  type: string;
  excerpt: string;
  body: string;
  hasImage: boolean;
};

type ApiState = { questionId: string; confidence: Confidence | null; notes: string | null };

type ApiUser = {
  id: string;
  email: string;
  fullName: string;
  role: "MEMBER" | "ADMIN";
  createdAt: string;
};

export async function getProfile(): Promise<Profile | null> {
  try {
    const me = await apiFetch<ApiUser>("/api/v1/me");
    return {
      id: me.id,
      full_name: me.fullName,
      email: me.email,
      created_at: me.createdAt,
      role: me.role === "ADMIN" ? "admin" : "member",
    };
  } catch {
    return null;
  }
}

export async function getQuestions(): Promise<Question[]> {
  const page = await apiFetch<PageEnvelope<ApiQuestion>>("/api/v1/questions?size=100");
  return page.content.map((q) => ({
    id: q.id,
    section: q.section,
    title: q.title,
    difficulty: q.difficulty,
    leetcode: q.leetcode,
    default_confidence: q.defaultConfidence,
    default_notes: q.defaultNotes,
  }));
}

export async function getDocs(): Promise<Doc[]> {
  const page = await apiFetch<PageEnvelope<ApiDoc>>("/api/v1/docs?size=100");
  return page.content.map(mapDoc);
}

export async function getDoc(id: string): Promise<Doc | null> {
  try {
    return mapDoc(await apiFetch<ApiDoc>(`/api/v1/docs/${id}`));
  } catch {
    return null;
  }
}

function mapDoc(d: ApiDoc): Doc {
  return {
    id: d.id,
    section: d.section,
    title: d.title,
    type: d.type,
    excerpt: d.excerpt,
    body: d.body,
    has_image: d.hasImage,
  };
}

export async function getQuestionState(): Promise<
  Record<string, { confidence: Confidence | null; notes: string | null }>
> {
  try {
    const rows = await apiFetch<ApiState[]>("/api/v1/question-state");
    const map: Record<string, { confidence: Confidence | null; notes: string | null }> = {};
    for (const row of rows) {
      map[row.questionId] = { confidence: row.confidence, notes: row.notes };
    }
    return map;
  } catch {
    return {};
  }
}

/** Merge per-user state over question defaults. */
export function effectiveConfidence(
  q: Question,
  state: Record<string, { confidence: Confidence | null; notes: string | null }>
): Confidence {
  return state[q.id]?.confidence ?? q.default_confidence;
}

export function effectiveNotes(
  q: Question,
  state: Record<string, { confidence: Confidence | null; notes: string | null }>
): string {
  return state[q.id]?.notes ?? q.default_notes ?? "";
}
