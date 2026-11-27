import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfolio Builder — Upload your resume, get a portfolio website",
  description: "Upload a .tex, .md, .pdf, or .docx resume. Pick from 5 modern templates. Deploy to GitHub Pages in one click. No code required.",
};

const TEMPLATES = [
  { name: "Classic",  bg: "from-slate-950 to-blue-950",  accent: "#3b82f6",  desc: "Dark hero, timeline experience, clean navy" },
  { name: "Minimal",  bg: "from-gray-50 to-white",        accent: "#111827",  desc: "Editorial giant type, maximum white space", dark: false },
  { name: "Bold",     bg: "from-[#080810] to-purple-950", accent: "#7c3aed",  desc: "Animated orbs, gradient name, dark glass" },
  { name: "Vibrant",  bg: "from-orange-500 to-yellow-400",accent: "#fff",     desc: "Diagonal colour block, energetic, creative" },
  { name: "Terminal", bg: "from-[#0d1117] to-[#161b22]",  accent: "#22c55e",  desc: "IDE aesthetic, syntax-highlighted sections" },
];

const FEATURES = [
  { icon: "📄", title: "Any resume format", body: ".tex, .md, .pdf, .docx — parsed locally or by AI. No account needed." },
  { icon: "🎨", title: "5 pro templates",   body: "Classic, Minimal, Bold, Vibrant, Terminal — each fully themed with animations." },
  { icon: "✏️", title: "Click-to-edit",     body: "Edit any text directly in the preview. Changes save automatically to your browser." },
  { icon: "🎭", title: "Accent colours",    body: "One colour picker themes the entire template — buttons, tags, gradients, borders." },
  { icon: "👤", title: "Headshot & gallery", body: "Upload a headshot for the hero. Add a photo gallery and project images." },
  { icon: "🎮", title: "Game / featured work", body: "Dedicated card for a game or side project, with tech tags and a Play button." },
  { icon: "🙈", title: "Show / hide sections", body: "Toggle any section or contact field on or off with a single switch." },
  { icon: "🚀", title: "One-click deploy",  body: "GitHub Pages wizard commits index.html with your PAT — full revision history." },
  { icon: "⬇️", title: "Download HTML",    body: "Fully self-contained file: Tailwind CDN, inline images, all animations included." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(10,10,15,0.9)", backdropFilter: "blur(16px)" }}>
        <span className="font-black text-sm tracking-tight">
          <span className="text-purple-400">◈</span> Portfolio Builder
        </span>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors hidden sm:block">Features</a>
          <a href="#templates" className="hover:text-white transition-colors hidden sm:block">Templates</a>
          <Link href="/build"
            className="bg-white text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
            Try it free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 pt-24 pb-20 text-center max-w-5xl mx-auto">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, #3b82f6 50%, transparent 70%)" }} />

        <div className="relative z-10">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1.5 rounded-full mb-6">
            Powered by IBM Granite · Bob AI
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Upload your resume.
            <br />
            <span style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Get a portfolio website.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            Drop a <code className="text-white/70 bg-white/10 px-1.5 py-0.5 rounded">.tex</code>,{" "}
            <code className="text-white/70 bg-white/10 px-1.5 py-0.5 rounded">.md</code>,{" "}
            <code className="text-white/70 bg-white/10 px-1.5 py-0.5 rounded">.pdf</code>, or{" "}
            <code className="text-white/70 bg-white/10 px-1.5 py-0.5 rounded">.docx</code> file.
            Pick a template. Click to edit. Deploy to GitHub Pages — no code, no account, no cost.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/build"
              className="inline-flex items-center gap-2 font-bold text-base px-7 py-3.5 rounded-xl text-white transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)", boxShadow: "0 4px 24px rgba(124,58,237,0.4)" }}>
              I have a resume →
            </Link>
            <Link href="/build#profile"
              className="inline-flex items-center gap-2 font-bold text-base px-7 py-3.5 rounded-xl border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all">
              ✍️ Start from scratch
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: "01", icon: "📄✍️", title: "Resume or profile", body: "Upload a .pdf/.docx/.tex/.md resume, or fill out a quick form from scratch. IBM Bob handles the rest." },
            { n: "02", icon: "🎨", title: "Pick a template & edit", body: "5 animated templates. Click any text in the preview to edit it. Toggle sections on/off. Customise colours." },
            { n: "03", icon: "🚀", title: "Deploy or download", body: "GitHub Pages wizard — one click commits your portfolio. Or download a self-contained HTML file." },
          ].map(({ n, icon, title, body }) => (
            <div key={n} className="rounded-2xl border border-white/10 p-6"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{n}</span>
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">5 beautiful templates</h2>
          <p className="text-white/50">Every template includes scroll-reveal animations, accent colour theming, and responsive layout.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {TEMPLATES.map(({ name, bg, accent, desc, dark }) => (
            <div key={name} className="rounded-2xl overflow-hidden border border-white/10 group cursor-default">
              <div className={`h-24 bg-gradient-to-br ${bg} flex items-end p-3 relative overflow-hidden`}>
                {/* Fake name text */}
                <span className="font-black text-sm leading-none" style={{ color: accent, opacity: dark === false ? 0.8 : 0.9 }}>
                  {name}
                </span>
                {/* Decorative dot */}
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: accent, opacity: 0.6 }} />
              </div>
              <div className="p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="font-semibold text-white text-xs mb-1">{name}</p>
                <p className="text-[11px] text-white/40 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Everything you need</h2>
          <p className="text-white/50">No hosting fees. No sign-up. Your data stays in your browser.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-white/10 p-5"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="text-2xl block mb-3">{icon}</span>
              <h3 className="font-bold text-white text-sm mb-1.5">{title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
          Resume or no resume —<br />
          <span style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            you get a portfolio.
          </span>
        </h2>
        <p className="text-white/40 mb-8">Free. No sign-up. Your data stays in your browser.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/build"
            className="inline-flex items-center gap-2 font-bold text-lg px-8 py-4 rounded-xl text-white transition-all hover:scale-105 hover:shadow-2xl"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)", boxShadow: "0 4px 24px rgba(124,58,237,0.4)" }}>
            Upload a resume →
          </Link>
          <Link href="/build"
            className="inline-flex items-center gap-2 font-bold text-lg px-8 py-4 rounded-xl border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all">
            ✍️ Build from scratch
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/30">
        Built with IBM Granite on watsonx.ai · Created by Allan Rojas
      </footer>
    </div>
  );
}
