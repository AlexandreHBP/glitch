import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { OrderList } from "@/components/account/OrderList";

export const metadata: Metadata = buildMetadata({
  title: "Minha conta",
  description: "Veja o histórico dos seus pedidos na Glitch.",
  path: "/minha-conta",
  noIndex: true,
});

export default function MyAccountPage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Minha conta</h1>
      <p className="mt-2 text-sm text-slate-400">Histórico de pedidos e status de entrega.</p>
      <div className="mt-8">
        <OrderList />
      </div>
    </div>
  );
}
