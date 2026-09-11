"use client";

/**
 * Galeria de fotos do produto (RF01). Client leaf: só troca a imagem em
 * destaque ao clicar numa miniatura — estado puramente visual.
 */
import { useState } from "react";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/types/product";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-sm text-slate-600">
        Sem fotos disponíveis
      </div>
    );
  }

  return (
    <div>
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

      {sorted.length > 1 && (
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
