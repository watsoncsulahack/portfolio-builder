export const runtime = "nodejs";

import { renderToStaticMarkup } from "react-dom/server.browser";
import React from "react";
import { NextRequest, NextResponse } from "next/server";
import type { PortfolioData, TemplateId } from "@/lib/types";
import ClassicStatic from "@/lib/staticTemplates/ClassicStatic";
import BoldStatic from "@/lib/staticTemplates/BoldStatic";
import MinimalStatic from "@/lib/staticTemplates/MinimalStatic";
import VibrantStatic from "@/lib/staticTemplates/VibrantStatic";
import TerminalStatic from "@/lib/staticTemplates/TerminalStatic";

/** Keyframe + utility CSS to embed in the exported HTML so animations work without Tailwind CDN plugin */
const ANIMATION_CSS = `
/* Monospace font fallback for terminal template */
.font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important; }
@keyframes fade-up { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
@keyframes fade-in { from { opacity:0; } to { opacity:1; } }
@keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
@keyframes orb-pulse { 0%,100% { opacity:.15; transform:scale(1); } 50% { opacity:.25; transform:scale(1.1); } }
.animate-fade-up { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
.animate-fade-in { animation: fade-in 0.6s ease forwards; }
.animate-float { animation: float 4s ease-in-out infinite; }
.animate-orb { animation: orb-pulse 6s ease-in-out infinite; }
/* Scroll-reveal: start hidden, JS adds .revealed */
.reveal { opacity:0; transform:translateY(28px); transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1); }
.reveal-left { opacity:0; transform:translateX(-24px); transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1); }
.reveal-scale { opacity:0; transform:scale(.94); transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1); }
.reveal.revealed,.reveal-left.revealed,.reveal-scale.revealed { opacity:1; transform:none; }
.stagger-1{transition-delay:.05s}.stagger-2{transition-delay:.1s}.stagger-3{transition-delay:.15s}
.stagger-4{transition-delay:.2s}.stagger-5{transition-delay:.25s}.stagger-6{transition-delay:.3s}
/* Cursor blink for terminal template */
@keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
.cursor-blink { animation: cursor-blink 1.06s step-end infinite; }
`;

/** Inline scroll-reveal script — mirrors useScrollReveal hook behaviour */
const SCROLL_REVEAL_SCRIPT = `
<script>
(function(){
  var els = document.querySelectorAll('.reveal,.reveal-left,.reveal-scale');
  if(!els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el){ io.observe(el); });
  /* Trigger immediately-visible elements */
  setTimeout(function(){
    document.querySelectorAll('.reveal,.reveal-left,.reveal-scale').forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.top < window.innerHeight*0.95) el.classList.add('revealed');
    });
  },100);
})();
</script>
`;

function wrapInPage(bodyHtml: string, title: string, description: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(title)} — Portfolio</title>
<meta name="description" content="${escapeHtml(description.slice(0, 160))}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description.slice(0, 160))}">
<script src="https://cdn.tailwindcss.com"></script>
<style>
${ANIMATION_CSS}
/* Smooth scroll */
html { scroll-behavior: smooth; }
/* Print: show all content */
@media print {
  .reveal,.reveal-left,.reveal-scale { opacity:1!important; transform:none!important; }
  nav[style] { position:static!important; }
}
</style>
</head>
<body>
${bodyHtml}
${SCROLL_REVEAL_SCRIPT}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  try {
    const { data, templateId } = (await request.json()) as { data: PortfolioData; templateId: TemplateId };

    if (!data || !templateId) {
      return NextResponse.json({ error: "Missing data or templateId" }, { status: 400 });
    }

    let element: React.ReactElement;
    switch (templateId) {
      case "classic":
        element = React.createElement(ClassicStatic, { data });
        break;
      case "bold":
        element = React.createElement(BoldStatic, { data });
        break;
      case "minimal":
        element = React.createElement(MinimalStatic, { data });
        break;
      case "vibrant":
        element = React.createElement(VibrantStatic, { data });
        break;
      case "terminal":
        element = React.createElement(TerminalStatic, { data });
        break;
      default:
        element = React.createElement(ClassicStatic, { data });
    }

    const bodyHtml = renderToStaticMarkup(element);
    const html = wrapInPage(
      bodyHtml,
      data.name || "Portfolio",
      data.bio || `Portfolio of ${data.name}`
    );

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Render failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
