import { NextResponse } from "next/server";
import { ApiRequestError, apiFetch } from "@/lib/api";

/** Proxies the AI coach call to the Spring Boot API with the user's JWT. */
export async function POST(request: Request) {
  let body: { questionId?: string; notes?: string; confidence?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!body.questionId) {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  try {
    const data = await apiFetch<{ advice: string }>("/api/v1/ai/coach", {
      method: "POST",
      body: JSON.stringify({
        questionId: body.questionId,
        notes: body.notes ?? "",
        confidence: body.confidence ?? null,
      }),
    });
    return NextResponse.json({ advice: data.advice });
  } catch (e) {
    if (e instanceof ApiRequestError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "AI coach unavailable" }, { status: 502 });
  }
}
