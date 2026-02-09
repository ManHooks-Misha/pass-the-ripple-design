import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { apiFetch } from "@/config/api";
import signInBg from "@/assets/Sign In/Sign In Background-new.jpg";
import signInBg2 from "@/assets/Sign In/sign-in-nackground.png";
import signInTitle from "@/assets/Sign In/sign in.webp";
import { useAuth } from "@/context/AuthContext";
import "@/styles/pages/_login.scss";

import btnOrangeBg from "@/assets/Challenges/btn-orange-bg.png";
import btnBlueBg from "@/assets/Challenges/btn-blue-bg.png";
import { FieldErrorMessage } from "@/components/auth/FieldErrorMessage";
import { AlertCircle } from "lucide-react";

const LoginRedesigned = () => {
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "teacher") {
        navigate("/teacher", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  // Show session expired message
  useEffect(() => {
    const expired = localStorage.getItem("sessionExpired");
    if (expired === "1") {
      toast({
        title: "Session expired",
        description: "Please log in again.",
      });
      localStorage.removeItem("sessionExpired");

    }
  }, []);

  // Prevent render until auth is hydrated
  if (authLoading) {
    return <p className="text-center py-10">Checking authentication...</p>;
  }

  // If user is logged in, they'll be redirected above
  if (user) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setSubmitting(true);

    try {
      const response = await apiFetch<any>("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data =
        typeof response.json === "function" ? await response.json() : response;

      if (data.success) {
        const userData = data.data?.user;
        const token = data.data?.access_token;
        const expiresIn = data.data?.expires_in;
        localStorage.removeItem("dailyTasksLastShown");

        if (!userData || !token) {
          throw new Error("Invalid response from server");
        }

        // console.log('🔐 New login detected:', userData.email);

        // 🔥 CRITICAL: Login with new user data
        login(userData, token, expiresIn);

        toast({
          title: "Welcome back!",
          description: `Logged in as ${userData.nickname || email}`,
        });

        // Small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect based on role with replace to prevent back navigation
        if (userData.role === "teacher") {
          navigate("/teacher", { replace: true });
        } else if (userData.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }

        // 🔥 Optional: Force a hard refresh if issues persist
        // window.location.href = userData.role === "teacher" ? "/teacher" : 
        //                        userData.role === "admin" ? "/admin" : "/dashboard";
      } else {
        setGeneralError(data.message || "Invalid email or password");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (error?.status === 422 && error?.errors) {
        setErrors(error.errors);
      } else {
        setGeneralError(error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="login-main"
      style={{
        backgroundImage: `url(${signInBg2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Seo
        title="Login — Pass The Ripple"
        description="Login to your Pass The Ripple account and continue your kindness journey."
        canonical={`${window.location.origin}/login`}
      />

      <div className="login-container">
        <div className="login-content">
          {/* Sign In Title Image */}
          <div className="login-title-image">
            <img
              src={signInTitle}
              alt="Sign In"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            {generalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{generalError}</p>
              </div>
            )}
            {/* Email Field */}
            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="login-input"
              />
              <FieldErrorMessage message={errors.email} />
            </div>

            {/* Password Field */}
            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password"
                required
                className="login-input"
              />
              <FieldErrorMessage message={errors.password} />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password
              </Link>
            </div>

            {/* Sign In Button */}
            <div className="text-right login-button-wrapper">
              <button
                type="submit"
                className="login-button btn-bg-img"
                style={{ backgroundImage: `url(${btnBlueBg})` }}
                disabled={submitting}

              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* I don't have an account Link */}
          <div className="text-right signup-link-wrapper">
            <Link to="/age-gate" className="signup-link btn-bg-img mr_20"
              style={{ backgroundImage: `url(${btnOrangeBg})` }}>
              I don't have an account
            </Link>
          </div>
        </div>
      </div >
    </main >
  );
};

export default LoginRedesigned;