import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = buildMetadata({
  title: "Carrinho",
  description: "Revise os itens do seu carrinho antes de finalizar o pedido.",
  path: "/carrinho",
  noIndex: true,
});

export default function CartPage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Carrinho</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
