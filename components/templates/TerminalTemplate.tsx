"use client";
import React, { useState, useEffect } from "react";
import type { PortfolioData } from "@/lib/types";
import { EditableText, EditableList } from "@/components/editor/EditableText";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

interface TemplateProps {
  data: PortfolioData;
  editMode: boolean;
  onUpdate: (updated: PortfolioData) => void;
}

export default function TerminalTemplate({ data, editMode, onUpdate }: TemplateProps) {
  const update = (patch: Partial<PortfolioData>) => onUpdate({ ...data, ...patch });
  const pageRef = useScrollReveal();
  const [blink, setBlink] = useState(true);
  const accent = data.accentColor ?? "#22c55e"; // green default
  const hidden = new Set<string>(data.hiddenSections ?? []);
  const show = (id: string) => !hidden.has(id);

  useEffect(() => {
    const timer = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(timer);
  }, []);

  /* ── Colour helpers ── */
  const dim = "rgba(255,255,255,0.35)";
  const dimmer = "rgba(255,255,255,0.18)";

  return (
    <div ref={pageRef} className="font-mono bg-[#0d1117] text-[#e6edf3] min-h-screen overflow-x-hidden">

      {/* ── HERO — full terminal screen ── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 overflow-hidden pt-6">

        {/* CRT scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)" }} />

        {/* Faint grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}0d 0%, transparent 60%)` }} />

        <div className="relative z-10 max-w-5xl mx-auto w-full">

          {/* Terminal window chrome */}
          <div className="mb-8 animate-fade-in" style={{ opacity: 0, animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs" style={{ color: dimmer }}>portfolio.sh — bash</span>
            </div>
            <div className="border rounded-2xl p-6 md:p-10 relative overflow-hidden" style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(22,27,34,0.6)" }}>

              {/* Line numbers column */}
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col pt-6 pl-3 gap-1 select-none" style={{ borderRight: "1px solid rgba(48,54,61,0.5)" }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i} className="text-[10px] leading-none" style={{ color: dimmer }}>{i + 1}</span>
                ))}
              </div>

              <div className="pl-10 md:pl-12">
                {/* Open to work badge */}
                <div className="mb-6">
                  {data.openToWork ? (
                    <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ color: "#4ade80", backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Open to Work
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: dimmer }}># available for opportunities</span>
                  )}
                </div>

                {/* Prompt line */}
                <div className="flex items-center gap-3 mb-2 text-sm">
                  <span style={{ color: accent }}>❯</span>
                  <span style={{ color: "#79c0ff" }}>whoami</span>
                </div>

                {/* Headshot + name */}
                <div className="flex items-end gap-6 mb-4 pl-4">
                  {data.headshot && (
                    <img src={data.headshot} alt={data.name} className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover shrink-0 ring-1 ring-white/10" />
                  )}
                  <div>
                    <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-black tracking-tight leading-none mb-2" style={{ color: accent }}>
                      <EditableText value={data.name} editMode={editMode} onCommit={(v) => update({ name: v })} className="block" />
                    </h1>
                    <p className="text-base md:text-xl font-semibold" style={{ color: "#79c0ff" }}>
                      <EditableText value={data.title} editMode={editMode} onCommit={(v) => update({ title: v })} placeholder="Your title" />
                    </p>
                  </div>
                </div>

                {/* Bio — shown as a comment block */}
                {data.bio && (
                  <div className="pl-4 mb-6 border-l-2" style={{ borderColor: `${accent}50` }}>
                    <p className="text-sm leading-relaxed" style={{ color: dim }}>
                      {/* Comment prefix */}
                      <span style={{ color: "#6e7681" }}>// </span>
                      <EditableText value={data.bio} editMode={editMode} onCommit={(v) => update({ bio: v })} multiline />
                    </p>
                  </div>
                )}

                {/* Contact row */}
                <div className="flex flex-wrap gap-4 text-sm pl-4">
                  {data.contact.email && (
                    <a href={`mailto:${data.contact.email}`} className="flex items-center gap-1.5 transition-colors hover:opacity-80"
                      style={{ color: accent }}>
                      <span style={{ color: "#6e7681" }}>email:</span> {data.contact.email}
                    </a>
                  )}
                  {data.contact.github && (
                    <a href={data.contact.github} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 transition-colors hover:opacity-80" style={{ color: accent }}>
                      <span style={{ color: "#6e7681" }}>github:</span> {data.contact.github.replace("https://github.com/", "@")}
                    </a>
                  )}
                  {data.contact.linkedin && show("contact_linkedin") && (
                    <a href={data.contact.linkedin} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 transition-colors hover:opacity-80" style={{ color: accent }}>
                      <span style={{ color: "#6e7681" }}>linkedin:</span> in/profile
                    </a>
                  )}
                </div>

                {/* Cursor */}
                <div className="flex items-center gap-2 mt-8 pl-4 text-sm">
                  <span style={{ color: accent }}>❯</span>
                  <span className="text-sm" style={{ color: "#79c0ff" }}>_</span>
                  <span className="inline-block w-2.5 h-5 ml-0.5 relative -top-px" style={{ backgroundColor: blink ? accent : "transparent" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      {data.projects.length > 0 && show("projects") && (
        <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
          <SectionHeader accent={accent} label="projects" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.projects.map((proj, i) => (
              <div key={proj.id}
                className={`reveal stagger-${Math.min(i + 1, 6)} rounded-xl overflow-hidden border`}
                style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(22,27,34,0.6)" }}>

                {/* File tab header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(13,17,23,0.5)" }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${accent}80` }} />
                  <span className="text-xs font-semibold" style={{ color: "#79c0ff" }}>{proj.name.toLowerCase().replace(/\s+/g, "-")}.ts</span>
                  <div className="ml-auto flex items-center gap-2">
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs transition-colors hover:opacity-80" style={{ color: accent }}>↗</a>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {/* Faux syntax line */}
                  <div className="text-xs mb-2" style={{ color: "#6e7681" }}>
                    <span style={{ color: "#ff7b72" }}>export const </span>
                    <span style={{ color: accent }}>{proj.name.replace(/\s+/g, "")} </span>
                    <span style={{ color: "#6e7681" }}>= {"{"}</span>
                  </div>

                  <p className="text-sm leading-relaxed mb-4 pl-4" style={{ color: dim }}>
                    <span style={{ color: "#6e7681" }}>// </span>
                    <EditableText value={proj.description} editMode={editMode} multiline onCommit={(v) => update({ projects: data.projects.map((p) => p.id === proj.id ? { ...p, description: v } : p) })} />
                  </p>

                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-4 mb-3">
                      {proj.technologies.map((t, ti) => (
                        <span key={ti} className="text-xs px-2 py-0.5 rounded font-medium border"
                          style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}30` }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs pl-0" style={{ color: "#6e7681" }}>{"}"}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EXPERIENCE ── */}
      {data.experience.length > 0 && show("experience") && (
        <section className="px-6 md:px-16 py-20">
          <div className="max-w-5xl mx-auto">
            <SectionHeader accent={accent} label="experience" />
            <div className="space-y-5">
              {data.experience.map((exp, i) => (
                <div key={exp.id}
                  className={`reveal stagger-${Math.min(i + 1, 6)} rounded-xl border overflow-hidden`}
                  style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(22,27,34,0.6)" }}>

                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(13,17,23,0.4)" }}>
                    <span style={{ color: "#ff7b72" }} className="text-xs">class </span>
                    <span style={{ color: accent }} className="text-sm font-bold">{exp.role.replace(/\s+/g, "")}</span>
                    <span style={{ color: "#6e7681" }} className="text-xs">extends </span>
                    <span style={{ color: "#79c0ff" }} className="text-sm">{exp.company}</span>
                    <div className="ml-auto text-xs px-3 py-1 rounded-full border" style={{ color: dimmer, borderColor: "rgba(48,54,61,0.8)" }}>
                      <EditableText value={`${exp.startDate}${exp.endDate ? ` → ${exp.endDate}` : ""}`} editMode={editMode} onCommit={(v) => {
                        const [s, end] = v.split("→").map((p) => p.trim());
                        update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, startDate: s, endDate: end ?? "" } : e) });
                      }} />
                    </div>
                  </div>

                  <div className="p-5 pl-8">
                    <ul className="space-y-2">
                      <EditableList
                        items={exp.bullets}
                        editMode={editMode}
                        onCommit={(items) => update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, bullets: items } : e) })}
                        getText={(item) => item}
                        setText={(_, text) => text}
                        renderWrapper={(children) => (
                          <li className="flex gap-2.5 text-sm" style={{ color: dim }}>
                            <span className="shrink-0 mt-0.5 text-xs" style={{ color: accent }}>▸</span>
                            <span className="leading-relaxed">{children}</span>
                          </li>
                        )}
                        newItem={() => "New achievement"}
                      />
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SKILLS ── */}
      {data.skills.length > 0 && show("skills") && (
        <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
          <SectionHeader accent={accent} label="skills" />
          <div className="rounded-xl border p-6" style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(22,27,34,0.6)" }}>
            <div className="text-xs mb-4" style={{ color: "#6e7681" }}>
              <span style={{ color: "#ff7b72" }}>const </span>
              <span style={{ color: accent }}>skills</span>
              <span>: string[] = [</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-4">
              {data.skills.map((skill, i) => (
                <span key={i}
                  className={`reveal-scale stagger-${Math.min((i % 6) + 1, 6)} text-sm px-3 py-1.5 rounded-lg border transition-all duration-300 cursor-default`}
                  style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}30` }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}25`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}10`; }}>
                  &ldquo;{skill}&rdquo;
                </span>
              ))}
            </div>
            <div className="text-xs mt-4 pl-0" style={{ color: "#6e7681" }}>];</div>
          </div>
        </section>
      )}

      {/* ── EDUCATION ── */}
      {data.education.length > 0 && show("education") && (
        <section className="px-6 md:px-16 py-20">
          <div className="max-w-5xl mx-auto">
            <SectionHeader accent={accent} label="education" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.education.map((edu, i) => (
                <div key={edu.id}
                  className={`reveal-scale stagger-${i + 1} rounded-xl border p-5`}
                  style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(22,27,34,0.6)" }}>
                  <p className="text-xs mb-2" style={{ color: "#6e7681" }}>
                    <span style={{ color: "#ff7b72" }}>import </span>
                    <span style={{ color: accent }}>&#123; degree &#125; </span>
                    <span>from &ldquo;</span>
                    <span style={{ color: "#a5d6ff" }}>
                      <EditableText value={edu.institution} editMode={editMode} onCommit={(v) => update({ education: data.education.map((e) => e.id === edu.id ? { ...e, institution: v } : e) })} />
                    </span>
                    <span>&rdquo;</span>
                  </p>
                  <p className="text-base font-bold text-white leading-tight">
                    <EditableText value={edu.degree + (edu.field ? ` — ${edu.field}` : "")} editMode={editMode} onCommit={(v) => update({ education: data.education.map((e) => e.id === edu.id ? { ...e, degree: v } : e) })} />
                  </p>
                  <p className="text-xs mt-2" style={{ color: dimmer }}>
                    graduated: <EditableText value={edu.endDate} editMode={editMode} onCommit={(v) => update({ education: data.education.map((e) => e.id === edu.id ? { ...e, endDate: v } : e) })} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GAME ── */}
      {data.game && show("game") && (
        <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
          <SectionHeader accent={accent} label="featured-game" />
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${accent}50`, background: "rgba(22,27,34,0.6)" }}>
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: `${accent}30`, background: `${accent}08` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
              <span className="text-xs font-bold" style={{ color: accent }}>{data.game.name.toLowerCase().replace(/\s+/g, "-")}.exe</span>
            </div>
            <div className="flex flex-col md:flex-row gap-6 p-6">
              {data.game.thumbnail && (
                <img src={data.game.thumbnail} alt={data.game.name} className="w-full md:w-40 h-28 object-cover rounded-lg shrink-0 ring-1 ring-white/10" />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-black text-white mb-2">
                  <EditableText value={data.game.name} editMode={editMode} onCommit={(v) => update({ game: { ...data.game!, name: v } })} />
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: dim }}>
                  <EditableText value={data.game.description} editMode={editMode} multiline onCommit={(v) => update({ game: { ...data.game!, description: v } })} />
                </p>
                {(data.game.technologies ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(data.game.technologies ?? []).map((t, ti) => (
                      <span key={ti} className="text-xs px-2.5 py-1 rounded font-medium border" style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}30` }}>{t}</span>
                    ))}
                  </div>
                )}
                <a href={data.game.url}
                  className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: accent, color: "#000" }}>
                  $ ./play.sh →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {(data.testimonials ?? []).length > 0 && show("testimonials") && (
        <section className="px-6 md:px-16 py-20">
          <div className="max-w-5xl mx-auto">
            <SectionHeader accent={accent} label="testimonials" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(data.testimonials ?? []).map((t, i) => (
                <div key={t.id}
                  className={`reveal stagger-${Math.min(i + 1, 6)} rounded-xl border p-6 relative`}
                  style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(22,27,34,0.6)" }}>
                  <span className="absolute top-4 left-5 text-xs" style={{ color: "#6e7681" }}>/** </span>
                  <p className="text-sm leading-relaxed mb-4 pl-5 pt-5 italic" style={{ color: dim }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 text-black" style={{ backgroundColor: accent }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-xs" style={{ color: dimmer }}>{t.title}{t.company ? `, ${t.company}` : ""}</p>
                    </div>
                  </div>
                  <span className="absolute bottom-4 right-5 text-xs" style={{ color: "#6e7681" }}>*/</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BLOG ── */}
      {(data.blog ?? []).length > 0 && show("blog") && (
        <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
          <SectionHeader accent={accent} label="writing" />
          <div className="space-y-3">
            {(data.blog ?? []).map((post, i) => (
              <a key={post.id} href={post.url} target="_blank" rel="noreferrer"
                className={`reveal stagger-${Math.min(i + 1, 6)} flex items-center gap-4 rounded-xl border p-4 transition-all duration-300`}
                style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(22,27,34,0.6)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}60`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(48,54,61,0.8)"; }}>
                <span className="text-xs shrink-0" style={{ color: accent }}>▸</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{post.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: dimmer }}>{post.excerpt}</p>
                </div>
                <span className="text-xs shrink-0 font-mono" style={{ color: dimmer }}>{post.date}</span>
                <span className="text-xs shrink-0" style={{ color: accent }}>→</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── TALKS ── */}
      {(data.talks ?? []).length > 0 && show("talks") && (
        <section className="px-6 md:px-16 py-20">
          <div className="max-w-5xl mx-auto">
            <SectionHeader accent={accent} label="talks" />
            <div className="space-y-3">
              {(data.talks ?? []).map((talk, i) => (
                <div key={talk.id}
                  className={`reveal stagger-${Math.min(i + 1, 6)} rounded-xl border p-5`}
                  style={{ borderColor: "rgba(48,54,61,0.8)", background: "rgba(22,27,34,0.6)" }}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-1.5">
                    <div>
                      <span className="text-xs" style={{ color: "#6e7681" }}>$ presented: </span>
                      <span className="font-bold text-white text-sm">{talk.title}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: dimmer }}>{talk.date}</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: accent }}>@ {talk.event}</p>
                  {talk.description && <p className="text-xs leading-relaxed mb-3" style={{ color: dimmer }}>{talk.description}</p>}
                  <div className="flex gap-3">
                    {talk.slidesUrl && (
                      <a href={talk.slidesUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ color: accent, backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}>
                        ./slides ↗
                      </a>
                    )}
                    {talk.videoUrl && (
                      <a href={talk.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ color: accent, backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}>
                        ▶ ./video
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── IMAGES ── */}
      {data.images.length > 0 && show("images") && (
        <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
          <SectionHeader accent={accent} label="gallery" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.images.map((img, i) => (
              <figure key={img.id} className={`reveal-scale stagger-${Math.min(i + 1, 6)} overflow-hidden rounded-xl ring-1 ring-white/10`}>
                <img src={img.url} alt={img.alt} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
                {img.caption && <figcaption className="text-xs py-2 text-center px-2" style={{ color: dimmer }}>{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t px-6 md:px-16 py-10" style={{ borderColor: "rgba(48,54,61,0.8)" }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-5 text-xs font-mono" style={{ color: dimmer }}>
          <div>
            <span style={{ color: accent }}>~/{data.name.toLowerCase().replace(/\s+/g, "")}$ </span>
            <span>echo &ldquo;{data.title}&rdquo;</span>
            {data.portfolioUrl && (
              <div className="mt-1">
                <span style={{ color: "#6e7681" }}>// </span>
                <a href={data.portfolioUrl} className="hover:opacity-80 transition-opacity" style={{ color: accent }}>{data.portfolioUrl}</a>
              </div>
            )}
          </div>
          <div className="flex gap-5">
            {data.contact.linkedin && show("contact_linkedin") && <a href={data.contact.linkedin} className="hover:opacity-80 transition-opacity" style={{ color: accent }}>LinkedIn</a>}
            {data.contact.github && show("contact_github") && <a href={data.contact.github} className="hover:opacity-80 transition-opacity" style={{ color: accent }}>GitHub</a>}
            {data.contact.email && <a href={`mailto:${data.contact.email}`} className="hover:opacity-80 transition-opacity" style={{ color: accent }}>{data.contact.email}</a>}
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ accent, label }: { accent: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10 reveal">
      <span className="text-xs font-bold" style={{ color: "#6e7681" }}>#</span>
      <span className="text-sm font-bold tracking-wide" style={{ color: accent }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}50, transparent)` }} />
      <span className="text-[10px] font-mono" style={{ color: "#6e7681" }}>{`</>`}</span>
    </div>
  );
}
