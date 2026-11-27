"use client";
import React, { useState } from "react";
import type {
  PortfolioData,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  TestimonialEntry,
  BlogEntry,
  TalkEntry,
  SectionId,
} from "@/lib/types";

interface Props {
  data: PortfolioData;
  onChange: (updated: PortfolioData) => void;
}

type Panel =
  | "contact"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "bio"
  | "testimonials"
  | "blog"
  | "talks"
  | "settings"
  | "visibility";

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function DataEditor({ data, onChange }: Props) {
  const [openPanel, setOpenPanel] = useState<Panel | null>(null);

  /* ── Section visibility helpers ───────────────────────────────── */
  const hidden = new Set<SectionId>(data.hiddenSections ?? []);
  const isHidden = (id: SectionId) => hidden.has(id);
  const toggleSection = (id: SectionId) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange({ ...data, hiddenSections: [...next] });
  };

  const toggle = (panel: Panel) => setOpenPanel(openPanel === panel ? null : panel);

  const updateContact = (patch: Partial<typeof data.contact>) =>
    onChange({ ...data, contact: { ...data.contact, ...patch } });

  /* ── Experience ─────────────────────────────────────────────────── */
  const addExp = () => {
    const entry: ExperienceEntry = {
      id: uid(), company: "Company", role: "Role",
      startDate: "Month YYYY", endDate: "Present", bullets: ["What you did"],
    };
    onChange({ ...data, experience: [...data.experience, entry] });
  };
  const updateExp = (id: string, patch: Partial<ExperienceEntry>) =>
    onChange({ ...data, experience: data.experience.map((e) => e.id === id ? { ...e, ...patch } : e) });
  const removeExp = (id: string) =>
    onChange({ ...data, experience: data.experience.filter((e) => e.id !== id) });

  /* ── Education ──────────────────────────────────────────────────── */
  const addEdu = () => {
    const entry: EducationEntry = {
      id: uid(), institution: "University", degree: "B.S.",
      field: "Major", startDate: "YYYY", endDate: "YYYY",
    };
    onChange({ ...data, education: [...data.education, entry] });
  };
  const updateEdu = (id: string, patch: Partial<EducationEntry>) =>
    onChange({ ...data, education: data.education.map((e) => e.id === id ? { ...e, ...patch } : e) });
  const removeEdu = (id: string) =>
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) });

  /* ── Projects ───────────────────────────────────────────────────── */
  const addProj = () => {
    const entry: ProjectEntry = {
      id: uid(), name: "Project Name", description: "What it does and why it matters.",
      technologies: [], url: "",
    };
    onChange({ ...data, projects: [...data.projects, entry] });
  };
  const updateProj = (id: string, patch: Partial<ProjectEntry>) =>
    onChange({ ...data, projects: data.projects.map((p) => p.id === id ? { ...p, ...patch } : p) });
  const removeProj = (id: string) =>
    onChange({ ...data, projects: data.projects.filter((p) => p.id !== id) });

  /* ── Testimonials ───────────────────────────────────────────────── */
  const addTestimonial = () => {
    const entry: TestimonialEntry = {
      id: uid(), quote: "Working with them was an absolute pleasure.", name: "Jane Doe", title: "Engineering Manager",
    };
    onChange({ ...data, testimonials: [...(data.testimonials ?? []), entry] });
  };
  const updateTestimonial = (id: string, patch: Partial<TestimonialEntry>) =>
    onChange({ ...data, testimonials: (data.testimonials ?? []).map((t) => t.id === id ? { ...t, ...patch } : t) });
  const removeTestimonial = (id: string) =>
    onChange({ ...data, testimonials: (data.testimonials ?? []).filter((t) => t.id !== id) });

  /* ── Blog ───────────────────────────────────────────────────────── */
  const addBlog = () => {
    const entry: BlogEntry = {
      id: uid(), title: "Post Title", date: "YYYY-MM-DD", excerpt: "A short description of the post.", url: "https://",
    };
    onChange({ ...data, blog: [...(data.blog ?? []), entry] });
  };
  const updateBlog = (id: string, patch: Partial<BlogEntry>) =>
    onChange({ ...data, blog: (data.blog ?? []).map((b) => b.id === id ? { ...b, ...patch } : b) });
  const removeBlog = (id: string) =>
    onChange({ ...data, blog: (data.blog ?? []).filter((b) => b.id !== id) });

  /* ── Talks ──────────────────────────────────────────────────────── */
  const addTalk = () => {
    const entry: TalkEntry = {
      id: uid(), title: "Talk Title", event: "Conference Name", date: "YYYY-MM-DD",
    };
    onChange({ ...data, talks: [...(data.talks ?? []), entry] });
  };
  const updateTalk = (id: string, patch: Partial<TalkEntry>) =>
    onChange({ ...data, talks: (data.talks ?? []).map((t) => t.id === id ? { ...t, ...patch } : t) });
  const removeTalk = (id: string) =>
    onChange({ ...data, talks: (data.talks ?? []).filter((t) => t.id !== id) });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Edit Content</p>
      </div>

      {/* ── BIO ──────────────────────────────────────────────────────── */}
      <Accordion label="Bio & Title" count={null} open={openPanel === "bio"} onToggle={() => toggle("bio")}>
        <div className="space-y-2 p-3">
          <Field label="Name">
            <input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })}
              className={INPUT} placeholder="Your name" />
          </Field>
          <Field label="Title">
            <input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })}
              className={INPUT} placeholder="e.g. Software Engineer" />
          </Field>
          <Field label="Bio">
            <textarea value={data.bio} onChange={(e) => onChange({ ...data, bio: e.target.value })}
              rows={4} className={INPUT + " resize-none"} placeholder="Short summary about you" />
          </Field>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="openToWork"
              checked={data.openToWork ?? false}
              onChange={(e) => onChange({ ...data, openToWork: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 accent-green-600"
            />
            <label htmlFor="openToWork" className="text-sm text-gray-700 select-none cursor-pointer">
              Show &ldquo;Open to Work&rdquo; badge
            </label>
          </div>
        </div>
      </Accordion>

      {/* ── SETTINGS ─────────────────────────────────────────────────── */}
      <Accordion label="Appearance" count={null} open={openPanel === "settings"} onToggle={() => toggle("settings")}>
        <div className="space-y-2 p-3">
          <Field label="Accent Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.accentColor ?? "#7c3aed"}
                onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
                className="w-10 h-9 rounded border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                value={data.accentColor ?? ""}
                onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
                className={INPUT + " flex-1"}
                placeholder="#7c3aed"
              />
            </div>
          </Field>
          <Field label="Portfolio URL">
            <input
              value={data.portfolioUrl ?? ""}
              onChange={(e) => onChange({ ...data, portfolioUrl: e.target.value })}
              className={INPUT}
              placeholder="https://yourname.github.io/portfolio"
            />
          </Field>
        </div>
      </Accordion>

      {/* ── CONTACT ──────────────────────────────────────────────────── */}
      <Accordion label="Contact" count={null} open={openPanel === "contact"} onToggle={() => toggle("contact")}>
        <div className="space-y-2 p-3">
          {(["email", "phone", "location", "linkedin", "github", "website"] as const).map((f) => (
            <Field key={f} label={f.charAt(0).toUpperCase() + f.slice(1)}>
              <input value={data.contact[f] || ""} onChange={(e) => updateContact({ [f]: e.target.value })}
                className={INPUT} placeholder={f === "email" ? "you@example.com" : f} />
            </Field>
          ))}
        </div>
      </Accordion>

      {/* ── EXPERIENCE ───────────────────────────────────────────────── */}
      <Accordion label="Experience" count={data.experience.length} open={openPanel === "experience"} onToggle={() => toggle("experience")}>
        <div className="p-3 space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id} className="border border-gray-100 rounded-xl p-3 space-y-2 relative">
              <button onClick={() => removeExp(exp.id)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 leading-none" aria-label="Remove">✕</button>
              <input value={exp.role} onChange={(e) => updateExp(exp.id, { role: e.target.value })}
                className={INPUT} placeholder="Job title" />
              <input value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })}
                className={INPUT} placeholder="Company" />
              <div className="grid grid-cols-2 gap-2">
                <input value={exp.startDate} onChange={(e) => updateExp(exp.id, { startDate: e.target.value })}
                  className={INPUT} placeholder="Start" />
                <input value={exp.endDate} onChange={(e) => updateExp(exp.id, { endDate: e.target.value })}
                  className={INPUT} placeholder="End / Present" />
              </div>
              <BulletEditor
                bullets={exp.bullets}
                onChange={(bullets) => updateExp(exp.id, { bullets })}
              />
            </div>
          ))}
          <button onClick={addExp}
            className="w-full text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-2 transition-colors">
            + Add experience
          </button>
        </div>
      </Accordion>

      {/* ── EDUCATION ────────────────────────────────────────────────── */}
      <Accordion label="Education" count={data.education.length} open={openPanel === "education"} onToggle={() => toggle("education")}>
        <div className="p-3 space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="border border-gray-100 rounded-xl p-3 space-y-2 relative">
              <button onClick={() => removeEdu(edu.id)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 leading-none" aria-label="Remove">✕</button>
              <input value={edu.institution} onChange={(e) => updateEdu(edu.id, { institution: e.target.value })}
                className={INPUT} placeholder="University / School" />
              <div className="grid grid-cols-2 gap-2">
                <input value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })}
                  className={INPUT} placeholder="Degree (B.S.)" />
                <input value={edu.field} onChange={(e) => updateEdu(edu.id, { field: e.target.value })}
                  className={INPUT} placeholder="Major / Field" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={edu.startDate} onChange={(e) => updateEdu(edu.id, { startDate: e.target.value })}
                  className={INPUT} placeholder="Start year" />
                <input value={edu.endDate} onChange={(e) => updateEdu(edu.id, { endDate: e.target.value })}
                  className={INPUT} placeholder="End year" />
              </div>
              <input value={edu.gpa || ""} onChange={(e) => updateEdu(edu.id, { gpa: e.target.value || undefined })}
                className={INPUT} placeholder="GPA (optional)" />
            </div>
          ))}
          <button onClick={addEdu}
            className="w-full text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-2 transition-colors">
            + Add education
          </button>
        </div>
      </Accordion>

      {/* ── PROJECTS ─────────────────────────────────────────────────── */}
      <Accordion label="Projects" count={data.projects.length} open={openPanel === "projects"} onToggle={() => toggle("projects")}>
        <div className="p-3 space-y-4">
          {data.projects.map((proj) => (
            <div key={proj.id} className="border border-gray-100 rounded-xl p-3 space-y-2 relative">
              <button onClick={() => removeProj(proj.id)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 leading-none" aria-label="Remove">✕</button>
              <input value={proj.name} onChange={(e) => updateProj(proj.id, { name: e.target.value })}
                className={INPUT} placeholder="Project name" />
              <textarea value={proj.description} onChange={(e) => updateProj(proj.id, { description: e.target.value })}
                rows={3} className={INPUT + " resize-none"} placeholder="What it does and why it matters" />
              <input value={proj.url || ""} onChange={(e) => updateProj(proj.id, { url: e.target.value })}
                className={INPUT} placeholder="URL (optional)" />
              <input
                value={proj.technologies.join(", ")}
                onChange={(e) => updateProj(proj.id, { technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                className={INPUT} placeholder="Tech stack (comma-separated)" />
            </div>
          ))}
          <button onClick={addProj}
            className="w-full text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-2 transition-colors">
            + Add project
          </button>
        </div>
      </Accordion>

      {/* ── SKILLS ───────────────────────────────────────────────────── */}
      <Accordion label="Skills" count={data.skills.length} open={openPanel === "skills"} onToggle={() => toggle("skills")}>
        <div className="p-3">
          <textarea
            value={data.skills.join(", ")}
            onChange={(e) => onChange({ ...data, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            rows={4} className={INPUT + " resize-none"}
            placeholder="TypeScript, React, Node.js, Python…" />
          <p className="text-xs text-gray-400 mt-1.5">Comma-separated list of skills</p>
        </div>
      </Accordion>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <Accordion label="Testimonials" count={(data.testimonials ?? []).length} open={openPanel === "testimonials"} onToggle={() => toggle("testimonials")}>
        <div className="p-3 space-y-4">
          {(data.testimonials ?? []).map((t) => (
            <div key={t.id} className="border border-gray-100 rounded-xl p-3 space-y-2 relative">
              <button onClick={() => removeTestimonial(t.id)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 leading-none" aria-label="Remove">✕</button>
              <textarea value={t.quote} onChange={(e) => updateTestimonial(t.id, { quote: e.target.value })}
                rows={3} className={INPUT + " resize-none"} placeholder="Quote / testimonial text" />
              <div className="grid grid-cols-2 gap-2">
                <input value={t.name} onChange={(e) => updateTestimonial(t.id, { name: e.target.value })}
                  className={INPUT} placeholder="Name" />
                <input value={t.title} onChange={(e) => updateTestimonial(t.id, { title: e.target.value })}
                  className={INPUT} placeholder="Title" />
              </div>
              <input value={t.company ?? ""} onChange={(e) => updateTestimonial(t.id, { company: e.target.value })}
                className={INPUT} placeholder="Company (optional)" />
            </div>
          ))}
          <button onClick={addTestimonial}
            className="w-full text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-2 transition-colors">
            + Add testimonial
          </button>
        </div>
      </Accordion>

      {/* ── BLOG ─────────────────────────────────────────────────────── */}
      <Accordion label="Blog / Writing" count={(data.blog ?? []).length} open={openPanel === "blog"} onToggle={() => toggle("blog")}>
        <div className="p-3 space-y-4">
          {(data.blog ?? []).map((b) => (
            <div key={b.id} className="border border-gray-100 rounded-xl p-3 space-y-2 relative">
              <button onClick={() => removeBlog(b.id)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 leading-none" aria-label="Remove">✕</button>
              <input value={b.title} onChange={(e) => updateBlog(b.id, { title: e.target.value })}
                className={INPUT} placeholder="Post title" />
              <textarea value={b.excerpt} onChange={(e) => updateBlog(b.id, { excerpt: e.target.value })}
                rows={2} className={INPUT + " resize-none"} placeholder="Short excerpt" />
              <div className="grid grid-cols-2 gap-2">
                <input value={b.date} onChange={(e) => updateBlog(b.id, { date: e.target.value })}
                  className={INPUT} placeholder="Date (YYYY-MM-DD)" />
                <input value={b.url} onChange={(e) => updateBlog(b.id, { url: e.target.value })}
                  className={INPUT} placeholder="URL" />
              </div>
              <input value={(b.tags ?? []).join(", ")} onChange={(e) => updateBlog(b.id, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                className={INPUT} placeholder="Tags (comma-separated)" />
            </div>
          ))}
          <button onClick={addBlog}
            className="w-full text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-2 transition-colors">
            + Add post
          </button>
        </div>
      </Accordion>

      {/* ── TALKS ────────────────────────────────────────────────────── */}
      <Accordion label="Talks / Presentations" count={(data.talks ?? []).length} open={openPanel === "talks"} onToggle={() => toggle("talks")}>
        <div className="p-3 space-y-4">
          {(data.talks ?? []).map((t) => (
            <div key={t.id} className="border border-gray-100 rounded-xl p-3 space-y-2 relative">
              <button onClick={() => removeTalk(t.id)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 leading-none" aria-label="Remove">✕</button>
              <input value={t.title} onChange={(e) => updateTalk(t.id, { title: e.target.value })}
                className={INPUT} placeholder="Talk title" />
              <div className="grid grid-cols-2 gap-2">
                <input value={t.event} onChange={(e) => updateTalk(t.id, { event: e.target.value })}
                  className={INPUT} placeholder="Event / conference" />
                <input value={t.date} onChange={(e) => updateTalk(t.id, { date: e.target.value })}
                  className={INPUT} placeholder="Date" />
              </div>
              <textarea value={t.description ?? ""} onChange={(e) => updateTalk(t.id, { description: e.target.value })}
                rows={2} className={INPUT + " resize-none"} placeholder="Short description (optional)" />
              <div className="grid grid-cols-2 gap-2">
                <input value={t.slidesUrl ?? ""} onChange={(e) => updateTalk(t.id, { slidesUrl: e.target.value })}
                  className={INPUT} placeholder="Slides URL" />
                <input value={t.videoUrl ?? ""} onChange={(e) => updateTalk(t.id, { videoUrl: e.target.value })}
                  className={INPUT} placeholder="Video URL" />
              </div>
            </div>
          ))}
          <button onClick={addTalk}
            className="w-full text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-2 transition-colors">
            + Add talk
          </button>
        </div>
      </Accordion>

      {/* ── VISIBILITY ───────────────────────────────────────────────── */}
      <Accordion label="Show / Hide sections" count={hidden.size > 0 ? hidden.size : null} open={openPanel === "visibility"} onToggle={() => toggle("visibility")}>
        <div className="p-3 space-y-1">
          <p className="text-xs text-gray-400 mb-2">Toggle sections on or off. Hidden sections won&apos;t appear on your portfolio.</p>
          {([
            { id: "projects" as const, label: "Projects" },
            { id: "experience" as const, label: "Experience" },
            { id: "education" as const, label: "Education" },
            { id: "skills" as const, label: "Skills" },
            { id: "game" as const, label: "Game / Featured Work" },
            { id: "testimonials" as const, label: "Testimonials" },
            { id: "blog" as const, label: "Blog / Writing" },
            { id: "talks" as const, label: "Talks & Presentations" },
            { id: "images" as const, label: "Gallery" },
          ]).map(({ id, label }) => (
            <VisibilityRow key={id} label={label} visible={!isHidden(id)} onToggle={() => toggleSection(id)} />
          ))}
          <div className="pt-2 pb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Contact fields</p>
          </div>
          {([
            { id: "contact_phone" as const, label: "Phone number" },
            { id: "contact_location" as const, label: "Location" },
            { id: "contact_linkedin" as const, label: "LinkedIn" },
            { id: "contact_github" as const, label: "GitHub" },
            { id: "contact_website" as const, label: "Website" },
          ]).map(({ id, label }) => (
            <VisibilityRow key={id} label={label} visible={!isHidden(id)} onToggle={() => toggleSection(id)} />
          ))}
        </div>
      </Accordion>
    </div>
  );
}

function VisibilityRow({ label, visible, onToggle }: { label: string; visible: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left group"
    >
      <span className={`text-sm ${visible ? "text-gray-800" : "text-gray-400 line-through"}`}>{label}</span>
      <span className={`w-8 h-4 rounded-full flex items-center transition-colors shrink-0 ${visible ? "bg-blue-500" : "bg-gray-200"}`}>
        <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform mx-0.5 ${visible ? "translate-x-4" : "translate-x-0"}`} />
      </span>
    </button>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */
const INPUT = "w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors placeholder:text-gray-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {children}
    </div>
  );
}

function Accordion({ label, count, open, onToggle, children }: {
  label: string; count: number | null; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors text-left">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          {count !== null && count > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
          )}
          <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  const update = (i: number, val: string) => {
    const next = [...bullets];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(bullets.filter((_, idx) => idx !== i));
  const add = () => onChange([...bullets, ""]);

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-gray-400">Bullets</p>
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-1">
          <input value={b} onChange={(e) => update(i, e.target.value)}
            className={INPUT + " flex-1"} placeholder={`Achievement ${i + 1}`} />
          <button onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600 px-2" aria-label="Remove bullet">✕</button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-blue-500 hover:text-blue-700">+ bullet</button>
    </div>
  );
}
