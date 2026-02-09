import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Seo from "@/components/Seo";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, Sparkles, Shield, Key, HelpCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/config/api";
import char3 from "@/assets/characters/char3.png";
import char5 from "@/assets/characters/char5.png";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { settingsTutorialSteps } from "@/hooks/usePageTutorialSteps";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.current_password.trim()) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password.trim()) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.new_password)) {
      newErrors.new_password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }

    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (formData.current_password === formData.new_password) {
      newErrors.new_password = "Must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/change-password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.confirm_password
        })
      }) as any;

      if (response.success) {
        toast({
          title: "Password Changed Successfully",
          description: response.message || "Your password has been updated successfully.",
          variant: "default"
        });

        // Reset form
        setFormData({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });

        // Navigate back to profile
        navigate("/profile");
      } else {
        throw new Error(response.message || "Password change failed");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      
      // Handle validation errors from API
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat();
        toast({
          title: "Validation Error",
          description: errorMessages.join(", "),
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to change password. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { text: "At least 8 characters long", met: formData.new_password.length >= 8 },
    { text: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(formData.new_password) },
    { text: "At least one lowercase letter (a-z)", met: /[a-z]/.test(formData.new_password) },
    { text: "At least one number (0-9)", met: /\d/.test(formData.new_password) },
    { text: "At least one special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.new_password) }
  ];

  // Change Password tutorial hook
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "change_password_tutorial_completed",
    steps: settingsTutorialSteps, // Reuse settings tutorial steps
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Seo
        title="Change Password | Pass The Ripple"
        description="Update your account password securely"
      />
      
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="change_password_tutorial_completed"
      />
      
      {/* Floating decorations */}
      <Sparkles className="absolute top-10 left-10 text-primary/20 w-8 h-8 animate-pulse" />
      <Sparkles className="absolute top-32 right-20 text-accent/20 w-6 h-6 animate-pulse delay-700" />
      <Sparkles className="absolute bottom-20 left-20 text-secondary/20 w-4 h-4 animate-pulse delay-1000" />
      
      {/* Back Button - Top Left Corner */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/profile")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      {/* Help Button - Top Right Corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={startTutorial}
          className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
          title="Take a tour of this page"
        >
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Help</span>
        </Button>
      </div>
      
      <main className="min-h-screen flex items-start justify-center p-4 pt-16 pb-8">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="relative">
              <h1 className="text-3xl font-bold text-gradient-primary mb-1">Change Password</h1>
              <p className="text-muted-foreground text-base">
                Keep your account secure with a strong password
              </p>
            </div>
          </div>

          {/* Change Password Form */}
          <Card className="shadow-elevated border-primary/10 bg-card/95 backdrop-blur relative overflow-hidden">
            <img 
              src={char3} 
              alt="Security character" 
              className="absolute -top-8 -right-8 w-32 h-32 opacity-10"
            />
            <CardHeader className="relative z-10 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="w-5 h-5 text-primary" />
                Update Password
              </CardTitle>
              <CardDescription className="text-sm">
                Enter your current password and choose a new secure password
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Current Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.current_password}
                      onChange={(e) => handleInputChange("current_password", e.target.value)}
                      className={`pr-10 transition-all duration-200 ${errors.current_password ? "border-red-500 focus:border-red-500" : "focus:border-primary"}`}
                      placeholder="Enter your current password"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={loading}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.current_password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.current_password}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-sm font-medium flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.new_password}
                      onChange={(e) => handleInputChange("new_password", e.target.value)}
                      className={`pr-10 transition-all duration-200 ${errors.new_password ? "border-red-500 focus:border-red-500" : "focus:border-primary"}`}
                      placeholder="Enter your new password"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.new_password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.new_password}
                    </p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.new_password && (
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
                                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                  level <= strength 
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
                        <span className={`text-xs font-medium ${
                          passwordRequirements.filter(req => req.met).length <= 2 
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
                                : "Strong"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>


                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Confirm New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirm_password}
                      onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                      className={`pr-10 transition-all duration-200 ${errors.confirm_password ? "border-red-500 focus:border-red-500" : "focus:border-primary"}`}
                      placeholder="Confirm your new password"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.confirm_password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-hero hover:opacity-90 text-white font-medium py-2 transition-all duration-200 hover:shadow-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating Password...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Update Password
                    </div>
                  )}
                </Button>
              </form>

              {/* Password Requirements Progress */}
              <div className="mt-4 space-y-1 p-2 rounded-lg bg-gradient-subtle border border-primary/10">
                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-primary" />
                  Password Strength:
                </p>
                <div className="grid grid-cols-1 gap-0.5">
                  {passwordRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs">
                      <CheckCircle 
                        className={`w-2 h-2 transition-colors duration-200 ${requirement.met ? "text-green-500" : "text-gray-300"}`} 
                      />
                      <span className={`transition-colors duration-200 ${requirement.met ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                        {requirement.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
