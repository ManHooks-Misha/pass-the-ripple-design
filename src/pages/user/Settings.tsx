import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import { apiFetch, apiFetchFormData, UPLOAD_BASE_URL } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { Upload, Loader2, Image as ImageIcon, CheckCircle, HelpCircle } from "lucide-react";
import { getAvatarImage } from "@/utils/avatars";
import { useAvatars } from "@/hooks/useAvatars";
import { useAuth } from "@/context/AuthContext";
import { formatDateForInput } from "@/utils/dateFormat";
import EnhancedDatePicker from "@/components/EnhancedDatePicker";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { settingsTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";

interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  full_name: string;
  date_of_birth: string;
  avatar_id: number | null;
  custom_avatar: string | null;
  profile_image_path: string | null;
  ripple_id: string;
  is_profile_public?: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  // Hooks must be called before any early returns
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "settings_tutorial_completed",
    steps: settingsTutorialSteps,
  });

  // Fetch dynamic avatars from API
  const { avatars, loading: avatarsLoading, error: avatarsError } = useAvatars();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const avatarUploadRef = useRef<HTMLInputElement | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Set default avatar when avatars are loaded and no avatar is selected
  useEffect(() => {
    if (avatars.length > 0 && selectedAvatarId === null && !customAvatarFile && !userProfile?.avatar_id && !userProfile?.profile_image_path) {
      setSelectedAvatarId(avatars[0].id);
    }
  }, [avatars, selectedAvatarId, customAvatarFile, userProfile?.avatar_id, userProfile?.profile_image_path]);

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

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCustomAvatarPreview(base64String);
    };
    reader.readAsDataURL(file);

    // Store the actual file for upload
    setCustomAvatarFile(file);
    setSelectedAvatarId(null); // Clear selected character avatar
  }, []);

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await apiFetch<any>("/user/profile", { method: "GET" });
      const profileData = response.data;

      if (profileData) {
        // Normalize is_profile_public to boolean (handle string "1"/"0", number 1/0, or boolean)
        const normalizeBoolean = (value: any): boolean => {
          if (value === true || value === 1 || value === "1") return true;
          if (value === false || value === 0 || value === "0") return false;
          return false;
        };

        const customAvatar = profileData.custom_avatar_url || profileData.custom_avatar || null;

        const formattedProfileData = {
          ...profileData,
          date_of_birth: formatDateForInput(profileData.date_of_birth),
          is_profile_public: normalizeBoolean(profileData.is_profile_public),
          // Map custom_avatar_url to custom_avatar for consistency
          custom_avatar: customAvatar
        };
        setUserProfile(formattedProfileData);

        // Update AuthContext with custom_avatar so it's available throughout the app
        updateUser({
          custom_avatar: customAvatar,
          profile_image_path: profileData.profile_image_path || null,
          avatar_id: profileData.avatar_id || null
        });

        // Set selected avatar based on profile data
        // Priority: avatar_id > custom avatar
        if (profileData.avatar_id) {
          setSelectedAvatarId(profileData.avatar_id);
          setCustomAvatarPreview(null);
          setCustomAvatarFile(null);
        } else if (profileData.custom_avatar_url || profileData.profile_image_path) {
          setCustomAvatarPreview(profileData.custom_avatar_url || `${UPLOAD_BASE_URL}/${profileData.profile_image_path}`);
          setCustomAvatarFile(null);
          setSelectedAvatarId(null);
        } else {
          // Default to first avatar if no avatar is set
          if (avatars.length > 0) {
            setSelectedAvatarId(avatars[0].id);
          }
        }
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [avatars, updateUser]);

  const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    setFormErrors({});

    try {
      // Create FormData instance
      const formData = new FormData();

      // Append basic profile data
      formData.append("nickname", userProfile.nickname.trim());
      formData.append("date_of_birth", userProfile.date_of_birth);
      formData.append("is_profile_public", userProfile.is_profile_public ? "1" : "0");

      // Handle avatar selection - priority: custom avatar file > avatar_id
      if (customAvatarFile) {
        // User uploaded a custom avatar file
        formData.append("custom_avatar", customAvatarFile);
        formData.append("avatar_id", ""); // Clear avatar_id when using custom avatar
      } else if (selectedAvatarId !== null) {
        // User selected a default avatar
        formData.append("avatar_id", selectedAvatarId.toString());
        // Add flag to remove custom avatar if switching from custom to default
        if (userProfile.profile_image_path || userProfile.custom_avatar) {
          formData.append("remove_custom_avatar", "true");
        }
      } else {
        // No avatar selection - clear both
        formData.append("avatar_id", "");
        if (userProfile.profile_image_path || userProfile.custom_avatar) {
          formData.append("remove_custom_avatar", "true");
        }
      }

      const response: any = await apiFetchFormData("/user/update-profile", {
        method: "POST",
        body: formData,
      });

      if (response?.success && response?.data) {
        // Normalize is_profile_public to boolean
        const normalizeBoolean = (value: any): boolean => {
          if (value === true || value === 1 || value === "1") return true;
          if (value === false || value === 0 || value === "0") return false;
          return false;
        };

        // Use the value from response if available, otherwise keep the current value we sent
        const isPublic = (response.data.is_profile_public !== undefined && response.data.is_profile_public !== null)
          ? normalizeBoolean(response.data.is_profile_public)
          : userProfile.is_profile_public;

        // Determine if we're using a default avatar or custom avatar
        const isDefaultAvatar = response.data.avatar_id && !response.data.custom_avatar_url && !response.data.profile_image_path;

        // Update AuthContext to reflect changes in header immediately
        updateUser({
          nickname: response.data.nickname,
          full_name: response.data.full_name,
          avatar_id: response.data.avatar_id || null,
          // Clear custom_avatar and profile_image_path when using default avatar
          custom_avatar: isDefaultAvatar ? null : (response.data.custom_avatar_url || null),
          profile_image_path: isDefaultAvatar ? null : (response.data.profile_image_path || null),
          is_profile_public: isPublic,
        });

        // Update local state
        setUserProfile(prev => prev ? {
          ...prev,
          nickname: response.data.nickname,
          full_name: response.data.full_name,
          avatar_id: response.data.avatar_id || null,
          // Clear custom_avatar and profile_image_path when using default avatar
          custom_avatar: isDefaultAvatar ? null : (response.data.custom_avatar_url || null),
          profile_image_path: isDefaultAvatar ? null : (response.data.profile_image_path || null),
          is_profile_public: isPublic
        } : null);

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

        toast({
          title: "Profile updated!",
          description: "Your changes have been saved.",
        });

        // Note: We don't reload here because we've already updated the state from the response
        // If you need to reload, uncomment the line below, but ensure the API returns the updated value
        // await loadUserProfile();
      } else {
        throw new Error(response?.message || "Failed to update profile");
      }
    } catch (err: any) {
      let errorMessage = "Failed to update profile";

      if (err.response?.data?.errors || err?.errors) {
        setFormErrors(err.response?.data?.errors || err?.errors);
        errorMessage = Object.values(err.response?.data?.errors || err?.errors)
          .flat()
          .join(" • ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile, selectedAvatarId, customAvatarFile, loadUserProfile, updateUser]);

  const handleLogout = useCallback(() => {
    logout();
    localStorage.clear();
    toast({
      title: "Logged out",
      description: "You've been signed out successfully.",
    });
    navigate("/");
  }, [navigate, logout]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleNicknameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfile(prev => prev ? { ...prev, nickname: e.target.value } : null);
    if (formErrors.nickname) {
      setFormErrors(prev => ({ ...prev, nickname: [] }));
    }
  }, [formErrors.nickname]);

  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfile(prev => prev ? { ...prev, full_name: e.target.value } : null);
  }, []);

  const handleDateOfBirthChange = useCallback((date: Date | null) => {
    if (date) {
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      setUserProfile(prev => prev ? { ...prev, date_of_birth: formattedDate } : null);
    }
  }, []);

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
    loadUserProfile();
  }, [loadUserProfile]);

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
    if (userProfile?.avatar_id) {
      const avatar = avatars.find(a => a.id === userProfile.avatar_id);
      if (avatar) return avatar.image;
    }

    // Priority 4: Existing custom avatar from profile
    if (userProfile?.custom_avatar) return userProfile.custom_avatar;
    if (userProfile?.profile_image_path) return `${UPLOAD_BASE_URL}/${userProfile.profile_image_path}`;

    // Priority 5: Default to first avatar if available
    return avatars.length > 0 ? avatars[0].image : null;
  }, [customAvatarPreview, userProfile, selectedAvatarId, avatars]);

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Seo
        title="Settings — Pass The Ripple"
        description="Manage your profile, privacy settings, and view your earned badges."
        canonical={`${window.location.origin}/settings`}
      />

      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="settings_tutorial_completed"
      />

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Settings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your profile, privacy settings, and view your earned badges
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>

        {/* Profile Settings */}
        <Card className="shadow-elevated">
          <CardHeader className="p-4 sm:p-5 md:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">👤 Profile Settings</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Update your nickname and avatar</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Current Avatar Display */}
              <div className="text-center mb-4 sm:mb-6" data-tutorial-target="avatar-section">
                <div className="relative inline-block">
                  <img
                    src={currentAvatarImage}
                    alt="Avatar"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-primary/20 object-cover mx-auto"
                  />
                  {selectedAvatarId !== null && (
                    <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 text-green-500 bg-white rounded-full" />
                  )}
                  {(customAvatarPreview || userProfile?.custom_avatar || userProfile?.profile_image_path) && (
                    <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 text-green-500 bg-white rounded-full" />
                  )}
                </div>
                <Badge variant="outline" className="mt-2 text-xs">{userProfile?.ripple_id || ""}</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2" data-tutorial-target="nickname-section">
                    <Label htmlFor="nickname" className="text-sm sm:text-base">Nickname</Label>
                    <Input
                      id="nickname"
                      value={userProfile?.nickname || ""}
                      onChange={handleNicknameChange}
                      maxLength={20}
                      className="text-sm sm:text-base"
                    />
                    {formErrors.nickname && (
                      <p className="text-xs sm:text-sm text-red-500">{formErrors.nickname.join(", ")}</p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2 hidden">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={userProfile?.full_name || ""}
                      onChange={handleFullNameChange}
                    />
                    {formErrors.full_name && (
                      <p className="text-sm text-red-500">{formErrors.full_name.join(", ")}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <EnhancedDatePicker
                      id="dob"
                      label="Date of Birth"
                      value={userProfile?.date_of_birth ? new Date(userProfile.date_of_birth) : null}
                      onChange={handleDateOfBirthChange}
                      maxDate={new Date()}
                      minDate={new Date(1900, 0, 1)}
                      showQuickSelect={false}
                      error={formErrors.date_of_birth ? formErrors.date_of_birth.join(", ") : undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent-email">Email</Label>
                    <Input
                      id="parent-email"
                      type="email"
                      value={userProfile?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  {/* Profile Privacy Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="profile-public" className="text-sm sm:text-base font-medium cursor-pointer">
                        Public Profile
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Allow others to view your profile
                      </p>
                    </div>
                    <button
                      type="button"
                      id="profile-public"
                      onClick={() => {
                        setUserProfile(prev => prev ? { ...prev, is_profile_public: !prev.is_profile_public } : null);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${userProfile?.is_profile_public
                        ? 'bg-primary'
                        : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      role="switch"
                      aria-checked={userProfile?.is_profile_public ?? false}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${userProfile?.is_profile_public ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Right Column - Avatar Selection */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold">
                    Choose Your Avatar
                  </Label>

                  <Tabs defaultValue="default" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 gap-1 sm:gap-2">
                      <TabsTrigger value="default" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4">Default Avatars</TabsTrigger>
                      <TabsTrigger value="custom" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4">Custom Avatar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="default" className="mt-3 sm:mt-4">
                      {avatarsLoading ? (
                        <div className="flex items-center justify-center py-6 sm:py-8">
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-500" />
                          <span className="ml-2 text-xs sm:text-sm text-gray-600">Loading avatars...</span>
                        </div>
                      ) : avatarsError ? (
                        <div className="text-center py-6 sm:py-8 text-red-500">
                          <p className="text-xs sm:text-sm">Failed to load avatars. Please refresh the page.</p>
                        </div>
                      ) : avatars.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                          <p className="text-xs sm:text-sm">No avatars available at the moment.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-2 sm:gap-3 max-h-64 sm:max-h-72 md:max-h-80 overflow-y-auto p-2">
                          {avatars.map((avatar) => (
                            <button
                              key={avatar.id}
                              type="button"
                              onClick={() => handleAvatarSelect(avatar.id)}
                              className={`relative rounded-xl border-2 p-2 sm:p-3 transition-all hover:scale-105 group ${selectedAvatarId === avatar.id && !customAvatarPreview
                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20"
                                : "border-gray-200 hover:border-blue-300 bg-white"
                                }`}
                            >
                              <img
                                src={avatar.image}
                                alt={avatar.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain mx-auto group-hover:scale-110 transition-transform"
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
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 flex-shrink-0" />
                          <span><strong>Image requirements:</strong> 200x200 to 2000x2000 pixels. Square images work best!</span>
                        </p>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
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
                                className="text-xs sm:text-sm px-3 sm:px-4"
                              >
                                Change Image
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleRemoveCustomAvatar}
                                className="text-xs sm:text-sm px-3 sm:px-4 text-red-600 hover:text-red-700"
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
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-xs sm:text-sm text-blue-800">
                        <p className="font-medium mb-1">Custom Avatar Requirements:</p>
                        <ul className="text-xs space-y-1 text-blue-700">
                          <li>• File size: Maximum 1 MB</li>
                          <li>• Image dimensions: 200x200 to 300x300 pixels</li>
                          <li>• Supported formats: JPG, PNG, GIF</li>
                          <li>• Square images work best for avatars</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full text-sm sm:text-base" disabled={loading} data-tutorial-target="save-button">
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Parent Access Note */}
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="text-lg sm:text-xl">👨‍👩‍👧‍👦</div>
              <div>
                <h4 className="font-medium text-sm sm:text-base text-yellow-800 dark:text-yellow-200 mb-1">
                  Parent/Guardian Access
                </h4>
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                  Parents and guardians have full access to manage settings and
                  view activity for users under 13. Contact us if you need help
                  accessing your child's account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-sm sm:text-base text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 px-4 sm:px-6"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;