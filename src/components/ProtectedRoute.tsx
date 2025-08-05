// /* eslint-disable @typescript-eslint/no-unused-vars */
// // ProtectedRoute.tsx
// import { useEffect, useState } from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { getAuthToken } from '../lib';

// export default function ProtectedRoute() {
//   const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

//   useEffect(() => {
//     const token = getAuthToken();

//     const isTokenExpired = (token: string | null) => {
//       if (!token) return true;
//       try {
//         const decoded = JSON.parse(atob(token.split('.')[1]));
//         const expirationTime = decoded.exp * 1000;
//         return Date.now() > expirationTime;
//       } catch (error) {
//         return true;
//       }
//     };

//     setIsTokenValid(!isTokenExpired(token));
//   }, []);

//   if (isTokenValid === null) return null; // or a loader

//   if (!isTokenValid) return <Navigate to={"/"} replace />;

//   return <Outlet />;
// }

// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import { getAuthToken } from "../lib";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = getAuthToken();

    const isTokenExpired = (token: string | null) => {
      if (!token) return true;
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decoded.exp * 1000;
        return Date.now() > expirationTime;
      } catch (error) {
        console.error(error);
        return true;
      }
    };

    setIsTokenValid(!isTokenExpired(token));
  }, []);

  if (isTokenValid === null) return null;

  if (!isTokenValid) {
    return <Navigate to={`/mobile-login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children ? children : <Outlet />}</>;
}
