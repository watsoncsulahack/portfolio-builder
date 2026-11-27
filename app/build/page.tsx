"use client";
import React, { useRef, useState } from "react";
import { usePortfolioEditor } from "@/lib/hooks/usePortfolioEditor";
import UploadZone from "@/components/UploadZone";
import TemplateSelector from "@/components/TemplateSelector";
import PublishPanel from "@/components/publish/PublishPanel";
import DataEditor from "@/components/editor/DataEditor";
import HeadshotUploader from "@/components/HeadshotUploader";
import SectionPhotoManager from "@/components/SectionPhotoManager";
import VisualAnnotator from "@/components/editor/VisualAnnotator";
import { getTemplate } from "@/lib/templateRegistry";
import type { PortfolioData } from "@/lib/types";

export default function BuildPage() {
  const {
    data,
    templateId,
    editMode,
    hydrated,
    updateData,
    loadPortfolio,
    clearPortfolio,
    setTemplateId,
    setEditMode,
  } = usePortfolioEditor();

  const [customizeMode, setCustomizeMode] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const hasData = Boolean(data.name || data.bio || data.experience.length > 0);
  const { component: TemplateComponent } = getTemplate(templateId);

  // Before localStorage rehydration, show the upload screen (safe default — no data yet)
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Build your portfolio</h1>
            <p className="text-gray-500">Upload your resume to get started.</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-lg font-semibold text-gray-800">Drop your resume here</p>
            <p className="text-sm text-gray-500 mt-1">Supports .tex, .md, .pdf, .docx</p>
          </div>
        </div>
      </div>
    );
  }

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
                title={editMode ? "Click to switch to Preview mode" : "Click to switch to Edit mode"}
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
                onClick={clearPortfolio}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {!hasData ? (
          /* Upload state */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Build your portfolio</h1>
              <p className="text-gray-500">Upload your resume to get started. We&apos;ll extract your info and generate polished copy.</p>
            </div>
            <UploadZone onParsed={(d) => loadPortfolio(d as Partial<PortfolioData>)} />
          </div>
        ) : (
          /* Builder state */
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Left: template preview */}
            <div className="space-y-5">
              {/* Template selector */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Template</p>
                <TemplateSelector active={templateId} onChange={setTemplateId} />
              </div>

              {/* Portfolio preview / WYSIWYG */}
              <div
                className={`relative rounded-2xl overflow-hidden border ${
                  customizeMode
                    ? "border-indigo-400 ring-2 ring-indigo-100"
                    : editMode
                    ? "border-blue-300 ring-2 ring-blue-100"
                    : "border-gray-200"
                } bg-white`}
              >
                {/* Edit mode banner */}
                {editMode && !customizeMode && (
                  <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2">
                    <span className="text-blue-500 text-sm">✏️</span>
                    <span className="text-xs text-blue-700 font-medium">Click any text to edit it directly</span>
                  </div>
                )}

                {/* Customize mode banner */}
                {customizeMode && (
                  <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 flex items-center gap-2">
                    <span className="text-indigo-500 text-sm">📍</span>
                    <span className="text-xs text-indigo-700 font-medium">Customize mode — click any element to annotate it</span>
                  </div>
                )}

                {/* Template preview */}
                <div ref={previewRef} className="relative">
                  <TemplateComponent
                    data={data}
                    editMode={editMode && !customizeMode}
                    onUpdate={updateData}
                  />

                  {/* Visual annotator overlay */}
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

            {/* Right: publish panel + data editor */}
            <div className="space-y-5 xl:sticky xl:top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pb-4">
              <PublishPanel data={data} templateId={templateId} />

              {/* Headshot */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Headshot</p>
                <HeadshotUploader
                  headshot={data.headshot}
                  onChange={(headshot) => updateData({ ...data, headshot })}
                />
              </div>

              {/* Structured data editor */}
              <DataEditor data={data} onChange={updateData} />

              {/* Game / featured project editor */}
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
                    <button onClick={() => updateData({ ...data, game: undefined })} className="text-xs text-red-500 hover:text-red-700">Remove game section</button>
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
        )}
      </div>
    </div>
  );
}
