import type { PortfolioData, ExperienceEntry, EducationEntry, ProjectEntry } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Strip all LaTeX commands and braces, returning plain text */
function plain(tex: string): string {
  return tex
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")   // \href{url}{text} → text
    .replace(/\\textbf\{([^}]*)\}/g, "$1")            // \textbf{x} → x
    .replace(/\\textit\{([^}]*)\}/g, "$1")            // \textit{x} → x
    .replace(/\\emph\{([^}]*)\}/g, "$1")
    .replace(/\\large/g, "")
    .replace(/\\bfseries/g, "")
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, "")             // remaining single-arg commands
    .replace(/\\[a-zA-Z]+/g, "")                       // bare commands
    .replace(/\{|\}/g, "")
    .replace(/---?/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract href URL from \href{URL}{text} */
function extractUrl(tex: string): string | undefined {
  const m = tex.match(/\\href\{([^}]+)\}/);
  return m ? m[1].trim() : undefined;
}

/** Extract itemize bullets between \begin{itemize} and \end{itemize} */
function extractBullets(block: string): string[] {
  const inner = block.match(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/);
  if (!inner) return [];
  return inner[1]
    .split(/\\item/)
    .slice(1)
    .map((s) => plain(s.replace(/\n/g, " ")))
    .filter(Boolean);
}

/**
 * Parse a LaTeX resume that uses:
 *   \ressection{Name}
 *   \textbf{Title}\hfill Dates
 *   \textit{Company}
 *   \begin{itemize} \item ... \end{itemize}
 */
export function parseTex(source: string): Partial<PortfolioData> {
  // Strip line comments
  const tex = source.replace(/%.*$/gm, "").replace(/\r\n/g, "\n");

  const result: Partial<PortfolioData> = {
    name: "",
    title: "",
    bio: "",
    contact: { email: "" },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    awards: [],
    certifications: [],
    images: [],
  };

  // ── Name & contact (from \begin{center}...\end{center}) ──────────────────
  const centerBlock = tex.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  if (centerBlock) {
    const cb = centerBlock[1];
    // Name is usually in a large/bfseries font size command or just the first text
    const nameMatch = cb.match(/\\bfseries\s+([^\\\n{]+)/i)
      || cb.match(/selectfont\\bfseries\s+([^\\\n{]+)/i)
      || cb.match(/\{[^}]*\\bfseries\s*([^}\\]+)/i);
    if (nameMatch) result.name = nameMatch[1].trim();

    // Email
    const emailMatch = cb.match(/\\href\{mailto:([^}]+)\}/i)
      || cb.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) result.contact = { ...result.contact!, email: emailMatch[1].trim() };

    // Phone
    const phoneMatch = cb.match(/([0-9]{3}[-.\s][0-9]{3}[-.\s][0-9]{4})/);
    if (phoneMatch) result.contact = { ...result.contact!, phone: phoneMatch[1].trim() };

    // LinkedIn
    const linkedinMatch = cb.match(/linkedin\.com\/in\/([\w\-]+)/i);
    if (linkedinMatch) result.contact = { ...result.contact!, linkedin: `https://linkedin.com/in/${linkedinMatch[1]}` };

    // GitHub
    const githubMatch = cb.match(/github\.com\/([\w\-]+)/i);
    if (githubMatch) result.contact = { ...result.contact!, github: `https://github.com/${githubMatch[1]}` };
  }

  // ── Split into sections by \ressection{...} ───────────────────────────────
  const sectionRe = /\\ressection\{([^}]+)\}/g;
  const sections: { name: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(tex)) !== null) {
    sections.push({ name: m[1].toLowerCase().trim(), index: m.index });
  }

  for (let i = 0; i < sections.length; i++) {
    const { name, index } = sections[i];
    const end = sections[i + 1]?.index ?? tex.length;
    const body = tex.slice(index, end);

    if (/education/.test(name)) {
      result.education = parseEducation(body);
    } else if (/experience|employment|work/.test(name)) {
      result.experience = parseExperience(body);
    } else if (/project/.test(name)) {
      result.projects = parseProjects(body);
    } else if (/skill/.test(name)) {
      result.skills = parseSkills(body);
    } else if (/summary|objective|about|profile/.test(name)) {
      result.bio = plain(body.replace(/\\ressection\{[^}]+\}/, "")).trim();
    }
  }

  return result;
}

// ── Education ────────────────────────────────────────────────────────────────
// Pattern: \textbf{Degree}\hfill Date\\ Institution
function parseEducation(body: string): EducationEntry[] {
  const entries: EducationEntry[] = [];

  // Each entry starts with \textbf{...}\hfill
  const entryRe = /\\textbf\{([^}]+)\}[ \t]*\\hfill[ \t]*([^\n\\]+)([\s\S]*?)(?=\\textbf\{|$)/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(body)) !== null) {
    const degree = plain(m[1]);
    const dateStr = plain(m[2]);
    const rest = m[3];

    // Institution is the first non-empty line after the degree line
    const institutionMatch = rest.match(/^\s*([A-Za-z][^\\\n]{3,})/m);
    const institution = institutionMatch ? plain(institutionMatch[1]) : "";

    // Try to split degree into degree + field
    const degreeField = degree.match(/^(B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|A\.?S\.?)\s+(.+)/i);

    entries.push({
      id: newId(),
      institution,
      degree: degreeField ? degreeField[1] : degree,
      field: degreeField ? degreeField[2] : "",
      startDate: "",
      endDate: dateStr.replace(/expected\s*/i, "").trim(),
    });
  }
  return entries;
}

// ── Experience ───────────────────────────────────────────────────────────────
// Pattern: \textbf{Role}\hfill Dates\\ \textit{Company}
function parseExperience(body: string): ExperienceEntry[] {
  const entries: EducationEntry[] = [];
  const result: ExperienceEntry[] = [];

  // Split on \textbf entries that have \hfill (role + date lines)
  const entryRe = /\\textbf\{([^}]+)\}[ \t]*\\hfill[ \t]*([^\n]+)([\s\S]*?)(?=\\textbf\{[^}]+\}[ \t]*\\hfill|$)/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(body)) !== null) {
    const role = plain(m[1]);
    const dateStr = plain(m[2]);
    const rest = m[3];

    // Company: first \textit{} in rest, or first italics-looking line
    const companyMatch = rest.match(/\\textit\{([^}]+)\}/)
      || rest.match(/\\emph\{([^}]+)\}/);
    const company = companyMatch ? plain(companyMatch[1]) : "";

    // Date range
    const dateParts = dateStr.split(/--|–|—|to/i).map((s) => s.trim());
    const startDate = dateParts[0] || "";
    const endDate = dateParts[1] || "Present";

    const bullets = extractBullets(rest);

    result.push({ id: newId(), company, role, startDate, endDate, bullets });
  }
  void entries;
  return result;
}

// ── Projects ─────────────────────────────────────────────────────────────────
// Pattern: \textbf{Name} - \href{...}{Link} or just \textbf{Name}
function parseProjects(body: string): ProjectEntry[] {
  const result: ProjectEntry[] = [];

  // Split on \textbf entries
  const entryRe = /\\textbf\{([^}]+)\}([\s\S]*?)(?=\\textbf\{|$)/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(body)) !== null) {
    const rawTitle = m[1];
    const rest = m[2];

    // Skip if this looks like a Skills line (e.g. \textbf{UI/UX Design:})
    if (/:\s*$/.test(rawTitle)) continue;

    const name = plain(rawTitle);

    // Extract all URLs from the title line (before first newline)
    const titleLine = rest.split("\n")[0];
    const urls: string[] = [];
    const hrefRe = /\\href\{([^}]+)\}/g;
    let hm: RegExpExecArray | null;
    while ((hm = hrefRe.exec(rawTitle + titleLine)) !== null) {
      urls.push(hm[1]);
    }

    const bullets = extractBullets(rest);
    const description = bullets.join(" ");

    // Extract tech from \hfill label (e.g. \hfill\textit{Graduate Project})
    const hfillMatch = rest.match(/\\hfill[\s\\]*\\textit\{([^}]+)\}/);
    const label = hfillMatch ? plain(hfillMatch[1]) : "";

    result.push({
      id: newId(),
      name,
      description,
      url: urls[1] || urls[0],  // prefer demo link over design process link
      technologies: label ? [label] : [],
    });
  }
  return result;
}

// ── Skills ───────────────────────────────────────────────────────────────────
// Pattern: \textbf{Category:} skill, skill, skill\\
function parseSkills(body: string): string[] {
  const skills: string[] = [];

  // Each skill line: \textbf{Category:} items
  const lineRe = /\\textbf\{[^}]+:?\}[:\s]*([^\n\\]+)/g;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(body)) !== null) {
    const items = plain(m[1])
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);
    skills.push(...items);
  }
  return [...new Set(skills)];
}
