"use client";

/**
 * Carrinho de compras — vive inteiramente no localStorage (sem tabela de
 * carrinho no backend, ver arquitetura "Sem tabela de carrinho"). Guarda
 * só o necessário para montar o pedido (productVariantId + quantity) mais
 * dados de exibição (nome, label, preço, imagem) copiados no momento em
 * que o item foi adicionado — o backend revalida preço e estoque de
 * verdade no POST /orders, o carrinho local nunca é fonte da verdade.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "glitch.cart";

export type CartItem = {
  productVariantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  maxQuantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (productVariantId: string, quantity: number) => void;
  removeItem: (productVariantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // carrinho corrompido — começa vazio
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productVariantId === item.productVariantId);
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, existing.maxQuantity || 20);
        return prev.map((i) =>
          i.productVariantId === item.productVariantId ? { ...i, quantity: nextQuantity } : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxQuantity || 20) }];
    });
  }, []);

  const updateQuantity = useCallback((productVariantId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productVariantId === productVariantId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity || 20)) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((productVariantId: string) => {
    setItems((prev) => prev.filter((i) => i.productVariantId !== productVariantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, isHydrated, totalItems, totalPrice, addItem, updateQuantity, removeItem, clear }),
    [items, isHydrated, totalItems, totalPrice, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
