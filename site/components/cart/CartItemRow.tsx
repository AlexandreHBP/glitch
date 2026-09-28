"use client";

/**
 * Linha de item do carrinho — permite ajustar quantidade ou remover.
 * Preço exibido aqui é só para exibição; o backend recalcula tudo no
 * checkout (nunca é enviado ao servidor).
 */
import Image from "next/image";
import type { CartItem } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";

type CartItemRowProps = {
  item: CartItem;
  onUpdateQuantity: (productVariantId: string, quantity: number) => void;
  onRemove: (productVariantId: string) => void;
  unavailableReason?: string;
};

export function CartItemRow({ item, onUpdateQuantity, onRemove, unavailableReason }: CartItemRowProps) {
  return (
    <li className="flex gap-4 border-b border-white/5 py-5 last:border-none">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-900">
        {item.imageUrl ? (
          <Image src={resolveMediaUrl(item.imageUrl)} alt={item.productName} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-600">Sem foto</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-white">{item.productName}</p>
        <p className="text-xs text-slate-400">{item.variantLabel}</p>
        {unavailableReason && (
          <p role="alert" className="text-xs font-medium text-red-400">
            {unavailableReason}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3">
          <label className="sr-only" htmlFor={`qty-${item.productVariantId}`}>
            Quantidade de {item.productName}
          </label>
          <select
            id={`qty-${item.productVariantId}`}
            value={item.quantity}
            onChange={(event) => onUpdateQuantity(item.productVariantId, Number(event.target.value))}
            className="h-9 rounded-md border border-white/10 bg-white/5 px-2 text-sm text-white"
          >
            {Array.from({ length: Math.max(item.maxQuantity, item.quantity, 1) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRemove(item.productVariantId)}
            className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-red-400 hover:underline"
          >
            Remover
          </button>
        </div>
      </div>

      <p className="whitespace-nowrap text-sm font-semibold text-bone">
        {formatPrice(item.unitPrice * item.quantity)}
      </p>
    </li>
  );
}
