import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Eye, EyeOff, Shield, ArrowLeft, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/config/api';
import Seo from '@/components/Seo';

export default function AdminChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
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
        navigate("/admin/profile");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Seo
        title="Change Password | Admin Panel"
        description="Change your administrator password securely"
        canonical={`${window.location.origin}/admin/change-password`}
      />
      
      <main className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/profile')}
            className="absolute top-4 left-4 z-10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
            <p className="text-gray-600">Update your administrator password</p>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security Update
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                    <Shield className="w-4 h-4 text-primary" />
                    Current Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.current_password}
                      onChange={(e) => handleInputChange("current_password", e.target.value)}
                      className={`pr-10 transition-all duration-200 border-gray-300 focus:border-primary focus:ring-primary ${errors.current_password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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
                  <Label htmlFor="new_password" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                    <Key className="w-4 h-4 text-primary" />
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.new_password}
                      onChange={(e) => handleInputChange("new_password", e.target.value)}
                      className={`pr-10 transition-all duration-200 border-gray-300 focus:border-primary focus:ring-primary ${errors.new_password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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
                    <div className="space-y-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          passwordRequirements.filter(req => req.met).length <= 2 
                            ? "text-red-600 bg-red-100" 
                            : passwordRequirements.filter(req => req.met).length <= 3 
                              ? "text-orange-600 bg-orange-100" 
                              : passwordRequirements.filter(req => req.met).length <= 4 
                                ? "text-yellow-600 bg-yellow-100" 
                                : "text-green-600 bg-green-100"
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
                  <Label htmlFor="confirm_password" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Confirm New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirm_password}
                      onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                      className={`pr-10 transition-all duration-200 border-gray-300 focus:border-primary focus:ring-primary ${errors.confirm_password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
              <div className="mt-4 space-y-2 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Password Requirements:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {passwordRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                        requirement.met 
                          ? "bg-green-100 text-green-600" 
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {requirement.met ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                        )}
                      </div>
                      <span className={`transition-colors duration-200 ${
                        requirement.met 
                          ? "text-green-700 font-medium" 
                          : "text-gray-600"
                      }`}>
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
}
