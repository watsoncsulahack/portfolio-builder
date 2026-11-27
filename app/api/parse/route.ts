import { NextRequest, NextResponse } from "next/server";
import { parseTex } from "@/lib/parsers/tex";
import { parseMd } from "@/lib/parsers/md";
import { parsePlainText } from "@/lib/parsers/plaintext";
import { extractStructuredData, generatePortfolioCopy } from "@/lib/granite";
import type { PortfolioData } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function ensureIds(data: Partial<PortfolioData>): Partial<PortfolioData> {
  return {
    ...data,
    experience: (data.experience ?? []).map((e) => ({ ...e, id: e.id || newId() })),
    education: (data.education ?? []).map((e) => ({ ...e, id: e.id || newId() })),
    projects: (data.projects ?? []).map((e) => ({ ...e, id: e.id || newId() })),
    awards: (data.awards ?? []).map((e) => ({ ...e, id: e.id || newId() })),
    certifications: (data.certifications ?? []).map((e) => ({ ...e, id: e.id || newId() })),
    images: data.images ?? [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const hasBobKey = Boolean(process.env.BOB_API_KEY);
    let parsed: Partial<PortfolioData> = {};

    if (fileName.endsWith(".tex")) {
      const text = buffer.toString("utf-8");
      parsed = parseTex(text);
    } else if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
      const text = buffer.toString("utf-8");
      parsed = parseMd(text);
    } else if (fileName.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const pdfData = await pdfParse(buffer);
      parsed = hasBobKey
        ? await extractStructuredData(pdfData.text)
        : parsePlainText(pdfData.text);
    } else if (fileName.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      parsed = hasBobKey
        ? await extractStructuredData(result.value)
        : parsePlainText(result.value);
    } else {
      return NextResponse.json({ error: "Unsupported file type. Upload .tex, .md, .pdf, or .docx" }, { status: 400 });
    }

    const enriched = hasBobKey ? await generatePortfolioCopy(parsed) : parsed;
    const withIds = ensureIds(enriched);

    return NextResponse.json({ data: withIds });
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse document" },
      { status: 500 }
    );
  }
}
