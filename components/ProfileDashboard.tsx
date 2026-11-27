"use client";
import React, { useState } from "react";
import type {
  PortfolioData,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  AwardEntry,
  CertificationEntry,
} from "@/lib/types";

// ── Two usage modes ───────────────────────────────────────────────────────────
// 1. Onboarding (no data/onChange) — owns its own state, has "Generate" button
// 2. Live editor (data + onChange) — binds directly to builder PortfolioData

type OnboardingProps = {
  onComplete: (data: Partial<PortfolioData>) => void;
  data?: undefined;
  onChange?: undefined;
};

type EditorProps = {
  data: PortfolioData;
  onChange: (data: PortfolioData) => void;
  onComplete?: undefined;
};

type Props = OnboardingProps | EditorProps;

function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Shared styles ─────────────────────────────────────────────────────────────
const INPUT = "w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-neutral-50 focus:bg-white";
const LABEL = "block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1";

// ── Entry card ────────────────────────────────────────────────────────────────
function EntryCard({
  title, subtitle, detail, onEdit, onDelete,
}: { title: string; subtitle?: string; detail?: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 truncate">{title}</p>
        {subtitle && <p className="text-xs text-neutral-500 mt-0.5 truncate">{subtitle}</p>}
        {detail && <p className="text-xs text-neutral-400 mt-1 line-clamp-2 whitespace-pre-line">{detail}</p>}
      </div>
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
        </button>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({
  title, icon, count, onAdd, children,
}: { title: string; icon: React.ReactNode; count: number; onAdd: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors text-left">
        <span className="size-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 text-sm">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-neutral-800">{title}</span>
        <span className="text-xs font-medium text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5 mr-1">{count}</span>
        <svg className={`size-4 text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-neutral-100">
          {count > 0 && <div className="p-3 space-y-2">{children}</div>}
          {count === 0 && <p className="text-sm text-neutral-400 text-center py-5">No {title.toLowerCase()} yet</p>}
          <div className="px-3 pb-3">
            <button onClick={onAdd}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-neutral-200 text-sm text-neutral-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add {title.endsWith("s") ? title.slice(0, -1).toLowerCase() : title.toLowerCase()}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, onSave, children }: {
  title: string; onClose: () => void; onSave: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}
          className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {children}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Save entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL}>{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className={INPUT} />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, rows = 3 }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL}>{label}</label>
      <textarea id={name} name={name} value={value} onChange={(e) => onChange(e.target.value)}
        rows={rows} placeholder={placeholder} className={INPUT + " resize-none"} />
    </div>
  );
}

// ── Entry modals ──────────────────────────────────────────────────────────────

function ExperienceModal({ initial, onClose, onSave }: {
  initial?: ExperienceEntry; onClose: () => void; onSave: (e: ExperienceEntry) => void;
}) {
  const [entry, setEntry] = useState<ExperienceEntry>(initial ?? {
    id: uid(), role: "", company: "", startDate: "", endDate: "", bullets: [""],
  });
  const set = (patch: Partial<ExperienceEntry>) => setEntry({ ...entry, ...patch });
  const updateBullet = (i: number, v: string) => {
    const b = [...entry.bullets]; b[i] = v; set({ bullets: b });
  };
  return (
    <Modal title={initial ? "Edit Experience" : "Add Experience"} onClose={onClose} onSave={() => onSave(entry)}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Role / Title *" name="role" value={entry.role} onChange={(v) => set({ role: v })} placeholder="Mechanical Engineer" />
        <Field label="Company *" name="company" value={entry.company} onChange={(v) => set({ company: v })} placeholder="Acme Corp" />
        <Field label="Start date" name="startDate" value={entry.startDate} onChange={(v) => set({ startDate: v })} placeholder="Jan 2022" />
        <Field label="End date" name="endDate" value={entry.endDate} onChange={(v) => set({ endDate: v })} placeholder="Present" />
      </div>
      <div>
        <label className={LABEL}>Bullets</label>
        <div className="space-y-2">
          {entry.bullets.map((b, i) => (
            <div key={i} className="flex gap-2">
              <input value={b} onChange={(e) => updateBullet(i, e.target.value)}
                placeholder={`Achievement ${i + 1}…`} className={INPUT + " flex-1"} />
              {entry.bullets.length > 1 && (
                <button type="button" onClick={() => set({ bullets: entry.bullets.filter((_, j) => j !== i) })}
                  className="text-neutral-300 hover:text-red-400 px-1.5">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => set({ bullets: [...entry.bullets, ""] })}
            className="text-xs text-blue-500 hover:text-blue-700">+ add bullet</button>
        </div>
      </div>
    </Modal>
  );
}

function EducationModal({ initial, onClose, onSave }: {
  initial?: EducationEntry; onClose: () => void; onSave: (e: EducationEntry) => void;
}) {
  const [entry, setEntry] = useState<EducationEntry>(initial ?? {
    id: uid(), institution: "", degree: "", field: "", startDate: "", endDate: "",
  });
  const set = (patch: Partial<EducationEntry>) => setEntry({ ...entry, ...patch });
  return (
    <Modal title={initial ? "Edit Education" : "Add Education"} onClose={onClose} onSave={() => onSave(entry)}>
      <Field label="Institution *" name="institution" value={entry.institution} onChange={(v) => set({ institution: v })} placeholder="State University" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Degree" name="degree" value={entry.degree} onChange={(v) => set({ degree: v })} placeholder="B.S." />
        <Field label="Field of study" name="field" value={entry.field} onChange={(v) => set({ field: v })} placeholder="Computer Science" />
        <Field label="Start year" name="startDate" value={entry.startDate} onChange={(v) => set({ startDate: v })} placeholder="2020" />
        <Field label="End year" name="endDate" value={entry.endDate} onChange={(v) => set({ endDate: v })} placeholder="2024" />
        <Field label="GPA (optional)" name="gpa" value={entry.gpa ?? ""} onChange={(v) => set({ gpa: v || undefined })} placeholder="3.7" />
      </div>
    </Modal>
  );
}

function ProjectModal({ initial, onClose, onSave }: {
  initial?: ProjectEntry; onClose: () => void; onSave: (p: ProjectEntry) => void;
}) {
  const [entry, setEntry] = useState<ProjectEntry>(initial ?? {
    id: uid(), name: "", description: "", url: "", technologies: [],
  });
  const set = (patch: Partial<ProjectEntry>) => setEntry({ ...entry, ...patch });
  return (
    <Modal title={initial ? "Edit Project" : "Add Project"} onClose={onClose} onSave={() => onSave(entry)}>
      <Field label="Project name *" name="name" value={entry.name} onChange={(v) => set({ name: v })} placeholder="My Awesome App" />
      <TextAreaField label="Description" name="description" value={entry.description} onChange={(v) => set({ description: v })} placeholder="What it does and why it matters…" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="URL" name="url" value={entry.url ?? ""} onChange={(v) => set({ url: v })} placeholder="github.com/…" />
        <Field label="Tech stack" name="tech" value={entry.technologies.join(", ")}
          onChange={(v) => set({ technologies: v.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="React, TypeScript, …" />
      </div>
    </Modal>
  );
}

function AwardModal({ initial, onClose, onSave }: {
  initial?: AwardEntry; onClose: () => void; onSave: (a: AwardEntry) => void;
}) {
  const [entry, setEntry] = useState<AwardEntry>(initial ?? { id: uid(), name: "", issuer: "", date: "" });
  const set = (patch: Partial<AwardEntry>) => setEntry({ ...entry, ...patch });
  return (
    <Modal title={initial ? "Edit Award" : "Add Award"} onClose={onClose} onSave={() => onSave(entry)}>
      <Field label="Award name *" name="name" value={entry.name} onChange={(v) => set({ name: v })} placeholder="Hackathon 1st Place" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Issuer" name="issuer" value={entry.issuer} onChange={(v) => set({ issuer: v })} placeholder="IBM" />
        <Field label="Date" name="date" value={entry.date} onChange={(v) => set({ date: v })} placeholder="Nov 2026" />
      </div>
      <TextAreaField label="Description" name="description" value={entry.description ?? ""} onChange={(v) => set({ description: v })} placeholder="Won for…" />
    </Modal>
  );
}

function CertModal({ initial, onClose, onSave }: {
  initial?: CertificationEntry; onClose: () => void; onSave: (c: CertificationEntry) => void;
}) {
  const [entry, setEntry] = useState<CertificationEntry>(initial ?? { id: uid(), name: "", issuer: "", date: "" });
  const set = (patch: Partial<CertificationEntry>) => setEntry({ ...entry, ...patch });
  return (
    <Modal title={initial ? "Edit Certification" : "Add Certification"} onClose={onClose} onSave={() => onSave(entry)}>
      <Field label="Cert name *" name="name" value={entry.name} onChange={(v) => set({ name: v })} placeholder="AWS Certified Developer" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Issuer" name="issuer" value={entry.issuer} onChange={(v) => set({ issuer: v })} placeholder="Amazon Web Services" />
        <Field label="Date" name="date" value={entry.date} onChange={(v) => set({ date: v })} placeholder="Jan 2024" />
      </div>
      <Field label="Credential URL (optional)" name="url" value={entry.credentialUrl ?? ""} onChange={(v) => set({ credentialUrl: v })} placeholder="credly.com/badges/…" />
    </Modal>
  );
}

function IdentityModal({ profile, onClose, onSave }: {
  profile: Partial<PortfolioData>; onClose: () => void; onSave: (p: Partial<PortfolioData>) => void;
}) {
  const [name, setName] = useState(profile.name ?? "");
  const [title, setTitle] = useState(profile.title ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const c = profile.contact ?? { email: "" };
  const [contact, setContact] = useState(c);
  const set = (patch: Partial<typeof c>) => setContact({ ...contact, ...patch });
  return (
    <Modal title="Edit Profile Info" onClose={onClose} onSave={() => onSave({ ...profile, name, title, bio, contact })}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name *" name="name" value={name} onChange={setName} placeholder="Alex Rivera" />
        <Field label="Professional title" name="title" value={title} onChange={setTitle} placeholder="Software Engineer" />
      </div>
      <TextAreaField label="Bio" name="bio" value={bio} onChange={setBio} placeholder="A short summary about you…" rows={3} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email" name="email" value={contact.email} onChange={(v) => set({ email: v })} placeholder="you@example.com" type="email" />
        <Field label="Phone" name="phone" value={contact.phone ?? ""} onChange={(v) => set({ phone: v })} placeholder="(555) 000-0000" />
        <Field label="Location" name="location" value={contact.location ?? ""} onChange={(v) => set({ location: v })} placeholder="San Francisco, CA" />
        <Field label="LinkedIn" name="linkedin" value={contact.linkedin ?? ""} onChange={(v) => set({ linkedin: v })} placeholder="linkedin.com/in/username" />
        <Field label="GitHub" name="github" value={contact.github ?? ""} onChange={(v) => set({ github: v })} placeholder="github.com/username" />
        <Field label="Website" name="website" value={contact.website ?? ""} onChange={(v) => set({ website: v })} placeholder="https://yoursite.com" />
      </div>
    </Modal>
  );
}

// ── Modal type ────────────────────────────────────────────────────────────────
type ModalType = "identity" | "experience" | "education" | "project" | "award" | "cert" | null;

// ── Shared dashboard body ─────────────────────────────────────────────────────
// Accepts a resolved profile + setter and renders all sections + modals.
function DashboardBody({
  profile,
  setProfile,
  skillsText,
  setSkillsText,
  isLiveEditor,      // true = hide the generate button (already in builder)
  onGenerate,
}: {
  profile: Partial<PortfolioData>;
  setProfile: (p: Partial<PortfolioData>) => void;
  skillsText: string;
  setSkillsText: (s: string) => void;
  isLiveEditor: boolean;
  // Receives the enriched data from /api/generate so caller never sees stale state
  onGenerate?: (enrichedData: Partial<PortfolioData>) => void;
}) {
  const [modal, setModal] = useState<ModalType>(null);
  const [editingExp, setEditingExp] = useState<ExperienceEntry | undefined>();
  const [editingEdu, setEditingEdu] = useState<EducationEntry | undefined>();
  const [editingProj, setEditingProj] = useState<ProjectEntry | undefined>();
  const [editingAward, setEditingAward] = useState<AwardEntry | undefined>();
  const [editingCert, setEditingCert] = useState<CertificationEntry | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const exp = profile.experience ?? [];
  const edu = profile.education ?? [];
  const proj = profile.projects ?? [];
  const awards = profile.awards ?? [];
  const certs = profile.certifications ?? [];
  const skills = skillsText.split(",").map((s) => s.trim()).filter(Boolean);

  const canGenerate = Boolean(profile.name?.trim());

  const handleGenerate = async () => {
    if (!onGenerate) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { ...profile, skills } }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const { data } = await res.json();
      // Pass enriched data to parent — avoids stale-state bug where onGenerate
      // captured the pre-generate snapshot of profile.
      onGenerate(data as Partial<PortfolioData>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const initials = profile.name
    ? profile.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="space-y-4">
      {/* Identity card */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <div className="h-14 bg-gradient-to-r from-purple-600 to-blue-500" />
        <div className="px-4 pb-4">
          <div className="-mt-7 mb-3 flex items-end justify-between">
            <div className="size-14 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center">
              <span className="text-base font-bold text-purple-600">{initials}</span>
            </div>
            <button onClick={() => setModal("identity")}
              className="mb-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
              <svg className="size-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              {profile.name ? "Edit info" : "Add info"}
            </button>
          </div>
          {profile.name ? (
            <>
              <p className="text-sm font-bold text-neutral-900">{profile.name}</p>
              {profile.title && <p className="text-xs text-neutral-500">{profile.title}</p>}
              {profile.contact?.email && <p className="text-xs text-neutral-400 mt-0.5">{profile.contact.email}</p>}
            </>
          ) : (
            <button onClick={() => setModal("identity")} className="text-xs text-neutral-400 hover:text-blue-600 transition-colors">
              Click <span className="underline">Edit info</span> to add your name
            </button>
          )}
          <div className="mt-3 pt-3 border-t border-neutral-100 flex gap-3 text-xs">
            {[
              { n: exp.length, label: "Jobs" },
              { n: edu.length, label: "Schools" },
              { n: proj.length, label: "Projects" },
              { n: skills.length, label: "Skills" },
            ].map(({ n, label }, i, arr) => (
              <React.Fragment key={label}>
                <div className="text-center">
                  <p className="text-base font-bold text-neutral-900">{n}</p>
                  <p className="text-neutral-400">{label}</p>
                </div>
                {i < arr.length - 1 && <div className="w-px bg-neutral-100 self-stretch" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button — only in onboarding mode */}
      {!isLiveEditor && (
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-purple-900">Ready to build your portfolio?</p>
            <p className="text-xs text-purple-600 mt-0.5">
              Bob will write your bio and polish your bullets.
              {!canGenerate && <span className="text-purple-400"> Add your name first.</span>}
            </p>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: loading ? "#9333ea" : "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            {loading
              ? <><span className="size-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Generating…</>
              : "✨ Generate"}
          </button>
        </div>
      )}

      {/* Experience */}
      <Section title="Experience" icon="💼" count={exp.length} onAdd={() => { setEditingExp(undefined); setModal("experience"); }}>
        {exp.map((e) => (
          <EntryCard key={e.id}
            title={`${e.role} @ ${e.company}`}
            subtitle={`${e.startDate}${e.endDate ? ` – ${e.endDate}` : ""}`}
            detail={e.bullets.filter(Boolean).join("\n")}
            onEdit={() => { setEditingExp(e); setModal("experience"); }}
            onDelete={() => setProfile({ ...profile, experience: exp.filter((x) => x.id !== e.id) })}
          />
        ))}
      </Section>

      {/* Education */}
      <Section title="Education" icon="🎓" count={edu.length} onAdd={() => { setEditingEdu(undefined); setModal("education"); }}>
        {edu.map((e) => (
          <EntryCard key={e.id}
            title={`${e.degree} in ${e.field}`}
            subtitle={e.institution}
            detail={e.startDate && e.endDate ? `${e.startDate} – ${e.endDate}` : ""}
            onEdit={() => { setEditingEdu(e); setModal("education"); }}
            onDelete={() => setProfile({ ...profile, education: edu.filter((x) => x.id !== e.id) })}
          />
        ))}
      </Section>

      {/* Projects */}
      <Section title="Projects" icon="🛠️" count={proj.length} onAdd={() => { setEditingProj(undefined); setModal("project"); }}>
        {proj.map((p) => (
          <EntryCard key={p.id}
            title={p.name}
            subtitle={p.technologies.join(", ")}
            detail={p.description}
            onEdit={() => { setEditingProj(p); setModal("project"); }}
            onDelete={() => setProfile({ ...profile, projects: proj.filter((x) => x.id !== p.id) })}
          />
        ))}
      </Section>

      {/* Skills */}
      <section className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <p className="text-sm font-semibold text-neutral-800">⚡ Skills</p>
        </div>
        <div className="p-4 space-y-3">
          <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)}
            placeholder="TypeScript, React, Python, SQL…" className={INPUT} />
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Awards */}
      <Section title="Awards" icon="🏆" count={awards.length} onAdd={() => { setEditingAward(undefined); setModal("award"); }}>
        {awards.map((a) => (
          <EntryCard key={a.id}
            title={a.name} subtitle={`${a.issuer} · ${a.date}`} detail={a.description}
            onEdit={() => { setEditingAward(a); setModal("award"); }}
            onDelete={() => setProfile({ ...profile, awards: awards.filter((x) => x.id !== a.id) })}
          />
        ))}
      </Section>

      {/* Certifications */}
      <Section title="Certifications" icon="📜" count={certs.length} onAdd={() => { setEditingCert(undefined); setModal("cert"); }}>
        {certs.map((c) => (
          <EntryCard key={c.id}
            title={c.name} subtitle={`${c.issuer} · ${c.date}`}
            onEdit={() => { setEditingCert(c); setModal("cert"); }}
            onDelete={() => setProfile({ ...profile, certifications: certs.filter((x) => x.id !== c.id) })}
          />
        ))}
      </Section>

      {/* Modals */}
      {modal === "identity" && (
        <IdentityModal profile={profile} onClose={() => setModal(null)}
          onSave={(p) => { setProfile(p); setModal(null); }} />
      )}
      {modal === "experience" && (
        <ExperienceModal initial={editingExp} onClose={() => setModal(null)}
          onSave={(e) => {
            const next = editingExp ? exp.map((x) => x.id === e.id ? e : x) : [...exp, e];
            setProfile({ ...profile, experience: next }); setModal(null);
          }} />
      )}
      {modal === "education" && (
        <EducationModal initial={editingEdu} onClose={() => setModal(null)}
          onSave={(e) => {
            const next = editingEdu ? edu.map((x) => x.id === e.id ? e : x) : [...edu, e];
            setProfile({ ...profile, education: next }); setModal(null);
          }} />
      )}
      {modal === "project" && (
        <ProjectModal initial={editingProj} onClose={() => setModal(null)}
          onSave={(p) => {
            const next = editingProj ? proj.map((x) => x.id === p.id ? p : x) : [...proj, p];
            setProfile({ ...profile, projects: next }); setModal(null);
          }} />
      )}
      {modal === "award" && (
        <AwardModal initial={editingAward} onClose={() => setModal(null)}
          onSave={(a) => {
            const next = editingAward ? awards.map((x) => x.id === a.id ? a : x) : [...awards, a];
            setProfile({ ...profile, awards: next }); setModal(null);
          }} />
      )}
      {modal === "cert" && (
        <CertModal initial={editingCert} onClose={() => setModal(null)}
          onSave={(c) => {
            const next = editingCert ? certs.map((x) => x.id === c.id ? c : x) : [...certs, c];
            setProfile({ ...profile, certifications: next }); setModal(null);
          }} />
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ProfileDashboard(props: Props) {
  const isLiveEditor = Boolean(props.data);

  // All hooks called unconditionally — React rules require this.
  // Onboarding mode uses ownProfile/ownSkillsText; live-editor mode ignores them.
  const [ownProfile, setOwnProfile] = useState<Partial<PortfolioData>>({
    name: "", title: "", bio: "",
    contact: { email: "" },
    experience: [], education: [], projects: [],
    skills: [], awards: [], certifications: [],
    testimonials: [], blog: [], talks: [], images: [],
  });
  const [ownSkillsText, setOwnSkillsText] = useState("");
  // Live-editor: initialise skills text from the incoming data (once)
  const [liveSkillsText, setLiveSkillsText] = useState(
    (props.data?.skills ?? []).join(", ")
  );

  if (isLiveEditor) {
    // ── Live editor mode ────────────────────────────────────────────────────
    const { data, onChange } = props as EditorProps;

    const handleSkillsChange = (text: string) => {
      setLiveSkillsText(text);
      const skills = text.split(",").map((s) => s.trim()).filter(Boolean);
      onChange({ ...data, skills } as PortfolioData);
    };

    return (
      <DashboardBody
        profile={data}
        setProfile={(p) => onChange(p as PortfolioData)}
        skillsText={liveSkillsText}
        setSkillsText={handleSkillsChange}
        isLiveEditor={true}
      />
    );
  }

  // ── Onboarding mode ─────────────────────────────────────────────────────────
  const { onComplete } = props as OnboardingProps;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <DashboardBody
        profile={ownProfile}
        setProfile={setOwnProfile}
        skillsText={ownSkillsText}
        setSkillsText={setOwnSkillsText}
        isLiveEditor={false}
        // Pass enriched data returned by /api/generate directly to onComplete
        onGenerate={(enrichedData) => onComplete(enrichedData)}
      />
    </div>
  );
}
