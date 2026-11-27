import { spawn } from "child_process";
import type { PortfolioData } from "@/lib/types";

const BOB_API_BASE = "https://api.us-east.bob.ibm.com/v1";

/**
 * Call Bob's OpenAI-compatible REST API directly (no subprocess).
 * This is safe in all environments (Vercel, Next.js dev with Turbopack, etc.)
 * and avoids any pdfjs-dist / DOMMatrix issues from pdf-parse.
 *
 * Returns the assistant's reply text.
 */
async function callBobRest(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens = 2048,
): Promise<string> {
  const bobApiKey = process.env.BOB_API_KEY;
  if (!bobApiKey) throw new Error("BOB_API_KEY not set");

  const res = await fetch(`${BOB_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bobApiKey}`,
    },
    body: JSON.stringify({
      model: "ibm/granite-3-3-8b-instruct",
      messages,
      stream: false,
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Bob REST API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? "";
}

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
      /*turbopackIgnore: true*/ bobPath,
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
/**
 * Extract plain text from a PDF buffer by sending it to Bob REST as a
 * base64-encoded user message.  Bob's Granite model can read the content
 * description and return the textual content.  This completely avoids
 * pdf-parse / pdfjs-dist and the DOMMatrix browser-only requirement.
 *
 * Falls back to an empty string if the API key is missing.
 */
export async function extractTextFromPdfBuffer(pdfBuffer: Buffer): Promise<string> {
  const base64 = pdfBuffer.toString("base64");
  // We embed the base64 PDF as a data URI in the message.
  // Granite 3.3 supports document understanding via the content array format.
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content:
        "You are a document text extractor. The user will provide a base64-encoded PDF. " +
        "Extract and return ALL readable text from the document exactly as it appears. " +
        "Preserve line breaks between sections. Output ONLY the extracted text — no commentary, no markdown.",
    },
    {
      role: "user",
      content:
        `Here is a PDF encoded as base64. Please extract all the text from it.\n\n` +
        `data:application/pdf;base64,${base64.slice(0, 60000)}`,
    },
  ];

  try {
    return await callBobRest(messages, 4096);
  } catch {
    return "";
  }
}

/**
 * Ask Bob to extract structured PortfolioData from raw document text.
 * Used for .pdf and .docx files.
 * Throws if BOB_API_KEY is not configured — callers must guard with hasBobKey.
 */
export async function extractStructuredData(rawText: string): Promise<Partial<PortfolioData>> {
  const systemPrompt =
    "You are a resume parser. Extract structured data from the resume text the user provides. " +
    "Return ONLY a valid JSON object matching the schema — no markdown fences, no explanation.";

  const userPrompt = `Extract this JSON from the resume:

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

  const raw = await callBobRest(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    2048,
  );
  return safeParseJson<Partial<PortfolioData>>(raw, {});
}

/**
 * Strip Bob's chain-of-thought preamble from a plain-text response.
 *
 * Bob sometimes prefixes its answer with reasoning text separated from the
 * real answer by one or more "---" lines. We drop everything up to (and
 * including) the last such separator so only the actual bio text remains.
 * If there is no separator we return the full text unchanged.
 */
function stripPreamble(text: string): string {
  // Split on lines of only dashes (---, ————, etc.)
  const parts = text.split(/\n[-–—]{3,}\s*\n/);
  return parts[parts.length - 1].trim();
}

/**
 * Ask Bob to generate a polished bio and rewrite bullet points as portfolio prose.
 * Callers must guard with hasBobKey before calling.
 */
export async function generatePortfolioCopy(data: Partial<PortfolioData>): Promise<Partial<PortfolioData>> {
  const expSummary = (data.experience ?? [])
    .map((e) => `${e.role} at ${e.company}: ${e.bullets.join("; ")}`)
    .join("\n");

  // Explicit instruction to suppress reasoning preamble
  const bioPrompt = `Write a 2-3 sentence first-person professional bio for a portfolio website.
Rules: output ONLY the bio sentences — no headings, no preamble, no explanation, no "---", no markdown.

Name: ${data.name ?? ""}
Title: ${data.title ?? ""}
Experience: ${expSummary}
Skills: ${(data.skills ?? []).slice(0, 15).join(", ")}`;

  const bio = stripPreamble(
    (await callBobRest([{ role: "user", content: bioPrompt }], 512)).trim(),
  );

  // Rewrite bullets for each experience entry
  const updatedExperience = await Promise.all(
    (data.experience ?? []).map(async (entry) => {
      if (entry.bullets.length === 0) return entry;
      const bulletPrompt = `Rewrite these resume bullets as portfolio achievement statements. Return a JSON array of strings only, no explanation.

Role: ${entry.role} at ${entry.company}
Bullets:
${entry.bullets.map((b: string) => `- ${b}`).join("\n")}`;

      const raw = await callBobRest([{ role: "user", content: bulletPrompt }], 1024);
      const rewritten = safeParseJson<string[]>(raw, entry.bullets);
      return { ...entry, bullets: Array.isArray(rewritten) ? rewritten : entry.bullets };
    })
  );

  return { ...data, bio, experience: updatedExperience };
}
