"use client";

/**
 * Agrega os context providers client-side (auth, carrinho, player de
 * música) num único wrapper, para o layout raiz (server component)
 * continuar exportando `metadata` normalmente.
 */
import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <MusicPlayerProvider>{children}</MusicPlayerProvider>
      </CartProvider>
    </AuthProvider>
  );
}
