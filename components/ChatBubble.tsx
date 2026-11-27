"use client";
import React, { useState, useRef, useEffect } from "react";
import type { PortfolioData } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatBubbleProps {
  data: PortfolioData;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

const SYSTEM_PROMPT = `You are an expert portfolio website designer and developer. You help users customize their portfolio site built with React and Tailwind CSS.

When asked to modify styles, colors, or layout, suggest concrete Tailwind class changes or CSS snippets.
When asked to generate a new template from scratch, produce a complete TypeScript React component.
Keep answers practical and concise. If you generate code, wrap it in a markdown code block with the correct language tag.`;

export default function ChatBubble({ data }: ChatBubbleProps) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bobAvailable, setBobAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/bob/status")
      .then((r) => r.json())
      .then((j) => setBobAvailable(j.available))
      .catch(() => setBobAvailable(false));
  }, []);

  useEffect(() => {
    if (expanded) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, expanded]);

  useEffect(() => {
    if (expanded) setTimeout(() => inputRef.current?.focus(), 80);
  }, [expanded]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: uid(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const contextPrompt = `${SYSTEM_PROMPT}

Portfolio: ${data.name || "unknown"} — ${data.title || ""}
Skills: ${data.skills.slice(0, 8).join(", ")}`;

    const history = [...messages, userMsg]
      .slice(-10) // keep last 10 messages for context
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/bob/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, systemPrompt: contextPrompt }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Bob unavailable");
      }

      const assistantId = uid();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "…" }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalText = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "result" && event.text) {
              finalText = event.text;
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: finalText } : m));
            }
            if (event.type === "content_block_delta" && event.delta?.text) {
              finalText += event.delta.text;
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: finalText } : m));
            }
          } catch { /* skip */ }
        }
      }

      if (!finalText) {
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "(No response)" } : m));
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: `⚠️ ${err instanceof Error ? err.message : "Something went wrong"}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
      {/* Expanded message history */}
      {expanded && (
        <div className="w-full max-w-3xl mx-auto pointer-events-auto mb-0">
          <div className="bg-white border border-gray-200 border-b-0 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "360px" }}>
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "linear-gradient(135deg, #6d28d9, #0ea5e9)" }}>
                  <span className="text-white text-xs">✦</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">AI Portfolio Assistant</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bobAvailable === true ? "bg-emerald-50 text-emerald-700" : bobAvailable === false ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}>
                  {bobAvailable === true ? "● Bob connected" : bobAvailable === false ? "○ offline" : "checking…"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button onClick={() => setMessages([])}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Clear
                  </button>
                )}
                <button onClick={() => setExpanded(false)}
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-sm">Ask me anything about your portfolio.</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {[
                      "Make the hero more impactful",
                      "Suggest a color palette",
                      "How do I add a custom font?",
                    ].map((q) => (
                      <button key={q} onClick={() => send(q)}
                        className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors border border-gray-200 hover:border-indigo-200">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                    style={msg.role === "user" ? { background: "linear-gradient(135deg, #6d28d9, #0ea5e9)" } : {}}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Always-visible chat bar */}
      <div className="w-full max-w-3xl mx-auto pointer-events-auto">
        <div className={`bg-white border border-gray-200 shadow-lg flex items-end gap-2 px-3 py-2 ${expanded ? "rounded-none border-t-0" : "rounded-2xl mb-3"}`}>
          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Expand chat"}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:bg-gray-100"
            style={expanded ? {} : { background: "linear-gradient(135deg, #6d28d9, #0ea5e9)" }}
          >
            {expanded ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </button>

          {/* Input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => !expanded && setExpanded(true)}
            placeholder="Ask Bob to redesign, suggest colors, generate a new template…"
            rows={1}
            className="flex-1 resize-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none py-1.5 max-h-28 overflow-y-auto leading-snug"
            style={{ minHeight: "32px" }}
          />

          {/* Bob status dot */}
          {bobAvailable !== null && (
            <span className={`w-2 h-2 rounded-full shrink-0 mb-2 ${bobAvailable ? "bg-emerald-400" : "bg-red-400"}`}
              title={bobAvailable ? "Bob connected" : "Bob offline — set BOB_API_KEY"} />
          )}

          {/* Send */}
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading || bobAvailable === false}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #6d28d9, #0ea5e9)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
