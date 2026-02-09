// ===================================
// Updated RippleActionForm.tsx
// ===================================

import { useState, useRef, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiFetch, apiFetchFormData } from "@/config/api";
import { Camera, Sparkles, Star, X, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { getAuthToken } from "@/lib/auth-token";
import { getIconByName } from "@/config/icons";
import { getImageUrl } from "@/utils/imageUrl";

// Import utilities
import { RichTextEditor } from "../ui/RichTextEditor";
import { analyzeContentSafety } from "@/utils/contentSafetyAnalysis";
import { Challenge } from "@/types/Challenge";
import { ChallengeCardPreview } from "@/components/ChallengeCardPreview";

interface KindnessCategory {
  id: string;
  name: string;
  description: string;
  code: string;
  icon: string | null;
  color_code: string | null;
  is_active: boolean;
}

interface RippleActionFormProps {
  mode?: "user" | "admin";
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  initialData?: {
    id?: number;
    title?: string;
    description?: string;
    category_id?: string;
    anonymous?: boolean;
    image?: string;
  };
  showCategorySelector?: boolean;
  hideAnonymous?: boolean;
  submitButtonText?: string;
  successMessage?: string;
  challenge?: Challenge | null;
}

export const RippleActionForm: React.FC<RippleActionFormProps> = ({
  mode = "user",
  onSuccess,
  onCancel,
  initialData,
  showCategorySelector = true,
  hideAnonymous = false,
  submitButtonText = "Start Your Ripple Adventure",
  successMessage = "Ripple created successfully!",
  challenge,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef<boolean>(false);

  // === State ===
  const [categories, setCategories] = useState<KindnessCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialData?.category_id || null
  );
  const [selectedCategoryData, setSelectedCategoryData] =
    useState<KindnessCategory | null>(null);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    initialData?.anonymous === true ? true : false
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // 🔥 NEW: Safety Analysis State
  const [safetyAnalysis, setSafetyAnalysis] = useState<{
    overallScore: number;
    isSafe: boolean;
    issues: Array<{
      type: string;
      severity: "high" | "medium" | "low";
      message: string;
      suggestion?: string;
    }>;
  } | null>(null);

  // === Fetch categories ===
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiFetch<{ data: KindnessCategory[] }>("/categories");
        setCategories(res.data);

        if (initialData?.category_id) {
          const cat = res.data.find((c) => c.id === initialData.category_id);
          if (cat) {
            setSelectedCategoryId(cat.id);
            setSelectedCategoryData(cat);
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, [initialData?.category_id]);

  // === Handle Challenge Pre-selection ===
  useEffect(() => {
    if (challenge && challenge.ripple_category_id && categories.length > 0) {
      // Find category by ID
      const cat = categories.find(c => c.id == challenge.ripple_category_id?.toString());
      if (cat) {
        setSelectedCategoryId(cat.id);
        setSelectedCategoryData(cat);
      }
    }
  }, [challenge, categories]);

  // === Validation Functions ===
  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    // Category validation
    if (!selectedCategoryId) {
      errors.category = ["Please select a category for your ripple"];
    }

    // Title validation
    if (!title.trim()) {
      errors.title = ["Please give your ripple a title"];
    } else if (title.trim().length < 5) {
      errors.title = ["Title should be at least 5 characters long"];
    } else if (title.trim().length > 100) {
      errors.title = ["Title should be less than 100 characters"];
    }

    // Description validation
    if (!description.trim()) {
      errors.description = ["Please share your story - what did you do?"];
    } else if (description.trim().length < 20) {
      errors.description = ["Please share more details about your act of kindness (at least 20 characters)"];
    } else if (description.trim().length > 5000) {
      errors.description = ["Your story is too long (maximum 5000 characters)"];
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // === Handlers ===
  const handleCategorySelect = (categoryId: string) => {
    // If challenged, user usually cannot change category, but we'll leave it open if they want to switch (though it might not count for challenge?)
    // Actually, usually challenges are specific. If we want to enforce it, we should disable logic.
    // Assuming for now user can change it, but we encourage the challenge one.
    // But if "only type challage show", they can't see others to select.
    setSelectedCategoryId(categoryId);
    const cat = categories.find((c) => c.id === categoryId) || null;
    setSelectedCategoryData(cat);

    // Clear category error when user selects one
    if (formErrors.category) {
      setFormErrors(prev => ({ ...prev, category: [] }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast({
        title: "Invalid file type",
        description: "Only images allowed",
        variant: "destructive",
      });
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast({
        title: "File too large",
        description: "Max size 2 MB",
        variant: "destructive",
      });
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Reset safety analysis when image changes
    setSafetyAnalysis(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Prevent double submission using ref (synchronous check)
    if (isSubmittingRef.current || loading) {
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Set submitting flag immediately (synchronous)
    isSubmittingRef.current = true;

    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please log in to create a ripple",
        variant: "destructive",
      });
      isSubmittingRef.current = false;
      return;
    }

    setLoading(true);

    try {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (!cat) throw new Error("Invalid category selected");

      const endpoint = initialData?.id
        ? `/admin/ripple-actions/${initialData.id}`
        : `/ripple-actions`;

      const method = "POST";

      let response: any;

      // Always use FormData to match backend expectations
      const formData = new FormData();
      formData.append("category_id", cat.id);
      formData.append("action_type", "Shared");
      formData.append("title", title);
      formData.append("description", description);

      // Always include anonymous field - ensure it's always explicitly set
      // Laravel FormData boolean format: send as "1" for true, "0" for false
      // The backend should accept this format and convert it to boolean
      // Ensure isAnonymous is always a boolean, never undefined/null
      const anonymousValue = (isAnonymous === true) ? "1" : "0";
      formData.append("anonymous", anonymousValue);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Add challenge_id if present
      if (challenge) {
        formData.append("challenge_id", challenge.id.toString());
      }

      response = await apiFetchFormData<any>(endpoint, {
        method,
        body: formData,
      });

      setLoading(false);
      isSubmittingRef.current = false;
      setHasAttemptedSubmit(false);

      toast({
        title: "Success",
        description: successMessage,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset form
      if (!initialData?.id) {
        setTitle("");
        setDescription("");
        setIsAnonymous(false);
        setImageFile(null);
        setImagePreview(null);
        setSelectedCategoryId(null);
        setSelectedCategoryData(null);
        setSafetyAnalysis(null); // Reset safety check
        setFormErrors({});
      }
    } catch (err: any) {
      setLoading(false);
      isSubmittingRef.current = false;

      let errorMessage = "Failed to save ripple action";

      // Log the full error for debugging
      console.error("Ripple action submission error:", err);

      if (err.response?.data?.errors || err?.errors) {
        const serverErrors = err.response?.data?.errors || err?.errors;
        setFormErrors(serverErrors);
        errorMessage = Object.values(serverErrors)
          .flat()
          .join(" • ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response?.data?.message;
        // Don't clear form errors if we have server validation errors
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Show more detailed error if available
      if (err.response?.data) {
        console.error("API Error Response:", err.response.data);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Helper to check if a field has errors
  const hasError = (fieldName: string): boolean => {
    return hasAttemptedSubmit && !!formErrors[fieldName]?.length;
  };

  // Get error message for a field
  const getErrorMessage = (fieldName: string): string => {
    return hasError(fieldName) ? formErrors[fieldName][0] : "";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card
        className="shadow-elevated border-primary/10 bg-card/95 backdrop-blur"
        data-ripple-form
      >
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">
            {challenge ? `Challenge: ${challenge.name}` : (initialData?.id ? "Edit Your Ripple" : "Create Your Ripple Story")}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {challenge ? "Complete this challenge by sharing your story!" : (initialData?.id
              ? "Update your act of kindness"
              : "Share your amazing act of kindness with the world")}
          </CardDescription>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-0">
            <span className="text-red-500">*</span> indicates mandatory fields
          </p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-2 sm:pt-4">

          {/* Challenge Card Preview */}
          {challenge && (
            <div className="flex justify-center mb-6">
              <div className="transform scale-90 sm:scale-100">
                <ChallengeCardPreview challenge={challenge} />
              </div>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* 1. Title - Full Width */}
            <div
              className="space-y-2"
              data-tutorial-target="story-title"
              data-error={hasError('title')}
            >
              <Label htmlFor="title" className="text-sm sm:text-base font-semibold">
                Give it a title <span className="text-red-500">*</span>
              </Label>
              <Input
                ref={titleInputRef}
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formErrors.title) {
                    setFormErrors(prev => ({ ...prev, title: [] }));
                  }
                  // Reset safety check when content changes
                  setSafetyAnalysis(null);
                }}
                placeholder="e.g., Helped my friend with homework"
                className={`text-sm sm:text-base ${hasError('title') ? 'border-red-500 bg-red-50 focus:ring-red-500' : ''
                  }`}
              />
              {hasError('title') && (
                <p className="text-xs sm:text-sm text-red-500 font-medium">
                  {getErrorMessage('title')}
                </p>
              )}
              {!hasError('title') && title.length > 0 && (
                <p className="text-xs text-green-600">
                  ✓ Good title length ({title.length}/100 characters)
                </p>
              )}
            </div>

            {/* 2. Description - Full Width */}
            <div
              className="space-y-2"
              data-tutorial-target="story-description"
              data-error={hasError('description')}
            >
              <Label
                htmlFor="description"
                className="text-sm sm:text-base font-semibold"
              >
                What did you do? How did it make you and others feel? <span className="text-red-500">*</span>
              </Label>
              <div className={hasError('description') ? 'ring-2 ring-red-500 rounded-lg' : ''}>
                <RichTextEditor
                  value={description}
                  onChange={(value) => {
                    setDescription(value);
                    if (formErrors.description) {
                      setFormErrors(prev => ({ ...prev, description: [] }));
                    }
                    setSafetyAnalysis(null);
                  }}
                  placeholder="Share your story in detail... You can format your text, add bullet points, and more!"
                  minHeight="150px"
                />
              </div>
              {hasError('description') && (
                <p className="text-xs sm:text-sm text-red-500 font-medium">
                  {getErrorMessage('description')}
                </p>
              )}
              {!hasError('description') && description.length > 0 && (
                <p className="text-xs text-green-600">
                  ✓ Story length: {description.length}/5000 characters
                  {description.length < 100 && " - Add more details to inspire others!"}
                </p>
              )}
            </div>

            {/* 3. Image Upload */}
            <div className="space-y-2" data-tutorial-target="story-image">
              <Label className="text-sm sm:text-base font-semibold">
                Add Photo (Optional)
              </Label>
              <p className="text-sm sm:text-base text-foreground">
                Proof helps inspire others—add a photo or note!
              </p>
              <p className="text-xs text-muted-foreground">
                Allowed file types: JPG, PNG, GIF — Max size: 2 MB
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Camera className="w-4 h-4" /> Choose Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setSafetyAnalysis(null); // Reset safety check
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Ripple Type Selection */}
            {showCategorySelector && (
              <div
                className="space-y-2"
                data-error={hasError("category") || hasError("category_id")}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <Label
                      htmlFor="category"
                      className="text-sm sm:text-base font-semibold"
                    >
                      Select Ripple Type <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Tap a symbol card to choose the type of kindness you’re sharing.
                    </p>
                  </div>
                  {selectedCategoryData && (
                    <p className="text-xs sm:text-sm text-primary font-medium">
                      Selected: {selectedCategoryData.name}
                    </p>
                  )}
                </div>

                {/* If Challenge Mode: Show ONLY the selected category (or challenge type) */}
                {challenge && selectedCategoryId ? (
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {categories.filter(c => c.id === selectedCategoryId).map(cat => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-4 p-4 border rounded-xl bg-primary/5 border-primary/20"
                      >
                        <div className="w-12 h-12 rounded-full bg-white p-2 border shadow-sm">
                          <img
                            src={getImageUrl(cat.icon || null)}
                            alt={cat.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-primary">{cat.name}</h4>
                          <p className="text-sm text-muted-foreground">This challenge uses the {cat.name} category.</p>
                        </div>
                        <div className="ml-auto">
                          <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                            <span className="text-xs font-bold">✓</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Standard Grid Selection */
                  <div
                    id="category"
                    className={`grid grid-cols-6 gap-2 sm:gap-3 ${hasError("category") || hasError("category_id")
                      ? "ring-2 ring-red-500 rounded-2xl p-1"
                      : ""
                      }`}
                  >
                    {categories.length === 0 ? (
                      <div className="col-span-6 rounded-xl border bg-muted/40 p-3 text-xs sm:text-sm text-muted-foreground">
                        No Ripple Types are set up yet. You can still share your story without a symbol.
                      </div>
                    ) : (
                      categories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        const iconUrl = getImageUrl(cat.icon || null);

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat.id)}
                            aria-pressed={isSelected}
                            className={`group relative flex flex-col items-center justify-center rounded-xl border bg-card px-1.5 py-2.5 sm:px-2 sm:py-3 text-center transition-all hover:border-primary/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isSelected
                              ? "border-primary ring-2 ring-primary/70 shadow-lg scale-[1.05] bg-primary/5"
                              : "border-border"
                              }`}
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center mb-1.5 shadow-inner">
                              <img
                                src={iconUrl}
                                alt={cat.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs font-semibold leading-tight line-clamp-2">
                              {cat.name}
                            </span>
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-[8px] text-white font-bold">✓</span>
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {(hasError("category") || hasError("category_id")) && (
                  <p className="text-xs sm:text-sm text-red-500 font-medium">
                    {getErrorMessage("category") ||
                      getErrorMessage("category_id")}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">

              {/* Anonymous */}
              {!hideAnonymous && (
                <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-indigo-50/50 border border-indigo-200 rounded-lg">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) =>
                      setIsAnonymous(Boolean(checked))
                    }
                    className="h-4 w-4 rounded-[4px] border-2 border-indigo-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 flex-shrink-0"
                    style={{ borderRadius: '4px' }}
                  />
                  <Label
                    htmlFor="anonymous"
                    className="text-xs sm:text-sm cursor-pointer font-medium text-indigo-900 flex-1"
                  >
                    Share anonymously (Your name won't be shown)
                  </Label>
                </div>
              )}

              {/* Validation Summary */}
              {hasAttemptedSubmit && Object.keys(formErrors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-800 text-sm">
                      Please fix the following issues:
                    </h3>
                  </div>
                  <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                    {Object.values(formErrors).flat().map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  data-tutorial-target="submit-button"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-3 sm:py-4 w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {submitButtonText}
                    </>
                  )}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full sm:w-auto text-sm sm:text-base border-2 py-3 sm:py-4"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};