import { redirect } from "next/navigation";
import { getDocs, getProfile, getQuestions } from "@/lib/data";
import AdminView from "./AdminView";

export default async function AdminPage() {
  const profile = await getProfile();
  if (profile?.role !== "admin") redirect("/");

  const [questions, docs] = await Promise.all([getQuestions(), getDocs()]);
  return <AdminView questions={questions} docs={docs} />;
}
