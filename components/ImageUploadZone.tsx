"use client";
import React, { useRef } from "react";
import type { ImageEntry } from "@/lib/types";

interface ImageUploadZoneProps {
  images: ImageEntry[];
  editMode: boolean;
  onChange: (images: ImageEntry[]) => void;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ImageUploadZone({ images, editMode, onChange }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newImages: ImageEntry[] = Array.from(files).map((file) => ({
      id: newId(),
      url: URL.createObjectURL(file),
      alt: file.name.replace(/\.[^.]+$/, ""),
      caption: "",
    }));
    onChange([...images, ...newImages]);
  };

  const handleRemove = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  if (!editMode && images.length === 0) return null;

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img src={img.url} alt={img.alt} className="w-full h-24 object-cover rounded-lg" />
              {editMode && (
                <button
                  onClick={() => handleRemove(img.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {editMode && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-300 rounded-lg px-4 py-2 w-full"
          >
            + Upload images
          </button>
        </>
      )}
    </div>
  );
}
