// src/pages/Logout.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLogout from "@/hooks/useLogout";
import { useAuth } from "@/context/AuthContext";

const Logout = () => {
  const {logout} = useAuth();
  const logoutUser = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    logoutUser();
    logout(); // call the hook function
    // Optionally navigate to login page after logout
    navigate("/login");
  }, []);

  return null; // no UI needed
};

export default Logout;