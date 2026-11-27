import React from "react";
import type { PortfolioData } from "@/lib/types";

/** Server-safe (no hooks) version of VibrantTemplate for static HTML export */
export default function VibrantStatic({ data }: { data: PortfolioData }) {
  const accent = data.accentColor ?? "#ff6b35";
  const hidden = new Set<string>(data.hiddenSections ?? []);
  const show = (id: string) => !hidden.has(id);

  return (
    <div className="font-sans bg-white text-gray-900 overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[55%] h-full" style={{ background: "linear-gradient(160deg, #ff6b35 0%, #ffd23f 100%)", clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)" }} />
          <div className="absolute top-[15%] right-[8%] w-32 h-32 rounded-full border-4 border-white/30" />
          <div className="absolute top-[55%] right-[22%] w-16 h-16 rounded-full bg-white/20" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-16 pt-10 pb-16 max-w-6xl mx-auto w-full">
          <div className="max-w-[55%]">
            <div className="mb-6">
              {data.openToWork ? (
                <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Open to Work
                </span>
              ) : (
                <span className="inline-block text-xs font-black uppercase tracking-[0.3em] text-orange-400 border border-orange-200 px-3 py-1.5 rounded-full">Portfolio</span>
              )}
            </div>

            <div className="flex items-end gap-5 mb-5">
              {data.headshot && (
                <img src={data.headshot} alt={data.name} className="w-32 h-32 md:w-44 md:h-44 rounded-2xl object-cover shrink-0 ring-4 ring-white/60 shadow-2xl" />
              )}
              <h1 className="text-7xl font-black leading-none tracking-tight text-gray-900">{data.name}</h1>
            </div>

            <p className="text-xl font-semibold mb-5" style={{ color: "#ff6b35" }}>{data.title}</p>
            {data.bio && <p className="text-gray-600 leading-relaxed max-w-sm mb-8 text-sm">{data.bio}</p>}

            <div className="flex flex-wrap gap-3">
              {data.contact.email && (
                <a href={`mailto:${data.contact.email}`} className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full text-white" style={{ background: "linear-gradient(135deg, #ff6b35, #ffd23f)" }}>Let&apos;s talk →</a>
              )}
              {data.contact.github && (
                <a href={data.contact.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full border-2 border-gray-900 text-gray-900">GitHub ↗</a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {data.projects.length > 0 && show("projects") && (
        <section className="px-6 md:px-16 py-24 bg-gray-950 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#ffd23f" }}>Work</span>
                <h2 className="text-4xl font-black mt-1 text-white">Projects</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.projects.map((proj, i) => (
                <div key={proj.id} className="relative rounded-2xl overflow-hidden" style={{
                  background: i % 3 === 0 ? "linear-gradient(135deg, #ff6b35, #ffd23f)" : i % 3 === 1 ? "rgba(255,255,255,0.05)" : "rgba(255,210,63,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <div className="relative p-7">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h3 className="text-xl font-black text-white">{proj.name}</h3>
                      {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white/20 text-white">↗</a>}
                    </div>
                    <p className={`text-sm leading-relaxed mb-4 ${i % 3 === 0 ? "text-white/80" : "text-zinc-400"}`}>{proj.description}</p>
                    {proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies.map((t, ti) => (
                          <span key={ti} className={`text-xs px-2.5 py-1 rounded-full font-medium ${i % 3 === 0 ? "bg-white/20 text-white" : "bg-white/5 text-zinc-300 border border-white/10"}`}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      {data.experience.length > 0 && show("experience") && (
        <section className="px-6 md:px-16 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Career</span>
              <h2 className="text-4xl font-black text-gray-900 mt-1">Experience</h2>
            </div>
            <div className="space-y-6">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="border-l-4 pl-6 py-6 rounded-r-2xl" style={{ borderColor: i % 2 === 0 ? "#ff6b35" : "#ffd23f" }}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{exp.role}</h3>
                      <p className="font-bold text-orange-500">{exp.company}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</span>
                  </div>
                  <ul className="space-y-2">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="flex gap-3 text-sm text-gray-600">
                        <span className="font-black text-orange-400 mt-0.5 shrink-0">→</span><span className="leading-relaxed">{b}</span>
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
        <section className="px-6 md:px-16 py-24" style={{ background: "linear-gradient(135deg, #fff7f0 0%, #fff 100%)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Expertise</span>
              <h2 className="text-4xl font-black text-gray-900 mt-1">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill, i) => (
                <span key={i} className="px-5 py-2.5 rounded-full text-sm font-black" style={{
                  background: i % 4 === 0 ? "linear-gradient(135deg, #ff6b35, #ffd23f)" : i % 4 === 1 ? "#f3f4f6" : i % 4 === 2 ? "#1f2937" : "#fff7ed",
                  color: i % 4 === 0 ? "white" : i % 4 === 1 ? "#374151" : i % 4 === 2 ? "white" : "#c2410c",
                }}>{skill}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {data.education.length > 0 && show("education") && (
        <section className="px-6 md:px-16 py-24 bg-gray-950 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#ffd23f" }}>Background</span>
              <h2 className="text-4xl font-black mt-1">Education</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="rounded-2xl p-8 relative overflow-hidden" style={{
                  background: i % 2 === 0 ? "linear-gradient(135deg, #ff6b35, #ffd23f)" : "rgba(255,255,255,0.05)",
                  border: i % 2 === 0 ? "none" : "1px solid rgba(255,255,255,0.1)"
                }}>
                  <p className={`text-xs font-black uppercase tracking-widest mb-3 ${i % 2 === 0 ? "text-white/70" : "text-orange-400"}`}>{edu.endDate}</p>
                  <p className="font-black text-white text-xl leading-tight">{edu.degree}{edu.field ? ` — ${edu.field}` : ""}</p>
                  <p className={`text-sm mt-2 ${i % 2 === 0 ? "text-white/80" : "text-zinc-400"}`}>{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GAME */}
      {data.game && show("game") && (
        <section className="px-6 md:px-16 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Side Project</span>
              <h2 className="text-4xl font-black text-gray-900 mt-1">Featured Game</h2>
            </div>
            <div className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start" style={{ background: "linear-gradient(135deg, #ff6b35, #ffd23f)" }}>
              {data.game.thumbnail && <img src={data.game.thumbnail} alt={data.game.name} className="w-full md:w-44 h-32 object-cover rounded-2xl shrink-0 ring-2 ring-white/30" />}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">{data.game.name}</h3>
                <p className="text-white/80 leading-relaxed mb-4">{data.game.description}</p>
                {(data.game.technologies ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(data.game.technologies ?? []).map((t, ti) => (
                      <span key={ti} className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-bold">{t}</span>
                    ))}
                  </div>
                )}
                <a href={data.game.url} className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-6 py-3 rounded-full">🎮 Play Now →</a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {(data.testimonials ?? []).length > 0 && show("testimonials") && (
        <section className="px-6 md:px-16 py-24 bg-gray-950 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#ffd23f" }}>Social Proof</span>
              <h2 className="text-4xl font-black mt-1">What People Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.testimonials ?? []).map((t) => (
                <div key={t.id} className="rounded-2xl p-7 relative border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="absolute top-5 right-6 text-5xl font-serif leading-none text-white/10">&ldquo;</span>
                  <p className="text-zinc-300 leading-relaxed mb-5 italic text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-orange-600" style={{ background: "linear-gradient(135deg, #ff6b35, #ffd23f)" }}>{t.name.charAt(0)}</div>
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
        <section className="px-6 md:px-16 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Writing</span>
              <h2 className="text-4xl font-black text-gray-900 mt-1">Blog</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data.blog ?? []).map((post) => (
                <a key={post.id} href={post.url} target="_blank" rel="noreferrer" className="relative rounded-2xl overflow-hidden p-6 border border-gray-200">
                  <p className="font-black text-gray-900 mb-2">{post.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-gray-300">{post.date}</span>
                    {(post.tags ?? []).length > 0 && (
                      <div className="flex gap-1.5">
                        {(post.tags ?? []).slice(0, 2).map((tag, ti) => (
                          <span key={ti} className="text-xs px-2 py-0.5 rounded-full font-bold text-orange-600 bg-orange-50">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TALKS */}
      {(data.talks ?? []).length > 0 && show("talks") && (
        <section className="px-6 md:px-16 py-24" style={{ background: "linear-gradient(135deg, #fff7f0 0%, #fff 100%)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Speaking</span>
              <h2 className="text-4xl font-black text-gray-900 mt-1">Talks &amp; Presentations</h2>
            </div>
            <div className="space-y-5">
              {(data.talks ?? []).map((talk, i) => (
                <div key={talk.id} className="border-l-4 pl-6 py-5 rounded-r-2xl" style={{ borderColor: i % 2 === 0 ? "#ff6b35" : "#ffd23f" }}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{talk.title}</h3>
                      <p className="text-sm font-bold text-orange-500">{talk.event}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{talk.date}</span>
                  </div>
                  {talk.description && <p className="text-sm text-gray-600 leading-relaxed mb-3">{talk.description}</p>}
                  <div className="flex gap-3">
                    {talk.slidesUrl && <a href={talk.slidesUrl} target="_blank" rel="noreferrer" className="text-xs font-black px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg, #ff6b35, #ffd23f)" }}>Slides ↗</a>}
                    {talk.videoUrl && <a href={talk.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-black px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg, #ff6b35, #ffd23f)" }}>▶ Watch</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* IMAGES */}
      {data.images.length > 0 && show("images") && (
        <section className="px-6 md:px-16 py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Gallery</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.images.map((img) => (
                <figure key={img.id} className="overflow-hidden rounded-2xl shadow-sm">
                  <img src={img.url} alt={img.alt} className="w-full h-40 object-cover" />
                  {img.caption && <figcaption className="text-xs text-gray-500 py-2 text-center bg-white">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="px-6 md:px-16 py-12 text-white" style={{ background: "linear-gradient(135deg, #ff6b35, #ffd23f)" }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="font-black text-xl text-white">{data.name}</p>
            <p className="text-white/70 text-sm mt-1">{data.title}</p>
            {data.portfolioUrl && <a href={data.portfolioUrl} className="text-xs text-white/60 mt-1 block">{data.portfolioUrl}</a>}
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-bold text-white/80">
            {data.contact.linkedin && show("contact_linkedin") && <a href={data.contact.linkedin}>LinkedIn ↗</a>}
            {data.contact.github && show("contact_github") && <a href={data.contact.github}>GitHub ↗</a>}
            {data.contact.email && <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
