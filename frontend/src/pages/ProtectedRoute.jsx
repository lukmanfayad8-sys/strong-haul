import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null; // loading
  return user ? children : <Navigate to="/auth" replace />;
}