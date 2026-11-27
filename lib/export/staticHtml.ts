import type { PortfolioData, TemplateId } from "@/lib/types";

/**
 * Convert all object URLs in PortfolioData to base64 data URIs
 * so the exported HTML bundle is fully self-contained.
 */
async function urlToBase64(url: string): Promise<string> {
  if (url.startsWith("data:")) return url; // already base64
  if (!url.startsWith("blob:") && !url.startsWith("http")) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url; // fallback: keep original URL
  }
}

async function resolveImages(data: PortfolioData): Promise<PortfolioData> {
  const images = await Promise.all(
    data.images.map(async (img) => ({ ...img, url: await urlToBase64(img.url) }))
  );
  const projects = await Promise.all(
    data.projects.map(async (p) => ({
      ...p,
      image: p.image ? await urlToBase64(p.image) : undefined,
    }))
  );
  const headshot = data.headshot ? await urlToBase64(data.headshot) : undefined;
  const game = data.game?.thumbnail
    ? { ...data.game, thumbnail: await urlToBase64(data.game.thumbnail) }
    : data.game;
  return { ...data, images, projects, headshot, game };
}

/**
 * Generate a self-contained HTML string using the actual template React components
 * rendered server-side via the /api/render route. The result includes Tailwind CDN
 * and animation keyframes so it looks identical to the in-app preview.
 */
export async function generateStaticHtml(data: PortfolioData, templateId: TemplateId): Promise<string> {
  // 1. Inline all blob/object URLs as base64 so the HTML is self-contained
  const resolvedData = await resolveImages(data);

  // 2. POST to the server-side render route which uses ReactDOMServer.renderToStaticMarkup
  const res = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: resolvedData, templateId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown render error" }));
    throw new Error(`Render failed: ${err.error ?? res.statusText}`);
  }

  return res.text();
}

/**
 * Trigger a browser download of the portfolio as portfolio.html
 */
export async function downloadPortfolio(data: PortfolioData, templateId: TemplateId): Promise<void> {
  const html = await generateStaticHtml(data, templateId);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.name.toLowerCase().replace(/\s+/g, "-") || "portfolio"}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
