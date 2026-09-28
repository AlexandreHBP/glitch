/**
 * Card de produto usado no catálogo e nos destaques da home. Server
 * component — puramente apresentacional. Glitch só no hover da imagem
 * (.glitch-hover), nunca no preço/nome (que precisam continuar 100%
 * legíveis). Mostra as tags de tamanho cadastradas (XS a 5XL, conforme o
 * produto) direto na grade, sem precisar abrir a página de detalhe.
 */
import Image from "next/image";
import Link from "next/link";
import { activeSizes, coverImage, resolveVariantPrice, type Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const image = coverImage(product);
  const hasStock = product.variants?.some((v) => v.active && v.stockQuantity > 0) ?? true;
  const price = resolveVariantPrice(product, null);
  const sizes = activeSizes(product);

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-wine/60 hover:bg-white/[0.04]"
    >
      <div className="glitch-hover relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
        {image ? (
          <Image
            src={resolveMediaUrl(image.url)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-600">
            Sem foto
          </div>
        )}
        {!hasStock && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-bone">
            Esgotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-white sm:text-base">{product.name}</h3>

        {sizes.length > 0 && (
          <ul role="list" aria-label="Tamanhos disponíveis" className="flex flex-wrap gap-1">
            {sizes.map((size) => (
              <li
                key={size}
                className="rounded border border-white/15 px-1.5 py-0.5 text-[11px] font-medium leading-none text-slate-300"
              >
                {size}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-auto pt-1 text-base font-bold text-bone">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}
