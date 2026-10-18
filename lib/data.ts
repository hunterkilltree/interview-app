import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Confidence, Difficulty, Doc, Question } from "./types";

// Content lives in plain text files under data/ (see data/questions.txt, data/docs.txt).
const DATA_DIR = path.join(process.cwd(), "data");

async function readData(file: string): Promise<string> {
  return (await readFile(path.join(DATA_DIR, file), "utf8")).replace(/\r\n/g, "\n");
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function getQuestions(): Promise<Question[]> {
  const text = await readData("questions.txt");
  return text
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((line) => {
      const [section, title, difficulty, leetcode, confidence, ...notes] = line
        .split(" | ")
        .map((p) => p.trim());
      return {
        id: slug(title),
        section,
        title,
        difficulty: difficulty as Difficulty,
        leetcode,
        default_confidence: confidence as Confidence,
        default_notes: notes.join(" | "),
      };
    });
}

export async function getDocs(): Promise<Doc[]> {
  const text = await readData("docs.txt");
  const docs: Doc[] = [];
  for (const block of text.split(/^=== /m).slice(1)) {
    const nl = block.indexOf("\n");
    const id = block.slice(0, nl).trim();
    const rest = block.slice(nl + 1);
    const bodyAt = rest.indexOf("\nbody:\n");
    const head = rest.slice(0, bodyAt);
    const body = rest.slice(bodyAt + 7).trim();
    const f: Record<string, string> = {};
    for (const l of head.split("\n")) {
      const i = l.indexOf(":");
      if (i > 0) f[l.slice(0, i).trim()] = l.slice(i + 1).trim();
    }
    docs.push({
      id,
      section: f.section,
      title: f.title,
      type: f.type,
      excerpt: f.excerpt,
      body,
      has_image: f.image === "yes",
    });
  }
  return docs;
}

export async function getDoc(id: string): Promise<Doc | null> {
  return (await getDocs()).find((d) => d.id === id) ?? null;
}
