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

export default function ClassicTemplate({ data, editMode, onUpdate }: TemplateProps) {
  const update = (patch: Partial<PortfolioData>) => onUpdate({ ...data, ...patch });
  const pageRef = useScrollReveal();

  const accent = data.accentColor ?? "#2563eb"; // blue-600 default
  const hidden = new Set<string>(data.hiddenSections ?? []);
  const show = (id: string) => !hidden.has(id);

  return (
    <div ref={pageRef} className="font-sans bg-white text-gray-900 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-950 text-white min-h-[85vh] flex flex-col justify-end px-6 md:px-16 pb-16 overflow-hidden">

        {/* Geometric accent lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "30px 30px" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)` }} />
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${accent}25 0%, transparent 70%)` }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full pt-10">
          {/* Open to work / availability badge */}
          <div className="animate-fade-in mb-8" style={{ opacity: 0, animationDelay: "0.1s" }}>
            {data.openToWork ? (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open to Work
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-400/10 border border-slate-400/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                Available for opportunities
              </span>
            )}
          </div>

          {/* Headshot + name row */}
          <div className="animate-fade-up flex items-end gap-6 mb-5" style={{ opacity: 0, animationDelay: "0.2s" }}>
            {data.headshot && (
              <img src={data.headshot} alt={data.name}
                className="w-36 h-36 md:w-48 md:h-48 rounded-2xl object-cover shrink-0 shadow-xl"
                style={{ boxShadow: `0 0 0 3px ${accent}50` }} />
            )}
            <h1 className="text-[clamp(3rem,8vw,7rem)] font-black tracking-tight leading-[0.9]">
              <span className="block" style={{ color: accent }}>
                <EditableText value={data.name} editMode={editMode} onCommit={(v) => update({ name: v })} className="block" />
              </span>
            </h1>
          </div>

          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: "0.35s" }}>
            <p className="text-xl md:text-2xl font-medium mb-5" style={{ color: `${accent}cc` }}>
              <EditableText value={data.title} editMode={editMode} onCommit={(v) => update({ title: v })} placeholder="Your title" />
            </p>
          </div>

          {data.bio && (
            <div className="animate-fade-up" style={{ opacity: 0, animationDelay: "0.5s" }}>
              <p className="text-slate-300 leading-relaxed max-w-xl text-base mb-8">
                <EditableText value={data.bio} editMode={editMode} onCommit={(v) => update({ bio: v })} multiline />
              </p>
            </div>
          )}

          <div className="animate-fade-up flex flex-wrap gap-3" style={{ opacity: 0, animationDelay: "0.6s" }}>
            {data.contact.email && (
              <a href={`mailto:${data.contact.email}`}
                className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: accent, boxShadow: `0 4px 15px ${accent}40` }}>
                Get in touch →
              </a>
            )}
            {data.contact.phone && show("contact_phone") && (
              <span className="inline-flex items-center text-sm text-slate-400 px-4 py-2.5 rounded-xl border border-slate-700">
                {data.contact.phone}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────────────────── */}
      {data.projects.length > 0 && show("projects") && (
        <section id="classic-projects" className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="reveal mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Work</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Selected Projects</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.projects.map((proj, i) => (
              <div key={proj.id}
                className={`reveal-scale stagger-${Math.min(i + 1, 6)} group relative bg-gray-50 hover:bg-white border border-gray-200 rounded-2xl p-7 transition-all duration-300 hover:shadow-xl`}
                style={{ ["--tw-shadow-color" as string]: `${accent}18` }}>

                {/* Top accent line */}
                <div className="absolute top-0 left-7 right-7 h-0.5 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full"
                  style={{ background: `linear-gradient(to right, ${accent}, ${accent}80)` }} />

                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-gray-900 transition-colors" style={{ ["--hover-color" as string]: accent }}>
                    <EditableText value={proj.name} editMode={editMode} onCommit={(v) => update({ projects: data.projects.map((p) => p.id === proj.id ? { ...p, name: v } : p) })} />
                  </h3>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noreferrer"
                      className="shrink-0 w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-sm transition-all duration-300 hover:text-white"
                      style={{ ["--hover-bg" as string]: accent }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = accent; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.color = ""; }}>
                      ↗
                    </a>
                  )}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  <EditableText value={proj.description} editMode={editMode} multiline onCommit={(v) => update({ projects: data.projects.map((p) => p.id === proj.id ? { ...p, description: v } : p) })} />
                </p>

                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {proj.technologies.map((t, ti) => (
                      <span key={ti} className="text-xs px-2.5 py-1 rounded-lg font-medium border"
                        style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}25` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EXPERIENCE ───────────────────────────────────────────────────── */}
      {data.experience.length > 0 && show("experience") && (
        <section id="classic-experience" className="px-6 md:px-16 py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="reveal mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Career</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Experience</h2>
            </div>

            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-3 bottom-3 w-px hidden md:block"
                style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}60, transparent)` }} />

              <div className="space-y-10">
                {data.experience.map((exp, i) => (
                  <div key={exp.id} className={`reveal stagger-${Math.min(i + 1, 6)} relative md:pl-14`}>
                    {/* Timeline dot */}
                    <div className="hidden md:flex absolute left-0 top-1 w-9 h-9 rounded-full bg-white border-2 items-center justify-center shadow-sm"
                      style={{ borderColor: accent }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          <EditableText value={exp.role} editMode={editMode} onCommit={(v) => update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, role: v } : e) })} />
                        </h3>
                        <p className="font-semibold" style={{ color: accent }}>
                          <EditableText value={exp.company} editMode={editMode} onCommit={(v) => update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, company: v } : e) })} />
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                        <EditableText value={`${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ""}`} editMode={editMode} onCommit={(v) => {
                          const [s, end] = v.split("–").map((p) => p.trim());
                          update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, startDate: s, endDate: end ?? "" } : e) });
                        }} />
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-gray-600 text-sm">
                      <EditableList
                        items={exp.bullets}
                        editMode={editMode}
                        onCommit={(items) => update({ experience: data.experience.map((e) => e.id === exp.id ? { ...e, bullets: items } : e) })}
                        getText={(item) => item}
                        setText={(_, text) => text}
                        renderWrapper={(children) => (
                          <li className="flex gap-2.5 leading-relaxed">
                            <span className="shrink-0 mt-1" style={{ color: accent }}>›</span>
                            <span>{children}</span>
                          </li>
                        )}
                        newItem={() => "New achievement"}
                      />
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SKILLS ───────────────────────────────────────────────────────── */}
      {data.skills.length > 0 && show("skills") && (
        <section id="classic-skills" className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="reveal mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Expertise</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Skills</h2>
          </div>
          <div className="reveal flex flex-wrap gap-3">
            {data.skills.map((skill, i) => (
              <span key={i}
                className={`reveal-scale stagger-${Math.min((i % 6) + 1, 6)} px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-xl transition-all duration-300 cursor-default shadow-sm hover:border-opacity-80 hover:shadow-md`}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; (e.currentTarget as HTMLElement).style.color = accent; (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}08`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.color = ""; (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── EDUCATION ────────────────────────────────────────────────────── */}
      {data.education.length > 0 && show("education") && (
        <section id="classic-education" className="px-6 md:px-16 py-24 bg-gradient-to-br from-slate-950 to-blue-950 text-white">
          <div className="max-w-5xl mx-auto">
            <div className="reveal mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: `${accent}cc` }}>Background</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">Education</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.education.map((edu, i) => (
                <div key={edu.id} className={`reveal-scale stagger-${i + 1} rounded-2xl p-7 border border-white/10 hover:border-white/20 transition-all duration-300`}
                  style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${accent}cc` }}>
                    <EditableText value={edu.endDate} editMode={editMode} onCommit={(v) => update({ education: data.education.map((e) => e.id === edu.id ? { ...e, endDate: v } : e) })} />
                  </p>
                  <p className="font-bold text-white text-xl leading-tight">
                    <EditableText value={edu.degree + (edu.field ? ` — ${edu.field}` : "")} editMode={editMode} onCommit={(v) => update({ education: data.education.map((e) => e.id === edu.id ? { ...e, degree: v } : e) })} />
                  </p>
                  <p className="text-blue-200 text-sm mt-2">
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
        <section className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="reveal mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Side Project</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Featured Game</h2>
          </div>
          <div className="reveal-scale rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start hover:shadow-xl transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${accent}08 0%, ${accent}04 100%)`, border: `1px solid ${accent}20` }}>
            {data.game.thumbnail && (
              <img src={data.game.thumbnail} alt={data.game.name}
                className="w-full md:w-44 h-32 object-cover rounded-2xl shrink-0 shadow-md" />
            )}
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
                <EditableText value={data.game.name} editMode={editMode} onCommit={(v) => update({ game: { ...data.game!, name: v } })} />
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                <EditableText value={data.game.description} editMode={editMode} multiline onCommit={(v) => update({ game: { ...data.game!, description: v } })} />
              </p>
              {(data.game.technologies ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {(data.game.technologies ?? []).map((t, ti) => (
                    <span key={ti} className="text-xs px-2.5 py-1 rounded-lg font-medium border"
                      style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}25` }}>
                      {t}
                    </span>
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
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      {(data.testimonials ?? []).length > 0 && show("testimonials") && (
        <section className="px-6 md:px-16 py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="reveal mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Social Proof</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">What People Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.testimonials ?? []).map((t, i) => (
                <div key={t.id} className={`reveal stagger-${Math.min(i + 1, 6)} bg-white rounded-2xl p-7 border border-gray-200 shadow-sm relative`}>
                  <span className="absolute top-5 right-6 text-5xl font-serif leading-none" style={{ color: `${accent}20` }}>&ldquo;</span>
                  <p className="text-gray-700 leading-relaxed mb-5 italic relative z-10">&ldquo;{t.quote}&rdquo;</p>
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
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.title}{t.company ? `, ${t.company}` : ""}</p>
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
        <section className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="reveal mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Writing</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Blog</h2>
          </div>
          <div className="space-y-5">
            {(data.blog ?? []).map((post, i) => (
              <a key={post.id} href={post.url} target="_blank" rel="noreferrer"
                className={`reveal stagger-${Math.min(i + 1, 6)} group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 bg-white`}>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">{post.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                  {(post.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(post.tags ?? []).map((tag, ti) => (
                        <span key={ti} className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: `${accent}12`, color: accent }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <span className="text-gray-400 group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── TALKS ────────────────────────────────────────────────────────── */}
      {(data.talks ?? []).length > 0 && show("talks") && (
        <section className="px-6 md:px-16 py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="reveal mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Speaking</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Talks & Presentations</h2>
            </div>
            <div className="space-y-5">
              {(data.talks ?? []).map((talk, i) => (
                <div key={talk.id} className={`reveal stagger-${Math.min(i + 1, 6)} bg-white rounded-2xl p-6 border border-gray-200`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{talk.title}</h3>
                      <p className="text-sm font-medium mt-0.5" style={{ color: accent }}>{talk.event}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{talk.date}</span>
                  </div>
                  {talk.description && <p className="text-sm text-gray-600 leading-relaxed mb-3">{talk.description}</p>}
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
        <section className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="reveal mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Gallery</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.images.map((img, i) => (
              <figure key={img.id} className={`reveal-scale stagger-${Math.min(i + 1, 6)} overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300`}>
                <img src={img.url} alt={img.alt} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
                {img.caption && <figcaption className="text-xs text-gray-500 py-2 text-center bg-gray-50">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 px-6 md:px-16 py-12">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-white font-bold text-lg">{data.name}</p>
            <p className="text-slate-500 text-sm mt-1">{data.title}</p>
            {data.portfolioUrl && (
              <a href={data.portfolioUrl} className="text-xs mt-1 hover:text-white transition-colors" style={{ color: `${accent}99` }}>
                {data.portfolioUrl}
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            {data.contact.linkedin && show("contact_linkedin") && <a href={data.contact.linkedin} className="hover:text-white transition-colors">LinkedIn ↗</a>}
            {data.contact.github && show("contact_github") && <a href={data.contact.github} className="hover:text-white transition-colors">GitHub ↗</a>}
            {data.contact.email && <a href={`mailto:${data.contact.email}`} className="hover:text-white transition-colors">{data.contact.email}</a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
