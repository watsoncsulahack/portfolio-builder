import matter from "gray-matter";
import type { PortfolioData, ExperienceEntry, EducationEntry, ProjectEntry } from "../types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Parse a Markdown resume into PortfolioData.
 * Supports gray-matter front matter for contact info.
 * Section headings (## Experience, ## Education, etc.) map to portfolio sections.
 */
export function parseMd(source: string): Partial<PortfolioData> {
  const { data: frontMatter, content } = matter(source);

  const result: Partial<PortfolioData> = {
    name: frontMatter.name || frontMatter.full_name || "",
    title: frontMatter.title || frontMatter.position || "",
    bio: frontMatter.summary || frontMatter.bio || "",
    contact: {
      email: frontMatter.email || "",
      phone: frontMatter.phone,
      location: frontMatter.location,
      linkedin: frontMatter.linkedin,
      github: frontMatter.github,
      website: frontMatter.website || frontMatter.portfolio,
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    awards: [],
    certifications: [],
    images: [],
  };

  // Split content into sections by ## headings
  const sectionRegex = /^##\s+(.+)$/gm;
  const positions: { name: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = sectionRegex.exec(content)) !== null) {
    positions.push({ name: m[1].toLowerCase().trim(), index: m.index });
  }

  // Also check for the first # heading as the name if not in front matter
  if (!result.name) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) result.name = h1Match[1].trim();
  }

  for (let i = 0; i < positions.length; i++) {
    const { name, index } = positions[i];
    const end = positions[i + 1]?.index ?? content.length;
    const body = content.slice(index, end);

    if (/experience|work/.test(name)) {
      result.experience = parseMdExperience(body);
    } else if (/education/.test(name)) {
      result.education = parseMdEducation(body);
    } else if (/project/.test(name)) {
      result.projects = parseMdProjects(body);
    } else if (/skill/.test(name)) {
      result.skills = parseMdSkills(body);
    } else if (/summary|about|objective/.test(name)) {
      result.bio = extractBodyText(body).trim();
    } else if (/award/.test(name)) {
      // Simple: treat each ### heading as an award
      result.awards = parseMdAwards(body);
    } else if (/cert/.test(name)) {
      result.certifications = parseMdCerts(body);
    }
  }

  return result;
}

function extractBodyText(section: string): string {
  // Remove the heading line and return plain text
  return section.replace(/^##.+$/m, "").trim();
}

function parseMdExperience(body: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  // ### Company — Role | Dates
  const subRegex = /^###\s+(.+)$/gm;
  const positions: { text: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = subRegex.exec(body)) !== null) {
    positions.push({ text: m[1], index: m.index });
  }
  for (let i = 0; i < positions.length; i++) {
    const { text, index } = positions[i];
    const end = positions[i + 1]?.index ?? body.length;
    const entryBody = body.slice(index, end);

    // Parse "Company — Role | Jan 2020 – Present" or "Role @ Company (dates)"
    let company = "";
    let role = "";
    let startDate = "";
    let endDate = "Present";

    const dateMatch = text.match(/\|?\s*([\w\s.]+\d{4})\s*[–-]\s*([\w\s.]+\d{4}|Present)/i);
    if (dateMatch) {
      startDate = dateMatch[1].trim();
      endDate = dateMatch[2].trim();
    }
    const withoutDate = text.replace(/\|.+$/, "").replace(/\(.+\)/, "").trim();
    const parts = withoutDate.split(/[—@|]/);
    company = (parts[0] || "").trim();
    role = (parts[1] || "").trim();

    const bullets = extractBullets(entryBody);
    entries.push({ id: newId(), company, role, startDate, endDate, bullets });
  }
  return entries;
}

function parseMdEducation(body: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const subRegex = /^###\s+(.+)$/gm;
  const positions: { text: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = subRegex.exec(body)) !== null) {
    positions.push({ text: m[1], index: m.index });
  }
  for (let i = 0; i < positions.length; i++) {
    const { text, index } = positions[i];
    const end = positions[i + 1]?.index ?? body.length;
    const entryBody = body.slice(index, end);

    let institution = text.trim();
    let degree = "";
    let field = "";
    let startDate = "";
    let endDate = "";

    const degreeMatch = entryBody.match(/\*\*([^*]+)\*\*/);
    if (degreeMatch) degree = degreeMatch[1].trim();
    const dateMatch = text.match(/([\d]{4})\s*[–-]\s*([\d]{4}|Present)/i);
    if (dateMatch) {
      startDate = dateMatch[1];
      endDate = dateMatch[2];
    }
    // Check for a "Field: ..." line
    const fieldMatch = entryBody.match(/(?:field|major|concentration)[:\s]+([^\n]+)/i);
    if (fieldMatch) field = fieldMatch[1].trim();

    entries.push({ id: newId(), institution, degree, field, startDate, endDate });
  }
  return entries;
}

function parseMdProjects(body: string): ProjectEntry[] {
  const entries: ProjectEntry[] = [];
  const subRegex = /^###\s+(.+)$/gm;
  const positions: { text: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = subRegex.exec(body)) !== null) {
    positions.push({ text: m[1], index: m.index });
  }
  for (let i = 0; i < positions.length; i++) {
    const { text, index } = positions[i];
    const end = positions[i + 1]?.index ?? body.length;
    const entryBody = body.slice(index, end);

    const name = text.replace(/\[([^\]]+)\]\([^)]+\)/, "$1").trim();
    const urlMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const url = urlMatch ? urlMatch[2] : undefined;

    // Description is the first non-heading paragraph
    const descMatch = entryBody.replace(/^###.+$/m, "").trim().match(/^([^-\n][^\n]+)/m);
    const description = descMatch ? descMatch[1].trim() : "";

    // Technologies from a "**Tech:** ..." line or backtick list
    const techMatch = entryBody.match(/(?:tech(?:nologies)?|stack|built with)[:\s]+([^\n]+)/i);
    const technologies = techMatch
      ? techMatch[1].split(/[,|]/).map((s) => s.replace(/`/g, "").trim()).filter(Boolean)
      : [];

    entries.push({ id: newId(), name, description, url, technologies });
  }
  return entries;
}

function parseMdSkills(body: string): string[] {
  const skills: string[] = [];
  // Handle both bulleted lists and comma-separated lines
  const lines = body.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  for (const line of lines) {
    const stripped = line.replace(/^[-*+]\s*/, "").replace(/\*\*[^*]+\*\*:?\s*/g, "");
    const parts = stripped.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
    skills.push(...parts);
  }
  return [...new Set(skills)];
}

function parseMdAwards(body: string): PortfolioData["awards"] {
  const awards: PortfolioData["awards"] = [];
  const subRegex = /^###\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = subRegex.exec(body)) !== null) {
    awards.push({ id: newId(), name: m[1].trim(), issuer: "", date: "" });
  }
  return awards;
}

function parseMdCerts(body: string): PortfolioData["certifications"] {
  const certs: PortfolioData["certifications"] = [];
  const subRegex = /^###\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = subRegex.exec(body)) !== null) {
    certs.push({ id: newId(), name: m[1].trim(), issuer: "", date: "" });
  }
  return certs;
}

function extractBullets(body: string): string[] {
  return body
    .split("\n")
    .filter((l) => /^[-*+]\s/.test(l.trim()))
    .map((l) => l.replace(/^[-*+]\s*/, "").trim())
    .filter(Boolean);
}
