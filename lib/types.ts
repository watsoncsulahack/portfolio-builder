export interface ContactInfo {
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string; // "Present" or date string
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  image?: string; // URL or base64
}

export interface AwardEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface TestimonialEntry {
  id: string;
  quote: string;
  name: string;
  title: string;
  company?: string;
  avatar?: string; // base64 or URL
}

export interface BlogEntry {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  url: string;
  tags?: string[];
}

export interface TalkEntry {
  id: string;
  title: string;
  event: string;
  date: string;
  slidesUrl?: string;
  videoUrl?: string;
  description?: string;
}

export interface ImageEntry {
  id: string;
  url: string; // object URL, base64, or Vercel Blob URL
  alt: string;
  caption?: string;
  /** Which section this image is associated with (e.g. "experience", "projects", "about") */
  section?: string;
}

export interface GameEntry {
  name: string;
  description: string;
  url: string;
  thumbnail?: string;
  technologies?: string[];
}

/**
 * Controls which top-level sections are hidden on the rendered portfolio.
 * Keys match section IDs used in templates.
 */
export type SectionId =
  | "projects"
  | "experience"
  | "education"
  | "skills"
  | "game"
  | "testimonials"
  | "blog"
  | "talks"
  | "images"
  | "contact_phone"
  | "contact_location"
  | "contact_linkedin"
  | "contact_github"
  | "contact_website";

export interface PortfolioData {
  name: string;
  title: string; // e.g. "Full-Stack Engineer"
  bio: string; // AI-generated summary
  contact: ContactInfo;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: string[];
  awards: AwardEntry[];
  certifications: CertificationEntry[];
  testimonials: TestimonialEntry[];
  blog: BlogEntry[];
  talks: TalkEntry[];
  images: ImageEntry[];
  game?: GameEntry;
  /** Base64 or object URL for the hero headshot */
  headshot?: string;
  /** Hex accent color applied to button/link highlights across templates */
  accentColor?: string;
  /** The live URL of this portfolio (used in the footer of exported HTML) */
  portfolioUrl?: string;
  /** Show "Open to Work" badge in hero */
  openToWork?: boolean;
  /**
   * Set of section/field IDs to hide from the rendered portfolio.
   * Sections not in this set are shown normally.
   */
  hiddenSections?: SectionId[];
}

export type TemplateId = "classic" | "minimal" | "bold" | "vibrant" | "terminal";

export interface PublishedPortfolio {
  slug: string;
  templateId: TemplateId;
  data: PortfolioData;
  createdAt: string;
  updatedAt: string;
}
