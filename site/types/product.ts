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

/**
 * Atributos de estilo do mockup de referência (filtros em pílula da seção
 * "A Coleção"). Espelha
 * backend/src/modules/catalog/enums/product-style-tag.enum.ts.
 */
export enum ProductStyleTag {
  GENDER_FLUID = "fluido_genero",
  UNISEX = "unissex",
  ADAPTIVE_FIT = "corte_adaptavel",
  ALL_BODIES = "todos_os_corpos",
  NEW_RELEASE = "lancamento",
}

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
  styleTags: ProductStyleTag[];
  /** Modelo 3D giratório (.glb) do produto; null = site mostra só as fotos. */
  model3dUrl: string | null;
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

/**
 * Tamanhos ativos do produto, sem repetição, na ordem em que o
 * administrador cadastrou as variações (mesma convenção usada na página de
 * detalhe, ver ProductPurchasePanel). Usado para mostrar as tags de
 * tamanho (XS a 5XL, conforme cadastrado) direto no card da grade.
 */
export function activeSizes(product: Product): string[] {
  return Array.from(new Set((product.variants ?? []).filter((v) => v.active).map((v) => v.size)));
}
