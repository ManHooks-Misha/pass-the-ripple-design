import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Sparkles, Star } from "lucide-react";
import { RippleActionForm } from "@/components/shared/RippleActionForm";
import { useSearchParams } from "react-router-dom";
import { challengeService } from "@/services/challengeService";
import { Challenge } from "@/types/Challenge";

interface LogActionComponentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showBackgroundIcons?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  showSuccessModal?: boolean;
  showCategorySelector?: boolean;
  submitButtonText?: string;
  successMessage?: string;
  mode?: "user" | "admin" | "teacher";
  className?: string;
}

export const LogActionComponent = ({
  onSuccess,
  onCancel,
  showBackgroundIcons = true,
  showHeader = true,
  headerTitle = "Log Your Kindness!",
  headerSubtitle = "What kind of kindness did you do?",
  showSuccessModal = true,
  showCategorySelector = true,
  submitButtonText = "Start Your Ripple Adventure",
  successMessage = "Ripple created successfully!",
  mode = "user",
  className = ""
}: LogActionComponentProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get("challengeId");
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    if (challengeId) {
      const fetchChallenge = async () => {
        try {
          const data = await challengeService.getChallenge(parseInt(challengeId));
          setChallenge(data);
        } catch (error) {
          console.error("Failed to fetch challenge", error);
        }
      };
      fetchChallenge();
    }
  }, [challengeId]);

  const triggerConfetti = () => {
    const colors = ["#a855f7", "#ec4899", "#fbbf24", "#34d399", "#60a5fa"];
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.3, y: 0.6 },
      colors
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.7, y: 0.6 },
      colors
    });
  };

  const handleSuccess = () => {
    if (showSuccessModal) {
      setShowSuccess(true);
      triggerConfetti();
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) onSuccess();
      }, 3000);
    } else {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background Icons */}
      {showBackgroundIcons && (
        <>
          <Sparkles className="absolute top-10 left-10 text-yellow-400/40 w-8 h-8 animate-pulse" />
          <Star className="absolute top-20 right-20 text-pink-400/40 w-6 h-6 animate-pulse delay-300" />
        </>
      )}

      {/* Header */}
      {showHeader && (
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-primary">{challenge ? `Complete Challenge: ${challenge.name}` : headerTitle}</span> ✨
          </h1>
          <p className="text-lg text-foreground/70">{challenge ? "Share your story to complete this challenge!" : headerSubtitle}</p>
        </div>
      )}

      {/* Ripple Form */}
      <div className="mx-auto">
        <RippleActionForm
          mode={mode}
          onSuccess={handleSuccess}
          onCancel={onCancel}
          showCategorySelector={showCategorySelector}
          submitButtonText={challenge ? "Complete Challenge" : submitButtonText}
          successMessage={challenge ? "Challenge Completed! 🎉" : successMessage}
          challenge={challenge}
        />
      </div>

      {/* Success Modal */}
      {showSuccess && showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="max-w-md w-full shadow-2xl border-0 animate-scale-in">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  <span className="text-gradient-primary">New ripple story created successfully!</span>
                  <span className="text-2xl">🎉</span>
                </h2>
              </div>
              <div className="my-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>
              <p className="text-muted-foreground mb-6">Your story has been shared with the world!</p>
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  if (onSuccess) onSuccess();
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:brightness-110"
              >
                View My Stories
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};