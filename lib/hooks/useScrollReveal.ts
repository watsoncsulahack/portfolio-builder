"use client";
import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to a container element.
 * Any child with class `reveal`, `reveal-left`, or `reveal-scale`
 * gets the `revealed` class added when it enters the viewport.
 */
export function useScrollReveal(rootMargin = "-60px") {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // SSR or no support — make everything visible immediately
      el?.querySelectorAll(".reveal,.reveal-left,.reveal-scale").forEach((node) => {
        node.classList.add("revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { rootMargin, threshold: 0.1 }
    );

    el.querySelectorAll(".reveal,.reveal-left,.reveal-scale").forEach((node) => {
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [rootMargin]);

  return ref;
}
