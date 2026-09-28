"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Plug aqui seu Sentry/Datadog/etc. Mantenha o objeto error opaco.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Algo inesperado aconteceu.
      </h1>
      <p className="mt-3 max-w-lg text-slate-400">
        Tente novamente em instantes. Se o problema persistir, entre em contato com nosso time.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500"
      >
        Tentar novamente
      </button>
    </main>
  );
}
