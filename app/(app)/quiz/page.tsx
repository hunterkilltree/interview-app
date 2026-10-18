import { getDocs, getQuestions } from "@/lib/data";
import QuizView, { type Card } from "./QuizView";

// Every Q&A imported so far becomes a review card: the interview Q&As
// (docs whose title is a question) plus the LeetCode problems with their notes.
export default async function QuizPage() {
  const [docs, questions] = await Promise.all([getDocs(), getQuestions()]);

  const qa: Card[] = docs
    .filter((d) => d.id.startsWith("tb-"))
    .map((d) => ({ id: d.id, section: d.section, question: d.title, answer: d.body }));

  const coding: Card[] = questions.map((q) => ({
    id: q.id,
    section: q.section,
    question: `${q.title} — what is the approach?`,
    answer: q.default_notes,
    link: q.leetcode,
  }));

  return <QuizView cards={[...coding, ...qa]} />;
}
