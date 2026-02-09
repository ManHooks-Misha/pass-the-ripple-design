import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/config/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { setAuthToken } from "@/lib/auth-token";

const useLogout = () => {
  const navigate = useNavigate();
  const { user, token, logout: authLogout } = useAuth();

  const logout = async () => {
    try {
      // Call backend logout API to revoke token
      if (token && user?.email) {
        try {
          await apiFetch("/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: user.email }),
          });
        } catch (apiError) {
          // Even if API call fails, still logout locally
          console.error("Backend logout failed:", apiError);
        }
      }

      // Clear auth context (removes ripple_auth_data from localStorage)
      setAuthToken(null);
      authLogout();

      // Clear ALL user-specific data
      const keysToRemove = [
        "role",
        "email",
        "ripple_auth_data",
        "userProfileVersion",
        "rippleId",
        "userAgeData",
        "resetEmail",
        "sessionExpired",
        "intendedPath",
        "teacher_students",
        "teacher_classrooms",
        "parent_consent_requests",
        "registrationPayload",
        "tokenType",
        "dailyTasksLastShown"
      ];

      // Remove specific keys
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear session storage
      sessionStorage.clear();

      toast({
        title: "Logged out successfully",
        description: "See you next time!"
      });

      // Force a small delay to ensure state is cleared, then reload
      setTimeout(() => {
        navigate("/login", { replace: true });
        // Force a page reload to clear all cached component state
        window.location.reload();
      }, 100);
    } catch (error: any) {
      // Even if something fails, still try to logout locally
      authLogout();

      // Clear critical keys at minimum
      localStorage.removeItem("ripple_auth_data");
      localStorage.removeItem("role");
       localStorage.removeItem("dailyTasksLastShown");
      sessionStorage.clear();

      toast({
        title: "Error",
        description: error.message || "Logout failed, but you've been logged out locally",
        variant: "destructive",
      });

      navigate("/login", { replace: true });
    }
  };

  return logout;
};

export default useLogout;
