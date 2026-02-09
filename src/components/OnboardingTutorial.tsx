import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Waves, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import heroRippleImage from "@/assets/hero-ripple.jpg";

const steps = [
  {
    icon: "🌊",
    title: "What is a Ripple?",
    description: "Imagine dropping a pebble in water. Plop! Little circles grow bigger and bigger. That's what your kindness does! On tiny act can spread joy everywhere.",
    details: "Smile at someone today and watch what happens.",
    image: heroRippleImage
  },
  {
    icon: "🎫",
    title: "How do I get my Ripple Card?",
    description: "You'll get your own special card. It is like a kindness ticket. It's your way to start a happiness wave.",
    details: "Every kind act adds a heart or star to your card.",
    image: heroRippleImage
  },
  {
    icon: "❤️",
    title: "What should I do with my Ripple Card?",
    description: 'Do something kind! Share a toy. Help a friend. Say "You are awesome!"',
    details: "Even small acts make big ripples!",
    image: heroRippleImage
  },
  {
    icon: "📝",
    title: "How do I share my kindness story?",
    description: "Tell us what you did! Write it. Draw it. Share a photo.",
    details: "Your story might make another kid smile!",
    image: heroRippleImage
  },
  {
    icon: "🌊",
    title: "What happens after I share?",
    description: "Pass your Ripple Card to a friend! Let them do a kind act next.",
    details: "Your kindness can travel all around the world - how cool is that?!",
    image: heroRippleImage
  },
  {
    icon: "🌊",
    title: "Can I see where my Ripple goes?",
    description: "Yes! Track your card on the map. See it travel to new schools or even new countries!",
    details: "Tap the globe to watch your ripple grow!",
    image: heroRippleImage
  },
  {
    icon: "🌊",
    title: "Why is kindness important? Why doe kindness matter?",
    description: "Kindness is like sunshine for your heart. It makes you happy, and everyone else, too!",
    details: "How do you feel after helping someone?",
    image: heroRippleImage
  },
  {
    icon: "🌊",
    title: "What if I'm shy about sharing? What if I'm shy?",
    description: "That's okay! Kindness can be quiet: Pick up dropped pencils. Give a secret high-five. Draw a happy note. ",
    details: "Every kind act counts, whether they are big or small!",
    image: heroRippleImage
  },
  {
    icon: "🌊",
    title: "How can I make my ripple extra special?",
    description: 'Get creative! Write a thank you note. Make a "You are Amazing" card. Do a secret kind act.',
    details: "The more love you add, the bigger your ripple grows!",
    image: heroRippleImage
  }
];

interface OnboardingTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  autoOpen?: boolean;
}

export default function OnboardingTutorial({
  open,
  onOpenChange,
  onComplete,
  autoOpen = false,
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoOpen) {
      onOpenChange(true);
    }
  }, [autoOpen, onOpenChange]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    onOpenChange(false);
    if (onComplete) {
      onComplete();
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleComplete();
      }
    }}>
      <DialogContent className="max-w-3xl flex flex-col p-3 sm:p-4 md:p-5" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
        <DialogHeader className="px-2 sm:px-0 pt-2 sm:pt-0 pb-2 sm:pb-3 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            How Pass The Ripple Works! 🌟
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm mt-1">
            Let's learn how to spread kindness together!
          </DialogDescription>
        </DialogHeader>

        <div className="px-2 sm:px-0 flex-1 flex items-center justify-center overflow-hidden">
          {/* Main Tutorial Card - All steps use same format like first card */}
          <div className={`w-full transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <Card className="shadow-lg border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30">
              <CardContent className="p-3 sm:p-4 md:p-5">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-5">
                  <div className="flex-shrink-0">
                    <img 
                      src={steps[currentStep].image} 
                      alt={steps[currentStep].title}
                      className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
                    />
                  </div>
                  <div className="text-center sm:text-left flex-1 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-2xl sm:text-3xl md:text-4xl">{steps[currentStep].icon}</span>
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900">
                        {steps[currentStep].title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {steps[currentStep].description}
                    </p>
                    <p className="text-xs sm:text-sm text-indigo-600 font-medium bg-indigo-50 rounded-lg p-2 sm:p-3 border border-indigo-100">
                      💡 {steps[currentStep].details}
                    </p>
                  </div>
                </div>

                {/* Create First Ripple CTA - Show on step 3 (Share Your Story) */}
                {currentStep === 3 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900 mb-1">Create your first Ripple in 30 sec ⚡</h3>
                        <p className="text-xs sm:text-sm text-slate-600">It's quick and easy to get started!</p>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                        onClick={() => {
                          openInNewTab(`${window.location.origin}/post-story`);
                        }}
                      >
                        <Waves className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Start Your Ripple Adventure
                      </Button>
                    </div>
                  </div>
                )}

                {/* Track Ripple Card CTA - Show on step 6 (Track Your Ripple) */}
                {currentStep === 5 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900 mb-1">Track your Ripple Card on the map 🌍</h3>
                        <p className="text-xs sm:text-sm text-slate-600">See where your kindness travels!</p>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                        onClick={() => {
                          openInNewTab(`${window.location.origin}/my-journey-map`);
                        }}
                      >
                        <Globe className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Track Ripple Card
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Indicators */}
                <div className="flex justify-center space-x-2 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-indigo-100">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all ${
                        index === currentStep
                          ? "bg-primary scale-125"
                          : index < currentStep
                          ? "bg-primary/60"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="px-2 sm:px-0 pt-2 pb-2 sm:pb-3 flex-col sm:flex-row gap-2 flex-shrink-0">
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleSkip} 
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              Skip Tutorial
            </Button>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-xs sm:text-sm"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="hero"
              onClick={handleNext}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </>
              ) : (
                "Let's Start!"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

