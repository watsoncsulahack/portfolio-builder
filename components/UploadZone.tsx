"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";

interface UploadZoneProps {
  onParsed: (data: object) => void;
}

function isAccepted(name: string): boolean {
  const n = name.toLowerCase();
  return n.endsWith(".tex") || n.endsWith(".md") || n.endsWith(".markdown") || n.endsWith(".pdf") || n.endsWith(".docx");
}

const STEPS_LOCAL = [
  "Reading your document…",
  "Extracting sections and entries…",
  "Structuring your portfolio data…",
  "Almost ready…",
];

const STEPS_AI = [
  "Uploading to IBM Granite…",
  "Extracting sections and entries…",
  "Structuring your portfolio data…",
  "Generating your bio…",
  "Polishing your copy…",
  "Almost ready…",
];

function useStepAnimation(active: boolean, steps: string[]) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) { setIndex(0); return; }
    const id = setInterval(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), 900);
    return () => clearInterval(id);
  }, [active, steps.length]);
  return steps[index];
}

export default function UploadZone({ onParsed }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAi, setIsAi] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const stepLabel = useStepAnimation(loading, isAi ? STEPS_AI : STEPS_LOCAL);

  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    setProgress(5);
    const target = isAi ? 85 : 90;
    const id = setInterval(() => {
      setProgress((p) => p >= target ? p : p + Math.max(1, (target - p) * 0.07));
    }, 400);
    return () => clearInterval(id);
  }, [loading, isAi]);

  const handleFile = useCallback(async (file: File) => {
    if (!isAccepted(file.name)) {
      setError(`"${file.name}" is not supported. Upload a .tex, .md, .pdf, or .docx file.`);
      return;
    }
    setError("");
    const useAi = /\.(pdf|docx)$/i.test(file.name);
    setIsAi(useAi);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Parse failed");
      }
      setProgress(100);
      const { data } = await res.json();
      await new Promise((r) => setTimeout(r, 400));
      onParsed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [onParsed]);

  // Block the browser from opening dropped files anywhere on the page
  useEffect(() => {
    const prevent = (e: DragEvent) => {
      // Only prevent default if the drop target is NOT inside our zone
      if (zoneRef.current && e.target instanceof Node && zoneRef.current.contains(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener("dragover", prevent);
    document.addEventListener("drop", prevent);
    return () => {
      document.removeEventListener("dragover", prevent);
      document.removeEventListener("drop", prevent);
    };
  }, []);

  // Native drag handlers on the zone itself
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    let counter = 0;

    const onDragEnter = (e: DragEvent) => { e.preventDefault(); counter++; setDragging(true); };
    const onDragOver  = (e: DragEvent) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"; };
    const onDragLeave = (e: DragEvent) => { e.preventDefault(); if (--counter <= 0) { counter = 0; setDragging(false); } };
    const onDrop      = (e: DragEvent) => {
      e.preventDefault();
      counter = 0;
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    };

    zone.addEventListener("dragenter", onDragEnter);
    zone.addEventListener("dragover",  onDragOver);
    zone.addEventListener("dragleave", onDragLeave);
    zone.addEventListener("drop",      onDrop);
    return () => {
      zone.removeEventListener("dragenter", onDragEnter);
      zone.removeEventListener("dragover",  onDragOver);
      zone.removeEventListener("dragleave", onDragLeave);
      zone.removeEventListener("drop",      onDrop);
    };
  }, [handleFile]);

  return (
    <div ref={zoneRef} className="space-y-3">
      {/* Invisible full-size label wrapping the input — most reliable click-to-upload pattern */}
      <label
        className={[
          "block border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 select-none",
          loading
            ? "border-blue-400 bg-blue-50 cursor-default pointer-events-none"
            : dragging
            ? "border-blue-500 bg-blue-50 scale-[1.01] cursor-copy"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-100 bg-gray-50 cursor-pointer",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".tex,.md,.markdown,.pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {loading ? (
          <div className="space-y-5 py-2">
            <div className="flex justify-center">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
                  style={{ animationDuration: "0.9s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  {isAi ? "🤖" : "📄"}
                </div>
              </div>
            </div>
            <p className="text-sm font-semibold text-blue-700 min-h-[1.25rem]">{stepLabel}</p>
            <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {isAi && <p className="text-xs text-blue-500">Powered by IBM Granite on watsonx.ai</p>}
          </div>
        ) : (
          <>
            <div className={`text-4xl mb-3 transition-transform duration-200 ${dragging ? "scale-125" : ""}`}>
              {dragging ? "⬇️" : "📄"}
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {dragging ? "Release to upload" : "Drop your resume here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {[".tex", ".md", ".pdf", ".docx"].map((ext) => (
                <span key={ext} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                  {ext}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              .tex and .md parsed locally · PDF and DOCX via IBM Granite
            </p>
          </>
        )}
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
          <p className="text-sm text-red-700 font-medium">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-600 shrink-0 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
