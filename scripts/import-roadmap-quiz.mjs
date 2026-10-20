// Usage: node scripts/import-roadmap-quiz.mjs <roadmap-quiz.json> [--category AI]
// Merges multiple-choice questions scraped from a roadmap.sh topic quiz into data/quiz.enc.
//
// Input shape: { topics: { "<Topic name>": [{ q, opts: string[], ans: number, why }] } }
// Each question becomes { id: "RM-<topic>-NN", set: 3, categories: [<group>], skills: [<topic>],
// options: {A..}, answer, explanation }. Options are shuffled with a seed derived from the id, because
// the generator puts the right answer last far more often than chance (about 35% vs 25%).
// Re-running replaces earlier RM-* entries, so it is safe to import a bigger scrape later.
import { readFileSync, writeFileSync } from "node:fs";

const SET = 3;
const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const catIdx = args.indexOf("--category");
const category = catIdx >= 0 ? args[catIdx + 1] : "AI";
if (!input) {
  console.error("usage: node scripts/import-roadmap-quiz.mjs <roadmap-quiz.json> [--category AI]");
  process.exit(1);
}

// Quiz-page filter chips come from `categories`, so group the roadmap topics into a few broad ones.
// A topic missing from this map falls back to --category (default "AI") and is listed after the import.
const GROUPS = {
  "AI Career": ["Introduction", "What is an AI Engineer?", "AI Engineer vs ML Engineer", "Roles and Responsiblities", "Impact on Product Development", "AI vs AGI"],
  "LLM Basics": ["Large Language Model (LLM)", "Inference", "Training", "Pre-trained Models", "Context", "Tokens", "How LLMs Work", "Top-K", "Top-P"],
  Prompting: ["Prompt Engineering", "ReAct", "CoT", "Zero-Shot", "Few-Shot"],
  "AI Safety": ["AI Safety and Ethics", "Prompt Injection Attacks", "Bias and Fairness", "Security and Privacy Concerns", "Conducting adversarial testing", "Content Moderation APIs", "Adding end-user IDs in prompts", "Robust prompt engineering", "Know your Customers / Usecases", "Constraining outputs and inputs"],
  "Models & Providers": ["Anthropic Claude", "Mistral", "Google Gemini", "OpenAI (GPT, o-series)", "Meta Llama", "Cohere", "DeepSeek", "Closed vs Open Source Models", "Hugging Face", "Hugging Face Hub", "Hugging Face Inference SDK", "Transformers.js", "LM Studio", "Ollama", "OpenAI Response API", "Google Gemini APi", "Models on Hugging Face"],
  Embeddings: ["What are Embeddings", "Semantic Search", "Recommendation Systems", "Anomaly Detection", "Data Classification", "Open AI Embeddings API", "Gemini Embedding", "Jina", "Sentence Transformers", "Embedding"],
  "Vector DBs": ["Vector DBs", "Vector Databases", "Purpose and Functionality", "Chroma", "Pinecone", "Weaviate", "FAISS", "Qdrant", "LanceDB", "Supabase", "MongoDB Atlas", "Indexing Embeddings", "Performing Similarity Search", "Vector Database"],
  RAG: ["RAGs", "What are RAGs?", "RAG Usecases", "Chunking", "RAG vs Fine-tuning", "Retrieval Process", "Generation", "Using SDKs Directly", "Langchain", "Llama Index"],
  "AI Agents": ["AI Agents", "Tools & Function Calling", "Agents Usecases", "ReAct Prompting", "Manual Implementation", "OpenAI AgentKit & Agent SDK", "Claude Agent SDK"],
  Multimodal: ["Multimodal AI", "Multimodal AI Usecases", "Image Understanding", "Image Generation", "Audio Processing", "Video Understanding", "Speech-to-Text", "Text-to-Speech", "DALL-E API", "OpenAI Vision API", "Whisper API"],
};
const groupOf = new Map(Object.entries(GROUPS).flatMap(([g, topics]) => topics.map((t) => [t, g])));
const uncategorized = new Set();

const bankUrl = new URL("../data/quiz.enc", import.meta.url);
const bank = JSON.parse(Buffer.from(readFileSync(bankUrl, "utf8").trim(), "base64").toString("utf8"));
const kept = bank.filter((q) => !q.id.startsWith("RM-"));
const known = new Set(kept.map((q) => q.question.trim().toLowerCase()));

const raw = JSON.parse(readFileSync(input, "utf8"));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// mulberry32 seeded from a string, so the shuffle is stable between runs.
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
let number = Math.max(0, ...kept.filter((q) => q.set === SET).map((q) => q.number));
for (const [topic, list] of Object.entries(raw.topics)) {
  list.forEach((q, i) => {
    const text = q.q.trim();
    if (known.has(text.toLowerCase())) return;
    if (!Array.isArray(q.opts) || q.opts.length < 2 || !q.opts[q.ans] || !q.why) return;
    known.add(text.toLowerCase());

    const id = `RM-${slug(topic)}-${String(i + 1).padStart(2, "0")}`;
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
      categories: [groupOf.get(topic) ?? (uncategorized.add(topic), category)],
      skills: [topic],
      question: text,
      options,
      answer,
      explanation: q.why.trim(),
    });
  });
}

const list = [...kept, ...added].sort((a, b) => a.set - b.set || a.number - b.number);
writeFileSync(bankUrl, Buffer.from(JSON.stringify(list), "utf8").toString("base64") + "\n");
if (uncategorized.size) console.log(`no group for: ${[...uncategorized].join(", ")} (used "${category}")`);
console.log(`added ${added.length} questions (${kept.length} existing) -> data/quiz.enc, total ${list.length}`);
