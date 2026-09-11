/**
 * Detalhe do produto (RF01) — galeria, seletor de variação e estoque.
 * Meta tags/OpenGraph dinâmicos via generateMetadata. Descrição do
 * produto é sempre tratada como texto puro (nunca dangerouslySetInnerHTML)
 * mesmo que contenha caracteres que pareçam HTML.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { productsApi } from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductPurchasePanel } from "@/components/catalog/ProductPurchasePanel";
import { coverImage } from "@/types/product";
import { resolveMediaUrl } from "@/lib/media";
import type { Product } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    return await productsApi.getBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    return buildMetadata({ title: "Produto não encontrado", path: `/produtos/${slug}`, noIndex: true });
  }
  const image = coverImage(product);
  return buildMetadata({
    title: product.name,
    description:
      product.description?.slice(0, 155) ??
      `${product.name} — peça Glitch disponível em tamanhos e cores variados.`,
    path: `/produtos/${product.slug}`,
    image: image ? resolveMediaUrl(image.url) : undefined,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  return (
    <div className="container-section py-16 sm:py-20">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
        <Link href="/produtos" className="hover:text-slate-300">
          Catálogo
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-slate-300">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{product.name}</h1>
          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-400">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
