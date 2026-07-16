"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Confidence } from "@/lib/types";

async function upsertState(
  questionId: string,
  patch: { confidence?: Confidence; notes?: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("question_state").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      ...patch,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_id" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function setConfidence(questionId: string, level: Confidence) {
  await upsertState(questionId, { confidence: level });
}

export async function setNotes(questionId: string, notes: string) {
  await upsertState(questionId, { notes });
}
