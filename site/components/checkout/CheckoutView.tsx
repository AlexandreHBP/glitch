"use client";

/**
 * Checkout (RF03, RF05, RN02, RN03). Exige login (RN02) — cliente
 * deslogado é redirecionado para /entrar preservando o carrinho, que
 * continua intacto porque vive no localStorage. O pedido enviado ao
 * backend carrega SÓ productVariantId + quantity por item (nunca preço —
 * o servidor recalcula e revalida estoque). Erro 409 lista exatamente o
 * que ficou indisponível no carrinho.
 */
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ordersApi } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";
import { DeliveryMethod, type OrderConflictBody } from "@/types/order";

export function CheckoutView() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { items, isHydrated, totalPrice, clear, removeItem } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.PICKUP);
  const [address, setAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    referencePoint: "",
  });
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailableIds, setUnavailableIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading || !isHydrated) return;
    if (!user) {
      router.replace("/entrar?redirect=/checkout");
    }
  }, [authLoading, isHydrated, user, router]);

  if (authLoading || !isHydrated || !user) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
        <p className="text-lg font-semibold text-white">Seu carrinho está vazio</p>
        <Button href="/produtos" className="mt-6" size="lg">
          Ver catálogo
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUnavailableIds({});
    setIsSubmitting(true);

    try {
      const order = await ordersApi.create({
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
        deliveryMethod,
        deliveryAddress: deliveryMethod === DeliveryMethod.SHIPPING ? address : undefined,
        customerNotes: customerNotes.trim() || undefined,
      });
      clear();
      router.push(`/pedido-confirmado/${order.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const body = err.body as OrderConflictBody;
        const map: Record<string, string> = {};
        for (const unavailable of body.items ?? []) {
          map[unavailable.productVariantId] = unavailable.reason;
        }
        setUnavailableIds(map);
        setError("Alguns itens do carrinho ficaram indisponíveis. Ajuste e tente novamente.");
      } else {
        setError(err instanceof ApiError ? err.message : "Não foi possível finalizar o pedido.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white">Itens do pedido</h2>
          <ul className="mt-4 divide-y divide-white/5" role="list">
            {items.map((item) => (
              <li key={item.productVariantId} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-white">
                    {item.quantity}x {item.productName}
                  </p>
                  <p className="text-xs text-slate-400">{item.variantLabel}</p>
                  {unavailableIds[item.productVariantId] && (
                    <p role="alert" className="mt-1 flex items-center gap-2 text-xs font-medium text-red-400">
                      {unavailableIds[item.productVariantId]}
                      <button
                        type="button"
                        onClick={() => removeItem(item.productVariantId)}
                        className="underline"
                      >
                        remover
                      </button>
                    </p>
                  )}
                </div>
                <span className="text-slate-300">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white">Entrega</h2>
          <div className="mt-4 flex gap-3">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm has-[:checked]:border-wine-bright has-[:checked]:bg-wine/10">
              <input
                type="radio"
                name="deliveryMethod"
                value={DeliveryMethod.PICKUP}
                checked={deliveryMethod === DeliveryMethod.PICKUP}
                onChange={() => setDeliveryMethod(DeliveryMethod.PICKUP)}
              />
              Retirar pessoalmente
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm has-[:checked]:border-wine-bright has-[:checked]:bg-wine/10">
              <input
                type="radio"
                name="deliveryMethod"
                value={DeliveryMethod.SHIPPING}
                checked={deliveryMethod === DeliveryMethod.SHIPPING}
                onChange={() => setDeliveryMethod(DeliveryMethod.SHIPPING)}
              />
              Envio pelo correio
            </label>
          </div>

          {deliveryMethod === DeliveryMethod.SHIPPING && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="street" className="mb-1.5 block text-sm text-slate-300">
                  Rua
                </label>
                <input
                  id="street"
                  required
                  value={address.street}
                  onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
                />
              </div>
              <div>
                <label htmlFor="number" className="mb-1.5 block text-sm text-slate-300">
                  Número
                </label>
                <input
                  id="number"
                  required
                  value={address.number}
                  onChange={(e) => setAddress((a) => ({ ...a, number: e.target.value }))}
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
                />
              </div>
              <div>
                <label htmlFor="complement" className="mb-1.5 block text-sm text-slate-300">
                  Complemento
                </label>
                <input
                  id="complement"
                  value={address.complement}
                  onChange={(e) => setAddress((a) => ({ ...a, complement: e.target.value }))}
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
                />
              </div>
              <div>
                <label htmlFor="neighborhood" className="mb-1.5 block text-sm text-slate-300">
                  Bairro
                </label>
                <input
                  id="neighborhood"
                  required
                  value={address.neighborhood}
                  onChange={(e) => setAddress((a) => ({ ...a, neighborhood: e.target.value }))}
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
                />
              </div>
              <div>
                <label htmlFor="city" className="mb-1.5 block text-sm text-slate-300">
                  Cidade
                </label>
                <input
                  id="city"
                  required
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
                />
              </div>
              <div>
                <label htmlFor="state" className="mb-1.5 block text-sm text-slate-300">
                  UF
                </label>
                <input
                  id="state"
                  required
                  maxLength={2}
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value.toUpperCase() }))}
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="mb-1.5 block text-sm text-slate-300">
                  CEP
                </label>
                <input
                  id="zipCode"
                  required
                  value={address.zipCode}
                  onChange={(e) => setAddress((a) => ({ ...a, zipCode: e.target.value }))}
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="referencePoint" className="mb-1.5 block text-sm text-slate-300">
                  Ponto de referência
                </label>
                <input
                  id="referencePoint"
                  value={address.referencePoint}
                  onChange={(e) => setAddress((a) => ({ ...a, referencePoint: e.target.value }))}
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
                />
              </div>
            </div>
          )}

          <div className="mt-5">
            <label htmlFor="notes" className="mb-1.5 block text-sm text-slate-300">
              Observações (opcional)
            </label>
            <textarea
              id="notes"
              rows={3}
              maxLength={500}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
            />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white">Resumo</h2>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <span>Total estimado</span>
          <span className="font-semibold text-bone">{formatPrice(totalPrice)}</span>
        </div>

        <div className="mt-4 rounded-lg border border-wine-bright/30 bg-wine/10 p-4 text-xs leading-relaxed text-slate-300">
          <p className="font-semibold text-bone">Sobre o pagamento</p>
          <p className="mt-1">
            O site não processa pagamento. Ao confirmar, seu pedido é registrado e a gente combina forma
            de pagamento e entrega diretamente com você (RN03). O valor final e a disponibilidade de
            cada item são conferidos pelo servidor neste momento.
          </p>
        </div>

        {error && (
          <p role="alert" aria-live="assertive" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando pedido..." : "Confirmar pedido"}
        </Button>
      </aside>
    </form>
  );
}
