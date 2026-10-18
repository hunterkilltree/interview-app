import { getDocs, getQuestions } from "@/lib/data";
import { getMcqQuestions } from "@/lib/quizBank";
import { sectionById } from "@/lib/sections";
import QuizView, { type Card } from "./QuizView";

// Every question collected so far becomes a review card: the interview Q&As,
// the LeetCode problems with their notes, and the private multiple-choice bank
// (decoded server-side from data/quiz.enc).
export default async function QuizPage() {
  const [docs, questions, mcq] = await Promise.all([
    getDocs(),
    getQuestions(),
    getMcqQuestions(),
  ]);

  const qa: Card[] = docs
    .filter((d) => d.id.startsWith("tb-"))
    .map((d) => ({
      id: d.id,
      topic: sectionById(d.section)?.name ?? d.section,
      question: d.title,
      answer: d.body,
    }));

  const coding: Card[] = questions.map((q) => ({
    id: q.id,
    topic: sectionById(q.section)?.name ?? q.section,
    question: `${q.title} — what is the approach?`,
    answer: q.default_notes,
    link: q.leetcode,
  }));

  // A question tagged with several categories shows up under each topic filter.
  const choice: Card[] = mcq.map((m) => ({
    id: m.id,
    topic: m.categories[0],
    topics: m.categories,
    question: m.question,
    options: m.options,
    correct: m.answer,
  }));

  return <QuizView cards={[...coding, ...qa, ...choice]} />;
}
