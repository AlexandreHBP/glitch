"use client";

/**
 * Galeria de fotos do produto (RF01), com alternância opcional para o
 * visualizador 3D giratório (model3dUrl) quando o admin anexou um modelo
 * .glb ao produto. Client leaf: só troca a imagem em destaque / a aba
 * ativa — estado puramente visual. Produtos sem model3dUrl nunca veem a
 * aba "Ver em 3D": a galeria de fotos continua funcionando sozinha.
 */
import { useState } from "react";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";
import { Model3DViewer } from "@/components/catalog/Model3DViewer";
import type { ProductImage } from "@/types/product";

type GalleryTab = "photos" | "3d";

export function ProductGallery({
  images,
  productName,
  model3dUrl,
}: {
  images: ProductImage[];
  productName: string;
  model3dUrl?: string | null;
}) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<GalleryTab>("photos");
  const active = sorted[activeIndex];
  const has3d = !!model3dUrl;

  if (sorted.length === 0 && !has3d) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-sm text-slate-600">
        Sem fotos disponíveis
      </div>
    );
  }

  return (
    <div>
      {has3d && (
        <div className="mb-3 inline-flex rounded-lg border border-white/10 bg-white/5 p-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "photos"}
            onClick={() => setActiveTab("photos")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              activeTab === "photos" ? "bg-wine text-bone" : "text-slate-300 hover:text-white",
            )}
          >
            Fotos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "3d"}
            onClick={() => setActiveTab("3d")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              activeTab === "3d" ? "bg-wine text-bone" : "text-slate-300 hover:text-white",
            )}
          >
            Ver em 3D
          </button>
        </div>
      )}

      {activeTab === "3d" && has3d ? (
        <Model3DViewer url={model3dUrl as string} productName={productName} />
      ) : sorted.length > 0 ? (
        <div className="glitch-hover relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          <Image
            src={resolveMediaUrl(active.url)}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-sm text-slate-600">
          Sem fotos disponíveis
        </div>
      )}

      {activeTab === "photos" && sorted.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto" role="list" aria-label="Miniaturas da galeria">
          {sorted.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver foto ${index + 1} de ${productName}`}
                aria-current={index === activeIndex}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                  index === activeIndex ? "border-wine-bright" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={resolveMediaUrl(image.url)} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
