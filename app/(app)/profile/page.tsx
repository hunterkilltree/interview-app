import { getQuestions } from "@/lib/data";
import ProfileView from "./ProfileView";

export default async function ProfilePage() {
  return <ProfileView questions={await getQuestions()} />;
}
