import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOB_API_BASE = "https://api.us-east.bob.ibm.com/v1";

/**
 * GET /api/bob/status
 * Checks whether the Bob API key is set and the endpoint is reachable.
 */
export async function GET() {
  const bobApiKey = process.env.BOB_API_KEY;

  if (!bobApiKey) {
    return NextResponse.json({ available: false, reason: "BOB_API_KEY not set in .env.local" });
  }

  // Ping the models list as a lightweight availability check
  try {
    const res = await fetch(`${BOB_API_BASE}/models`, {
      headers: { Authorization: `Bearer ${bobApiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      return NextResponse.json({ available: true });
    }
    const text = await res.text().catch(() => "");
    return NextResponse.json({ available: false, reason: `API returned ${res.status}: ${text.slice(0, 100)}` });
  } catch (err) {
    return NextResponse.json({
      available: false,
      reason: `Could not reach Bob API: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}
