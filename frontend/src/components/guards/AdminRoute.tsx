/**
 * Protege as rotas do painel: exige uma sessão válida com role "admin".
 * Sem sessão -> redireciona para /login. Sessão de outro papel (não
 * deveria existir hoje, mas por segurança) -> também bloqueia.
 */
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";

export function AdminRoute() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
