"use client";
import React, { useRef } from "react";
import type { ImageEntry } from "@/lib/types";

const SECTIONS = ["hero", "about", "experience", "projects", "education", "skills", "game", "gallery"] as const;
type SectionKey = (typeof SECTIONS)[number];

interface SectionPhotoManagerProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function SectionPhotoManager({ images, onChange }: SectionPhotoManagerProps) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = (section: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      // Replace existing image for this section or add new one
      const existing = images.find((img) => img.section === section);
      if (existing) {
        onChange(images.map((img) => img.id === existing.id ? { ...img, url } : img));
      } else {
        const newEntry: ImageEntry = {
          id: uid(),
          url,
          alt: `${section} photo`,
          section,
        };
        onChange([...images, newEntry]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeSection = (section: string) => {
    onChange(images.filter((img) => img.section !== section));
  };

  const getImage = (section: string) => images.find((img) => img.section === section);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 leading-relaxed">
        Assign photos to specific sections. Each section can optionally show an image alongside its content.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SECTIONS.map((section) => {
          const img = getImage(section);
          return (
            <div key={section} className="relative group">
              <input
                ref={(el) => { fileRefs.current[section] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(section, file);
                  e.target.value = "";
                }}
              />
              {img ? (
                <div className="relative rounded-xl overflow-hidden cursor-pointer border border-gray-200"
                  onClick={() => fileRefs.current[section]?.click()}>
                  <img src={img.url} alt={img.alt} className="w-full h-16 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSection(section); }}
                      className="text-xs text-red-300 bg-black/50 px-2 py-1 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="absolute bottom-0 left-0 right-0 text-center text-xs font-bold text-white bg-black/50 py-0.5">{section}</span>
                </div>
              ) : (
                <button
                  onClick={() => fileRefs.current[section]?.click()}
                  className="w-full h-16 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-lg">+</span>
                  <span className="text-xs text-gray-400 font-medium">{section}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
