import { readFile } from "node:fs/promises";
import path from "node:path";

export type McqQuestion = {
  id: string;
  set: number;
  number: number;
  categories: string[];
  skills: string[];
  question: string;
  options: Record<string, string>;
  /** Optional answer key letter; the source bank ships without one. */
  answer?: string;
};

/**
 * Decodes the private multiple-choice bank from data/quiz.enc (base64,
 * produced by scripts/encode-quiz.mjs). Runs on the server only; the raw
 * question file is never stored in the repo. Returns [] if the file is absent.
 */
export async function getMcqQuestions(): Promise<McqQuestion[]> {
  try {
    const encoded = await readFile(path.join(process.cwd(), "data", "quiz.enc"), "utf8");
    const json = Buffer.from(encoded.trim(), "base64").toString("utf8");
    return JSON.parse(json) as McqQuestion[];
  } catch {
    return [];
  }
}
