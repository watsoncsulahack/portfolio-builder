"use client";
import React from "react";
import type { PortfolioData } from "@/lib/types";
import { EditableText, EditableList } from "@/components/editor/EditableText";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

interface TemplateProps {
  data: PortfolioData;
  editMode: boolean;
  onUpdate: (updated: PortfolioData) => void;
}

export default function BoldTemplate({ data, editMode, onUpdate }: TemplateProps) {
  const update = (patch: Partial<PortfolioData>) => onUpdate({ ...data, ...patch });
  const pageRef = useScrollReveal();
  const accent = data.accentColor ?? "#7c3aed"; // violet-600 default
  const hidden = new Set<string>(data.hiddenSections ?? []);
  const show = (id: string) => !hidden.has(id);

  return (
    <div ref={pageRef} className="font-sans bg-[#080810] text-white min-h-screen overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 overflow-hidden">

        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-orb absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
            style={{ background: `radial-gradient(circle, ${accent}4d 0%, transparent 70%)` }} />
          <div className="animate-orb absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)", animationDelay: "2s" }} />
          <div className="animate-orb absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)", animationDelay: "4s" }} />
        </div>

        {/* Grid overlay texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-6xl mx-auto w-full pt-8 pb-16">

          {/* Eyebrow */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s", opacity: 0 }}>
            {data.openToWork ? (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open to Work
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ color: accent }}>
                <span className="w-8 h-px inline-block" style={{ backgroundColor: accent }} />
                Portfolio
                <span className="w-8 h-px inline-block" style={{ backgroundColor: accent }} />
              </span>
            )}
          </div>

          {/* Headshot + Name */}
          <div className="animate-fade-up flex items-end gap-6 mb-4" style={{ animationDelay: "0.2s", opacity: 0 }}>
            {data.headshot && (
              <img src={data.headshot} alt={data.name}
                className="w-36 h-36 md:w-48 md:h-48 rounded-2xl object-cover shrink-0 shadow-2xl"
                style={{ boxShadow: `0 0 0 3px ${accent}66` }} />
            )}
            <h1 className="text-[clamp(3.5rem,10vw,9rem)] font-black tracking-tighter leading-[0.9]">
              <span className="text-gradient block" style={{ backgroundImage: `linear-gradient(135deg, #fff 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                <EditableText value={data.name} editMode={editMode} onCommit={(v) => update({ name: v })} className="block" />
              </span>
            </h1>
          </div>

          {/* Title */}
          <div className="animate-fade-up" style={{ animationDelay: "0.35s", opacity: 0 }}>
            <p className="text-xl md:text-3xl font-medium mb-6 text-teal-300">
              <EditableText value={data.title} editMode={editMode} onCommit={(v) => update({ title: v })} placeholder="Your title" />
            </p>
          </div>

          {/* Bio */}
          {data.bio && (
            <div className="animate-fade-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-2xl mb-10">
                <EditableText value={data.bio} editMode={editMode} onCommit={(v) => update({ bio: v })} multiline />
              </p>
            </div>
          )}

          {/* Contact links */}
          <div className="animate-fade-up flex flex-wrap gap-3" style={{ animationDelay: "0.65s", opacity: 0 }}>
            {data.contact.email && (
              <a href={`mailto:${data.contact.email}`}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:border-violet-500 hover:text-white hover:bg-violet-500/10 transition-all duration-300">
                <span>✉</span> {data.contact.email}
              </a>
            )}
            {data.contact.linkedin && (
              <a href={data.contact.linkedin} target="_blank" rel="noreferrer"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:border-teal-500 hover:text-white hover:bg-teal-500/10 transition-all duration-300">
                LinkedIn ↗
              </a>
            )}
            {data.contact.github && (
              <a href={data.contact.github} target="_blank" rel="noreferrer"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:border-teal-500 hover:text-white hover:bg-teal-500/10 transition-all duration-300">
                GitHub ↗
              </a>
            )}
            {data.contact.phone && show("contact_phone") && (
              <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-500">
                {data.contact.phone}
              </span>
            )}
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float hidden md:flex flex-col items-center gap-2 text-zinc-600 text-xs">
            <span>scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-zinc-600 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────────────────── */}
      {data.projects.length > 0 && show("projects") && (
        <section id="bold-projects" className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="reveal flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Selected Work</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.projects.map((proj, i) => (
              <div key={proj.id}
                className={`reveal reveal-scale stagger-${Math.min(i + 1, 6)} group relative border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-500 cursor-default`}
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}99`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = ""; }}>

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${accent}26 0%, transparent 60%)` }} />

                <div className="relative p-7">
                  {/* Number */}
                  <span className="text-6xl font-black text-zinc-900 select-none absolute top-5 right-6 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3 className="text-xl font-bold text-white mb-3 transition-colors duration-300 group-hover:opacity-80">
                    <EditableText value={proj.name} editMode={editMode} onCommit={(v) => update({ projects: data.projects.map((p) => p.id === proj.id ? { ...p, name: v } : p) })} />
                  </h3>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                    <EditableText value={proj.description} editMode={editMode} multiline onCommit={(v) => update({ projects: data.projects.map((p) => p.id === proj.id ? { ...p, description: v } : p) })} />
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {proj.technologies.map((t, ti) => (
                      <span key={ti} className="text-xs bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-lg font-medium" style={{ color: accent }}>{t}</span>
                    ))}
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer"
                        className="ml-auto text-sm font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                        style={{ color: accent }}>
                        View project <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EXPERIENCE ───────────────────────────────────────────────────── */}
      {data.experience.length > 0 && show("experience") && (
        <section id="bold-experience" className="px-6 md:px-16 py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${accent}08 50%, transparent 100%)` }}>
          <div className="max-w-6xl mx-auto">
            <div className="reveal flex items-center gap-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Experience</span>
              <div className="flex-1 h-px bg-gradient-to-r from-teal-500/50 to-transparent" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
            </div>

            <div className="space-y-5">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className={`reveal stagger-${Math.min(i + 1, 6)} group border border-zinc-800/80 rounded-2xl p-7 hover:border-zinc-700 transition-all duration-300`}
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 100%)" }}>

                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                        <EditableText value={exp.role} editMode={editMode} onCommit={(v) => update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, role: v } : e) })} />
                      </h3>
                      <p className="text-teal-400 font-semibold mt-1">
                        <EditableText value={exp.company} editMode={editMode} onCommit={(v) => update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, company: v } : e) })} />
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full font-medium shrink-0">
                      <EditableText value={`${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ""}`} editMode={editMode} onCommit={(v) => {
                        const [s, end] = v.split("–").map((p) => p.trim());
                        update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, startDate: s, endDate: end ?? "" } : e) });
                      }} />
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    <EditableList
                      items={exp.bullets}
                      editMode={editMode}
                      onCommit={(items) => update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, bullets: items } : e) })}
                      getText={(item) => item}
                      setText={(_, text) => text}
                      renderWrapper={(children) => (
                        <li className="flex gap-3 text-sm text-zinc-400">
                          <span className="mt-0.5 shrink-0 text-xs" style={{ color: accent }}>▸</span>
                          <span className="leading-relaxed">{children}</span>
                        </li>
                      )}
                      newItem={() => "New achievement"}
                    />
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SKILLS ───────────────────────────────────────────────────────── */}
      {data.skills.length > 0 && show("skills") && (
        <section id="bold-skills" className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="reveal flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Skills</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
          </div>
          <div className="reveal flex flex-wrap gap-3">
            {data.skills.map((skill, i) => (
              <span key={i}
                className={`reveal-scale stagger-${Math.min((i % 6) + 1, 6)} px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 cursor-default`}
                style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.03)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}1a`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── EDUCATION ────────────────────────────────────────────────────── */}
      {data.education.length > 0 && show("education") && (
        <section id="bold-education" className="px-6 md:px-16 py-24" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.04) 50%, transparent 100%)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="reveal flex items-center gap-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Education</span>
              <div className="flex-1 h-px bg-gradient-to-r from-teal-500/50 to-transparent" style={{ background: "linear-gradient(to right, rgba(20,184,166,0.5), transparent)" }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.education.map((edu, i) => (
                <div key={edu.id} className={`reveal-scale stagger-${i + 1} border border-zinc-800/80 rounded-2xl p-7`}
                  style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.05) 0%, transparent 100%)" }}>
                  <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">
                    <EditableText value={edu.endDate} editMode={editMode} onCommit={(v) => update({ education: data.education.map((e) => e.id === edu.id ? { ...e, endDate: v } : e) })} />
                  </p>
                  <p className="font-bold text-white text-lg leading-tight">
                    <EditableText value={edu.degree + (edu.field ? ` — ${edu.field}` : "")} editMode={editMode} onCommit={(v) => update({ education: data.education.map((e) => e.id === edu.id ? { ...e, degree: v } : e) })} />
                  </p>
                  <p className="text-zinc-400 text-sm mt-2">
                    <EditableText value={edu.institution} editMode={editMode} onCommit={(v) => update({ education: data.education.map((e) => e.id === edu.id ? { ...e, institution: v } : e) })} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GAME ─────────────────────────────────────────────────────────── */}
      {data.game && show("game") && (
        <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="reveal flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Featured Game</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
          </div>
          <div className="reveal-scale relative rounded-3xl p-8 md:p-12 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${accent}1a 0%, rgba(20,184,166,0.05) 100%)`, border: `1px solid ${accent}50` }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)` }} />
            <div className="relative flex flex-col md:flex-row gap-8 items-start">
              {data.game.thumbnail && (
                <img src={data.game.thumbnail} alt={data.game.name}
                  className="w-full md:w-48 h-32 object-cover rounded-2xl shrink-0"
                  style={{ boxShadow: `0 0 0 1px ${accent}50` }} />
              )}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                  <EditableText value={data.game.name} editMode={editMode} onCommit={(v) => update({ game: { ...data.game!, name: v } })} />
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  <EditableText value={data.game.description} editMode={editMode} multiline onCommit={(v) => update({ game: { ...data.game!, description: v } })} />
                </p>
                {(data.game.technologies ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(data.game.technologies ?? []).map((t, ti) => (
                      <span key={ti} className="text-xs bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-lg font-medium" style={{ color: accent }}>{t}</span>
                    ))}
                  </div>
                )}
                <a href={data.game.url}
                  className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: accent, boxShadow: `0 4px 15px ${accent}40` }}>
                  🎮 Play Now →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      {(data.testimonials ?? []).length > 0 && show("testimonials") && (
        <section className="px-6 md:px-16 py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${accent}06 50%, transparent 100%)` }}>
          <div className="max-w-6xl mx-auto">
            <div className="reveal flex items-center gap-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Social Proof</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.testimonials ?? []).map((t, i) => (
                <div key={t.id} className={`reveal stagger-${Math.min(i + 1, 6)} rounded-2xl p-7 relative border border-zinc-800/80`}
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}>
                  <span className="absolute top-5 right-6 text-5xl font-serif leading-none" style={{ color: `${accent}30` }}>&ldquo;</span>
                  <p className="text-zinc-300 leading-relaxed mb-5 italic relative z-10 text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: accent }}>
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-zinc-500">{t.title}{t.company ? `, ${t.company}` : ""}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BLOG ─────────────────────────────────────────────────────────── */}
      {(data.blog ?? []).length > 0 && show("blog") && (
        <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="reveal flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Writing</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
          </div>
          <div className="space-y-4">
            {(data.blog ?? []).map((post, i) => (
              <a key={post.id} href={post.url} target="_blank" rel="noreferrer"
                className={`reveal stagger-${Math.min(i + 1, 6)} group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300`}
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 100%)" }}>
                <div className="flex-1">
                  <p className="font-bold text-white mb-1 group-hover:opacity-80 transition-opacity">{post.title}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{post.excerpt}</p>
                  {(post.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(post.tags ?? []).map((tag, ti) => (
                        <span key={ti} className="text-xs px-2 py-0.5 rounded font-medium bg-zinc-900 border border-zinc-800" style={{ color: accent }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs text-zinc-600">{post.date}</span>
                  <span className="text-zinc-600 group-hover:translate-x-1 transition-transform duration-200" style={{ color: accent }}>→</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── TALKS ────────────────────────────────────────────────────────── */}
      {(data.talks ?? []).length > 0 && show("talks") && (
        <section className="px-6 md:px-16 py-24" style={{ background: `linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.04) 50%, transparent 100%)` }}>
          <div className="max-w-6xl mx-auto">
            <div className="reveal flex items-center gap-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Speaking</span>
              <div className="flex-1 h-px bg-gradient-to-r from-teal-500/50 to-transparent" />
            </div>
            <div className="space-y-4">
              {(data.talks ?? []).map((talk, i) => (
                <div key={talk.id} className={`reveal stagger-${Math.min(i + 1, 6)} border border-zinc-800/80 rounded-2xl p-6`}
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 100%)" }}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-lg">{talk.title}</h3>
                      <p className="text-sm font-medium mt-0.5 text-teal-400">{talk.event}</p>
                    </div>
                    <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">{talk.date}</span>
                  </div>
                  {talk.description && <p className="text-sm text-zinc-500 leading-relaxed mb-3">{talk.description}</p>}
                  <div className="flex gap-3">
                    {talk.slidesUrl && (
                      <a href={talk.slidesUrl} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:text-white"
                        style={{ borderColor: accent, color: accent }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = accent; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.color = accent; }}>
                        Slides ↗
                      </a>
                    )}
                    {talk.videoUrl && (
                      <a href={talk.videoUrl} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:text-white"
                        style={{ borderColor: accent, color: accent }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = accent; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.color = accent; }}>
                        ▶ Watch
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── IMAGES ───────────────────────────────────────────────────────── */}
      {data.images.length > 0 && show("images") && (
        <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="reveal flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Gallery</span>
            <div className="flex-1 h-px bg-gradient-to-r from-teal-500/50 to-transparent" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.images.map((img, i) => (
              <figure key={img.id} className={`reveal-scale stagger-${Math.min(i + 1, 6)} overflow-hidden rounded-2xl ring-1 ring-zinc-800`}>
                <img src={img.url} alt={img.alt} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
                {img.caption && <figcaption className="text-xs text-zinc-500 mt-2 text-center px-2 pb-2">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 px-6 md:px-16 py-10 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-600">
        <div>
          <span className="font-bold text-zinc-500">{data.name}</span>
          {data.portfolioUrl && (
            <a href={data.portfolioUrl} className="block text-xs mt-0.5 hover:text-zinc-400 transition-colors" style={{ color: `${accent}80` }}>
              {data.portfolioUrl}
            </a>
          )}
        </div>
        <div className="flex gap-5">
          {data.contact.linkedin && show("contact_linkedin") && <a href={data.contact.linkedin} className="hover:text-zinc-400 transition-colors">LinkedIn</a>}
          {data.contact.github && show("contact_github") && <a href={data.contact.github} className="hover:text-zinc-400 transition-colors">GitHub</a>}
          {data.contact.email && <a href={`mailto:${data.contact.email}`} className="hover:text-zinc-400 transition-colors">{data.contact.email}</a>}
        </div>
      </footer>
    </div>
  );
}
