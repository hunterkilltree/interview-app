// Usage: node scripts/encode-quiz.mjs <path-to-raw-quiz.json>
// Flattens the private question bank (questions that sit under several categories
// are merged by id), base64-encodes it into data/quiz.enc.
// The raw JSON is never committed; lib/quizBank.ts decodes data/quiz.enc on the server.
import { readFileSync, writeFileSync } from "node:fs";

const input = process.argv[2];
if (!input) {
  console.error("usage: node scripts/encode-quiz.mjs <raw.json>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(input, "utf8"));
const byId = new Map();
for (const [category, group] of Object.entries(raw.categories)) {
  for (const q of group.questions) {
    const prev = byId.get(q.id);
    const categories = new Set([...(prev?.categories ?? []), ...(q.categories ?? [category])]);
    byId.set(q.id, {
      id: q.id,
      set: q.set,
      number: q.number,
      categories: [...categories],
      skills: q.skills ?? [],
      question: q.question,
      options: q.options,
      ...(q.answer ? { answer: q.answer } : {}),
    });
  }
}

const list = [...byId.values()].sort((a, b) => a.set - b.set || a.number - b.number);
const encoded = Buffer.from(JSON.stringify(list), "utf8").toString("base64");
writeFileSync(new URL("../data/quiz.enc", import.meta.url), encoded + "\n");
console.log(`encoded ${list.length} questions -> data/quiz.enc (${encoded.length} chars)`);
