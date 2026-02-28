// components/PrivateRoute.tsx
import React from "react"; // ✅ this is needed for JSX.Element
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode; // ✅ or JSX.Element
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const token = sessionStorage.getItem("auth_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
