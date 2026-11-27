"use client";
import { useState, useEffect, useCallback } from "react";
import type { PortfolioData, TemplateId } from "@/lib/types";

const STORAGE_KEY = "portfolio_builder_data";
const TEMPLATE_KEY = "portfolio_builder_template";

const EMPTY_PORTFOLIO: PortfolioData = {
  name: "",
  title: "",
  bio: "",
  contact: { email: "" },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  awards: [],
  certifications: [],
  testimonials: [],
  blog: [],
  talks: [],
  images: [],
};

export function usePortfolioEditor() {
  const [data, setData] = useState<PortfolioData>(EMPTY_PORTFOLIO);
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [editMode, setEditMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedTemplate = localStorage.getItem(TEMPLATE_KEY) as TemplateId | null;
      if (savedData) {
        const parsed = JSON.parse(savedData) as PortfolioData;
        // Backfill new arrays for portfolios saved before these fields existed
        setData({
          ...EMPTY_PORTFOLIO,
          ...parsed,
          contact: { ...EMPTY_PORTFOLIO.contact, ...parsed.contact },
          testimonials: parsed.testimonials ?? [],
          blog: parsed.blog ?? [],
          talks: parsed.talks ?? [],
        });
      }
      if (savedTemplate) setTemplateId(savedTemplate);
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Auto-save to localStorage on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(TEMPLATE_KEY, templateId);
  }, [templateId, hydrated]);

  const updateData = useCallback((updated: PortfolioData) => {
    setData(updated);
  }, []);

  const loadPortfolio = useCallback((incoming: Partial<PortfolioData>) => {
    setData({
      ...EMPTY_PORTFOLIO,
      ...incoming,
      contact: { ...EMPTY_PORTFOLIO.contact, ...incoming.contact },
      testimonials: incoming.testimonials ?? [],
      blog: incoming.blog ?? [],
      talks: incoming.talks ?? [],
    });
    setEditMode(true);
  }, []);

  const clearPortfolio = useCallback(() => {
    setData(EMPTY_PORTFOLIO);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    data,
    templateId,
    editMode,
    hydrated,
    updateData,
    loadPortfolio,
    clearPortfolio,
    setTemplateId,
    setEditMode,
  };
}
