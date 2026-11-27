"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { PortfolioData } from "@/lib/types";

interface Pin {
  id: string;
  x: number;
  y: number;
  label: string;
  elementHint: string;
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface AnnotatorProps {
  data: PortfolioData;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function getElementHint(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const text = (el.textContent ?? "").trim().slice(0, 50);
  return text ? `${tag}: "${text}"` : tag;
}

export default function VisualAnnotator({ data, containerRef, onClose }: AnnotatorProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [activePin, setActivePin] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMsg[]>([
    { id: "intro", role: "system", content: "Click anywhere on the preview to drop a pin, then describe what you want. Or just type a prompt below." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [bobAvailable, setBobAvailable] = useState<boolean | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Floating panel position + drag state — initialize lazily to avoid SSR crash
  const [panelPos, setPanelPos] = useState(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - 380 : 600,
    y: 80,
  }));
  const dragState = useRef<{ startX: number; startY: number; startPanelX: number; startPanelY: number } | null>(null);

  useEffect(() => {
    fetch("/api/bob/status")
      .then((r) => r.json())
      .then((j) => setBobAvailable(j.available))
      .catch(() => setBobAvailable(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ── Drag handle ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragState.current = { startX: e.clientX, startY: e.clientY, startPanelX: panelPos.x, startPanelY: panelPos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const dx = ev.clientX - dragState.current.startX;
      const dy = ev.clientY - dragState.current.startY;
      setPanelPos({
        x: Math.max(0, Math.min(window.innerWidth - 360, dragState.current.startPanelX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 100, dragState.current.startPanelY + dy)),
      });
    };
    const onUp = () => {
      dragState.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [panelPos]);

  // ── Pin placement ──────────────────────────────────────────────────────
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("[data-pin]")) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (overlayRef.current) overlayRef.current.style.pointerEvents = "none";
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (overlayRef.current) overlayRef.current.style.pointerEvents = "";

    const hint = el ? getElementHint(el) : "element";
    const newPin: Pin = { id: uid(), x, y, label: "", elementHint: hint };
    setPins((prev) => [...prev, newPin]);
    setActivePin(newPin.id);
    setChat((prev) => [...prev, {
      id: uid(), role: "system",
      content: `📍 Pin ${prev.filter(m => m.role === "system" && m.content.startsWith("📍")).length + 1} placed on "${hint}"`,
    }]);
  }, []);

  const removePin = (id: string) => {
    const idx = pins.findIndex(p => p.id === id);
    setPins((prev) => prev.filter((p) => p.id !== id));
    setChat((prev) => [...prev, { id: uid(), role: "system", content: `🗑 Pin ${idx + 1} removed` }]);
    if (activePin === id) setActivePin(null);
  };

  // ── Send to Bob ────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const userMsg: ChatMsg = { id: uid(), role: "user", content: text };
    setChat((prev) => [...prev, userMsg]);

    const pinContext = pins.length > 0
      ? `The user has placed ${pins.length} visual pin(s) on the preview:\n` +
        pins.map((p, i) => `  Pin ${i + 1} on "${p.elementHint}"${p.label ? `: "${p.label}"` : ""}`).join("\n") + "\n\n"
      : "";

    const systemPrompt = `You are an expert portfolio website designer and React/Tailwind CSS developer.
You help users customize their portfolio site. The site uses Tailwind CSS 4 and React (TypeScript).
When the user asks for changes, respond with specific, actionable suggestions or code snippets.
Keep answers concise. For code, use markdown code blocks with the correct language tag.

Portfolio: ${data.name}${data.title ? ` — ${data.title}` : ""}
Skills: ${data.skills.slice(0, 8).join(", ")}`;

    const history = chat
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-8)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const fullUserContent = pinContext + text;

    try {
      const res = await fetch("/api/bob/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: fullUserContent }],
          systemPrompt,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error ?? "Bob unavailable");
      }

      const assistantId = uid();
      setChat((prev) => [...prev, { id: assistantId, role: "assistant", content: "…" }]);

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
              setChat((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: finalText } : m));
            }
            if (event.type === "content_block_delta" && event.delta?.text) {
              finalText += event.delta.text;
              setChat((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: finalText } : m));
            }
            // OpenAI-compatible streaming
            if (event.choices?.[0]?.delta?.content) {
              finalText += event.choices[0].delta.content;
              setChat((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: finalText } : m));
            }
          } catch { /* skip non-JSON */ }
        }
      }

      if (!finalText) {
        setChat((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "(No response)" } : m));
      }
    } catch (err) {
      setChat((prev) => [...prev, {
        id: uid(), role: "assistant",
        content: `⚠️ ${err instanceof Error ? err.message : "Something went wrong"}`,
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Click-capture overlay (stays inside the preview) ──────────────────
  const overlay = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="absolute inset-0 cursor-crosshair z-30"
      style={{ pointerEvents: "auto", background: "rgba(99,102,241,0.03)" }}
    >
      {/* Crosshair hint */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <span className="bg-gray-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
          <span className="text-indigo-400">+</span> Click to place a pin
        </span>
      </div>

      {/* Pins */}
      {pins.map((pin, i) => (
        <div
          key={pin.id}
          data-pin="true"
          onClick={(e) => { e.stopPropagation(); setActivePin(pin.id === activePin ? null : pin.id); }}
          className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <div className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shadow-lg border-2 border-white transition-all duration-100 ${
            pin.id === activePin ? "bg-indigo-500 scale-125 ring-2 ring-indigo-300 ring-offset-1" : "bg-gray-900 hover:bg-indigo-500 hover:scale-110"
          } text-white`}>
            {i + 1}
          </div>
          <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity max-w-[180px] truncate">
            {pin.label || pin.elementHint}
          </div>
          {pin.id === activePin && (
            <button
              data-pin="true"
              onClick={(e) => { e.stopPropagation(); removePin(pin.id); }}
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 shadow"
            >×</button>
          )}
        </div>
      ))}
    </div>
  );

  // ── Floating chat panel (portaled to body) ─────────────────────────────
  const panel = (
    <div
      className="fixed z-[300] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{
        left: panelPos.x,
        top: panelPos.y,
        width: 360,
        height: 540,
        background: "#0f0f10",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
      }}
    >
      {/* Drag handle / header */}
      <div
        onMouseDown={handleDragStart}
        className="px-4 py-3 flex items-center justify-between gap-3 shrink-0 cursor-grab active:cursor-grabbing select-none"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #6d28d9, #0ea5e9)" }}>✦</div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">AI Customizer</p>
            <p className={`text-xs mt-0.5 ${bobAvailable === true ? "text-emerald-400" : bobAvailable === false ? "text-red-400" : "text-gray-500"}`}>
              {bobAvailable === true ? "● Bob connected" : bobAvailable === false ? "○ Bob offline — set BOB_API_KEY" : "checking…"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {pins.length > 0 && (
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              {pins.length} pin{pins.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-gray-500 hover:text-white"
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        {chat.map((msg) => {
          if (msg.role === "system") {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-xs text-gray-600 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                  {msg.content}
                </span>
              </div>
            );
          }
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-sm text-white leading-relaxed whitespace-pre-wrap"
                  style={{ background: "linear-gradient(135deg, #6d28d9, #0ea5e9)" }}>
                  {msg.content}
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)" }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1 items-center"
              style={{ background: "rgba(255,255,255,0.07)" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Pin label editor */}
      {activePin && (() => {
        const pin = pins.find(p => p.id === activePin);
        if (!pin) return null;
        const idx = pins.findIndex(p => p.id === activePin);
        return (
          <div className="px-3 py-2 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(99,102,241,0.08)" }}>
            <p className="text-xs text-indigo-400 mb-1.5 font-semibold">Pin {idx + 1} — {pin.elementHint}</p>
            <input
              value={pin.label}
              onChange={(e) => setPins(prev => prev.map(p => p.id === activePin ? { ...p, label: e.target.value } : p))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); inputRef.current?.focus(); setActivePin(null); } }}
              placeholder="Describe what to change here…"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white/10 text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-indigo-500/60"
              autoFocus
            />
            <p className="text-xs text-gray-600 mt-1">Enter to confirm · click elsewhere to dismiss</p>
          </div>
        );
      })()}

      {/* Input bar */}
      <div className="px-3 py-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex gap-2 items-end rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pins.length > 0 ? `${pins.length} pin${pins.length !== 1 ? "s" : ""} placed — describe your changes…` : "Describe what you want to change…"}
            rows={1}
            disabled={sending}
            className="flex-1 resize-none text-sm text-white placeholder:text-gray-500 bg-transparent focus:outline-none leading-snug max-h-24 overflow-y-auto"
            style={{ minHeight: "24px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || bobAvailable === false}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #6d28d9, #0ea5e9)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1.5 text-center">Enter to send · Shift+Enter newline</p>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return (
    <>
      {/* Overlay stays in the preview container */}
      {overlay}
      {/* Floating panel portaled to body */}
      {createPortal(panel, document.body)}
    </>
  );
}
