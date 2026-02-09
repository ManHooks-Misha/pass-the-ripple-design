import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import { apiFetch } from "@/config/api";
import { FieldErrorMessage } from "@/components/auth/FieldErrorMessage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ParentEmailResponse {
  success: boolean;
  message: string;
  data?: {
    parent_email: string;
    age_group: string;
    ripple_id?: string;
    next_step: string;
    requires_parent_consent: boolean;
  };
}

const ParentConsent = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Email validation
  const validateEmail = (email: string): string => {
    if (!email) {
      return "Email is required";
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    return ""; // No error
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.parent_email) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.parent_email;
        return newErrors;
      });
    }
  };

  const handleEmailBlur = () => {
    const error = validateEmail(email);
    if (error) {
      setErrors(prev => ({ ...prev, parent_email: [error] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setGeneralError(null);

    const emailValidationError = validateEmail(email);
    const currentErrors: { [key: string]: string | string[] } = {};

    if (emailValidationError) {
      currentErrors.parent_email = [emailValidationError];
    }

    if (!consent) {
      currentErrors.consent = ["Please agree to the privacy policy and terms"];
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    const rippleId = localStorage.getItem("rippleId");
    const ageGroup = localStorage.getItem("ageGroup") || "below_13";

    try {
      setLoading(true);

      const response = await apiFetch<ParentEmailResponse>("/send-parent-email", {
        method: "POST",
        body: JSON.stringify({
          parent_email: email,
          ripple_id: rippleId,
          age_group: ageGroup,
        }),
      });

      if (response.success) {
        // Store parent email and related data for OTP verification
        localStorage.setItem("parentEmail", email);
        localStorage.setItem("ageGroup", ageGroup);
        if (rippleId) {
          localStorage.setItem("rippleId", rippleId);
        }

        // Store consent request data
        const consentRequest = {
          parentEmail: email,
          status: "pending",
          requestedAt: new Date().toISOString(),
          ageGroup: ageGroup,
          rippleId: rippleId,
        };

        localStorage.setItem("parentConsentRequest", JSON.stringify(consentRequest));

        toast({
          title: "OTP Sent Successfully!",
          description: response.message || `We've sent a 4-digit OTP to ${email}. It will expire in 10 minutes.`,
        });

        setEmail("");
        setConsent(false);
        setErrors({});

        // Navigate to OTP verification
        navigate("/verify-consent");
      } else {
        throw new Error(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Parent consent request error:", error);
      if (error?.status === 422 && error?.errors) {
        setErrors(error.errors);
      } else {
        setGeneralError(error.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 py-10 px-4">
      <Seo
        title="Parent Consent — Pass The Ripple"
        description="Provide parent or guardian consent for children under 13."
        canonical={`${window.location.origin}/consent`}
      />

      <Card className="w-full max-w-md mx-auto shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Parent Consent Required</CardTitle>
            <CardDescription className="text-base">
              A parent or guardian must approve registration for children under 13
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {generalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Parent/Guardian Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value.trim())}
                  onBlur={handleEmailBlur}
                  placeholder="parent@example.com"
                  className={errors.parent_email ? "border-destructive focus-visible:ring-destructive" : ""}
                  disabled={loading}
                />
                <FieldErrorMessage message={errors.parent_email} />
                <p className="text-xs text-muted-foreground">
                  We'll send a 4-digit OTP to this email for verification. The OTP will expire in 10 minutes.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  disabled={loading}
                  className="mt-0.5"
                />
                <div className="space-y-1.5">
                  <Label
                    htmlFor="consent"
                    className="text-sm font-normal cursor-pointer leading-tight"
                  >
                    I am the parent or legal guardian and I agree to the{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/terms-of-service"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </Link>
                    {" "}for my child's account.
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We take children's privacy seriously. Your child's information will be protected according to our privacy policy.
                  </p>
                </div>
              </div>
              <FieldErrorMessage message={errors.consent} />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                disabled={loading || Object.keys(errors).length > 0 || !consent}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  "Send Verification OTP"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full"
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </form>

          <div className="text-center space-y-2 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link
                to="/contact-us"
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              By proceeding, you confirm you are the parent or legal guardian.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ParentConsent;