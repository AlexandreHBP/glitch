/**
 * Destaque do catálogo na home (RF01) — busca os produtos mais recentes no
 * servidor (bom para SEO e LCP: primeira imagem sai já no HTML).
 */
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/catalog/ProductCard";
import { productsApi } from "@/lib/api/products";

export async function FeaturedProducts() {
  const result = await productsApi.list({ limit: 4 }, 60);

  if (result.data.length === 0) {
    return null;
  }

  return (
    <Section
      id="catalogo"
      eyebrow="Catálogo"
      title="Últimas peças"
      description="Um recorte do que chegou por último. O catálogo completo tem mais opções de tamanho, cor e categoria."
    >
      <ul role="list" className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {result.data.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} priority={index === 0} />
          </li>
        ))}
      </ul>

      <div className="mt-10 flex justify-center">
        <Button href="/produtos" variant="secondary" size="lg">
          Ver catálogo completo
        </Button>
      </div>
    </Section>
  );
}
