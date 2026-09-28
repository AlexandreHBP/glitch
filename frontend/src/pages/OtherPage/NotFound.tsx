/**
 * Página 404 simples do painel administrativo.
 */
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta title="Página não encontrada | Glitch Admin" description="Página não encontrada" />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="mb-4 text-4xl font-bold text-brand-500">404</h1>
        <p className="mb-6 text-base text-gray-700 dark:text-gray-400">
          Não encontramos a página que você está procurando.
        </p>
        <Link
          to="/produtos"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Voltar para Produtos
        </Link>
      </div>
    </>
  );
}
