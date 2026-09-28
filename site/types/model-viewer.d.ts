/**
 * Tipagem JSX do web component <model-viewer> (@google/model-viewer).
 * A lib só registra um custom element no browser (customElements.define),
 * sem tipos de JSX — sem isto, `<model-viewer>` quebra o typecheck do
 * React/TypeScript. Duas augmentations (módulo "react" + global) cobrem as
 * duas formas como o TS pode resolver `JSX.IntrinsicElements` dependendo do
 * runtime de JSX configurado.
 */
import type { DetailedHTMLProps, HTMLAttributes } from "react";

interface ModelViewerJsxAttributes
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  src?: string;
  alt?: string;
  poster?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: number | string;
  "rotation-per-second"?: string;
  "shadow-intensity"?: number | string;
  "shadow-softness"?: number | string;
  exposure?: number | string;
  "environment-image"?: string;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
  "interaction-prompt"?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
  "disable-zoom"?: boolean;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerJsxAttributes;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerJsxAttributes;
    }
  }
}

export {};
