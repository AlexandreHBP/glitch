"use client";

/**
 * Reflete `prefers-reduced-motion` em tempo real. CSS puro (glitch, ovelha)
 * já respeita a media query globalmente via app/globals.css; este hook é
 * para os efeitos que rodam via JavaScript (ParallaxSection), que não são
 * cobertos por CSS media query.
 */
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setReduced(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}
