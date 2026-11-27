/**
 * Plain-text resume parser — no AI required.
 * Used as a fallback when BOB_API_KEY is not configured.
 *
 * Handles the common quirks that pdf-parse produces:
 * - Right-aligned dates concatenated with preceding text: "Mechanical EngineerFebruary 2021"
 * - Hyphenated line-break words: "ac-\ncount" → "account"
 * - No space between degree/role name and month/year: "M.S. Information SystemsExpected May 2027"
 */

import type { PortfolioData } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Pre-processing ────────────────────────────────────────────────────────────

/**
 * Inject a space before a month name or "Expected" that is directly
 * concatenated onto the previous word (no preceding space).
 * e.g. "Mechanical EngineerFebruary 2021" → "Mechanical Engineer February 2021"
 *      "M.S. Information SystemsExpected May 2027" → "M.S. Information Systems Expected May 2027"
 */
const MONTH_OR_EXPECTED = /(?<=[a-zA-Z.])(January|February|March|April|May|June|July|August|September|October|November|December|Expected)/g;

function fixMergedDates(text: string): string {
  return text.replace(MONTH_OR_EXPECTED, " $1");
}

/** Rejoin hyphenated line-breaks: "ac-\ncount" → "account" */
function rejoinHyphens(text: string): string {
  return text.replace(/-\n(\s*)/g, "");
}

function preprocess(raw: string): string {
  return fixMergedDates(rejoinHyphens(raw));
}

// ── Contact extraction ────────────────────────────────────────────────────────

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

// ── Section splitting ─────────────────────────────────────────────────────────

const SECTION_PATTERNS: { key: SectionKey; re: RegExp }[] = [
  { key: "experience", re: /^(professional\s+)?experience|work\s+history|employment/i },
  { key: "education",  re: /^education/i },
  { key: "projects",   re: /^projects?|personal\s+projects?|side\s+projects?/i },
  { key: "skills",     re: /^(technical\s+)?skills?|core\s+competencies|technologies/i },
  { key: "awards",     re: /^awards?|honors?|achievements?/i },
  { key: "certs",      re: /^certifications?|credentials?|licenses?/i },
];

type SectionKey = "experience" | "education" | "projects" | "skills" | "awards" | "certs";

function splitSections(lines: string[]): Partial<Record<SectionKey | "header", string[]>> {
  const result: Partial<Record<SectionKey | "header", string[]>> = { header: [] };
  let current: SectionKey | "header" = "header";

  for (const line of lines) {
    const trimmed = line.trim();
    // A section heading: short line that matches a known keyword
    if (trimmed.length > 0 && trimmed.length < 60) {
      const matched = SECTION_PATTERNS.find(({ re }) => re.test(trimmed));
      if (matched) {
        current = matched.key;
        result[current] ??= [];
        continue; // skip the heading line itself
      }
    }
    (result[current] ??= []).push(line);
  }

  return result;
}

// ── Shared entry helpers ──────────────────────────────────────────────────────

function isBullet(line: string) {
  return /^[•\-*▪◦·]\s+/.test(line.trim()) || /^\d+[.)]\s+/.test(line.trim());
}

function cleanBullet(line: string) {
  return line.replace(/^[•\-*▪◦·]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
}

/**
 * Heuristically determine if a line looks like an entry header (role, company,
 * institution, project name) rather than a bullet or body text.
 * We treat lines that are NOT bullets and are reasonably short as headers.
 */
function isEntryHeader(line: string) {
  if (!line.trim()) return false;
  if (isBullet(line)) return false;
  return line.trim().length < 120;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const DATE_RE = /\b((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4}|expected\s+\w+\s+\d{4}|present)\b/gi;

function extractDates(text: string): string[] {
  return Array.from(text.matchAll(DATE_RE)).map((m) => m[0].trim());
}

function stripDates(text: string): string {
  return text.replace(DATE_RE, "").replace(/[–—]\s*$/, "").replace(/\s{2,}/g, " ").trim();
}

// ── Experience parser ─────────────────────────────────────────────────────────

function parseExperience(lines: string[]): PortfolioData["experience"] {
  const entries: PortfolioData["experience"][number][] = [];
  let role = "";
  let company = "";
  let startDate = "";
  let endDate = "";
  let bullets: string[] = [];

  function flush() {
    if (role || company) {
      entries.push({ id: newId(), role, company, startDate, endDate, bullets });
    }
    role = ""; company = ""; startDate = ""; endDate = ""; bullets = [];
  }

  let headerCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isBullet(trimmed)) {
      bullets.push(cleanBullet(trimmed));
      headerCount = 0;
    } else if (isEntryHeader(trimmed)) {
      const dates = extractDates(trimmed);
      const bare = stripDates(trimmed);

      if (dates.length > 0) {
        // Line contains a date → it's the role line or a combined role+date line
        // Start a new entry
        flush();
        startDate = dates[0] ?? "";
        endDate = dates[1] ?? "";
        role = bare;
        headerCount = 1;
      } else if (headerCount === 1) {
        // Second header line after the role → company name
        company = bare;
        headerCount = 2;
      } else {
        // No date, not second header — start a new entry with this as the role
        flush();
        role = bare;
        headerCount = 1;
      }
    }
  }
  flush();
  return entries;
}

// ── Education parser ──────────────────────────────────────────────────────────

function parseEducation(lines: string[]): PortfolioData["education"] {
  const entries: PortfolioData["education"][number][] = [];
  let degree = "";
  let field = "";
  let institution = "";
  let startDate = "";
  let endDate = "";

  function flush() {
    if (institution || degree) {
      entries.push({ id: newId(), institution, degree, field, startDate, endDate });
    }
    degree = ""; field = ""; institution = ""; startDate = ""; endDate = "";
  }

  const DEGREE_RE = /\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Ph\.?D\.?|A\.?S\.?|A\.?A\.?)/i;
  let headerCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isBullet(trimmed)) continue;

    const dates = extractDates(trimmed);
    const bare = stripDates(trimmed);
    const degreeMatch = bare.match(DEGREE_RE);

    if (degreeMatch || dates.length > 0) {
      // Degree/date line → start new entry
      flush();
      degree = degreeMatch?.[0] ?? "";
      field = bare.replace(DEGREE_RE, "").replace(/^[.\s]+/, "").trim();
      startDate = dates[0] ?? "";
      endDate = dates[1] ?? "";
      headerCount = 1;
    } else if (headerCount === 1) {
      // Institution line
      institution = bare;
      headerCount = 2;
    } else {
      flush();
      field = bare;
      headerCount = 1;
    }
  }
  flush();
  return entries;
}

// ── Projects parser ───────────────────────────────────────────────────────────

function parseProjects(lines: string[]): PortfolioData["projects"] {
  const entries: PortfolioData["projects"][number][] = [];
  let name = "";
  let bullets: string[] = [];
  let url = "";

  function flush() {
    if (name) {
      entries.push({
        id: newId(),
        name,
        description: bullets.join(" "),
        url,
        technologies: [],
      });
    }
    name = ""; bullets = []; url = "";
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isBullet(trimmed)) {
      bullets.push(cleanBullet(trimmed));
    } else {
      flush();
      const urlMatch = trimmed.match(/https?:\/\/[^\s)]+/);
      url = urlMatch?.[0] ?? "";
      // Strip link labels like "- Figma Link", "- GitHub Link / Demo"
      name = trimmed
        .replace(/https?:\/\/[^\s)]+/g, "")
        .replace(/[-–—]\s*(figma|github|demo|link)[^-–—]*/gi, "")
        .replace(/[-–—]\s*$/, "")
        .trim();
    }
  }
  flush();
  return entries;
}

// ── Skills parser ─────────────────────────────────────────────────────────────

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
      .filter((s) => s.length > 1 && s.length < 50)
      .forEach((s) => skills.push(s));
  }
  return [...new Set(skills)];
}

// ── Main export ───────────────────────────────────────────────────────────────

export function parsePlainText(raw: string): Partial<PortfolioData> {
  const text = preprocess(raw);
  const lines = text.split("\n");
  const sections = splitSections(lines);
  const headerText = (sections.header ?? []).join("\n");

  const name = firstLine(headerText);
  const email = extractEmail(headerText);
  const phone = extractPhone(headerText);
  const linkedin = extractLinkedIn(headerText);
  const github = extractGithub(headerText);
  const website = extractWebsite(headerText);
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
