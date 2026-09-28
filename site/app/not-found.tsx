import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Página não encontrada (404)",
  description: "A página que você procura não existe ou foi movida.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Esta página decolou sem nós.
      </h1>
      <p className="mt-4 max-w-xl text-base text-slate-400">
        O endereço acessado não existe ou foi movido. Volte ao início e siga o caminho a partir daí.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
