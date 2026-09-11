"use client";

/**
 * Cabeçalho global da loja (renderizado pelo layout raiz, presente em
 * todas as páginas). Client component: precisa de estado de sessão
 * (useAuth), contagem do carrinho (useCart) e do menu mobile.
 */
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlitchText } from "@/components/glitch/GlitchText";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { siteConfig } from "@/lib/site-config";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Catálogo", href: "/produtos" },
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="20.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="20.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const { totalItems, isHydrated } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <nav aria-label="Navegação principal" className="container-section flex h-16 items-center justify-between">
        <Link href="/" className="glitch-hover flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-wine-bright to-wine text-bone shadow-lg shadow-wine/40"
          >
            ◆
          </span>
          <GlitchText as="span" intensity="strong" className="text-base uppercase tracking-widest">
            {siteConfig.name}
          </GlitchText>
        </Link>

        <ul className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="transition-colors hover:text-bone">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/carrinho"
            aria-label={`Carrinho${isHydrated && totalItems > 0 ? `, ${totalItems} ${totalItems === 1 ? "item" : "itens"}` : ""}`}
            className="glitch-hover relative flex h-9 w-9 items-center justify-center rounded-md text-slate-200 hover:bg-white/5 hover:text-bone"
          >
            <CartIcon />
            {isHydrated && totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-wine px-1 text-[10px] font-bold text-bone">
                {totalItems}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <Button variant="ghost" size="sm" href="/minha-conta">
                  Minha conta
                </Button>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" href="/entrar">
                  Entrar
                </Button>
                <Button variant="primary" size="sm" href="/cadastro">
                  Criar conta
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-200 hover:bg-white/5 md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {isMenuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-white/5 bg-slate-950 md:hidden">
          <ul className="container-section flex flex-col gap-1 py-4 text-sm text-slate-200">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2 py-2 hover:bg-white/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-3">
              {user ? (
                <>
                  <Link href="/minha-conta" className="rounded-md px-2 py-2 hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>
                    Minha conta
                  </Link>
                  <button
                    type="button"
                    className="rounded-md px-2 py-2 text-left hover:bg-white/5"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/entrar" className="rounded-md px-2 py-2 hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>
                    Entrar
                  </Link>
                  <Link href="/cadastro" className="rounded-md bg-wine px-2 py-2 text-bone" onClick={() => setIsMenuOpen(false)}>
                    Criar conta
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
