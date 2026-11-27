"use client";
import React, { useState } from "react";
import type { PortfolioData, TemplateId } from "@/lib/types";
import { downloadPortfolio } from "@/lib/export/staticHtml";
import GitHubDeployModal from "@/components/publish/GitHubDeployModal";

interface PublishPanelProps {
  data: PortfolioData;
  templateId: TemplateId;
}

export default function PublishPanel({ data, templateId }: PublishPanelProps) {
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Publish</h2>

        {/* Download */}
        <button
          onClick={() => downloadPortfolio(data, templateId)}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="text-xl">⬇️</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Download HTML</p>
            <p className="text-xs text-gray-500">Self-contained — host anywhere</p>
          </div>
        </button>

        {/* GitHub Pages */}
        <button
          onClick={() => setShowGitHubModal(true)}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="text-xl">🐙</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Deploy to GitHub Pages</p>
            <p className="text-xs text-gray-500">Free at username.github.io</p>
          </div>
        </button>
      </div>

      {/* GitHub Pages modal */}
      {showGitHubModal && (
        <GitHubDeployModal
          data={data}
          templateId={templateId}
          onClose={() => setShowGitHubModal(false)}
        />
      )}
    </>
  );
}
