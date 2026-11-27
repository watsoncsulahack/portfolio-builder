import { notFound } from "next/navigation";
import { connection } from "next/server";
import path from "path";
import fs from "fs/promises";
import type { PublishedPortfolio } from "@/lib/types";
import PortfolioViewer from "@/components/PortfolioViewer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPortfolio(slug: string): Promise<PublishedPortfolio | null> {
  // Try Vercel Blob first if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: `portfolios/${slug}.json` });
      if (blobs[0]) {
        const res = await fetch(blobs[0].url);
        if (res.ok) return (await res.json()) as PublishedPortfolio;
      }
    } catch {
      // Fall through to file-based
    }
  }

  // File-based fallback
  try {
    const filePath = path.join(process.cwd(), "data", "portfolios", `${slug}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as PublishedPortfolio;
  } catch {
    return null;
  }
}

export default async function PortfolioPage({ params }: PageProps) {
  await connection(); // opt out of static prerendering
  const { slug } = await params;
  const portfolio = await getPortfolio(slug);

  if (!portfolio) notFound();

  return (
    <PortfolioViewer data={portfolio.data} templateId={portfolio.templateId} />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await getPortfolio(slug);
  if (!portfolio) return {};
  return {
    title: `${portfolio.data.name} — Portfolio`,
    description: portfolio.data.bio?.slice(0, 160) || `Portfolio of ${portfolio.data.name}`,
    openGraph: {
      title: `${portfolio.data.name} — Portfolio`,
      description: portfolio.data.bio?.slice(0, 160) || `Portfolio of ${portfolio.data.name}`,
    },
  };
}
