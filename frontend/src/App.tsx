/**
 * Ponto de entrada das rotas do painel administrativo Glitch.
 *
 * Estrutura de rotas (documentada aqui por não haver routes.config
 * separado neste projeto pequeno):
 *   /login               - público, tela de login do admin
 *   /produtos            - lista de produtos (protegida)
 *   /produtos/novo       - criar produto (protegida)
 *   /produtos/:id/editar - editar produto (protegida)
 *   /pedidos             - lista de pedidos (protegida)
 *   /pedidos/:id         - detalhe do pedido (protegida)
 *   /playlist            - gestão da playlist (protegida)
 *   /                    - redireciona para /produtos
 *   *                    - 404
 *
 * Todas as rotas protegidas exigem sessão de admin (AdminRoute) e usam o
 * AppLayout (sidebar + header). Não existe área de cliente neste app.
 */
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router";
import { useEffect } from "react";
import AppLayout from "./layout/AppLayout";
import { AdminRoute } from "./components/guards/AdminRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { useAuth } from "./context/AuthContext";
import { UNAUTHORIZED_EVENT } from "./services/api";
import LoginPage from "./pages/auth/LoginPage";
import ProductsPage from "./pages/admin/ProductsPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import OrdersPage from "./pages/admin/OrdersPage";
import OrderDetailPage from "./pages/admin/OrderDetailPage";
import PlaylistPage from "./pages/admin/PlaylistPage";
import NotFound from "./pages/OtherPage/NotFound";

// Escuta o 401 global disparado pelo interceptor do axios (services/api.ts)
// e navega via React Router em vez do antigo `window.location.href`, que
// forçava reload completo da SPA e perdia o histórico de navegação.
function UnauthorizedHandler() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate("/login", { replace: true });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [navigate, logout]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <UnauthorizedHandler />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AdminRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/produtos" replace />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/produtos/novo" element={<ProductFormPage />} />
            <Route path="/produtos/:id/editar" element={<ProductFormPage />} />
            <Route path="/pedidos" element={<OrdersPage />} />
            <Route path="/pedidos/:id" element={<OrderDetailPage />} />
            <Route path="/playlist" element={<PlaylistPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
