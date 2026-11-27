import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOB_API_BASE = "https://api.us-east.bob.ibm.com/v1";

/**
 * POST /api/bob/chat
 * Body: { messages: [{role, content}], systemPrompt?: string }
 *
 * Calls the Bob / watsonx OpenAI-compatible chat completions endpoint directly.
 * This avoids spawning `bob run` as a subprocess (which is blocked inside a Bob session).
 *
 * Streams the response back as Server-Sent Events / NDJSON so the client
 * can show tokens incrementally.
 */
export async function POST(req: NextRequest) {
  const bobApiKey = process.env.BOB_API_KEY;
  if (!bobApiKey) {
    return NextResponse.json(
      { error: "BOB_API_KEY not set. Add it to portfolio-app/.env.local to enable AI features." },
      { status: 503 }
    );
  }

  let body: { messages: { role: string; content: string }[]; systemPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, systemPrompt } = body;
  if (!messages?.length) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  const system = systemPrompt ?? `You are an expert portfolio website designer and developer. 
Help users customize their portfolio websites. When asked to generate a custom template or modify the design, 
output complete, valid React/Tailwind CSS component code. When asked questions, answer concisely.`;

  const chatMessages = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Try streaming first; fall back to non-streaming if the endpoint doesn't support it
  const encoder = new TextEncoder();

  const upstream = await fetch(`${BOB_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bobApiKey}`,
    },
    body: JSON.stringify({
      model: "ibm/granite-3-3-8b-instruct",
      messages: chatMessages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `Bob API error ${upstream.status}: ${errText.slice(0, 200)}` },
      { status: upstream.status }
    );
  }

  // Stream SSE from upstream → pass through as NDJSON for the client
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }
      const dec = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const event = JSON.parse(data);
              const delta = event.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                accumulatedText += delta;
                // Forward OpenAI-compatible delta so the client can render tokens
                controller.enqueue(encoder.encode(
                  JSON.stringify({ type: "content_block_delta", delta: { text: delta } }) + "\n"
                ));
              }
            } catch { /* skip malformed lines */ }
          }
        }
      } finally {
        // Send a final result event with the full text
        controller.enqueue(encoder.encode(
          JSON.stringify({ type: "result", text: accumulatedText }) + "\n"
        ));
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
