"use client";
import React, { useRef } from "react";

interface HeadshotUploaderProps {
  headshot?: string;
  onChange: (dataUrl: string | undefined) => void;
}

export default function HeadshotUploader({ headshot, onChange }: HeadshotUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      {headshot ? (
        <div className="relative group">
          <img
            src={headshot}
            alt="Headshot"
            className="w-full h-40 object-cover rounded-2xl"
          />
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold text-white bg-white/20 hover:bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              Change
            </button>
            <button
              onClick={() => onChange(undefined)}
              className="text-xs font-semibold text-red-300 bg-white/20 hover:bg-red-500/40 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center text-2xl">
            🤳
          </div>
          <p className="text-sm font-semibold text-gray-700">Upload headshot</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — drag & drop or click</p>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-xs text-gray-400">
        Your headshot will appear in the hero section of your portfolio.
      </p>
    </div>
  );
}
