"use client";
import React, { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePortfolioEditor } from "@/lib/hooks/usePortfolioEditor";
import UploadZone from "@/components/UploadZone";
import ProfileDashboard from "@/components/ProfileDashboard";
import TemplateSelector from "@/components/TemplateSelector";
import PublishPanel from "@/components/publish/PublishPanel";
import DataEditor from "@/components/editor/DataEditor";
import HeadshotUploader from "@/components/HeadshotUploader";
import SectionPhotoManager from "@/components/SectionPhotoManager";
import VisualAnnotator from "@/components/editor/VisualAnnotator";
import { getTemplate } from "@/lib/templateRegistry";
import type { PortfolioData } from "@/lib/types";

type EntryMode = "choose" | "upload" | "profile";

// Inner component that reads searchParams — must be inside <Suspense>
function BuildPageInner() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as EntryMode | null) ?? "choose";

  const {
    data, templateId, editMode, hydrated,
    updateData, loadPortfolio, clearPortfolio,
    setTemplateId, setEditMode,
  } = usePortfolioEditor();

  const [entryMode, setEntryMode] = useState<EntryMode>(initialMode);
  const [customizeMode, setCustomizeMode] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const hasData = Boolean(data.name || data.bio || data.experience.length > 0);
  const { component: TemplateComponent } = getTemplate(templateId);

  // ── Loading skeleton (before localStorage rehydration) ──────────────────────
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Build your portfolio</h1>
            <p className="text-gray-500">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Entry choice (no data yet, haven't picked a path) ───────────────────────
  if (!hasData && entryMode === "choose") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center">
          <a href="/" className="font-bold text-gray-900 text-sm">◀ Portfolio Builder</a>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">Build your portfolio</h1>
            <p className="text-gray-500 text-lg">How would you like to get started?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Path A — Upload resume */}
            <button
              onClick={() => setEntryMode("upload")}
              className="group text-left rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all p-6 bg-white"
            >
              <div className="text-4xl mb-4">📄</div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">I have a resume</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Upload a <code className="bg-gray-100 px-1 rounded">.pdf</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">.docx</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">.tex</code>, or{" "}
                <code className="bg-gray-100 px-1 rounded">.md</code> file.
                We&apos;ll extract your info, generate a polished bio, and build your portfolio instantly.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                Upload resume →
              </div>
            </button>

            {/* Path B — Build from scratch */}
            <button
              onClick={() => setEntryMode("profile")}
              className="group text-left rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all p-6 bg-white"
            >
              <div className="text-4xl mb-4">✍️</div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Start from scratch</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Fill out a simple form with your experience, education, and projects.
                IBM Bob will write your bio and polish your bullets — no resume needed.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                Build my profile →
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Your data stays in your browser — nothing is stored on our servers without your permission.
          </p>
        </div>
      </div>
    );
  }

  // ── Upload path ──────────────────────────────────────────────────────────────
  if (!hasData && entryMode === "upload") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
          <button onClick={() => setEntryMode("choose")} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Back
          </button>
          <span className="font-bold text-gray-900 text-sm">Upload your resume</span>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Drop your resume</h1>
            <p className="text-gray-500">
              .tex and .md are parsed locally. PDF and DOCX are extracted by IBM Bob on watsonx.ai.
            </p>
          </div>
          <UploadZone onParsed={(d) => loadPortfolio(d as Partial<PortfolioData>)} />
          <p className="text-center text-xs text-gray-400">
            Don&apos;t have a resume?{" "}
            <button onClick={() => setEntryMode("profile")} className="text-blue-500 hover:text-blue-700 underline">
              Build your profile from scratch
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Profile-dashboard path ────────────────────────────────────────────────────
  if (!hasData && entryMode === "profile") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setEntryMode("choose")} className="text-gray-400 hover:text-gray-600 text-sm">
              ← Back
            </button>
            <span className="font-bold text-gray-900 text-sm">Build your profile</span>
          </div>
          <button onClick={() => setEntryMode("upload")} className="text-xs text-gray-400 hover:text-purple-600 underline">
            Upload a resume instead
          </button>
        </header>
        <ProfileDashboard onComplete={(d) => loadPortfolio(d as Partial<PortfolioData>)} />
      </div>
    );
  }

  // ── Builder (data loaded from either path) ───────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
        <a href="/" className="font-bold text-gray-900 text-sm">◀ Portfolio Builder</a>
        <div className="flex items-center gap-2">
          {hasData && (
            <>
              {/* Edit / Preview toggle */}
              <button
                onClick={() => { setEditMode(!editMode); if (customizeMode) setCustomizeMode(false); }}
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  editMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                {editMode ? (
                  <><span>✏️</span><span>Editing</span><span className="text-blue-200 text-xs font-normal">→ Preview</span></>
                ) : (
                  <><span>👁</span><span>Preview</span><span className="text-gray-400 text-xs font-normal">→ Edit</span></>
                )}
              </button>

              {/* Customize button */}
              <button
                onClick={() => { setCustomizeMode((v) => !v); if (!customizeMode) setEditMode(false); }}
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  customizeMode
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                {customizeMode ? "📍 Annotating" : "✨ Customize"}
              </button>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              <button
                onClick={() => { clearPortfolio(); setEntryMode("choose"); }}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Left: template preview */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Template</p>
              <TemplateSelector active={templateId} onChange={setTemplateId} />
            </div>

            <div
              className={`relative rounded-2xl overflow-hidden border ${
                customizeMode
                  ? "border-indigo-400 ring-2 ring-indigo-100"
                  : editMode
                  ? "border-blue-300 ring-2 ring-blue-100"
                  : "border-gray-200"
              } bg-white`}
            >
              {editMode && !customizeMode && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2">
                  <span className="text-blue-500 text-sm">✏️</span>
                  <span className="text-xs text-blue-700 font-medium">Click any text to edit it directly</span>
                </div>
              )}
              {customizeMode && (
                <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 flex items-center gap-2">
                  <span className="text-indigo-500 text-sm">📍</span>
                  <span className="text-xs text-indigo-700 font-medium">Customize mode — click any element to annotate it</span>
                </div>
              )}

              <div ref={previewRef} className="relative">
                <TemplateComponent
                  data={data}
                  editMode={editMode && !customizeMode}
                  onUpdate={updateData}
                />
                {customizeMode && (
                  <VisualAnnotator
                    data={data}
                    containerRef={previewRef}
                    onClose={() => setCustomizeMode(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right: publish + editors */}
          <div className="space-y-5 xl:sticky xl:top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pb-4">
            <PublishPanel data={data} templateId={templateId} />

            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Headshot</p>
              <HeadshotUploader
                headshot={data.headshot}
                onChange={(headshot) => updateData({ ...data, headshot })}
              />
            </div>

            <DataEditor data={data} onChange={updateData} />

            {/* Game / featured work */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Game / Featured Work</p>
              {data.game ? (
                <div className="space-y-2">
                  {(["name", "description", "url"] as const).map((field) => (
                    <input
                      key={field}
                      value={data.game![field] || ""}
                      onChange={(e) => updateData({ ...data, game: { ...data.game!, [field]: e.target.value } })}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 placeholder:text-gray-400"
                    />
                  ))}
                  <button onClick={() => updateData({ ...data, game: undefined })}
                    className="text-xs text-red-500 hover:text-red-700">Remove game section</button>
                </div>
              ) : (
                <button
                  onClick={() => updateData({ ...data, game: { name: "", description: "", url: "" } })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add a game or featured project
                </button>
              )}
            </div>

            {/* Section photos */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Section Photos</p>
              <SectionPhotoManager
                images={data.images}
                onChange={(images) => updateData({ ...data, images })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Loading…</p></div>}>
      <BuildPageInner />
    </Suspense>
  );
}
