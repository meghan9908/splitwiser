import { useProtectedRoute } from "../context/ProtectedRoute";

export default function AuthLayout() {
  useProtectedRoute();
  
  return null;
}
