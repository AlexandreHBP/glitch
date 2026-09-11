import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { OrderDetail } from "@/components/account/OrderDetail";

export const metadata: Metadata = buildMetadata({
  title: "Pedido confirmado",
  description: "Seu pedido foi registrado na Glitch.",
  path: "/pedido-confirmado",
  noIndex: true,
});

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container-section py-16 sm:py-20">
      <OrderDetail orderId={id} showSuccessBanner />
    </div>
  );
}
