import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import Header from "@/components/layouts/includes/MagicalHeader";
import FooterSection from "@/components/layouts/includes/FooterSection";
import { apiFetch } from "@/config/api";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { FieldErrorMessage } from "@/components/auth/FieldErrorMessage";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCPassword, setShowCPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Check if verification token exists on mount
  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    const verificationToken = localStorage.getItem("resetVerificationToken");

    if (!email || !verificationToken) {
      toast({
        title: "Session Expired",
        description: "Please restart the password reset process.",
        variant: "destructive",
      });
      navigate("/forgot-password");
    }
  }, [navigate]);


  // Password requirements
  const passwordRequirements = [
    { text: "At least 8 characters long", met: password.length >= 8 },
    { text: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { text: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { text: "At least one number (0-9)", met: /\d/.test(password) },
    { text: "At least one special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
  ];

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setGeneralError(null);

    const currentErrors: { [key: string]: string | string[] } = {};

    if (!password) {
      currentErrors.password = ["Password is required"];
    } else if (password.length < 8) {
      currentErrors.password = ["Password must be at least 8 characters"];
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      currentErrors.password = ["Password must contain uppercase, lowercase, number, and special character"];
    }

    if (!confirmPassword) {
      currentErrors.password_confirmation = ["Please confirm your password"];
    } else if (password !== confirmPassword) {
      currentErrors.password_confirmation = ["Passwords do not match"];
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    try {
      setLoading(true);

      const email = localStorage.getItem("resetEmail");
      const verificationToken = localStorage.getItem("resetVerificationToken");

      if (!email) {
        throw new Error("Email not found. Please restart the password reset flow.");
      }

      if (!verificationToken) {
        throw new Error("Verification token not found. Please restart the password reset flow.");
      }

      const response = await apiFetch<any>("/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          password_confirmation: confirmPassword,
          verification_token: verificationToken,
        }),
      });

      if (!response.success) {
        // extract message or first validation error
        let description = response.message || "Password reset failed";
        if (response.errors) {
          const firstKey = Object.keys(response.errors)[0];
          if (firstKey && response.errors[firstKey]?.length) {
            description = response.errors[firstKey][0];
          }
        }
        throw new Error(description);
      }

      toast({
        title: "Success",
        description: "Your password has been reset successfully. Please log in.",
      });

      // Clean up localStorage
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetVerificationToken");
      localStorage.removeItem("otpExpiresAt");
      navigate("/login");
    } catch (error: any) {
      console.error("Reset password error:", error);
      if (error?.status === 422 && error?.errors) {
        setErrors(error.errors);
      } else {
        setGeneralError(error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="Reset Password — Pass The Ripple"
        description="Set a new password for your Pass The Ripple account."
        canonical={`${window.location.origin}/reset-password`}
      />
      <main className="container py-10">
        <Card className="max-w-md mx-auto shadow-elevated">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <CardTitle className="text-3xl">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              {generalError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  <FieldErrorMessage message={errors.password} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showCPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className={errors.password_confirmation ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  <FieldErrorMessage message={errors.password_confirmation} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCPassword(!showCPassword)}
                  >
                    {showCPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Strength:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => {
                        const metRequirements = passwordRequirements.filter(req => req.met).length;
                        const strength = Math.min(5, Math.max(1, Math.floor((metRequirements / 5) * 5)));
                        return (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full transition-colors duration-200 ${level <= strength
                              ? strength <= 2
                                ? "bg-red-500"
                                : strength <= 3
                                  ? "bg-orange-500"
                                  : strength <= 4
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              : "bg-gray-200"
                              }`}
                          />
                        );
                      })}
                    </div>
                    <span className={`text-xs font-medium ${passwordRequirements.filter(req => req.met).length <= 2
                      ? "text-red-500"
                      : passwordRequirements.filter(req => req.met).length <= 3
                        ? "text-orange-500"
                        : passwordRequirements.filter(req => req.met).length <= 4
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}>
                      {passwordRequirements.filter(req => req.met).length <= 2
                        ? "Weak"
                        : passwordRequirements.filter(req => req.met).length <= 3
                          ? "Fair"
                          : passwordRequirements.filter(req => req.met).length <= 4
                            ? "Good"
                            : "Strong"
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-800">Password Requirements</h4>
                </div>
                <div className="space-y-2">
                  {passwordRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${requirement.met
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                        }`}>
                        {requirement.met && (
                          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={requirement.met ? "text-green-700 font-medium" : "text-gray-600"}>
                        {requirement.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResetPassword;