import { NextRequest, NextResponse } from "next/server";
import { generatePortfolioCopy } from "@/lib/granite";
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

/**
 * POST /api/generate
 * Body: { profile: Partial<PortfolioData> }
 *
 * Takes a manually-entered profile (no resume) and asks Bob to:
 *  - Suggest a professional title if missing
 *  - Write a polished bio
 *  - Rewrite experience bullets as achievement statements
 *
 * If BOB_API_KEY is not configured, returns the profile as-is with ids assigned.
 */
export async function POST(req: NextRequest) {
  let body: { profile: Partial<PortfolioData> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { profile } = body;
  if (!profile) {
    return NextResponse.json({ error: "profile is required" }, { status: 400 });
  }

  const hasBobKey = Boolean(process.env.BOB_API_KEY);

  try {
    const enriched = hasBobKey ? await generatePortfolioCopy(profile) : profile;
    return NextResponse.json({ data: ensureIds(enriched) });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate portfolio" },
      { status: 500 }
    );
  }
}
