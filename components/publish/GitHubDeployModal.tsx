"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import type { PortfolioData, TemplateId } from "@/lib/types";
import { generateStaticHtml } from "@/lib/export/staticHtml";
import { useSecureLocalStorage } from "@/lib/hooks/useSecureLocalStorage";
import QRCode from "qrcode";

type Step = "intro" | "token" | "repo" | "deploy" | "done" | "error";

interface GitHubDeployModalProps {
  data: PortfolioData;
  templateId: TemplateId;
  onClose: () => void;
}

export default function GitHubDeployModal({ data, templateId, onClose }: GitHubDeployModalProps) {
  // Render into document.body via portal so the modal escapes any
  // stacking context created by overflow-hidden / transform on the template preview
  const [step, setStep] = useState<Step>("intro");
  const { value: pat, set: setPat, hydrated: patHydrated } = useSecureLocalStorage("github_pat");
  const [repoName, setRepoName] = useState("");
  const [isUserPage, setIsUserPage] = useState(true);
  const [deployedUrl, setDeployedUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const [copyDone, setCopyDone] = useState(false);
  const [bobLog, setBobLog] = useState<string[]>([]);
  const [deployProgress, setDeployProgress] = useState("");

  const addLog = (line: string) => setBobLog((prev) => [...prev, line]);

  const handleDeploy = async () => {
    setStep("deploy");
    setError("");
    setBobLog([]);

    try {
      // Step 1 — render HTML
      setDeployProgress("Generating portfolio HTML…");
      addLog("📄 [1/5] Generating static HTML bundle…");
      const html = await generateStaticHtml(data, templateId);
      addLog(`✅ [1/5] HTML generated — ${Math.round(html.length / 1024)} KB`);

      // Steps 2-5 happen server-side — call the deploy API
      setDeployProgress("Pushing to GitHub…");
      addLog("🔐 [2/5] Authenticating with GitHub…");
      addLog(`📦 [3/5] Checking repo: ${repoName}…`);
      addLog("🌲 [4/5] Committing index.html via Git Tree API…");

      const res = await fetch("/api/github/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: html, pat, repoName, isUserPage }),
      });

      // Handle both JSON error bodies and unexpected non-JSON responses
      let json: { error?: string; url?: string; repo?: string } = {};
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`);
      }

      if (!res.ok) {
        throw new Error(json.error ?? `GitHub API error (${res.status})`);
      }

      addLog(`✅ [4/5] index.html committed to ${repoName} (${isUserPage ? "main" : "gh-pages"} branch)`);
      addLog(`🌐 [5/5] GitHub Pages URL: ${json.url}`);
      addLog(`🔗 Repo: ${json.repo}`);
      setDeployedUrl(json.url ?? "");
      // Generate QR code for the deployed URL
      try {
        const qr = await QRCode.toDataURL(json.url ?? "", { width: 200, margin: 1, color: { dark: "#111827", light: "#ffffff" } });
        setQrDataUrl(qr);
      } catch { /* non-fatal */ }
      setStep("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      addLog(`❌ Error: ${msg}`);
      setStep("error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(deployedUrl);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  const modal = (
    /* Backdrop — rendered at z-[200] via portal to escape all stacking contexts */
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xl">🐙</div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Deploy to GitHub Pages</h2>
              <p className="text-xs text-gray-500 mt-0.5">Free hosting at <code className="bg-gray-100 px-1 rounded">username.github.io</code></p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-5">

          {/* ── Step: Intro ─────────────────────────────────────────── */}
          {step === "intro" && (
            <>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your portfolio will be exported as a <strong>single self-contained HTML file</strong> and pushed to a GitHub repository. GitHub Pages will then serve it at your personal domain — completely free, no server needed.
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">What you&apos;ll need</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2"><span>✅</span> A GitHub account</li>
                  <li className="flex gap-2"><span>✅</span> A personal access token with <code className="bg-gray-200 px-1 rounded text-xs">repo</code> scope</li>
                  <li className="flex gap-2"><span>ℹ️</span> GitHub Pages enabled on your repository</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 Tip</p>
                <p>For a user page (the most common setup), name your repo <code className="bg-blue-100 px-1 rounded">&lt;your-username&gt;.github.io</code> — e.g. <code className="bg-blue-100 px-1 rounded">alrondeau.github.io</code>.</p>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setStep("token")}
                  className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
                  Get started →
                </button>
              </div>
            </>
          )}

          {/* ── Step: Token ─────────────────────────────────────────── */}
          {step === "token" && (
            <>
              <p className="text-sm text-gray-600">
                Create a GitHub personal access token with <code className="bg-gray-100 px-1 rounded">repo</code> scope.
              </p>
              <a href="https://github.com/settings/tokens/new?scopes=repo&description=Portfolio+Builder"
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 underline">
                Open GitHub token page ↗
              </a>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">Personal Access Token</label>
                <input
                  type="password"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  placeholder={patHydrated && pat ? "••••••••••••••••••••" : "ghp_xxxxxxxxxxxxxxxxxxxx"}
                  className="w-full text-sm text-gray-900 font-mono border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900/30 placeholder:text-gray-400 bg-white"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400">
                    {pat ? "✅ Token saved in browser storage — never sent to our servers." : "Stored locally in your browser only."}
                  </p>
                  {pat && (
                    <button onClick={() => setPat("")} className="text-xs text-red-400 hover:text-red-600 ml-2 shrink-0">
                      Clear saved token
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button onClick={() => setStep("intro")} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
                <button onClick={() => setStep("repo")} disabled={!pat.trim()}
                  className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors">
                  Next →
                </button>
              </div>
            </>
          )}

          {/* ── Step: Repo ──────────────────────────────────────────── */}
          {step === "repo" && (
            <>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Page type</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    {
                      value: true,
                      label: "User / Org page",
                      hint: "username.github.io",
                      tooltip: "Your portfolio lives at the root of username.github.io — the repo must be named exactly your-username.github.io. Use this for your main portfolio.",
                    },
                    {
                      value: false,
                      label: "Project page",
                      hint: "username.github.io/repo",
                      tooltip: "Your portfolio lives at a sub-path like username.github.io/my-portfolio. Any repo name works. Use this for additional portfolios or if username.github.io is already taken.",
                    },
                  ] as const).map(({ value, label, hint, tooltip }) => (
                    <button key={String(value)} onClick={() => setIsUserPage(value)}
                      className={`relative rounded-xl border-2 p-3 text-left transition-all ${isUserPage === value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}>
                      {/* ⓘ tooltip */}
                      <span className="absolute top-2 right-2 group">
                        <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center cursor-default select-none">i</span>
                        <span className="pointer-events-none absolute right-0 top-5 w-56 bg-gray-900 text-white text-xs rounded-xl p-2.5 leading-relaxed z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xl">
                          {tooltip}
                        </span>
                      </span>
                      <p className="text-sm font-semibold text-gray-900 pr-5">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{hint}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">Repository name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => {
                    // Auto-strip full GitHub URLs — user may paste https://github.com/user/repo
                    let val = e.target.value.trim();
                    const ghMatch = val.match(/github\.com\/[^/]+\/([^/]+?)(\.git)?$/);
                    if (ghMatch) val = ghMatch[1];
                    setRepoName(val);
                  }}
                  placeholder={isUserPage ? "your-username.github.io" : "my-portfolio"}
                  className="w-full text-sm text-gray-900 font-mono border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900/30 placeholder:text-gray-400 bg-white"
                />
                {/* Live preview of the resulting Pages URL */}
                {repoName.trim() && (
                  <p className="text-xs mt-1.5 font-mono" style={{ color: "#2563eb" }}>
                    → {isUserPage
                      ? `https://${repoName.trim()}`
                      : `https://[your-username].github.io/${repoName.trim()}`}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {isUserPage
                    ? "Repo must be named exactly your-username.github.io"
                    : "Just the repo name (e.g. my-portfolio). Paste a full GitHub URL and it will be stripped automatically."}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <button onClick={() => setStep("token")} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
                <button onClick={handleDeploy} disabled={!repoName.trim()}
                  className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors">
                  Deploy 🚀
                </button>
              </div>
            </>
          )}

          {/* ── Step: Deploying ─────────────────────────────────────── */}
          {step === "deploy" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-sm font-semibold text-gray-900">{deployProgress}</p>
              </div>
              <div className="bg-gray-950 rounded-2xl p-4 font-mono text-xs text-emerald-400 space-y-1 max-h-48 overflow-y-auto">
                {bobLog.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                {!bobLog.length && <p className="text-gray-600">Starting…</p>}
              </div>
            </div>
          )}

          {/* ── Step: Done ──────────────────────────────────────────── */}
          {step === "done" && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-black text-gray-900 text-xl">Deployed!</h3>
                <p className="text-sm text-gray-500 mt-2">Your portfolio is live. It may take 1–2 minutes for GitHub Pages to activate.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500">Your portfolio URL</p>
                <div className="flex gap-2">
                  <input readOnly value={deployedUrl}
                    className="flex-1 text-sm font-mono text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2" />
                  <button onClick={handleCopy}
                    className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors">
                    {copyDone ? "✓" : "Copy"}
                  </button>
                </div>
                <a href={deployedUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline block">
                  Open in new tab ↗
                </a>
              </div>
              {/* QR code */}
              {qrDataUrl && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                  <img src={qrDataUrl} alt="QR code for portfolio" className="w-20 h-20 rounded-xl shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">QR Code</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Print this on your business card or resume to link directly to your live portfolio.</p>
                    <a href={qrDataUrl} download="portfolio-qr.png"
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-2 block">
                      Download QR image
                    </a>
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-2xl p-4 font-mono text-xs text-gray-500 max-h-32 overflow-y-auto space-y-1">
                {bobLog.map((line, i) => <p key={i}>{line}</p>)}
              </div>
              <div className="flex justify-end">
                <button onClick={onClose}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl hover:border-gray-400 transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Error ─────────────────────────────────────────── */}
          {step === "error" && (
            <div className="space-y-5">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Deployment failed</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
              <div className="bg-gray-950 rounded-2xl p-4 font-mono text-xs text-emerald-400 space-y-1 max-h-32 overflow-y-auto">
                {bobLog.map((line, i) => <p key={i}>{line}</p>)}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep("repo")} className="text-sm text-gray-500 hover:text-gray-700">← Try again</button>
                <button onClick={onClose}
                  className="text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
