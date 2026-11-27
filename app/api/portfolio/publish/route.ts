import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";
import fs from "fs/promises";
import type { PortfolioData, TemplateId, PublishedPortfolio } from "@/lib/types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

async function savePortfolioLocal(slug: string, portfolio: PublishedPortfolio): Promise<void> {
  const dir = path.join(process.cwd(), "data", "portfolios");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${slug}.json`), JSON.stringify(portfolio, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      portfolioData: PortfolioData;
      templateId: TemplateId;
      slug?: string;
    };

    const { portfolioData, templateId, slug: requestedSlug } = body;
    if (!portfolioData || !templateId) {
      return NextResponse.json({ error: "portfolioData and templateId are required" }, { status: 400 });
    }

    // Generate or validate slug
    const baseSlug = requestedSlug || slugify(portfolioData.name || "portfolio");
    const slug = `${baseSlug}-${randomSuffix()}`;

    const now = new Date().toISOString();
    const portfolio: PublishedPortfolio = {
      slug,
      templateId,
      data: portfolioData,
      createdAt: now,
      updatedAt: now,
    };

    // Try Vercel Blob if token available, fall back to local file
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`portfolios/${slug}.json`, JSON.stringify(portfolio), {
        access: "public",
        contentType: "application/json",
      });
      console.log("Saved to Vercel Blob:", blob.url);
    } else {
      await savePortfolioLocal(slug, portfolio);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.json({ slug, url: `${baseUrl}/portfolio/${slug}` });
  } catch (err) {
    console.error("Publish error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to publish portfolio" },
      { status: 500 }
    );
  }
}
