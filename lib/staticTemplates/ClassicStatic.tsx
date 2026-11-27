import React from "react";
import type { PortfolioData } from "@/lib/types";

/** Server-safe (no hooks) version of ClassicTemplate for static HTML export */
export default function ClassicStatic({ data }: { data: PortfolioData }) {
  const accent = data.accentColor ?? "#2563eb";
  const hidden = new Set<string>(data.hiddenSections ?? []);
  const show = (id: string) => !hidden.has(id);

  return (
    <div className="font-sans bg-white text-gray-900 overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-slate-950 text-white min-h-[85vh] flex flex-col justify-end px-6 md:px-16 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "30px 30px" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)` }} />
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${accent}25 0%, transparent 70%)` }} />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto w-full pt-10">
          <div className="mb-8">
            {data.openToWork ? (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Open to Work
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-400/10 border border-slate-400/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Available for opportunities
              </span>
            )}
          </div>
          <div className="flex items-end gap-6 mb-5">
            {data.headshot && (
              <img src={data.headshot} alt={data.name} className="w-36 h-36 md:w-48 md:h-48 rounded-2xl object-cover shrink-0 shadow-xl"
                style={{ boxShadow: `0 0 0 2px ${accent}50` }} />
            )}
            <h1 className="text-7xl font-black tracking-tight leading-none" style={{ color: accent }}>{data.name}</h1>
          </div>
          <p className="text-xl md:text-2xl font-medium mb-5" style={{ color: `${accent}cc` }}>{data.title}</p>
          {data.bio && <p className="text-slate-300 leading-relaxed max-w-xl text-base mb-8">{data.bio}</p>}
          <div className="flex flex-wrap gap-3">
            {data.contact.email && (
              <a href={`mailto:${data.contact.email}`} className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{ backgroundColor: accent }}>Get in touch →</a>
            )}
            {data.contact.phone && show("contact_phone") && (
              <span className="inline-flex items-center text-sm text-slate-400 px-4 py-2.5 rounded-xl border border-slate-700">{data.contact.phone}</span>
            )}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      {data.projects.length > 0 && show("projects") && (
        <section className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Work</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Selected Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.projects.map((proj, i) => (
              <div key={proj.id} className={`relative bg-gray-50 border border-gray-200 rounded-2xl p-7`}>
                <div className="absolute top-0 left-7 right-7 h-0.5 rounded-full" style={{ background: `linear-gradient(to right, ${accent}, ${accent}80)` }} />
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{proj.name}</h3>
                  {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="shrink-0 w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-sm" style={{ color: accent }}>↗</a>}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{proj.description}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {proj.technologies.map((t, ti) => (
                      <span key={ti} className="text-xs px-2.5 py-1 rounded-lg font-medium border"
                        style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}25` }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EXPERIENCE ── */}
      {data.experience.length > 0 && show("experience") && (
        <section className="px-6 md:px-16 py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Career</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Experience</h2>
            </div>
            <div className="space-y-10">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative md:pl-14">
                  <div className="hidden md:flex absolute left-0 top-1 w-9 h-9 rounded-full bg-white border-2 items-center justify-center shadow-sm" style={{ borderColor: accent }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                      <p className="font-semibold" style={{ color: accent }}>{exp.company}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                      {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-gray-600 text-sm">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="flex gap-2.5 leading-relaxed">
                        <span className="shrink-0 mt-1" style={{ color: accent }}>›</span><span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SKILLS ── */}
      {data.skills.length > 0 && show("skills") && (
        <section className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Expertise</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Skills</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-xl shadow-sm">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {/* ── EDUCATION ── */}
      {data.education.length > 0 && show("education") && (
        <section className="px-6 md:px-16 py-24 bg-gradient-to-br from-slate-950 to-blue-950 text-white">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: `${accent}cc` }}>Background</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">Education</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.education.map((edu) => (
                <div key={edu.id} className="rounded-2xl p-7 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${accent}cc` }}>{edu.endDate}</p>
                  <p className="font-bold text-white text-xl leading-tight">{edu.degree}{edu.field ? ` — ${edu.field}` : ""}</p>
                  <p className="text-blue-200 text-sm mt-2">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GAME ── */}
      {data.game && show("game") && (
        <section className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Side Project</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Featured Game</h2>
          </div>
          <div className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start"
            style={{ background: `linear-gradient(135deg, ${accent}08 0%, ${accent}04 100%)`, border: `1px solid ${accent}20` }}>
            {data.game.thumbnail && <img src={data.game.thumbnail} alt={data.game.name} className="w-full md:w-44 h-32 object-cover rounded-2xl shrink-0 shadow-md" />}
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">{data.game.name}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{data.game.description}</p>
              {(data.game.technologies ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {(data.game.technologies ?? []).map((t, ti) => (
                    <span key={ti} className="text-xs px-2.5 py-1 rounded-lg font-medium border"
                      style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}25` }}>{t}</span>
                  ))}
                </div>
              )}
              <a href={data.game.url} className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl"
                style={{ backgroundColor: accent }}>🎮 Play Now →</a>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {(data.testimonials ?? []).length > 0 && show("testimonials") && (
        <section className="px-6 md:px-16 py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Social Proof</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">What People Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.testimonials ?? []).map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm relative">
                  <span className="absolute top-5 right-6 text-5xl font-serif leading-none" style={{ color: `${accent}20` }}>&ldquo;</span>
                  <p className="text-gray-700 leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: accent }}>
                      {t.name.charAt(0)}
                    </div>
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

      {/* ── BLOG ── */}
      {(data.blog ?? []).length > 0 && show("blog") && (
        <section className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Writing</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Blog</h2>
          </div>
          <div className="space-y-5">
            {(data.blog ?? []).map((post) => (
              <a key={post.id} href={post.url} target="_blank" rel="noreferrer"
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">{post.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{post.date}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── TALKS ── */}
      {(data.talks ?? []).length > 0 && show("talks") && (
        <section className="px-6 md:px-16 py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Speaking</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Talks &amp; Presentations</h2>
            </div>
            <div className="space-y-5">
              {(data.talks ?? []).map((talk) => (
                <div key={talk.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{talk.title}</h3>
                      <p className="text-sm font-medium mt-0.5" style={{ color: accent }}>{talk.event}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{talk.date}</span>
                  </div>
                  {talk.description && <p className="text-sm text-gray-600 leading-relaxed mb-3">{talk.description}</p>}
                  <div className="flex gap-3">
                    {talk.slidesUrl && <a href={talk.slidesUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: accent, color: accent }}>Slides ↗</a>}
                    {talk.videoUrl && <a href={talk.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: accent, color: accent }}>▶ Watch</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── IMAGES ── */}
      {data.images.length > 0 && show("images") && (
        <section className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Gallery</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.images.map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-2xl shadow-sm">
                <img src={img.url} alt={img.alt} className="w-full h-40 object-cover" />
                {img.caption && <figcaption className="text-xs text-gray-500 py-2 text-center bg-gray-50">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-slate-400 px-6 md:px-16 py-12">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-white font-bold text-lg">{data.name}</p>
            <p className="text-slate-500 text-sm mt-1">{data.title}</p>
            {data.portfolioUrl && <a href={data.portfolioUrl} className="text-xs mt-1" style={{ color: `${accent}99` }}>{data.portfolioUrl}</a>}
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            {data.contact.linkedin && show("contact_linkedin") && <a href={data.contact.linkedin}>LinkedIn ↗</a>}
            {data.contact.github && show("contact_github") && <a href={data.contact.github}>GitHub ↗</a>}
            {data.contact.email && <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
