"use client";
import type { PortfolioData } from "@/lib/types";
import type { TemplateId } from "@/lib/types";
import { getTemplate } from "@/lib/templateRegistry";

interface ViewerProps {
  data: PortfolioData;
  templateId: TemplateId;
}

/**
 * Client component that renders a portfolio template in view-only mode.
 * Needed because template components are "use client" and accept function props
 * that cannot be passed across the server/client boundary.
 */
export default function PortfolioViewer({ data, templateId }: ViewerProps) {
  const { component: TemplateComponent } = getTemplate(templateId);
  return (
    <TemplateComponent
      data={data}
      editMode={false}
      onUpdate={() => {}} // view-only — no-op
    />
  );
}
