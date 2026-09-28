import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { LoginForm } from "@/components/forms/LoginForm";
import { GlitchText } from "@/components/glitch/GlitchText";

export const metadata: Metadata = buildMetadata({
  title: "Entrar",
  description: "Acesse sua conta Glitch para finalizar pedidos e acompanhar o status das suas compras.",
  path: "/entrar",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <div className="container-section flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <h1 className="text-center text-2xl font-bold">
          <GlitchText as="span" intensity="subtle">
            Entrar
          </GlitchText>
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Entre para finalizar pedidos e ver seu histórico de compras.
        </p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
