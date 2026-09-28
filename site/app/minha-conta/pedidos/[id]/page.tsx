import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { OrderDetail } from "@/components/account/OrderDetail";

export const metadata: Metadata = buildMetadata({
  title: "Detalhe do pedido",
  description: "Acompanhe o status do seu pedido na Glitch.",
  path: "/minha-conta/pedidos",
  noIndex: true,
});

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container-section py-16 sm:py-20">
      <OrderDetail orderId={id} />
    </div>
  );
}
