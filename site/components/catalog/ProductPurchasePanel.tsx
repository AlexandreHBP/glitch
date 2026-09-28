"use client";

/**
 * Seleção de variação (tamanho/cor), estoque da variação selecionada e
 * adicionar ao carrinho (RF01). Client leaf da página de produto — o
 * restante da página (descrição, título) continua server component.
 * Nunca envia preço para o backend; o carrinho só guarda uma cópia para
 * exibição, o servidor recalcula tudo no checkout.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StockBadge } from "@/components/catalog/StockBadge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/format";
import { coverImage, resolveVariantPrice, type Product, type ProductVariant } from "@/types/product";

function uniqueValues(variants: ProductVariant[], key: "size" | "color"): string[] {
  return Array.from(new Set(variants.filter((v) => v.active).map((v) => v[key])));
}

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const activeVariants = product.variants.filter((v) => v.active);

  const sizes = useMemo(() => uniqueValues(activeVariants, "size"), [activeVariants]);
  const colors = useMemo(() => uniqueValues(activeVariants, "color"), [activeVariants]);

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () =>
      activeVariants.find((v) => v.size === selectedSize && v.color === selectedColor) ?? null,
    [activeVariants, selectedSize, selectedColor],
  );

  const price = resolveVariantPrice(product, selectedVariant);
  const inStock = (selectedVariant?.stockQuantity ?? 0) > 0;
  const image = coverImage(product);

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem(
      {
        productVariantId: selectedVariant.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: `${selectedVariant.size} / ${selectedVariant.color}`,
        unitPrice: price,
        imageUrl: image?.url ?? null,
        maxQuantity: Math.min(selectedVariant.stockQuantity, 20),
      },
      quantity,
    );
    setFeedback(`${quantity}x ${product.name} (${selectedVariant.size}/${selectedVariant.color}) no carrinho.`);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/carrinho");
  }

  if (activeVariants.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
        Este produto está temporariamente sem variações disponíveis para compra.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-3xl font-bold text-bone">{formatPrice(price)}</p>

      {sizes.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-300">Tamanho</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={`min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition ${
                  selectedSize === size
                    ? "border-wine-bright bg-wine text-bone"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-300">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-pressed={selectedColor === color}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  selectedColor === color
                    ? "border-wine-bright bg-wine text-bone"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <StockBadge stockQuantity={selectedVariant?.stockQuantity ?? null} />

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-slate-300">
          Quantidade
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          disabled={!inStock}
          className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white disabled:opacity-50"
        >
          {Array.from({ length: Math.min(selectedVariant?.stockQuantity ?? 1, 10) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          size="lg"
          className="glitch-hover flex-1"
          onClick={handleAddToCart}
          disabled={!selectedVariant || !inStock}
        >
          Adicionar ao carrinho
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="glitch-hover flex-1"
          onClick={handleBuyNow}
          disabled={!selectedVariant || !inStock}
        >
          Comprar agora
        </Button>
      </div>

      {feedback && (
        <p role="status" className="text-sm text-emerald-400">
          {feedback}
        </p>
      )}

      <p className="text-xs text-slate-500">
        O pagamento é combinado diretamente com a gente depois do pedido — nada é cobrado no site.
      </p>
    </div>
  );
}
