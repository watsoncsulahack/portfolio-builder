/**
 * Plain-text resume parser — no AI required.
 * Used as a fallback when BOB_API_KEY is not configured.
 * Extracts name, contact info, sections, and bullets from raw text using
 * heuristics that work well on modern single-column PDF/DOCX resumes.
 */

import type { PortfolioData } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function firstLine(text: string) {
  return text.split("\n").find((l) => l.trim().length > 0)?.trim() ?? "";
}

function extractEmail(text: string) {
  return text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] ?? "";
}

function extractPhone(text: string) {
  return text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/)?.[0]?.trim() ?? "";
}

function extractLinkedIn(text: string) {
  return text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i)?.[0] ?? "";
}

function extractGithub(text: string) {
  return text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i)?.[0] ?? "";
}

function extractWebsite(text: string) {
  const m = text.match(/https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[\w.-]+\.[a-z]{2,}[^\s]*/i);
  return m?.[0] ?? "";
}

// Common section heading keywords
const SECTION_PATTERNS: { key: keyof typeof SECTION_MAP; re: RegExp }[] = [
  { key: "experience", re: /^(professional\s+)?experience|work\s+history|employment/i },
  { key: "education", re: /^education/i },
  { key: "projects",  re: /^projects?|personal\s+projects?|side\s+projects?/i },
  { key: "skills",    re: /^(technical\s+)?skills?|core\s+competencies|technologies/i },
  { key: "awards",    re: /^awards?|honors?|achievements?/i },
  { key: "certs",     re: /^certifications?|credentials?|licenses?/i },
];

const SECTION_MAP = {
  experience: true,
  education: true,
  projects: true,
  skills: true,
  awards: true,
  certs: true,
} as const;

type SectionKey = keyof typeof SECTION_MAP;

function splitSections(lines: string[]): Record<SectionKey | "header", string[]> {
  const result: Record<string, string[]> = { header: [] };
  let current = "header";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { result[current].push(line); continue; }

    const matched = SECTION_PATTERNS.find(({ re }) => re.test(trimmed));
    if (matched && trimmed.length < 60) {
      current = matched.key;
      result[current] ??= [];
    } else {
      result[current] ??= [];
      result[current].push(line);
    }
  }

  return result as Record<SectionKey | "header", string[]>;
}

// ── Section parsers ───────────────────────────────────────────────────────────

function parseSkills(lines: string[]): string[] {
  const skills: string[] = [];
  for (const line of lines) {
    const content = line.replace(/^[-•*]\s*/, "").trim();
    if (!content) continue;
    // "Category: skill1, skill2" or just "skill1, skill2"
    const afterColon = content.includes(":") ? content.split(":").slice(1).join(":") : content;
    afterColon
      .split(/[,;|/]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40)
      .forEach((s) => skills.push(s));
  }
  return [...new Set(skills)];
}

function isBullet(line: string) {
  return /^[-•*▪◦·]\s+/.test(line.trim()) || /^\d+[.)]\s+/.test(line.trim());
}

function cleanBullet(line: string) {
  return line.replace(/^[-•*▪◦·]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
}

/**
 * Parse a block of lines into entries that follow the pattern:
 *   <Title/Role>   <Date range>
 *   <Company/Institution>
 *   - bullet
 *   - bullet
 */
function parseEntries(lines: string[]): { header: string[]; bullets: string[] }[] {
  const entries: { header: string[]; bullets: string[] }[] = [];
  let cur: { header: string[]; bullets: string[] } | null = null;

  // Date pattern: "Jan 2020", "2020", "May 2020 – Present", etc.
  const dateRe = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isBullet(trimmed)) {
      (cur ??= { header: [], bullets: [] }).bullets.push(cleanBullet(trimmed));
    } else if (dateRe.test(trimmed) || (cur === null) || (!isBullet(trimmed) && trimmed.length > 0)) {
      // Start a new entry when we see a line that looks like a heading
      if (cur && (cur.header.length > 0 || cur.bullets.length > 0)) {
        entries.push(cur);
      }
      cur = { header: [trimmed], bullets: [] };
    }
  }
  if (cur) entries.push(cur);
  return entries;
}

function parseExperience(lines: string[]): PortfolioData["experience"] {
  const entries = parseEntries(lines);
  return entries.map((e) => {
    const dateRe = /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*\d{4}\b|\bpresent\b)/gi;
    const headerText = e.header.join(" ");
    const dates = headerText.match(dateRe) ?? [];
    return {
      id: newId(),
      role: e.header[0]?.replace(dateRe, "").replace(/[-–—|]\s*$/, "").trim() ?? "",
      company: e.header[1]?.replace(dateRe, "").replace(/[-–—|]\s*$/, "").trim() ?? "",
      startDate: dates[0] ?? "",
      endDate: dates[1] ?? "",
      bullets: e.bullets,
    };
  });
}

function parseEducation(lines: string[]): PortfolioData["education"] {
  const entries = parseEntries(lines);
  return entries.map((e) => {
    const headerText = e.header.join(" ");
    const dateRe = /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*\d{4}\b|\bpresent\b|\bexpected\b\s+\w+\s+\d{4})/gi;
    const dates = headerText.match(dateRe) ?? [];
    const degreeRe = /\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Ph\.?D\.?|A\.?S\.?|A\.?A\.?)/i;
    const degreeMatch = headerText.match(degreeRe);
    return {
      id: newId(),
      institution: e.header[1]?.replace(dateRe, "").trim() ?? e.header[0]?.replace(dateRe, "").trim() ?? "",
      degree: degreeMatch?.[0] ?? "",
      field: e.header[0]?.replace(degreeRe, "").replace(dateRe, "").trim() ?? "",
      startDate: dates[0] ?? "",
      endDate: dates[1] ?? "",
    };
  });
}

function parseProjects(lines: string[]): PortfolioData["projects"] {
  const entries = parseEntries(lines);
  return entries.map((e) => {
    const headerText = e.header[0] ?? "";
    const urlMatch = headerText.match(/https?:\/\/[^\s)]+/);
    const name = headerText
      .replace(/https?:\/\/[^\s)]+/g, "")
      .replace(/[-–—]\s*(github|demo|figma)\s*link/gi, "")
      .replace(/[–—]\s*$/, "")
      .trim();
    return {
      id: newId(),
      name,
      description: e.bullets.join(" "),
      url: urlMatch?.[0] ?? "",
      technologies: [],
    };
  });
}

// ── Main export ───────────────────────────────────────────────────────────────

export function parsePlainText(text: string): Partial<PortfolioData> {
  const lines = text.split("\n");
  const sections = splitSections(lines);
  const headerText = (sections.header ?? []).join("\n");

  const name = firstLine(headerText);
  const email = extractEmail(headerText);
  const phone = extractPhone(headerText);
  const linkedin = extractLinkedIn(headerText);
  const github = extractGithub(headerText);
  const website = extractWebsite(headerText);

  // Try to find location: "City, ST" pattern
  const locationMatch = headerText.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s+[A-Z]{2}/);
  const location = locationMatch?.[0] ?? "";

  return {
    name,
    contact: { email, phone, location, linkedin, github, website },
    experience: parseExperience(sections.experience ?? []),
    education: parseEducation(sections.education ?? []),
    projects: parseProjects(sections.projects ?? []),
    skills: parseSkills(sections.skills ?? []),
    awards: [],
    certifications: [],
    images: [],
  };
}
