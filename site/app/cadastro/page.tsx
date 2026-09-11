import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { GlitchText } from "@/components/glitch/GlitchText";

export const metadata: Metadata = buildMetadata({
  title: "Criar conta",
  description: "Crie sua conta Glitch — é grátis e necessário para finalizar pedidos.",
  path: "/cadastro",
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <div className="container-section flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <h1 className="text-center text-2xl font-bold">
          <GlitchText as="span" intensity="subtle">
            Criar conta
          </GlitchText>
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Cadastro rápido — precisa de conta pra finalizar um pedido (RN02).
        </p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
