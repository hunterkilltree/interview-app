import { getDocs, getQuestions } from "@/lib/data";
import DashboardView from "./DashboardView";

export default async function DashboardPage() {
  const [questions, docs] = await Promise.all([getQuestions(), getDocs()]);
  return <DashboardView questions={questions} docs={docs} />;
}
