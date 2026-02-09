import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import Seo from "@/components/Seo";
import { apiFetch } from "@/config/api";
import { FieldErrorMessage } from "@/components/auth/FieldErrorMessage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface VerifyParentOtpResponse {
  success: boolean;
  message: string;
  data?: {
    parent_email: string;
    parent_email_verified: boolean;
    next_step: string;
    registration_status: string;
  };
}

interface ParentConsentRequest {
  parentEmail: string;
  status: string;
  requestedAt: string;
  ageGroup: string;
  rippleId?: string;
}

interface UserAgeData {
  parent_data?: ParentConsentRequest;
  age_group?: string;
  ripple_id?: string;
}

export default function VerifyConsent() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [expired, setExpired] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [rippleId, setRippleId] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Initialize from localStorage with proper userAgeData handling
  useEffect(() => {
    const userAgeDataStr = localStorage.getItem("userAgeData");
    let userAgeData: UserAgeData | null = null;

    if (userAgeDataStr) {
      try {
        userAgeData = JSON.parse(userAgeDataStr);
      } catch (error) {
        console.error("Error parsing userAgeData:", error);
      }
    }

    const storedParentEmail = localStorage.getItem("parentEmail");
    const storedAgeGroup = localStorage.getItem("ageGroup");
    const storedRippleId = localStorage.getItem("rippleId");

    let finalParentEmail = "";
    let finalAgeGroup = "";
    let finalRippleId = "";

    if (userAgeData?.parent_data?.parentEmail) {
      finalParentEmail = userAgeData.parent_data.parentEmail;
      finalAgeGroup = userAgeData.parent_data.ageGroup || userAgeData.age_group || "below_13";
      finalRippleId = userAgeData.parent_data.rippleId || userAgeData.ripple_id || "";
    } else if (storedParentEmail) {
      finalParentEmail = storedParentEmail;
      finalAgeGroup = storedAgeGroup || "below_13";
      finalRippleId = storedRippleId || "";
    }

    if (!finalParentEmail) {
      toast({
        title: "Session Expired",
        description: "Please restart the parent consent process.",
        variant: "destructive",
      });
      navigate("/consent");
      return;
    }

    setParentEmail(finalParentEmail);
    setAgeGroup(finalAgeGroup);
    setRippleId(finalRippleId);

    const fallbackExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const remaining = Math.max(0, Math.floor((fallbackExpiry.getTime() - Date.now()) / 1000));
    setTimeLeft(remaining);
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

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }

    if (errors.otp_code) {
      setErrors({});
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

    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex < 3) {
      const nextInput = document.getElementById(`otp-${lastFilledIndex + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 4) {
      setErrors({ otp_code: ["Please enter the full 4-digit code"] });
      return;
    }

    setErrors({});
    setGeneralError(null);

    if (!parentEmail) {
      setGeneralError("Session Expired. Please restart the parent consent process.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch<VerifyParentOtpResponse>("/verify-parent-otp", {
        method: "POST",
        body: JSON.stringify({
          parent_email: parentEmail,
          otp_code: enteredOtp,
        }),
      });

      if (response.success) {
        setVerified(true);

        const userAgeDataStr = localStorage.getItem("userAgeData");
        let userAgeData: UserAgeData = {};

        if (userAgeDataStr) {
          try {
            userAgeData = JSON.parse(userAgeDataStr);
          } catch (error) {
            console.error("Error parsing userAgeData:", error);
          }
        }

        if (userAgeData.parent_data) {
          userAgeData.parent_data.status = "verified";
        } else {
          userAgeData.parent_data = {
            parentEmail: parentEmail,
            status: "verified",
            requestedAt: new Date().toISOString(),
            ageGroup: ageGroup,
            rippleId: rippleId,
          };
        }

        localStorage.setItem("userAgeData", JSON.stringify(userAgeData));
        localStorage.setItem("parentConsentVerified", "true");
        localStorage.setItem("parentEmailVerified", "true");

        toast({
          title: "Success!",
          description: response.message || "Parent consent approved successfully!",
        });

        setTimeout(() => {
          navigate("/register", {
            state: {
              parentConsentVerified: true,
              parentEmail: parentEmail,
              ageGroup: ageGroup
            }
          });
        }, 1500);
      } else {
        throw new Error(response.message || "OTP verification failed");
      }
    } catch (error: any) {
      console.error("Parent OTP verification error:", error);
      if (error?.status === 422 && error?.errors) {
        setErrors(error.errors);
      } else {
        setGeneralError(error.message || "OTP verification failed. Please try again.");
      }

      setOtp(["", "", "", ""]);
      const firstInput = document.getElementById("otp-0") as HTMLInputElement;
      firstInput?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!parentEmail) {
      setGeneralError("Session Expired. Please restart the parent consent process.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch<any>("/send-parent-email", {
        method: "POST",
        body: JSON.stringify({
          parent_email: parentEmail,
          ripple_id: rippleId,
          age_group: ageGroup,
        }),
      });

      if (response.success) {
        setOtp(["", "", "", ""]);
        setExpired(false);
        setTimeLeft(600);

        const userAgeDataStr = localStorage.getItem("userAgeData");
        let userAgeData: UserAgeData = {};

        if (userAgeDataStr) {
          try {
            userAgeData = JSON.parse(userAgeDataStr);
          } catch (error) {
            console.error("Error parsing userAgeData:", error);
          }
        }

        if (userAgeData.parent_data) {
          userAgeData.parent_data.status = "pending";
          userAgeData.parent_data.requestedAt = new Date().toISOString();
        }

        localStorage.setItem("userAgeData", JSON.stringify(userAgeData));

        toast({
          title: "OTP Resent",
          description: response.message || "A new OTP has been sent to your email.",
        });

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

  const maskedEmail = parentEmail ? parentEmail.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) =>
    p1 + '*'.repeat(p2.length)
  ) : "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 py-10 px-4">
      <Seo
        title="Verify Parent Consent — Pass The Ripple"
        description="Enter the OTP sent to parent's email to approve consent."
        canonical={`${window.location.origin}/verify-consent`}
      />

      <Card className="w-full max-w-md mx-auto shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Parent Consent Approval</CardTitle>
            <CardDescription className="text-base">
              Enter the 4-digit OTP sent to {maskedEmail}
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
                <FieldErrorMessage message={errors.otp_code} className="text-center justify-center" />
                <p className="text-sm text-muted-foreground text-center">
                  This OTP will be used to approve your child's consent request
                </p>
              </div>

              {/* Timer and Status */}
              <div className="text-center space-y-2">
                {!expired ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Time remaining: <span className="font-medium text-foreground">{formatTime(timeLeft)}</span>
                    </p>
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
                    "Approve Consent"
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
                <p className="text-lg font-semibold text-green-600">Consent Approved!</p>
                <p className="text-sm text-muted-foreground">
                  Parent consent has been verified successfully.
                </p>
              </div>
              <Button
                onClick={() => navigate("/register")}
                className="w-full h-12"
                variant="hero"
              >
                Continue to Registration
              </Button>
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
                to="/parent-consent"
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