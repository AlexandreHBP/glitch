/**
 * Vitrine de categorias na home — pensada para a página inicial parecer
 * uma loja de verdade (navegação direta por categoria), não uma landing
 * page institucional. Busca as categorias reais cadastradas pelo
 * administrador (nenhum rótulo binário de gênero é inventado aqui) e, para
 * cada uma, o total de produtos ativos, para dar contexto real de estoque.
 * Cada card é só cor/gradiente + tipografia (sem foto), já que ainda não
 * existem fotos de categoria — ver TODO no Hero sobre imagens reais.
 */
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { categoriesApi } from "@/lib/api/categories";
import { productsApi } from "@/lib/api/products";

const ACCENTS = ["text-wine-bright", "text-glitch-cyan", "text-glitch-magenta"] as const;

export async function CategoryShowcase() {
  const categories = await categoriesApi.list();
  const activeCategories = categories.filter((category) => category.active);

  if (activeCategories.length === 0) {
    return null;
  }

  const counts = await Promise.all(
    activeCategories.map((category) => productsApi.list({ categoryId: category.id, limit: 1 }, 60)),
  );

  return (
    <Section
      id="categorias"
      eyebrow="Categorias"
      title="Escolha por categoria"
      description="Escolha por onde começar. Cada categoria mostra o total de peças disponíveis agora."
    >
      <ul role="list" className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {activeCategories.map((category, index) => {
          const total = counts[index]?.total ?? 0;
          const accent = ACCENTS[index % ACCENTS.length];

          return (
            <li key={category.id}>
              <Link
                href={{ pathname: "/produtos", query: { categoria: category.id } }}
                className="glitch-hover group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-wine/30 via-ink to-black p-5 transition hover:border-wine/60"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-10 transition-opacity group-hover:opacity-20"
                />
                <span aria-hidden="true" className={`relative text-4xl font-black ${accent} opacity-80`}>
                  {category.name.charAt(0).toUpperCase()}
                </span>
                <h3 className="relative mt-2 text-base font-semibold text-white">{category.name}</h3>
                <p className="relative text-xs text-slate-400">
                  {total} {total === 1 ? "peça disponível" : "peças disponíveis"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
