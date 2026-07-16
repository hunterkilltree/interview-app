import {
  effectiveConfidence,
  effectiveNotes,
  getQuestions,
  getQuestionState,
} from "@/lib/data";
import CodingView from "./CodingView";

export default async function CodingPage() {
  const [questions, state] = await Promise.all([
    getQuestions(),
    getQuestionState(),
  ]);

  const rows = questions
    .filter((q) => q.section === "coding")
    .map((q) => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty,
      leetcode: q.leetcode,
      confidence: effectiveConfidence(q, state),
      notes: effectiveNotes(q, state),
    }));

  return <CodingView rows={rows} />;
}
