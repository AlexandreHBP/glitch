"use client";

/**
 * Página do carrinho. Client component: lê o CartContext (localStorage) e
 * leva o cliente para /checkout. A verificação de login acontece lá
 * (RN02) — o carrinho continua intacto porque vive no localStorage, não
 * em estado de página.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const router = useRouter();
  const { items, isHydrated, totalPrice, updateQuantity, removeItem } = useCart();

  if (!isHydrated) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
        <p className="text-lg font-semibold text-white">Seu carrinho está vazio</p>
        <p className="mt-2 text-sm text-slate-400">Adicione peças do catálogo para começar um pedido.</p>
        <Button href="/produtos" className="mt-6" size="lg">
          Ver catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <ul className="lg:col-span-2" role="list">
        {items.map((item) => (
          <CartItemRow
            key={item.productVariantId}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white">Resumo</h2>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span className="font-semibold text-bone">{formatPrice(totalPrice)}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          O valor final é confirmado pelo servidor ao finalizar o pedido — preços e estoque podem mudar
          entre a montagem do carrinho e o checkout.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/checkout")}>
          Finalizar pedido
        </Button>
        <Link href="/produtos" className="mt-3 block text-center text-sm text-slate-400 hover:text-white">
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
