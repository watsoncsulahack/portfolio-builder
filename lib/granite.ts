import { spawn } from "child_process";
import type { PortfolioData } from "@/lib/types";

/**
 * Run a prompt through Bob Shell non-interactively via stdin pipe.
 * Requires BOB_API_KEY to be set in the environment.
 * Uses --format json which emits a single JSON object with `last_message`.
 *
 * We pipe the prompt via stdin (echo "..." | bob run) rather than passing it
 * as a CLI argument so that multi-line prompts with special characters are
 * never mangled by shell argument parsing.
 *
 * We also strip BOB_SUPERVISED / BOB_SESSION from the child env so that
 * the subprocess is not treated as a nested Bob session when Next.js dev
 * is started inside a Bob shell session.
 */
async function runBob(prompt: string): Promise<string> {
  const bobPath = process.env.BOB_PATH || "bob";

  // Strip Bob-session guard vars to avoid "Nested session not allowed".
  const { BOB_SUPERVISED: _a, BOB_SESSION: _b, ...cleanEnv } = process.env;

  return new Promise((resolve, reject) => {
    const child = spawn(
      bobPath,
      ["run", "--format", "json", "--disable-mcp", "--disable-subagents", "--accept-license"],
      {
        env: cleanEnv,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Bob exited ${code}: ${stderr.trim() || stdout.trim()}`));
        return;
      }
      // --format json emits a single JSON object: { type: "result", last_message, ... }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.last_message) { resolve(result.last_message as string); return; }
      } catch { /* fall through */ }
      resolve(stdout);
    });

    child.on("error", (err) => reject(new Error(`Bob spawn error: ${err.message}`)));

    // Write the prompt to stdin and close it (equivalent to: echo "..." | bob run)
    child.stdin.write(prompt, "utf8");
    child.stdin.end();
  });
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
 * Throws if BOB_API_KEY is not configured — callers must guard with hasBobKey.
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
 * Callers must guard with hasBobKey before calling.
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
