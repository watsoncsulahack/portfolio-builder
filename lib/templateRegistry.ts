import type { ComponentType } from "react";
import type { PortfolioData, TemplateId } from "@/lib/types";
import ClassicTemplate from "@/components/templates/ClassicTemplate";
import MinimalTemplate from "@/components/templates/MinimalTemplate";
import BoldTemplate from "@/components/templates/BoldTemplate";
import VibrantTemplate from "@/components/templates/VibrantTemplate";
import TerminalTemplate from "@/components/templates/TerminalTemplate";

export interface TemplateProps {
  data: PortfolioData;
  editMode: boolean;
  onUpdate: (updated: PortfolioData) => void;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  accentColor: string; // Tailwind bg color class for the thumbnail chip
  component: ComponentType<TemplateProps>;
}

export const templates: TemplateDefinition[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Professional serif layout, traditional and polished",
    accentColor: "bg-blue-700",
    component: ClassicTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and modern — lots of white space, light typography",
    accentColor: "bg-gray-900",
    component: MinimalTemplate,
  },
  {
    id: "bold",
    name: "Bold",
    description: "Dark hero, vibrant accents — makes a strong first impression",
    accentColor: "bg-purple-700",
    component: BoldTemplate,
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Bold color-blocked layout — energetic, creative, and eye-catching",
    accentColor: "bg-orange-500",
    component: VibrantTemplate,
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Dark code aesthetic — IDE-inspired with syntax highlighting",
    accentColor: "bg-green-600",
    component: TerminalTemplate,
  },
];

export function getTemplate(id: TemplateId): TemplateDefinition {
  return templates.find((t) => t.id === id) ?? templates[0];
}
