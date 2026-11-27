import { execFile } from "child_process";
import { promisify } from "util";
import type { PortfolioData } from "@/lib/types";

const execFileAsync = promisify(execFile);

/**
 * Run a prompt through Bob Shell non-interactively.
 * Requires BOB_API_KEY to be set in the environment.
 * Returns the assistant's last message text.
 */
async function runBob(prompt: string, maxTokens = 2000): Promise<string> {
  const bobPath = process.env.BOB_PATH || "bob";
  try {
    const { stdout } = await execFileAsync(
      bobPath,
      ["run", "--format", "stream-json", prompt],
      {
        env: { ...process.env },
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 60_000,
      }
    );

    // stream-json emits NDJSON — find the last "result" event
    const lines = stdout.trim().split("\n").filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const event = JSON.parse(lines[i]);
        if (event.type === "result" && event.last_message) {
          return event.last_message;
        }
        // Also look for the last assistant message event
        if (event.type === "message" && event.role === "assistant" && event.content) {
          return typeof event.content === "string"
            ? event.content
            : event.content.map((c: { text?: string }) => c.text ?? "").join("");
        }
      } catch {
        // skip non-JSON lines
      }
    }
    // Fallback: return all stdout
    return stdout;
  } catch (err) {
    throw new Error(`Bob Shell error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function safeParseJson<T>(text: string, fallback: T): T {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[1] ?? match[0]) as T;
  } catch {
    return fallback;
  }
}

/**
 * Ask Bob to extract structured PortfolioData from raw document text.
 * Used for .pdf and .docx files.
 */
export async function extractStructuredData(rawText: string): Promise<Partial<PortfolioData>> {
  const prompt = `You are a resume parser. Extract the following JSON from this resume. Return ONLY the JSON object, nothing else.

{
  "name": "",
  "title": "",
  "contact": { "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "website": "" },
  "experience": [{ "id": "1", "company": "", "role": "", "startDate": "", "endDate": "", "bullets": [] }],
  "education": [{ "id": "1", "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "" }],
  "projects": [{ "id": "1", "name": "", "description": "", "url": "", "technologies": [] }],
  "skills": [],
  "awards": [],
  "certifications": []
}

Resume:
${rawText.slice(0, 6000)}`;

  const raw = await runBob(prompt);
  return safeParseJson<Partial<PortfolioData>>(raw, {});
}

/**
 * Ask Bob to generate a polished bio and rewrite bullet points as portfolio prose.
 */
export async function generatePortfolioCopy(data: Partial<PortfolioData>): Promise<Partial<PortfolioData>> {
  const expSummary = (data.experience ?? [])
    .map((e) => `${e.role} at ${e.company}: ${e.bullets.join("; ")}`)
    .join("\n");

  const bioPrompt = `Write a compelling 2-3 sentence first-person professional bio for a portfolio website. Be specific and avoid buzzwords. No heading, just the bio text.

Name: ${data.name ?? ""}
Title: ${data.title ?? ""}
Experience: ${expSummary}
Skills: ${(data.skills ?? []).slice(0, 15).join(", ")}`;

  const bio = (await runBob(bioPrompt)).trim();

  // Rewrite bullets for each experience entry
  const updatedExperience = await Promise.all(
    (data.experience ?? []).map(async (entry) => {
      if (entry.bullets.length === 0) return entry;
      const bulletPrompt = `Rewrite these resume bullets as portfolio achievement statements. Return a JSON array of strings only, no explanation.

Role: ${entry.role} at ${entry.company}
Bullets:
${entry.bullets.map((b: string) => `- ${b}`).join("\n")}`;

      const raw = await runBob(bulletPrompt);
      const rewritten = safeParseJson<string[]>(raw, entry.bullets);
      return { ...entry, bullets: Array.isArray(rewritten) ? rewritten : entry.bullets };
    })
  );

  return { ...data, bio, experience: updatedExperience };
}
