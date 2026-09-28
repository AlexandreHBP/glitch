"use client";

/**
 * Formulário de login (RF02). Em caso de sucesso, respeita ?redirect= na
 * URL — é assim que o checkout manda o cliente deslogado pra cá e recebe
 * ele de volta depois, com o carrinho intacto (RN02).
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { getSafeRedirect } from "@/lib/safe-redirect";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push(getSafeRedirect(searchParams.get("redirect")));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
        />
      </div>

      {error && (
        <p role="alert" aria-live="assertive" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-wine-bright hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
