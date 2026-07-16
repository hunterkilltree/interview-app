"use server";

import { revalidatePath } from "next/cache";
import { ApiRequestError, apiFetch } from "@/lib/api";

export type SaveResult = { error?: string };

function toError(e: unknown): SaveResult {
  return { error: e instanceof ApiRequestError ? e.message : "Request failed" };
}

export async function saveDoc(input: {
  id?: string;
  section: string;
  title: string;
  type: string;
  excerpt: string;
  body: string;
}): Promise<SaveResult> {
  try {
    const payload = JSON.stringify({
      section: input.section,
      title: input.title,
      type: input.type,
      excerpt: input.excerpt,
      body: input.body,
    });
    await apiFetch(
      input.id ? `/api/v1/admin/docs/${input.id}` : "/api/v1/admin/docs",
      { method: input.id ? "PUT" : "POST", body: payload }
    );
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return toError(e);
  }
}

export async function deleteDoc(id: string): Promise<SaveResult> {
  try {
    await apiFetch(`/api/v1/admin/docs/${id}`, { method: "DELETE" });
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return toError(e);
  }
}

export async function saveQuestion(input: {
  id?: string;
  section: string;
  title: string;
  difficulty: string;
  leetcode: string;
}): Promise<SaveResult> {
  try {
    const payload = JSON.stringify({
      section: input.section,
      title: input.title,
      difficulty: input.difficulty,
      leetcode: input.leetcode,
    });
    await apiFetch(
      input.id ? `/api/v1/admin/questions/${input.id}` : "/api/v1/admin/questions",
      { method: input.id ? "PUT" : "POST", body: payload }
    );
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return toError(e);
  }
}

export async function deleteQuestion(id: string): Promise<SaveResult> {
  try {
    await apiFetch(`/api/v1/admin/questions/${id}`, { method: "DELETE" });
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return toError(e);
  }
}
