import React from "react";
import type { PortfolioData } from "@/lib/types";

/** Server-safe (no hooks) version of BoldTemplate for static HTML export */
export default function BoldStatic({ data }: { data: PortfolioData }) {
  const accent = data.accentColor ?? "#7c3aed";
  const hidden = new Set<string>(data.hiddenSections ?? []);
  const show = (id: string) => !hidden.has(id);

  return (
    <div className="font-sans bg-[#080810] text-white min-h-screen overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)` }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)" }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-6xl mx-auto w-full pt-8 pb-16">
          <div className="mb-8">
            {data.openToWork ? (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Open to Work
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ color: accent }}>
                <span className="w-8 h-px inline-block" style={{ backgroundColor: accent }} />Portfolio<span className="w-8 h-px inline-block" style={{ backgroundColor: accent }} />
              </span>
            )}
          </div>

          <div className="flex items-end gap-6 mb-4">
            {data.headshot && (
              <img src={data.headshot} alt={data.name} className="w-36 h-36 md:w-48 md:h-48 rounded-2xl object-cover shrink-0 shadow-2xl" style={{ boxShadow: `0 0 0 2px ${accent}66` }} />
            )}
            <h1 className="text-8xl font-black tracking-tighter leading-none" style={{ backgroundImage: `linear-gradient(135deg, #fff 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {data.name}
            </h1>
          </div>

          <p className="text-xl md:text-3xl font-medium mb-6 text-teal-300">{data.title}</p>
          {data.bio && <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-2xl mb-10">{data.bio}</p>}

          <div className="flex flex-wrap gap-3">
            {data.contact.email && (
              <a href={`mailto:${data.contact.email}`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300">✉ {data.contact.email}</a>
            )}
            {data.contact.linkedin && (
              <a href={data.contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300">LinkedIn ↗</a>
            )}
            {data.contact.github && (
              <a href={data.contact.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300">GitHub ↗</a>
            )}
            {data.contact.phone && show("contact_phone") && (
              <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-500">{data.contact.phone}</span>
            )}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {data.projects.length > 0 && show("projects") && (
        <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Selected Work</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="relative border border-zinc-800/80 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}>
                <div className="relative p-7">
                  <span className="text-6xl font-black text-zinc-900 select-none absolute top-5 right-6 leading-none">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{proj.name}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-5">{proj.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {proj.technologies.map((t, ti) => (
                      <span key={ti} className="text-xs bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-lg font-medium" style={{ color: accent }}>{t}</span>
                    ))}
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer" className="ml-auto text-sm font-semibold flex items-center gap-1" style={{ color: accent }}>View project →</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      {data.experience.length > 0 && show("experience") && (
        <section className="px-6 md:px-16 py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${accent}08 50%, transparent 100%)` }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Experience</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
            </div>
            <div className="space-y-5">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border border-zinc-800/80 rounded-2xl p-7" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 100%)" }}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                      <p className="text-teal-400 font-semibold mt-1">{exp.company}</p>
                    </div>
                    <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full font-medium shrink-0">
                      {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="flex gap-3 text-sm text-zinc-400">
                        <span className="mt-0.5 shrink-0 text-xs" style={{ color: accent }}>▸</span>
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SKILLS */}
      {data.skills.length > 0 && show("skills") && (
        <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Skills</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
          </div>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.03)" }}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {data.education.length > 0 && show("education") && (
        <section className="px-6 md:px-16 py-24" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.04) 50%, transparent 100%)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Education</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(20,184,166,0.5), transparent)" }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.education.map((edu) => (
                <div key={edu.id} className="border border-zinc-800/80 rounded-2xl p-7" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.05) 0%, transparent 100%)" }}>
                  <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">{edu.endDate}</p>
                  <p className="font-bold text-white text-lg leading-tight">{edu.degree}{edu.field ? ` — ${edu.field}` : ""}</p>
                  <p className="text-zinc-400 text-sm mt-2">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GAME */}
      {data.game && show("game") && (
        <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Featured Game</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
          </div>
          <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}1a 0%, rgba(20,184,166,0.05) 100%)`, border: `1px solid ${accent}50` }}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {data.game.thumbnail && <img src={data.game.thumbnail} alt={data.game.name} className="w-full md:w-48 h-32 object-cover rounded-2xl shrink-0" style={{ boxShadow: `0 0 0 1px ${accent}50` }} />}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">{data.game.name}</h3>
                <p className="text-zinc-400 leading-relaxed mb-4">{data.game.description}</p>
                {(data.game.technologies ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(data.game.technologies ?? []).map((t, ti) => (
                      <span key={ti} className="text-xs bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-lg font-medium" style={{ color: accent }}>{t}</span>
                    ))}
                  </div>
                )}
                <a href={data.game.url} className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl" style={{ backgroundColor: accent }}>🎮 Play Now →</a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {(data.testimonials ?? []).length > 0 && show("testimonials") && (
        <section className="px-6 md:px-16 py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${accent}06 50%, transparent 100%)` }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Social Proof</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.testimonials ?? []).map((t) => (
                <div key={t.id} className="rounded-2xl p-7 relative border border-zinc-800/80" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}>
                  <span className="absolute top-5 right-6 text-5xl font-serif leading-none" style={{ color: `${accent}30` }}>&ldquo;</span>
                  <p className="text-zinc-300 leading-relaxed mb-5 italic text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: accent }}>{t.name.charAt(0)}</div>
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

      {/* BLOG */}
      {(data.blog ?? []).length > 0 && show("blog") && (
        <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Writing</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
          </div>
          <div className="space-y-4">
            {(data.blog ?? []).map((post) => (
              <a key={post.id} href={post.url} target="_blank" rel="noreferrer"
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border border-zinc-800/80"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 100%)" }}>
                <div className="flex-1">
                  <p className="font-bold text-white mb-1">{post.title}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{post.excerpt}</p>
                </div>
                <span className="text-xs text-zinc-600 shrink-0">{post.date}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* TALKS */}
      {(data.talks ?? []).length > 0 && show("talks") && (
        <section className="px-6 md:px-16 py-24" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.04) 50%, transparent 100%)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Speaking</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(20,184,166,0.5), transparent)" }} />
            </div>
            <div className="space-y-4">
              {(data.talks ?? []).map((talk) => (
                <div key={talk.id} className="border border-zinc-800/80 rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 100%)" }}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-lg">{talk.title}</h3>
                      <p className="text-sm font-medium mt-0.5 text-teal-400">{talk.event}</p>
                    </div>
                    <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">{talk.date}</span>
                  </div>
                  {talk.description && <p className="text-sm text-zinc-500 leading-relaxed mb-3">{talk.description}</p>}
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

      {/* IMAGES */}
      {data.images.length > 0 && show("images") && (
        <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Gallery</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(20,184,166,0.5), transparent)" }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.images.map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-2xl ring-1 ring-zinc-800">
                <img src={img.url} alt={img.alt} className="w-full h-40 object-cover" />
                {img.caption && <figcaption className="text-xs text-zinc-500 mt-2 text-center px-2 pb-2">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 px-6 md:px-16 py-10 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-600">
        <div>
          <span className="font-bold text-zinc-500">{data.name}</span>
          {data.portfolioUrl && <a href={data.portfolioUrl} className="block text-xs mt-0.5" style={{ color: `${accent}80` }}>{data.portfolioUrl}</a>}
        </div>
        <div className="flex gap-5">
          {data.contact.linkedin && show("contact_linkedin") && <a href={data.contact.linkedin}>LinkedIn</a>}
          {data.contact.github && show("contact_github") && <a href={data.contact.github}>GitHub</a>}
          {data.contact.email && <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>}
        </div>
      </footer>
    </div>
  );
}
