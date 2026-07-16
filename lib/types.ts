export type Confidence = "Low" | "Medium" | "High";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type Section = {
  id: string;
  name: string;
  mono: string;
  accent: string;
};

export type Question = {
  id: string;
  section: string;
  title: string;
  difficulty: Difficulty;
  leetcode: string;
  default_confidence: Confidence;
  default_notes: string;
};

export type Doc = {
  id: string;
  section: string;
  title: string;
  type: string;
  excerpt: string;
  body: string;
  has_image: boolean;
};

export type QuestionState = {
  question_id: string;
  confidence: Confidence | null;
  notes: string | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  role: "member" | "admin";
};

export const DOC_TYPES = [
  "Notes from books",
  "Real interview experience",
  "Best practices",
  "Personal thoughts and solutions",
  "Code examples",
] as const;

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export function confPct(level: Confidence | null | undefined): number {
  return level === "High" ? 1 : level === "Medium" ? 0.55 : 0.2;
}
