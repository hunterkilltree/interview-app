"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Admin access required");
  return supabase;
}

export type SaveResult = { error?: string };

export async function saveDoc(input: {
  id?: string;
  section: string;
  title: string;
  type: string;
  excerpt: string;
  body: string;
}): Promise<SaveResult> {
  try {
    const supabase = await requireAdmin();
    const row = {
      section: input.section,
      title: input.title,
      type: input.type,
      excerpt: input.excerpt,
      body: input.body,
    };
    const { error } = input.id
      ? await supabase.from("docs").update(row).eq("id", input.id)
      : await supabase.from("docs").insert(row);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function deleteDoc(id: string): Promise<SaveResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("docs").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
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
    const supabase = await requireAdmin();
    const row = {
      section: input.section,
      title: input.title,
      difficulty: input.difficulty,
      leetcode: input.leetcode,
    };
    const { error } = input.id
      ? await supabase.from("questions").update(row).eq("id", input.id)
      : await supabase.from("questions").insert(row);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function deleteQuestion(id: string): Promise<SaveResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
