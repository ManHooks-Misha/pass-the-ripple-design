import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "@/lib/auth-token";
import { useAuth } from "@/context/AuthContext";

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string; // default redirect if user is authenticated
}

const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  redirectTo = "/dashboard",
}) => {
  const { user } = useAuth();
  const token = getAuthToken();


  // If user is authenticated, redirect them away from guest-only pages
  if (token && user) {
    try {
      const profile = user;
      
      // Redirect based on role
      if (profile.role === "admin") return <Navigate to="/admin" replace />;
      if (profile.role === "teacher") return <Navigate to="/teacher" replace />;
      if (profile.role === "user" || profile.role === "child") return <Navigate to="/dashboard" replace />;
      return <Navigate to={redirectTo} replace />;
    } catch (error) {
      console.error("Error parsing user profile:", error);
    }
  }

  // Not authenticated, allow access to guest pages
  return <>{children}</>;
};

export default GuestRoute;