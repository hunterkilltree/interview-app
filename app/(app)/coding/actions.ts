"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { Confidence } from "@/lib/types";

export async function setConfidence(questionId: string, level: Confidence) {
  await apiFetch(`/api/v1/question-state/${questionId}`, {
    method: "PUT",
    body: JSON.stringify({ confidence: level }),
  });
  revalidatePath("/", "layout");
}

export async function setNotes(questionId: string, notes: string) {
  await apiFetch(`/api/v1/question-state/${questionId}`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });
  revalidatePath("/", "layout");
}
