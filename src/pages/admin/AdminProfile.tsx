import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Calendar,
  Key,
  Save,
  Clock,
  Settings,
  Upload,
  Users,
  FileText,
  Award,
  Target,
  Heart,
  Star,
  Trophy,
  ArrowLeft,
  Edit3,
  User,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { apiFetch, apiFetchFormData, UPLOAD_BASE_URL } from '@/config/api';
import { characterAvatars, getAvatarById, getAvatarImage } from '@/utils/avatars';
import Seo from '@/components/Seo';
import { useAuth } from '@/context/AuthContext';
import { LoggedInUserAvatar } from '@/components/UserIdentity';
import MyProfile from '../MyProfile';
import { useAvatars } from '@/hooks/useAvatars';

interface AdminProfile {
  id: number;
  email: string;
  nickname: string;
  role: string;
  avatar_id: number | null;
  custom_avatar: string | null;
  profile_image_path: string | null;
  ripple_id?: string;
  created_at: string;
  last_active: string | null;
  updated_at?: string;
  total_users_managed: number;
  total_content_reviewed: number;
  total_ripples_created?: number;
  badges_awarded?: number;
  challenges_completed?: number;
  is_profile_public?: boolean;
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Fetch dynamic avatars from API
  const { avatars, loading: avatarsLoading, error: avatarsError } = useAvatars();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const avatarUploadRef = useRef<HTMLInputElement | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    is_profile_public: false
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRequirements = [
    { text: "At least 8 characters long", met: formData.new_password.length >= 8 },
    { text: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(formData.new_password) },
    { text: "At least one lowercase letter (a-z)", met: /[a-z]/.test(formData.new_password) },
    { text: "At least one number (0-9)", met: /\d/.test(formData.new_password) },
    { text: "At least one special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.new_password) }
  ];

  // Set default avatar when avatars are loaded and no avatar is selected
  useEffect(() => {
    if (avatars.length > 0 && selectedAvatarId === null && !customAvatarFile && !profile?.avatar_id && !profile?.profile_image_path) {
      setSelectedAvatarId(avatars[0].id);
    }
  }, [avatars, selectedAvatarId, customAvatarFile, profile?.avatar_id, profile?.profile_image_path]);

  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (1MB limit)
    // if (file.size > 1 * 1024 * 1024) {
    //   toast({
    //     title: "File too large",
    //     description: "Please upload an image smaller than 1MB",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    // Check image dimensions
    const img = new window.Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;

      // if (width < 200 || width > 300 || height < 200 || height > 300) {
      //   toast({
      //     title: "Invalid image dimensions",
      //     description: "Image dimensions should be between 200x200 to 300x300 pixels",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);

      // Store the actual file for upload
      setCustomAvatarFile(file);
      setSelectedAvatarId(null);
    };

    img.onerror = () => {
      toast({
        title: "Invalid image file",
        description: "Please select a valid image file",
        variant: "destructive",
      });
    };

    img.src = URL.createObjectURL(file);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiFetch("/admin/profile") as any;

      if (response.success && response.data) {
        const profileData = response.data;
        // Normalize is_profile_public to boolean (handle string "1"/"0", number 1/0, or boolean)
        const normalizeBoolean = (value: any): boolean => {
          if (value === true || value === 1 || value === "1") return true;
          if (value === false || value === 0 || value === "0") return false;
          return false;
        };

        const isPublic = normalizeBoolean(profileData.is_profile_public);

        const adminProfile: AdminProfile = {
          id: user.id,
          email: profileData.email,
          nickname: profileData.nickname,
          role: 'admin',
          avatar_id: profileData.avatar_id,
          custom_avatar: profileData.custom_avatar_url || null,
          profile_image_path: profileData.profile_image_path || null,
          ripple_id: profileData.ripple_id,
          is_profile_public: isPublic,
          created_at: profileData.created_at,
          last_active: profileData.last_active,
          updated_at: profileData.updated_at,
          total_users_managed: 234,
          total_content_reviewed: 567,
          total_ripples_created: 89,
          badges_awarded: 45,
          challenges_completed: 123
        };

        setProfile(adminProfile);
        setFormData({
          ...formData,
          nickname: adminProfile.nickname,
          email: adminProfile.email,
          is_profile_public: isPublic
        });

        // Initialize avatar state
        if (adminProfile.avatar_id) {
          setSelectedAvatarId(adminProfile.avatar_id);
          setCustomAvatarPreview(null);
          setCustomAvatarFile(null);
        } else if (adminProfile.custom_avatar || adminProfile.profile_image_path) {
          setCustomAvatarPreview(adminProfile.custom_avatar || `${UPLOAD_BASE_URL}/${adminProfile.profile_image_path}`);
          setCustomAvatarFile(null);
          setSelectedAvatarId(null);
        } else {
          // Default to first avatar if no avatar is set
          if (avatars.length > 0) {
            setSelectedAvatarId(avatars[0].id);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get current avatar image URL with proper priority
  const currentAvatarImage = useMemo(() => {
    // Priority 1: New custom avatar preview (not yet saved)
    if (customAvatarPreview) return customAvatarPreview;

    // Priority 2: Selected default avatar (not yet saved)
    if (selectedAvatarId) {
      const avatar = avatars.find(a => a.id === selectedAvatarId);
      if (avatar) return avatar.image;
    }

    // Priority 3: Existing default avatar from profile
    if (profile?.avatar_id) {
      const avatar = avatars.find(a => a.id === profile.avatar_id);
      if (avatar) return avatar.image;
    }

    // Priority 4: Existing custom avatar from profile
    if (profile?.custom_avatar) return profile.custom_avatar;
    if (profile?.profile_image_path) return `${UPLOAD_BASE_URL}/${profile.profile_image_path}`;

    // Priority 5: Default to first avatar if available
    return avatars.length > 0 ? avatars[0].image : null;
  }, [customAvatarPreview, profile, selectedAvatarId, avatars]);

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      // Create FormData instance
      const formDataToSend = new FormData();
      formDataToSend.append('nickname', formData.nickname.trim());
      formDataToSend.append('is_profile_public', formData.is_profile_public ? "1" : "0");

      // Handle avatar selection - priority: custom avatar file > avatar_id
      if (customAvatarFile) {
        // User uploaded a custom avatar file
        formDataToSend.append('custom_avatar', customAvatarFile);
        formDataToSend.append('avatar_id', ''); // Clear avatar_id when using custom avatar
      } else if (selectedAvatarId !== null) {
        // User selected a default avatar
        formDataToSend.append('avatar_id', selectedAvatarId.toString());
        // Add flag to remove custom avatar if switching from custom to default
        if (profile?.profile_image_path || profile?.custom_avatar) {
          formDataToSend.append('remove_custom_avatar', 'true');
        }
      } else {
        // No avatar selection - clear both
        formDataToSend.append('avatar_id', '');
        if (profile?.profile_image_path || profile?.custom_avatar) {
          formDataToSend.append('remove_custom_avatar', 'true');
        }
      }

      const response = await apiFetchFormData('/user/update-profile', {
        method: 'POST',
        body: formDataToSend,
      }) as any;

      if (response?.success && response.data) {
        toast({
          title: 'Success',
          description: response.message || 'Profile updated successfully',
        });

        // Normalize is_profile_public to boolean
        const normalizeBoolean = (value: any): boolean => {
          if (value === true || value === 1 || value === "1") return true;
          if (value === false || value === 0 || value === "0") return false;
          return false;
        };

        // Use the value from response if available, otherwise keep the current value we sent
        const isPublic = (response.data.is_profile_public !== undefined && response.data.is_profile_public !== null)
          ? normalizeBoolean(response.data.is_profile_public)
          : formData.is_profile_public;

        // Determine if we're using a default avatar or custom avatar
        const isDefaultAvatar = response.data.avatar_id && !response.data.custom_avatar_url && !response.data.profile_image_path;

        // Update local profile state
        setProfile((prev) =>
          prev
            ? {
              ...prev,
              nickname: response.data.nickname,
              avatar_id: response.data.avatar_id || null,
              // Clear custom_avatar and profile_image_path when using default avatar
              custom_avatar: isDefaultAvatar ? null : (response.data.custom_avatar_url || null),
              profile_image_path: isDefaultAvatar ? null : (response.data.profile_image_path || null),
              updated_at: response.data.updated_at,
              is_profile_public: isPublic,
            }
            : prev
        );

        // Update formData state
        setFormData((prev) => ({
          ...prev,
          nickname: response.data.nickname,
          is_profile_public: isPublic
        }));

        // Update AuthContext
        updateUser({
          nickname: response.data.nickname,
          avatar_id: response.data.avatar_id || null,
          // Clear custom_avatar and profile_image_path when using default avatar
          custom_avatar: isDefaultAvatar ? null : (response.data.custom_avatar_url || null),
          profile_image_path: isDefaultAvatar ? null : (response.data.profile_image_path || null),
          ripple_id: response.data.ripple_id || profile?.ripple_id,
          email: response.data.email || profile?.email,
          is_profile_public: isPublic,
        });

        // Sync UI state
        setSelectedAvatarId(response.data.avatar_id);

        // Update custom avatar preview with the new URL from server
        if (isDefaultAvatar) {
          // Clear custom avatar preview when switching to default avatar
          setCustomAvatarPreview(null);
          setCustomAvatarFile(null);
        } else if (customAvatarFile && response.data.custom_avatar_url) {
          setCustomAvatarPreview(response.data.custom_avatar_url);
          setCustomAvatarFile(null);
        } else if (response.data.custom_avatar_url) {
          // Update preview even if no new file was uploaded (in case URL changed)
          setCustomAvatarPreview(response.data.custom_avatar_url);
        } else if (response.data.profile_image_path) {
          // Update preview with profile_image_path if custom_avatar_url is not available
          setCustomAvatarPreview(`${UPLOAD_BASE_URL}/${response.data.profile_image_path}`);
        } else {
          // Clear preview if avatar was removed
          setCustomAvatarPreview(null);
        }

        // Update selected avatar ID when switching to default avatar
        if (isDefaultAvatar && response.data.avatar_id) {
          setSelectedAvatarId(response.data.avatar_id);
        }

        setEditing(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);

      if (err.response?.data?.errors || err?.errors) {
        setFormErrors(err.response?.data?.errors || err?.errors);
        const errorMessages = Object.values(err.response?.data?.errors || err?.errors).flat();
        toast({
          title: 'Validation Error',
          description: errorMessages.join(', '),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

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

        setChangingPassword(false);
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));
      } else {
        throw new Error(response.message || "Password change failed");
      }
    } catch (err: any) {
      console.error("Error changing password:", err);

      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat();
        toast({
          title: "Validation Error",
          description: errorMessages.join(", "),
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: err.message || "Failed to change password. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (editing) {
      if (!formData.nickname.trim()) {
        newErrors.nickname = "Nickname is required";
      }
    }

    if (changingPassword) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAvatarSelect = useCallback((avatarId: number) => {
    setSelectedAvatarId(avatarId);
    setCustomAvatarFile(null);
    setCustomAvatarPreview(null);
    // Clear file input
    if (avatarUploadRef.current) {
      avatarUploadRef.current.value = '';
    }
  }, []);

  const handleCustomAvatarClick = useCallback(() => {
    avatarUploadRef.current?.click();
  }, []);

  const handleRemoveCustomAvatar = useCallback(() => {
    setCustomAvatarFile(null);
    setCustomAvatarPreview(null);
    if (avatars.length > 0) {
      setSelectedAvatarId(avatars[0].id);
    }
    // Clear the file input
    if (avatarUploadRef.current) {
      avatarUploadRef.current.value = '';
    }
  }, [avatars]);

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading && !profile) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">Admin Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  return (
    <>
      <Seo
        title="Admin Profile — Pass The Ripple"
        description="Manage your administrator profile and account settings"
        canonical={`${window.location.origin}/admin/profile`}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'ProfilePage', name: 'Admin Profile' }}
      />

      <div className="container py-4 sm:py-6 md:py-8 px-4 sm:px-6 relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/dashboard')}
          className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 text-xs sm:text-sm"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Profile Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 mt-8 sm:mt-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">Admin Profile</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your administrator account</p>
        </div>

        {/* Profile Header Card */}
        <Card className="mx-auto shadow-xl border-0 bg-white">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <LoggedInUserAvatar size="w-16 h-16 sm:w-20 sm:h-20" />
                {selectedAvatarId !== null && (
                  <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 text-green-500 bg-white rounded-full" />
                )}
                {(customAvatarPreview || profile?.custom_avatar || profile?.profile_image_path) && (
                  <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 text-green-500 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">{profile.nickname}</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-2 break-words">{profile.email}</p>
                {profile.ripple_id && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 font-mono break-all">{profile.ripple_id}</p>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="default" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    {profile.role.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Member since </span>
                    {new Date(profile.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {!editing && !changingPassword && (
                  <Button onClick={() => setEditing(true)} className="w-full sm:w-auto text-xs sm:text-sm">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Edit Profile</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Profile Information Card */}
        {editing && !changingPassword && (
          <Card className="mx-auto shadow-xl border-0 bg-white mt-4 sm:mt-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Edit Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <User className="w-4 h-4 text-primary" />
                    Nickname <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange("nickname", e.target.value)}
                    className={`border-gray-300 focus:border-primary focus:ring-primary transition-all duration-200 ${errors.nickname ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="Enter your nickname"
                  />
                  {errors.nickname && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.nickname}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed"
                    placeholder="Email address"
                  />
                </div>

                {/* Profile Privacy Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50 md:col-span-2">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="profile-public" className="text-sm font-medium cursor-pointer">
                      Public Profile
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow others to view your profile
                    </p>
                  </div>
                  <button
                    type="button"
                    id="profile-public"
                    onClick={() => {
                      handleInputChange("is_profile_public", !formData.is_profile_public);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${formData.is_profile_public
                      ? 'bg-primary'
                      : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    role="switch"
                    aria-checked={formData.is_profile_public}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${formData.is_profile_public ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                    />
                  </button>
                </div>

                {/* Avatar Selection */}
                <div className="space-y-3 sm:space-y-4 md:col-span-2">
                  <Label className="text-sm sm:text-base font-semibold">
                    Choose Your Avatar
                  </Label>

                  <Tabs defaultValue="default" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 gap-1 sm:gap-2">
                      <TabsTrigger value="default" className="text-xs sm:text-sm">Default Avatars</TabsTrigger>
                      <TabsTrigger value="custom" className="text-xs sm:text-sm">Custom Avatar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="default" className="mt-4">
                      {avatarsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                          <span className="ml-2 text-gray-600">Loading avatars...</span>
                        </div>
                      ) : avatarsError ? (
                        <div className="text-center py-8 text-red-500">
                          <p>Failed to load avatars. Please refresh the page.</p>
                        </div>
                      ) : avatars.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No avatars available at the moment.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 max-h-60 sm:max-h-80 overflow-y-auto p-2">
                          {avatars.map((avatar) => (
                            <button
                              key={avatar.id}
                              type="button"
                              onClick={() => handleAvatarSelect(avatar.id)}
                              className={`relative rounded-lg sm:rounded-xl border-2 p-2 sm:p-3 transition-all hover:scale-105 group ${selectedAvatarId === avatar.id && !customAvatarPreview
                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20"
                                : "border-gray-200 hover:border-blue-300 bg-white"
                                }`}
                            >
                              <img
                                src={avatar.image}
                                alt={avatar.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mx-auto group-hover:scale-110 transition-transform"
                              />
                              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-xs">{avatar.emoji}</span>
                              <p className="text-xs mt-1 sm:mt-2 font-medium text-center text-gray-700 truncate">
                                {avatar.name}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="custom" className="mt-3 sm:mt-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          ref={avatarUploadRef}
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />

                        {customAvatarPreview ? (
                          <div className="space-y-3 sm:space-y-4">
                            <div className="relative inline-block">
                              <img
                                src={customAvatarPreview}
                                alt="Custom Avatar"
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full border-4 border-blue-500 shadow-lg mx-auto"
                              />
                              <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">
                                Selected
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCustomAvatarClick}
                                className="text-xs sm:text-sm"
                              >
                                Change Image
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleRemoveCustomAvatar}
                                className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleCustomAvatarClick}
                            className="w-full space-y-2 sm:space-y-3"
                          >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                              <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm sm:text-base text-gray-900">Upload Custom Avatar</p>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">JPG, PNG, GIF • Max 1MB</p>
                              <p className="text-xs text-gray-500 mt-1">200x200 to 300x300 pixels</p>
                            </div>
                          </button>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Avatar Upload Requirements Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0">
                        <svg fill="currentColor" viewBox="0 0 20 20" className="w-3 h-3 sm:w-4 sm:h-4">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-xs sm:text-sm text-blue-800">
                        <p className="font-medium mb-1">Custom Avatar Requirements:</p>
                        <ul className="text-xs space-y-0.5 sm:space-y-1 text-blue-700">
                          <li>• File size: Maximum 1 MB</li>
                          <li>• Image dimensions: 200x200 to 300x300 pixels</li>
                          <li>• Supported formats: JPG, PNG, GIF</li>
                          <li>• Square images work best for avatars</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm"
                    disabled={!formData.nickname.trim() || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1 sm:mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 sm:h-4 sm:h-4 mr-1 sm:mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings Card */}
        {!editing && !changingPassword && (
          <Card className="mx-auto shadow-xl border-0 bg-white mt-4 sm:mt-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Key className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Password</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setChangingPassword(true)}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white border-0 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Change Password</span>
                    <span className="sm:hidden">Change</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Change Password Form Card */}
        {changingPassword && !editing && (
          <Card className="mx-auto shadow-xl border-0 bg-white mt-4 sm:mt-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-3 sm:space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="text-sm font-medium flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
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
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
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
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium py-2 transition-all duration-200 hover:shadow-lg text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    Update Password
                  </div>
                </Button>
              </form>

              {/* Password Requirements Progress */}
              <div className="mt-3 sm:mt-4 space-y-1 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-primary/10">
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

              {/* Cancel Button */}
              <div className="flex justify-center mt-3 sm:mt-4">
                <Button
                  variant="outline"
                  onClick={() => setChangingPassword(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto text-xs sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <MyProfile userId={user.id} />
      </div>
    </>
  );
}