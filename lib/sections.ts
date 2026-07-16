import type { Section } from "./types";

export const SECTIONS: Section[] = [
  { id: "coding", name: "Coding", mono: "CD", accent: "var(--accent-coding)" },
  { id: "sysdesign", name: "System Design", mono: "SD", accent: "var(--accent-sysdesign)" },
  { id: "microservices", name: "Microservices", mono: "MS", accent: "var(--accent-microservices)" },
  { id: "k8s", name: "Kubernetes & Docker", mono: "K8", accent: "var(--accent-k8s)" },
  { id: "aws", name: "AWS", mono: "AW", accent: "var(--accent-aws)" },
  { id: "java", name: "Java", mono: "JV", accent: "var(--accent-java)" },
  { id: "spring", name: "Spring Boot", mono: "SB", accent: "var(--accent-spring)" },
  { id: "frontend", name: "Frontend (Next.js)", mono: "FE", accent: "var(--accent-frontend)" },
];

export function sectionById(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}
