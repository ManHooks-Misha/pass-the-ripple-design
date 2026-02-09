import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { apiFetch } from "@/config/api";
import { FieldErrorMessage } from "@/components/auth/FieldErrorMessage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    verification_token: string;
    expires_in_minutes: number;
    expires_at: string;
  };
}

export default function VerifyResetPasswordOTP() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [expired, setExpired] = useState(false);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Initialize email and timer from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    const storedExpiresAt = localStorage.getItem("otpExpiresAt");

    if (!storedEmail) {
      toast({
        title: "Session Expired",
        description: "Please restart the password reset process.",
        variant: "destructive",
      });
      navigate("/forgot-password");
      return;
    }

    setEmail(storedEmail);

    // Calculate time left from stored expiry
    if (storedExpiresAt) {
      const expiryTime = new Date(storedExpiresAt).getTime();
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setExpired(true);
      }
    }
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (expired || verified) return;

    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setExpired(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, expired, verified]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasted)) return;

    const digits = pasted.split("").slice(0, 4);
    const newOtp = digits.concat(Array(4 - digits.length).fill(""));
    setOtp(newOtp);

    // Focus the last input after paste
    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex < 3) {
      const nextInput = document.getElementById(`otp-${lastFilledIndex + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 4) {
      setErrors({ otp: ["Please enter the full 4-digit code"] });
      return;
    }

    setErrors({});
    setGeneralError(null);

    setLoading(true);

    try {
      const response = await apiFetch<VerifyOtpResponse>("/verify-reset-password-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          otp: enteredOtp
        }),
      });

      if (response.success) {
        setVerified(true);

        // Store verification token for password reset
        if (response.data?.verification_token) {
          localStorage.setItem("resetVerificationToken", response.data.verification_token);
        }

        toast({
          title: "Success!",
          description: response.message || "OTP verified successfully!",
        });

        // Navigate to reset password page
        setTimeout(() => {
          navigate("/reset-password");
        }, 1000);
      } else {
        throw new Error(response.message || "OTP verification failed");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      if (error?.status === 422 && error?.errors) {
        setErrors(error.errors);
      } else {
        setGeneralError(error.message || "OTP verification failed. Please try again.");
      }

      // Clear OTP on failure
      setOtp(["", "", "", ""]);
      const firstInput = document.getElementById("otp-0") as HTMLInputElement;
      firstInput?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);

    try {
      const response = await apiFetch<VerifyOtpResponse>("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        // Reset state
        setOtp(["", "", "", ""]);
        setExpired(false);
        setVerified(false);

        // Update expiry time
        if (response.data) {
          localStorage.setItem("otpExpiresAt", response.data.expires_at);
          const expiryTime = new Date(response.data.expires_at).getTime();
          const now = new Date().getTime();
          const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
          setTimeLeft(remaining);
        }

        toast({
          title: "OTP Resent",
          description: response.message || "A new OTP has been sent to your email.",
        });

        // Focus first input
        const firstInput = document.getElementById("otp-0") as HTMLInputElement;
        firstInput?.focus();
      } else {
        throw new Error(response.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      if (error?.status === 422 && error?.errors) {
        setErrors(error.errors);
      } else {
        setGeneralError(error.message || "Failed to resend OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const maskedEmail = email ? email.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) =>
    p1 + '*'.repeat(p2.length)
  ) : "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 py-10 px-4">
      <Seo
        title="Verify OTP — Pass The Ripple"
        description="Enter the OTP sent to your email to reset your password."
        canonical={`${window.location.origin}/verify-otp`}
      />

      <Card className="w-full max-w-md mx-auto shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">📧</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
            <CardDescription className="text-base">
              Enter the 4-digit code sent to {maskedEmail}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!verified ? (
            <>
              {generalError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}
              {/* OTP Inputs */}
              <div className="space-y-4">
                <Label htmlFor="otp-0" className="text-sm font-medium text-center block">
                  4-Digit Verification Code
                </Label>
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      maxLength={1}
                      className="w-14 h-14 text-center text-xl font-semibold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={loading || expired}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <FieldErrorMessage message={errors.otp} className="text-center justify-center" />
              </div>

              {/* Timer and Status */}
              <div className="text-center space-y-2">
                {!expired ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Time remaining: <span className="font-medium text-foreground">{formatTime(timeLeft)}</span>
                    </p>
                    {/* <p className="text-xs text-muted-foreground">
                      OTP expires in {formatTime(timeLeft)}
                    </p> */}
                  </>
                ) : (
                  <p className="text-sm text-destructive font-medium">
                    OTP has expired. Please request a new one.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleVerify}
                  disabled={otp.join("").length < 4 || loading || expired}
                  className="w-full h-12 text-base font-semibold"
                  variant="hero"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                {expired && (
                  <Button
                    onClick={handleResend}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-12"
                  >
                    {loading ? "Sending..." : "Resend OTP"}
                  </Button>
                )}
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-green-600">✓</span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-600">OTP Verified!</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to password reset...
                </p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="text-center space-y-3 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={loading || !expired}
                className="text-primary font-medium hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </p>

            <p className="text-sm text-muted-foreground">
              <Link
                to="/forgot-password"
                className="text-primary font-medium hover:underline transition-colors"
              >
                Use different email
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}