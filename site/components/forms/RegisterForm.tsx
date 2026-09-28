"use client";

/**
 * Formulário de cadastro de cliente (RF02). Validação client-side
 * consistente com o backend (RegisterDto: nome 2-150, senha 6-72).
 * Também respeita ?redirect= para voltar ao checkout com o carrinho.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { getSafeRedirect } from "@/lib/safe-redirect";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Nome deve ter no mínimo 2 caracteres");
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email, password);
      router.push(getSafeRedirect(searchParams.get("redirect")));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-200">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={150}
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-200">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-200">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          maxLength={72}
          autoComplete="new-password"
          aria-describedby="password-help"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
        />
        <p id="password-help" className="mt-1.5 text-xs text-slate-500">
          Mínimo de 6 caracteres.
        </p>
      </div>

      {error && (
        <p role="alert" aria-live="assertive" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-wine-bright hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
