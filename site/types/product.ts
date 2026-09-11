/**
 * Tipos do catálogo — espelham as entidades do backend
 * (src/modules/catalog/entities/*.ts). Estoque mora na variação, nunca no
 * produto (RN01) — não crie um campo de estoque em Product aqui.
 */
export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  isCover: boolean;
  position: number;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  /** Preço só desta variação; nulo = usa product.basePrice */
  priceOverride: number | null;
  stockQuantity: number;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  categoryId: string | null;
  category: Category | null;
  active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

export function resolveVariantPrice(product: Product, variant: ProductVariant | null): number {
  if (variant?.priceOverride != null) return variant.priceOverride;
  return product.basePrice;
}

export function coverImage(product: Product): ProductImage | null {
  if (product.images.length === 0) return null;
  return (
    product.images.find((image) => image.isCover) ??
    [...product.images].sort((a, b) => a.position - b.position)[0]
  );
}
