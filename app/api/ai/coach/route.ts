import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI coach is not configured. Set ANTHROPIC_API_KEY to enable it." },
      { status: 503 }
    );
  }

  let body: { questionId?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!body.questionId) {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const { data: question } = await supabase
    .from("questions")
    .select("title, difficulty, section")
    .eq("id", body.questionId)
    .single();
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const { data: state } = await supabase
    .from("question_state")
    .select("confidence")
    .eq("user_id", user.id)
    .eq("question_id", body.questionId)
    .maybeSingle();

  const anthropic = new Anthropic();
  const notes = (body.notes ?? "").slice(0, 4000);

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 600,
    system:
      "You are an interview-prep coach. Be concise and practical. " +
      "Given a LeetCode-style problem, the user's self-rated confidence, and their notes, " +
      "give 3-5 short, concrete coaching tips: the key pattern/approach to remember, " +
      "common pitfalls, and what to practice next. Plain text, no markdown headers.",
    messages: [
      {
        role: "user",
        content: `Problem: ${question.title} (${question.difficulty})\nMy confidence: ${state?.confidence ?? "not set"}\nMy notes: ${notes || "(none)"}`,
      },
    ],
  });

  const advice = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return NextResponse.json({ advice });
}
