/**
 * Rodapé global da loja — presente em todas as páginas (renderizado pelo
 * layout raiz). Inclui a ovelha negra animada (RF11), que por viver aqui
 * nunca é remontada ao trocar de rota. Estrutura e copy seguem o mockup de
 * referência da home (3 colunas de links + ícones sociais + linha final).
 *
 * IMPORTANTE (flag para o Alexandre revisar): "Nosso Manifesto", "Guia de
 * Medidas", "Acessibilidade", "Sustentabilidade" e "Envio & Trocas" ainda
 * não têm página própria no site — apontam para o e-mail de contato como
 * solução provisória, em vez de um link morto. Quando o conteúdo dessas
 * páginas existir, troque o href pela rota real.
 */
import Link from "next/link";
import { BlackSheep } from "@/components/glitch/BlackSheep";
import { GlitchText } from "@/components/glitch/GlitchText";
import { siteConfig } from "@/lib/site-config";

const contactHref = `mailto:${siteConfig.contact.email}`;

const columns = [
  {
    title: "Loja",
    links: [
      { label: "Novidades", href: "/produtos" },
      { label: "Todos os Tamanhos XS–5XL", href: "/produtos" },
      { label: "Cortes Adaptáveis", href: "/produtos" },
      { label: "Promoção", href: "/produtos" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { label: "Nosso Manifesto", href: contactHref },
      { label: "Guia de Medidas", href: contactHref },
      { label: "Acessibilidade", href: contactHref },
      { label: "Sustentabilidade", href: contactHref },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "Envio & Trocas", href: contactHref },
      { label: "Guia de Medidas", href: contactHref },
      { label: "Fale Conosco", href: contactHref },
    ],
  },
];

const socials = [
  { label: "Instagram", short: "IG", href: siteConfig.social.instagram },
  { label: "TikTok", short: "TK", href: siteConfig.social.tiktok },
  { label: "Discord", short: "DC", href: siteConfig.social.discord },
  { label: "YouTube", short: "YT", href: siteConfig.social.youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="container-section py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <GlitchText as="span" intensity="subtle" className="font-display text-2xl uppercase tracking-widest">
                {siteConfig.name}
              </GlitchText>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              Moda alternativa para todo corpo, toda expressão. Sem concessões.
            </p>

            <ul className="mt-6 flex items-center gap-2" aria-label="Redes sociais">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="glitch-hover flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-xs font-semibold uppercase text-slate-300 hover:border-white/40 hover:text-white"
                  >
                    {social.short}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-wine-bright">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center text-xs uppercase tracking-wide text-slate-500">
          <p>
            © {new Date().getFullYear()} Glitch Coletivo. Todos os tamanhos. Todos os corpos. Todos são
            bem-vindos.
          </p>
        </div>

        <BlackSheep />
      </div>
    </footer>
  );
}
