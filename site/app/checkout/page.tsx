import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = buildMetadata({
  title: "Finalizar pedido",
  description: "Revise seu pedido e confirme — o pagamento é combinado com a gente depois.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Finalizar pedido</h1>
      <div className="mt-8">
        <CheckoutView />
      </div>
    </div>
  );
}
