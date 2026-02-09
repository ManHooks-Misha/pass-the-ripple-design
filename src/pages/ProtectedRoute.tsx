import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth(); 

  if (!user) {
    // Not logged in → kick them out
    return <Navigate to="/login" replace />;
  }

  // Logged in → show the dashboard
  return children;
};

export default ProtectedRoute;
