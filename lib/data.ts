import { createClient } from "@/lib/supabase/server";
import type { Confidence, Doc, Profile, Question, QuestionState } from "./types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

export async function getQuestions(): Promise<Question[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Question[]) ?? [];
}

export async function getDocs(): Promise<Doc[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("docs")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Doc[]) ?? [];
}

export async function getDoc(id: string): Promise<Doc | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("docs").select("*").eq("id", id).single();
  return (data as Doc) ?? null;
}

export async function getQuestionState(): Promise<
  Record<string, { confidence: Confidence | null; notes: string | null }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};
  const { data } = await supabase
    .from("question_state")
    .select("question_id, confidence, notes")
    .eq("user_id", user.id);
  const map: Record<string, { confidence: Confidence | null; notes: string | null }> = {};
  for (const row of (data as QuestionState[]) ?? []) {
    map[row.question_id] = { confidence: row.confidence, notes: row.notes };
  }
  return map;
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
