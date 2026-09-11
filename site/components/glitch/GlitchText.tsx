/**
 * Efeito visual "glitch" (RF09) para o logo e títulos de seção. Server
 * component — é só marcação + CSS de app/globals.css, sem estado nem
 * efeito, então não precisa de "use client". O texto real permanece
 * intacto e selecionável; as duas cópias coloridas são elementos reais
 * (não pseudo-elementos) marcados com aria-hidden, para leitores de tela
 * nunca lerem a duplicata.
 *
 * Proibido usar em texto corrido, descrição de produto, preço ou
 * qualquer campo de formulário — só logo e títulos de seção.
 */
import type { ElementType } from "react";
import { cn } from "@/lib/cn";

type GlitchTextProps = {
  as?: ElementType;
  children: string;
  intensity?: "subtle" | "strong";
  className?: string;
};

export function GlitchText({ as, children, intensity = "subtle", className }: GlitchTextProps) {
  const Tag = as ?? "span";
  return (
    <Tag className={cn("glitch-text", `glitch-text--${intensity}`, className)}>
      <span aria-hidden="true" className="glitch-text__layer glitch-text__layer--cyan" data-text={children} />
      <span
        aria-hidden="true"
        className="glitch-text__layer glitch-text__layer--magenta"
        data-text={children}
      />
      <span className="glitch-text__base">{children}</span>
    </Tag>
  );
}
