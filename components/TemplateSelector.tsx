"use client";
import React from "react";
import { templates } from "@/lib/templateRegistry";
import type { TemplateId } from "@/lib/types";

interface TemplateSelectorProps {
  active: TemplateId;
  onChange: (id: TemplateId) => void;
}

export default function TemplateSelector({ active, onChange }: TemplateSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {templates.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => onChange(tpl.id)}
          className={[
            "flex flex-col items-start gap-2 p-3 rounded-xl border-2 transition-all shrink-0 w-40 text-left",
            active === tpl.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-gray-400",
          ].join(" ")}
        >
          {/* Visual chip */}
          <div className={`w-full h-14 rounded-lg ${tpl.accentColor} opacity-90`} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5">{tpl.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
