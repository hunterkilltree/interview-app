// Usage: node scripts/import-ai-skills-quiz.mjs <ai-skills.raw.json>...
// Merges the hand-written AI skills question set into data/quiz.enc. Several input files are merged in order.
//
// Input shape: { categories: { "<Category>": { code: "FUND", questions: [{ skill, q, opts: string[], ans: number, why }] } } }
// Each question becomes { id: "AS-<code>-NN", set: 4, categories: [<Category>], skills: [skill], options: {A..},
// answer, explanation }. Options are shuffled with a seed derived from the id, so the answer letter is spread evenly
// however the source was written. Re-running replaces earlier AS-* entries, so the set can be edited and re-imported.
import { readFileSync, writeFileSync } from "node:fs";

const SET = 4;
const inputs = process.argv.slice(2);
if (!inputs.length) {
  console.error("usage: node scripts/import-ai-skills-quiz.mjs <ai-skills.raw.json>...");
  process.exit(1);
}

const bankUrl = new URL("../data/quiz.enc", import.meta.url);
const bank = JSON.parse(Buffer.from(readFileSync(bankUrl, "utf8").trim(), "base64").toString("utf8"));
const kept = bank.filter((q) => !q.id.startsWith("AS-"));
const known = new Set(kept.map((q) => q.question.trim().toLowerCase()));
const ids = new Set(kept.map((q) => q.id));

// mulberry32 seeded from a string, so the shuffle is stable between runs (same as import-roadmap-quiz.mjs).
function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const added = [];
const skipped = [];
let number = Math.max(0, ...kept.filter((q) => q.set === SET).map((q) => q.number));
for (const input of inputs) {
  const raw = JSON.parse(readFileSync(input, "utf8"));
  for (const [category, { code, questions }] of Object.entries(raw.categories)) {
    questions.forEach((q, i) => {
      const id = `AS-${code}-${String(i + 1).padStart(2, "0")}`;
      const text = q.q.trim();
      // Hand-written content, so report what is dropped instead of skipping silently.
      if (ids.has(id)) return skipped.push(`${id} (duplicate id)`);
      if (known.has(text.toLowerCase())) return skipped.push(`${id} (duplicate question)`);
      if (!Array.isArray(q.opts) || q.opts.length < 2 || !q.opts[q.ans] || !q.why) return skipped.push(`${id} (incomplete)`);
      ids.add(id);
      known.add(text.toLowerCase());

      const rand = rng(id);
      const order = q.opts.map((_, k) => k);
      for (let k = order.length - 1; k > 0; k--) {
        const j = Math.floor(rand() * (k + 1));
        [order[k], order[j]] = [order[j], order[k]];
      }
      const options = {};
      order.forEach((orig, pos) => (options[String.fromCharCode(65 + pos)] = q.opts[orig].trim()));
      const answer = String.fromCharCode(65 + order.indexOf(q.ans));

      added.push({
        id,
        set: SET,
        number: ++number,
        categories: [category],
        skills: q.skill ? [q.skill] : [],
        question: text,
        options,
        answer,
        explanation: q.why.trim(),
      });
    });
  }
}

const list = [...kept, ...added].sort((a, b) => a.set - b.set || a.number - b.number);
writeFileSync(bankUrl, Buffer.from(JSON.stringify(list), "utf8").toString("base64") + "\n");
if (skipped.length) console.log(`skipped: ${skipped.join(", ")}`);
console.log(`added ${added.length} questions (${kept.length} existing) -> data/quiz.enc, total ${list.length}`);
