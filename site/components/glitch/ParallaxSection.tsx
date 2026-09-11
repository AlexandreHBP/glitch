"use client";

/**
 * Efeito parallax (RF12) — o único efeito de identidade visual com JS por
 * frame. IntersectionObserver só liga o requestAnimationFrame enquanto a
 * seção está visível; anima exclusivamente `transform: translate3d()`
 * (nunca background-position/top/margin, que forçam layout a cada frame).
 * Desligado abaixo de 768px e com prefers-reduced-motion — nesses casos
 * vira um fundo estático, sem custo de JS.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

type ParallaxSectionProps = {
  children: ReactNode;
  /** Intensidade do deslocamento; 0 = parado, valores típicos 0.1–0.4. */
  speed?: number;
  className?: string;
};

const MIN_VIEWPORT_WIDTH = 768;

export function ParallaxSection({ children, speed = 0.2, className }: ParallaxSectionProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    function evaluate() {
      setEnabled(window.innerWidth >= MIN_VIEWPORT_WIDTH && !reducedMotion);
    }
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, [reducedMotion]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !enabled) return;

    function tick() {
      if (!isVisibleRef.current || !node) return;
      const rect = node.getBoundingClientRect();
      const distanceFromCenter = rect.top - window.innerHeight / 2;
      const offset = distanceFromCenter * speed * -1;
      node.style.transform = `translate3d(0, ${offset}px, 0)`;
      rafIdRef.current = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && rafIdRef.current === null) {
          tick();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      node.style.transform = "";
    };
  }, [enabled, speed]);

  return (
    <div ref={nodeRef} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
