import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { apiFetch } from "@/config/api";
import { FieldErrorMessage } from "@/components/auth/FieldErrorMessage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expires_in_minutes: number;
    expires_at: string;
  };
}

// ValidationErrors interface is merged into state type

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Real-time validation
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const handleEmailChange = (value: string) => {
    const trimmedValue = value.trim();
    setEmail(trimmedValue);
    if (errors.email) {
      setErrors({}); // Clear all errors on type
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const emailError = validateEmail(email);

    if (emailError) {
      setErrors({ email: [emailError] });
      return;
    }

    setErrors({});
    setGeneralError(null);
    setLoading(true);

    try {
      const response = await apiFetch<ForgotPasswordResponse>("/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.success) {
        // Store email and expiry info for OTP verification
        localStorage.setItem("resetEmail", email.trim());
        if (response.data) {
          localStorage.setItem("otpExpiresAt", response.data.expires_at);
          localStorage.setItem("otpExpiresIn", response.data.expires_in_minutes.toString());
        }

        toast({
          title: "OTP Sent Successfully",
          description: response.message || `We've sent a 4-digit OTP to ${email}. It will expire in 10 minutes.`,
          variant: "default",
        });

        setEmail("");
        navigate("/verify-otp", {
          state: {
            email: email.trim(),
            expiresIn: response.data?.expires_in_minutes || 10
          }
        });
      } else {
        setGeneralError(response.message || "Please check your email and try again.");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      if (error?.status === 422 && error?.errors) {
        setErrors(error.errors);
      } else {
        setGeneralError(error.message || "Unable to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    const error = validateEmail(email);
    if (error) {
      setErrors({ email: [error] });
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center py-12">
      <Seo
        title="Forgot Password — Pass The Ripple"
        description="Reset your Pass The Ripple account password using OTP verification."
        canonical={`${window.location.origin}/forgot-password`}
      />

      <div className="container max-w-md mx-auto px-4">
        <Card className="bg-white shadow-none relative" style={{
          borderRadius: '45px 38px 42px 40px / 42px 40px 38px 45px',
          border: '2px solid #374151',
          borderStyle: 'solid'
        }}>
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔑</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl md:text-3xl font-black text-gray-900 font-fuzzy">Forgot Password?</CardTitle>
              <CardDescription className="text-base text-gray-900">
                Enter your email and we'll send you a 4-digit OTP to reset your password
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {generalError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Enter your registered email"
                  required
                  className={`h-12 bg-white border-gray-300 focus:border-blue-600 ${errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                    }`}
                  disabled={loading}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                <FieldErrorMessage message={errors.email} />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                disabled={loading || !!errors.email}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>

            <div className="text-center space-y-3 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-900">
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-medium hover:underline transition-colors"
                >
                  Back to Login
                </Link>
              </p>

              <p className="text-xs text-gray-900">
                Didn't receive the OTP? Check your spam folder or try again in a few minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ForgotPassword;