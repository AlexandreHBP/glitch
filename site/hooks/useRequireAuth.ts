"use client";

/**
 * Guarda de rotas que exigem login (Minha conta, detalhe de pedido,
 * confirmação de pedido). Redireciona para /entrar preservando a rota de
 * origem em ?redirect=, sem afetar o carrinho (que vive à parte, no
 * localStorage do CartContext).
 */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/entrar?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  return { user, ready: !isLoading && Boolean(user) };
}
