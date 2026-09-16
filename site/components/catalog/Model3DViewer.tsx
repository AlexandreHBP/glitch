"use client";

/**
 * Visualizador 3D giratório do produto (<model-viewer>, web component do
 * Google). "@google/model-viewer" chama `customElements.define(...)` no
 * topo do módulo, sem guarda de ambiente — importar isso de forma estática
 * quebraria a renderização no servidor (Next.js ainda faz SSR de Client
 * Components), porque `customElements` não existe em Node. Por isso o
 * import acontece dentro de um `useEffect`, só depois de montar no
 * browser; a tag <model-viewer> só é renderizada depois que o custom
 * element está registrado.
 */
import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/media";

export function Model3DViewer({ url, productName }: { url: string; productName: string }) {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("@google/model-viewer").then(() => {
      if (!cancelled) setIsRegistered(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="glitch-hover relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      {isRegistered ? (
        <>
          <model-viewer
            src={resolveMediaUrl(url)}
            alt={`Modelo 3D de ${productName}`}
            camera-controls
            auto-rotate
            auto-rotate-delay={0}
            rotation-per-second="18deg"
            shadow-intensity="1"
            exposure="1"
            ar
            ar-modes="webxr scene-viewer quick-look"
            interaction-prompt="none"
            loading="eager"
            style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
          >
            <div slot="progress-bar" />
          </model-viewer>
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11px] text-slate-300">
            Arraste para girar
          </p>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
          Carregando modelo 3D…
        </div>
      )}
    </div>
  );
}
