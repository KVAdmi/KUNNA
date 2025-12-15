import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return null; // pantalla de carga después

  // si no hay sesión, redirigir a landing
  if (!session) return <Navigate to="/landing" replace />;

  // si hay sesión, entrar
  return children;
}
