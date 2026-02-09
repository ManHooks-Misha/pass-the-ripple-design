import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Upload, Camera, MapPin } from "lucide-react";
import { apiFetch } from "@/config/api";
import { getCategoryIconUrl } from "@/utils/imageUrl";
import Seo from "@/components/Seo";
import Header from "@/components/layouts/includes/MagicalHeader";
import FooterSection from "@/components/layouts/includes/FooterSection";

interface RippleCategory {
  id: number;
  name: string;
  icon: string | null;
}

const RippleActionLog = () => {
  const [story, setStory] = useState("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<RippleCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load Ripple Symbol Types from API (with graceful fallback)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        let res;
        try {
          res = await apiFetch<{ data: RippleCategory[] }>("/categories");
        } catch {
          // Fallback for older API versions
          res = await apiFetch<{ data: RippleCategory[] }>("/admin/categories");
        }
        if (res?.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Failed to load ripple symbol types:", error);
        toast({
          title: "Error loading Ripple Symbols",
          description: "You can still share your story, but symbols may not display correctly.",
          variant: "destructive",
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock city name based on coordinates
          setLocation("San Francisco, CA");
          toast({ title: "Location detected!", description: "San Francisco, CA" });
        },
        () => {
          toast({ 
            title: "Location access denied", 
            description: "You can manually enter your city",
            variant: "destructive" 
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!story || !category) {
      toast({ 
        title: "Missing information", 
        description: "Please add your story and select a Ripple Symbol Type",
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);

    // Mock submission to moderation queue
    setTimeout(() => {
      const rippleData = {
        id: Date.now(),
        story,
        category, // stores selected Ripple Symbol Type id as string
        isAnonymous,
        photo: photoPreview,
        location: location || "Unknown",
        timestamp: new Date().toISOString(),
        status: "pending", // Goes to moderation queue
        user: isAnonymous ? "Anonymous" : JSON.parse(localStorage.getItem('userProfile') || '{}').nickname || "Unknown"
      };

      // Save to localStorage
      const ripples = JSON.parse(localStorage.getItem('ripples') || '[]');
      ripples.push(rippleData);
      localStorage.setItem('ripples', JSON.stringify(ripples));

      toast({ 
        title: "Ripple submitted!", 
        description: "Your story is being reviewed and will appear soon!" 
      });

      // Reset form
      setStory("");
      setCategory("");
      setIsAnonymous(false);
      setPhoto(null);
      setPhotoPreview("");
      setLocation("");
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="Log Your Ripple — Pass The Ripple"
        description="Share your act of kindness and inspire others to spread ripples of good."
        canonical={`${window.location.origin}/ripple-action-log`}
      />
      <Header/>
      <main className="container py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-1">
              Create Your Ripple Story
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Every act of kindness starts a ripple. Choose your Ripple Symbol Type and tell the story behind it.
            </p>
          </div>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Log Your Act of Kindness</CardTitle>
              <CardDescription>Start by choosing the Ripple Symbol Type that best matches your story.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ripple Symbol Type Selection */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <Label htmlFor="ripple-symbol-type">Ripple Symbol Type *</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Tap a symbol card to choose the type of kindness you’re sharing.
                      </p>
                    </div>
                    {category && categories.length > 0 && (
                      <p className="text-xs sm:text-sm text-primary font-medium">
                        Selected:{" "}
                        {categories.find((cat) => cat.id.toString() === category)?.name}
                      </p>
                    )}
                  </div>

                  {loadingCategories ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-28 sm:h-32 rounded-2xl border border-dashed bg-muted animate-pulse"
                        />
                      ))}
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                      No Ripple Symbol Types are set up yet. You can still share your story without a symbol.
                    </div>
                  ) : (
                    <div
                      id="ripple-symbol-type"
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5"
                    >
                      {categories.map((cat) => {
                        const isSelected = category === cat.id.toString();
                        const iconUrl = getCategoryIconUrl(cat.icon);

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id.toString())}
                            aria-pressed={isSelected}
                            className={`group relative flex flex-col items-center justify-between rounded-2xl border bg-card px-3 py-4 sm:px-4 sm:py-5 text-center transition-all hover:border-primary/70 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/70 shadow-xl scale-[1.03]"
                                : "border-border"
                            }`}
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center mb-3 shadow-inner">
                              <img
                                src={iconUrl}
                                alt={cat.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold leading-tight">
                              {cat.name}
                            </span>
                            {isSelected && (
                              <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                Selected
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Story */}
                <div className="grid gap-2">
                  <Label htmlFor="story">Tell your story *</Label>
                  <Textarea
                    id="story"
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Describe your act of kindness... What did you do? How did it make others feel?"
                    className="min-h-[120px]"
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {story.length}/500 characters
                  </p>
                </div>

                {/* Photo Upload */}
                <div className="grid gap-2">
                  <Label>Add a photo (optional)</Label>
                  <div className="flex gap-2">
                    <Label htmlFor="photo-upload" className="cursor-pointer flex-1">
                      <div className="rounded-lg border-2 border-dashed p-4 text-center hover:border-primary/50 transition-colors">
                        {photoPreview ? (
                          <div className="space-y-2">
                            <img 
                              src={photoPreview} 
                              alt="Preview" 
                              className="w-full h-32 object-cover rounded"
                            />
                            <p className="text-sm text-muted-foreground">Click to change photo</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload a photo
                            </p>
                          </div>
                        )}
                      </div>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </Label>
                    <Button type="button" variant="outline" className="px-3">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Location */}
                <div className="grid gap-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State/Country"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={detectLocation}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Help others see how far kindness travels
                  </p>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <Label 
                    htmlFor="anonymous" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Post anonymously (your nickname won't be shown)
                  </Label>
                </div>

                {/* Guidelines */}
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium mb-2">Community Guidelines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keep stories positive and inspiring</li>
                    <li>• No personal information or last names</li>
                    <li>• Be respectful and kind in your words</li>
                    <li>• All stories are reviewed before appearing</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Share My Ripple"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg font-medium mb-2">
                "No act of kindness, no matter how small, is ever wasted."
              </p>
              <p className="text-sm text-muted-foreground">- Aesop</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default RippleActionLog;