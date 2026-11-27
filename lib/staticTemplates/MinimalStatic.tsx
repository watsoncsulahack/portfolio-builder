import React from "react";
import type { PortfolioData } from "@/lib/types";

/** Server-safe (no hooks) version of MinimalTemplate for static HTML export */
export default function MinimalStatic({ data }: { data: PortfolioData }) {
  const accent = data.accentColor ?? "#111827";
  const hidden = new Set<string>(data.hiddenSections ?? []);
  const show = (id: string) => !hidden.has(id);

  return (
    <div className="font-sans bg-[#fafafa] text-gray-900 overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-20">
        <div className="max-w-4xl mx-auto w-full pt-8">
          {data.openToWork && (
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Open to Work
              </span>
            </div>
          )}

          <div className="flex items-end gap-8 mb-6">
            {data.headshot && (
              <img src={data.headshot} alt={data.name} className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover shrink-0 shadow-xl ring-2 ring-gray-200" />
            )}
            <h1 className="text-9xl font-black tracking-[-0.04em] leading-[0.85] text-gray-900">{data.name}</h1>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px" style={{ backgroundColor: accent }} />
            <p className="text-base md:text-lg text-gray-500 font-medium">{data.title}</p>
          </div>

          {data.bio && <p className="text-gray-600 leading-relaxed max-w-lg text-base mb-10">{data.bio}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {data.contact.email && <a href={`mailto:${data.contact.email}`} className="border-b border-gray-200 pb-0.5">{data.contact.email}</a>}
            {data.contact.phone && show("contact_phone") && <span>{data.contact.phone}</span>}
            {data.contact.linkedin && show("contact_linkedin") && <a href={data.contact.linkedin} className="border-b border-gray-200 pb-0.5">LinkedIn</a>}
            {data.contact.github && show("contact_github") && <a href={data.contact.github} className="border-b border-gray-200 pb-0.5">GitHub</a>}
          </div>
        </div>
        <div className="absolute bottom-10 right-6 md:right-20 text-[8rem] font-black text-gray-100 leading-none select-none pointer-events-none">01</div>
      </section>

      {/* PROJECTS */}
      {data.projects.length > 0 && show("projects") && (
        <section className="px-6 md:px-20 py-28 bg-white relative">
          <div className="absolute top-10 right-6 md:right-20 text-[8rem] font-black text-gray-50 leading-none select-none pointer-events-none">02</div>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">Work</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
              <span className="text-xs text-gray-400 tabular-nums">{String(data.projects.length).padStart(2, "0")}</span>
            </div>
            <div className="space-y-0">
              {data.projects.map((proj, i) => (
                <div key={proj.id} className="border-t border-gray-100 py-8">
                  <div className="flex items-start gap-6">
                    <span className="text-xs text-gray-300 w-6 shrink-0 mt-1 font-mono">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{proj.name}</h3>
                        {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-sm text-gray-400 shrink-0">↗</a>}
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed mb-3">{proj.description}</p>
                      {proj.technologies.length > 0 && <p className="text-xs text-gray-400 font-medium">{proj.technologies.join("  ·  ")}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100" />
            </div>
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      {data.experience.length > 0 && show("experience") && (
        <section className="px-6 md:px-20 py-28 bg-[#fafafa] relative">
          <div className="absolute top-10 left-6 md:left-20 text-[8rem] font-black text-gray-50 leading-none select-none pointer-events-none">03</div>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">Experience</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
            </div>
            <div className="space-y-14">
              {data.experience.map((exp) => (
                <div key={exp.id} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                  <div>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</p>
                    <p className="text-xs text-gray-400 mt-1">{exp.company}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{exp.role}</h3>
                    <ul className="space-y-2 text-sm text-gray-500">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="flex gap-2 leading-relaxed">
                          <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-gray-400 inline-block" /><span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SKILLS */}
      {data.skills.length > 0 && show("skills") && (
        <section className="px-6 md:px-20 py-28 bg-white relative">
          <div className="absolute bottom-10 right-6 md:right-20 text-[8rem] font-black text-gray-50 leading-none select-none pointer-events-none">04</div>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">Skills</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
              {data.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-sm text-gray-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {data.education.length > 0 && show("education") && (
        <section className="px-6 md:px-20 py-28 bg-[#fafafa]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">Education</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
            </div>
            <div className="space-y-10">
              {data.education.map((edu) => (
                <div key={edu.id} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                  <p className="text-xs text-gray-400">{edu.endDate}</p>
                  <div>
                    <p className="font-bold text-gray-900">{edu.degree}{edu.field ? ` — ${edu.field}` : ""}</p>
                    <p className="text-sm text-gray-500 mt-1">{edu.institution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GAME */}
      {data.game && show("game") && (
        <section className="px-6 md:px-20 py-28 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">Featured Game</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
            </div>
            <div className="border border-gray-200 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start" style={{ borderColor: `${accent}30` }}>
              {data.game.thumbnail && <img src={data.game.thumbnail} alt={data.game.name} className="w-full md:w-40 h-28 object-cover rounded-2xl shrink-0" />}
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 mb-3">{data.game.name}</h3>
                <p className="text-gray-500 leading-relaxed mb-4 text-sm">{data.game.description}</p>
                {(data.game.technologies ?? []).length > 0 && (
                  <p className="text-xs text-gray-400 font-medium mb-5">{(data.game.technologies ?? []).join("  ·  ")}</p>
                )}
                <a href={data.game.url} className="inline-flex items-center gap-2 text-sm font-bold border-b-2 pb-0.5" style={{ color: accent, borderColor: accent }}>🎮 Play →</a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {(data.testimonials ?? []).length > 0 && show("testimonials") && (
        <section className="px-6 md:px-20 py-28 bg-[#fafafa]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">What People Say</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.testimonials ?? []).map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm relative">
                  <span className="absolute top-5 right-6 text-5xl font-serif leading-none text-gray-100">&ldquo;</span>
                  <p className="text-gray-600 leading-relaxed mb-5 italic text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gray-900">{t.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.title}{t.company ? `, ${t.company}` : ""}</p>
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
        <section className="px-6 md:px-20 py-28 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">Writing</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
            </div>
            <div className="space-y-0">
              {(data.blog ?? []).map((post, i) => (
                <a key={post.id} href={post.url} target="_blank" rel="noreferrer" className="border-t border-gray-100 py-7 flex items-start gap-6">
                  <span className="text-xs text-gray-300 w-6 shrink-0 mt-1 font-mono">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-4 mb-1.5">
                      <p className="font-bold text-gray-900">{post.title}</p>
                      <span className="text-xs text-gray-300 shrink-0">{post.date}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                  </div>
                </a>
              ))}
              <div className="border-t border-gray-100" />
            </div>
          </div>
        </section>
      )}

      {/* TALKS */}
      {(data.talks ?? []).length > 0 && show("talks") && (
        <section className="px-6 md:px-20 py-28 bg-[#fafafa]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">Talks</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
            </div>
            <div className="space-y-0">
              {(data.talks ?? []).map((talk) => (
                <div key={talk.id} className="border-t border-gray-100 py-7">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-1.5">
                    <div>
                      <h3 className="font-bold text-gray-900">{talk.title}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{talk.event}</p>
                    </div>
                    <span className="text-xs text-gray-300">{talk.date}</span>
                  </div>
                  {talk.description && <p className="text-sm text-gray-500 leading-relaxed mb-3">{talk.description}</p>}
                  <div className="flex gap-4 mt-2">
                    {talk.slidesUrl && <a href={talk.slidesUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-0.5">Slides ↗</a>}
                    {talk.videoUrl && <a href={talk.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-0.5">▶ Video</a>}
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100" />
            </div>
          </div>
        </section>
      )}

      {/* IMAGES */}
      {data.images.length > 0 && show("images") && (
        <section className="px-6 md:px-20 py-28 bg-[#fafafa]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-6 mb-16">
              <h2 className="text-3xl font-black text-gray-900">Gallery</h2>
              <div className="flex-1 h-px bg-gray-100 mt-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.images.map((img) => (
                <figure key={img.id} className="overflow-hidden rounded-xl">
                  <img src={img.url} alt={img.alt} className="w-full h-36 object-cover" />
                  {img.caption && <figcaption className="text-xs text-gray-400 mt-1 text-center">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="px-6 md:px-20 py-10 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-5 text-sm text-gray-400">
          <div>
            <span className="font-bold text-gray-900">{data.name}</span>
            {data.portfolioUrl && <a href={data.portfolioUrl} className="block text-xs mt-0.5">{data.portfolioUrl}</a>}
          </div>
          <div className="flex gap-6">
            {data.contact.linkedin && show("contact_linkedin") && <a href={data.contact.linkedin}>LinkedIn</a>}
            {data.contact.github && show("contact_github") && <a href={data.contact.github}>GitHub</a>}
            {data.contact.email && <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
