/**
 * Rodapé global da loja — presente em todas as páginas (renderizado pelo
 * layout raiz). Inclui a ovelha negra animada (RF11), que por viver aqui
 * nunca é remontada ao trocar de rota.
 */
import Link from "next/link";
import { BlackSheep } from "@/components/glitch/BlackSheep";
import { GlitchText } from "@/components/glitch/GlitchText";
import { siteConfig } from "@/lib/site-config";

const groups = [
  {
    title: "Loja",
    links: [
      { label: "Catálogo", href: "/produtos" },
      { label: "Minha conta", href: "/minha-conta" },
      { label: "Carrinho", href: "/carrinho" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/entrar" },
      { label: "Criar conta", href: "/cadastro" },
    ],
  },
  {
    title: "Contato",
    links: [
      { label: "Fale com a gente", href: `mailto:${siteConfig.contact.email}` },
      { label: "Instagram", href: siteConfig.social.instagram },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="container-section py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-wine-bright to-wine text-bone"
              >
                ◆
              </span>
              <GlitchText as="span" intensity="subtle" className="uppercase tracking-widest">
                {siteConfig.name}
              </GlitchText>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-400">{siteConfig.description}</p>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                {group.links.map((link) => (
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

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p>O pagamento é sempre combinado diretamente com a gente, fora do site.</p>
        </div>

        <BlackSheep />
      </div>
    </footer>
  );
}
