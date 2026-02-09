// src/components/ProtectedRoute.tsx
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/routes/types";
import useLogout from "@/hooks/useLogout";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const logout = useLogout();

  // Check consent status and redirect to login if rejected
  useEffect(() => {
    if (!loading && user) {
      const consentStatus = (user as any)?.consent_status || (user as any)?.parent_consent_status;
      if (consentStatus === "rejected" || consentStatus === "denied") {
        // Clear auth and logout (useLogout handles navigation)
        logout();
      }
    }
  }, [user, loading, logout]);

  // Redirect to login with return URL
  useEffect(() => {
    if (!loading && !user) {
      // Save intended destination
      localStorage.setItem("intendedPath", location.pathname + location.search);
    }
  }, [user, loading, location]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check consent status before allowing access
  const consentStatus = (user as any)?.consent_status || (user as any)?.parent_consent_status;
  if (consentStatus === "rejected" || consentStatus === "denied") {
    logout();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;