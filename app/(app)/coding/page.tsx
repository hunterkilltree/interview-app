import { getQuestions } from "@/lib/data";
import CodingView from "./CodingView";

export default async function CodingPage() {
  const questions = await getQuestions();
  return <CodingView questions={questions.filter((q) => q.section === "coding")} />;
}
