"use client";
import React, { useState } from "react";
import type {
  PortfolioData,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
} from "@/lib/types";

interface Props {
  onComplete: (data: Partial<PortfolioData>) => void;
  onCancel: () => void;
}

type Step = "identity" | "experience" | "education" | "projects" | "skills" | "review";

const STEPS: Step[] = ["identity", "experience", "education", "projects", "skills", "review"];
const STEP_LABELS: Record<Step, string> = {
  identity: "About you",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  review: "Review & generate",
};

function uid() { return Math.random().toString(36).slice(2, 9); }

const INPUT = "w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-colors placeholder:text-gray-400";
const LABEL = "block text-xs font-medium text-gray-500 mb-1";
const SECTION_TITLE = "text-base font-semibold text-gray-800 mb-4";

// ── Empty shapes ──────────────────────────────────────────────────────────────

function emptyExp(): ExperienceEntry {
  return { id: uid(), role: "", company: "", startDate: "", endDate: "", bullets: [""] };
}
function emptyEdu(): EducationEntry {
  return { id: uid(), institution: "", degree: "", field: "", startDate: "", endDate: "" };
}
function emptyProj(): ProjectEntry {
  return { id: uid(), name: "", description: "", url: "", technologies: [] };
}

// ── Sub-forms ─────────────────────────────────────────────────────────────────

function IdentityStep({
  data, onChange,
}: { data: Partial<PortfolioData>; onChange: (d: Partial<PortfolioData>) => void }) {
  const c = data.contact ?? { email: "" };
  const set = (patch: Partial<PortfolioData>) => onChange({ ...data, ...patch });
  const setContact = (patch: object) => set({ contact: { ...c, ...patch } });

  return (
    <div className="space-y-4">
      <p className={SECTION_TITLE}>Tell us about yourself</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Full name *</label>
          <input value={data.name ?? ""} onChange={(e) => set({ name: e.target.value })}
            className={INPUT} placeholder="Alex Rivera" />
        </div>
        <div>
          <label className={LABEL}>Professional title</label>
          <input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })}
            className={INPUT} placeholder="Software Engineer" />
        </div>
      </div>
      <div>
        <label className={LABEL}>Bio / summary <span className="text-gray-400 font-normal">(Bob will write this if left blank)</span></label>
        <textarea value={data.bio ?? ""} onChange={(e) => set({ bio: e.target.value })}
          rows={3} className={INPUT + " resize-none"} placeholder="A short paragraph about your background and what you do…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Email</label>
          <input value={c.email ?? ""} onChange={(e) => setContact({ email: e.target.value })}
            className={INPUT} placeholder="you@example.com" type="email" />
        </div>
        <div>
          <label className={LABEL}>Phone</label>
          <input value={c.phone ?? ""} onChange={(e) => setContact({ phone: e.target.value })}
            className={INPUT} placeholder="(555) 000-0000" />
        </div>
        <div>
          <label className={LABEL}>Location</label>
          <input value={c.location ?? ""} onChange={(e) => setContact({ location: e.target.value })}
            className={INPUT} placeholder="San Francisco, CA" />
        </div>
        <div>
          <label className={LABEL}>LinkedIn URL</label>
          <input value={c.linkedin ?? ""} onChange={(e) => setContact({ linkedin: e.target.value })}
            className={INPUT} placeholder="linkedin.com/in/username" />
        </div>
        <div>
          <label className={LABEL}>GitHub URL</label>
          <input value={c.github ?? ""} onChange={(e) => setContact({ github: e.target.value })}
            className={INPUT} placeholder="github.com/username" />
        </div>
        <div>
          <label className={LABEL}>Website</label>
          <input value={c.website ?? ""} onChange={(e) => setContact({ website: e.target.value })}
            className={INPUT} placeholder="https://yoursite.com" />
        </div>
      </div>
    </div>
  );
}

function ExperienceStep({
  entries, onChange,
}: { entries: ExperienceEntry[]; onChange: (e: ExperienceEntry[]) => void }) {
  const update = (id: string, patch: Partial<ExperienceEntry>) =>
    onChange(entries.map((e) => e.id === id ? { ...e, ...patch } : e));
  const remove = (id: string) => onChange(entries.filter((e) => e.id !== id));
  const addBullet = (id: string) =>
    update(id, { bullets: [...(entries.find((e) => e.id === id)?.bullets ?? []), ""] });
  const updateBullet = (id: string, i: number, val: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const bullets = [...entry.bullets];
    bullets[i] = val;
    update(id, { bullets });
  };
  const removeBullet = (id: string, i: number) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    update(id, { bullets: entry.bullets.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-5">
      <p className={SECTION_TITLE}>Work experience</p>
      <p className="text-xs text-gray-400 -mt-3 mb-2">
        Add each job. Leave bullets blank and Bob will generate achievement statements for you.
      </p>
      {entries.map((exp, idx) => (
        <div key={exp.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative bg-gray-50/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job {idx + 1}</span>
            {entries.length > 1 && (
              <button onClick={() => remove(exp.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Role / Title *</label>
              <input value={exp.role} onChange={(e) => update(exp.id, { role: e.target.value })}
                className={INPUT} placeholder="Software Engineer" />
            </div>
            <div>
              <label className={LABEL}>Company *</label>
              <input value={exp.company} onChange={(e) => update(exp.id, { company: e.target.value })}
                className={INPUT} placeholder="Acme Corp" />
            </div>
            <div>
              <label className={LABEL}>Start date</label>
              <input value={exp.startDate} onChange={(e) => update(exp.id, { startDate: e.target.value })}
                className={INPUT} placeholder="Jan 2022" />
            </div>
            <div>
              <label className={LABEL}>End date</label>
              <input value={exp.endDate} onChange={(e) => update(exp.id, { endDate: e.target.value })}
                className={INPUT} placeholder="Present" />
            </div>
          </div>
          <div>
            <label className={LABEL}>What did you do? <span className="text-gray-400 font-normal">(one per line, or leave blank for AI)</span></label>
            <div className="space-y-1.5">
              {exp.bullets.map((b, i) => (
                <div key={i} className="flex gap-1.5">
                  <input value={b} onChange={(e) => updateBullet(exp.id, i, e.target.value)}
                    className={INPUT + " flex-1"} placeholder={`Achievement ${i + 1}…`} />
                  {exp.bullets.length > 1 && (
                    <button onClick={() => removeBullet(exp.id, i)}
                      className="text-xs text-gray-300 hover:text-red-400 px-2">✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => addBullet(exp.id)}
                className="text-xs text-purple-500 hover:text-purple-700">+ add bullet</button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...entries, emptyExp()])}
        className="w-full text-sm text-purple-600 hover:text-purple-800 border border-dashed border-purple-200 hover:border-purple-400 rounded-xl py-2.5 transition-colors">
        + Add another job
      </button>
    </div>
  );
}

function EducationStep({
  entries, onChange,
}: { entries: EducationEntry[]; onChange: (e: EducationEntry[]) => void }) {
  const update = (id: string, patch: Partial<EducationEntry>) =>
    onChange(entries.map((e) => e.id === id ? { ...e, ...patch } : e));
  const remove = (id: string) => onChange(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-5">
      <p className={SECTION_TITLE}>Education</p>
      {entries.map((edu, idx) => (
        <div key={edu.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative bg-gray-50/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">School {idx + 1}</span>
            {entries.length > 1 && (
              <button onClick={() => remove(edu.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <div>
            <label className={LABEL}>Institution *</label>
            <input value={edu.institution} onChange={(e) => update(edu.id, { institution: e.target.value })}
              className={INPUT} placeholder="State University" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Degree</label>
              <input value={edu.degree} onChange={(e) => update(edu.id, { degree: e.target.value })}
                className={INPUT} placeholder="B.S." />
            </div>
            <div>
              <label className={LABEL}>Field of study</label>
              <input value={edu.field} onChange={(e) => update(edu.id, { field: e.target.value })}
                className={INPUT} placeholder="Computer Science" />
            </div>
            <div>
              <label className={LABEL}>Start year</label>
              <input value={edu.startDate} onChange={(e) => update(edu.id, { startDate: e.target.value })}
                className={INPUT} placeholder="2020" />
            </div>
            <div>
              <label className={LABEL}>End year</label>
              <input value={edu.endDate} onChange={(e) => update(edu.id, { endDate: e.target.value })}
                className={INPUT} placeholder="2024" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...entries, emptyEdu()])}
        className="w-full text-sm text-purple-600 hover:text-purple-800 border border-dashed border-purple-200 hover:border-purple-400 rounded-xl py-2.5 transition-colors">
        + Add another school
      </button>
    </div>
  );
}

function ProjectsStep({
  entries, onChange,
}: { entries: ProjectEntry[]; onChange: (e: ProjectEntry[]) => void }) {
  const update = (id: string, patch: Partial<ProjectEntry>) =>
    onChange(entries.map((p) => p.id === id ? { ...p, ...patch } : p));
  const remove = (id: string) => onChange(entries.filter((p) => p.id !== id));

  return (
    <div className="space-y-5">
      <p className={SECTION_TITLE}>Projects <span className="text-gray-400 font-normal text-sm">(optional)</span></p>
      {entries.map((proj, idx) => (
        <div key={proj.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative bg-gray-50/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project {idx + 1}</span>
            <button onClick={() => remove(proj.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          </div>
          <div>
            <label className={LABEL}>Project name *</label>
            <input value={proj.name} onChange={(e) => update(proj.id, { name: e.target.value })}
              className={INPUT} placeholder="My Awesome App" />
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea value={proj.description} onChange={(e) => update(proj.id, { description: e.target.value })}
              rows={2} className={INPUT + " resize-none"} placeholder="What it does and why it matters…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>URL</label>
              <input value={proj.url ?? ""} onChange={(e) => update(proj.id, { url: e.target.value })}
                className={INPUT} placeholder="https://github.com/…" />
            </div>
            <div>
              <label className={LABEL}>Tech stack</label>
              <input
                value={proj.technologies.join(", ")}
                onChange={(e) => update(proj.id, { technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                className={INPUT} placeholder="React, TypeScript, …" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...entries, emptyProj()])}
        className="w-full text-sm text-purple-600 hover:text-purple-800 border border-dashed border-purple-200 hover:border-purple-400 rounded-xl py-2.5 transition-colors">
        + Add a project
      </button>
    </div>
  );
}

function SkillsStep({
  skills, onChange,
}: { skills: string[]; onChange: (s: string[]) => void }) {
  return (
    <div className="space-y-4">
      <p className={SECTION_TITLE}>Skills</p>
      <p className="text-xs text-gray-400 -mt-2">Comma-separated list of tools, languages, and technologies.</p>
      <textarea
        value={skills.join(", ")}
        onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        rows={5} className={INPUT + " resize-none"}
        placeholder="TypeScript, React, Python, SQL, Figma, AWS…" />
      <div className="flex flex-wrap gap-2 pt-1">
        {skills.map((s) => (
          <span key={s} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded-full">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: Partial<PortfolioData> }) {
  const hasBobKey = true; // always show the note — the server checks

  const sections = [
    { label: "Name", value: data.name || "—" },
    { label: "Title", value: data.title || "— (Bob will suggest one)" },
    { label: "Bio", value: data.bio ? data.bio.slice(0, 100) + (data.bio.length > 100 ? "…" : "") : "— (Bob will write this)" },
    { label: "Experience", value: `${(data.experience ?? []).length} role(s)` },
    { label: "Education", value: `${(data.education ?? []).length} school(s)` },
    { label: "Projects", value: `${(data.projects ?? []).length} project(s)` },
    { label: "Skills", value: `${(data.skills ?? []).length} skills` },
  ];

  return (
    <div className="space-y-5">
      <p className={SECTION_TITLE}>Ready to generate</p>
      <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {sections.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-baseline px-4 py-2.5 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-800 font-medium text-right max-w-[55%] truncate">{value}</span>
          </div>
        ))}
      </div>
      {hasBobKey && (
        <div className="rounded-xl bg-purple-50 border border-purple-100 p-4 text-sm text-purple-700 flex gap-3">
          <span className="text-lg shrink-0">🤖</span>
          <div>
            <p className="font-semibold mb-0.5">IBM Bob will:</p>
            <ul className="text-xs space-y-0.5 text-purple-600 list-disc list-inside">
              <li>Write a polished professional bio</li>
              <li>Rewrite experience bullets as achievement statements</li>
              <li>Suggest a professional title if you left it blank</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileForm({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState<Step>("identity");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Core profile state
  const [profile, setProfile] = useState<Partial<PortfolioData>>({
    name: "", title: "", bio: "",
    contact: { email: "" },
    experience: [emptyExp()],
    education: [emptyEdu()],
    projects: [],
    skills: [],
    awards: [], certifications: [], testimonials: [], blog: [], talks: [], images: [],
  });

  const stepIndex = STEPS.indexOf(step);

  const canAdvance = () => {
    if (step === "identity") return Boolean(profile.name?.trim());
    if (step === "experience") return (profile.experience ?? []).every((e) => e.role.trim() && e.company.trim());
    if (step === "education") return (profile.education ?? []).every((e) => e.institution.trim());
    return true;
  };

  const next = () => {
    const nextStep = STEPS[stepIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const back = () => {
    const prevStep = STEPS[stepIndex - 1];
    if (prevStep) setStep(prevStep);
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const { data } = await res.json();
      onComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Build your profile</h2>
          <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
        {/* Step progress */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < stepIndex && setStep(s)}
                className={[
                  "flex items-center gap-1.5 text-xs font-medium transition-colors",
                  s === step ? "text-purple-700" : i < stepIndex ? "text-purple-400 hover:text-purple-600 cursor-pointer" : "text-gray-300 cursor-default",
                ].join(" ")}
              >
                <span className={[
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  s === step ? "bg-purple-600 text-white" : i < stepIndex ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400",
                ].join(" ")}>
                  {i < stepIndex ? "✓" : i + 1}
                </span>
                <span className="hidden sm:block">{STEP_LABELS[s]}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < stepIndex ? "bg-purple-200" : "bg-gray-100"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
        {step === "identity" && (
          <IdentityStep data={profile} onChange={setProfile} />
        )}
        {step === "experience" && (
          <ExperienceStep
            entries={profile.experience ?? []}
            onChange={(experience) => setProfile({ ...profile, experience })}
          />
        )}
        {step === "education" && (
          <EducationStep
            entries={profile.education ?? []}
            onChange={(education) => setProfile({ ...profile, education })}
          />
        )}
        {step === "projects" && (
          <ProjectsStep
            entries={profile.projects ?? []}
            onChange={(projects) => setProfile({ ...profile, projects })}
          />
        )}
        {step === "skills" && (
          <SkillsStep
            skills={profile.skills ?? []}
            onChange={(skills) => setProfile({ ...profile, skills })}
          />
        )}
        {step === "review" && <ReviewStep data={profile} />}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="flex gap-2">
          {stepIndex > 0 && (
            <button onClick={back} disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              ← Back
            </button>
          )}
          {step !== "review" ? (
            <button
              onClick={next}
              disabled={!canAdvance()}
              className="text-sm font-semibold px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={generate}
              disabled={loading}
              className="text-sm font-semibold px-5 py-2 rounded-lg text-white transition-all disabled:opacity-60"
              style={{ background: loading ? "#9333ea" : "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating with Bob…
                </span>
              ) : "✨ Generate portfolio →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
