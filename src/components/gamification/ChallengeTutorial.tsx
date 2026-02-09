import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Target,
  Flame,
  Gift,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  PartyPopper,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ChallengeTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tutorialSteps = [
  {
    id: 1,
    title: "Welcome to Challenges! 🎉",
    icon: <PartyPopper className="w-12 h-12 text-purple-500" />,
    description: "Fun activities where you compete with friends and earn rewards!",
    illustration: (
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-xl">
        <div className="flex justify-center gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <Star className="w-8 h-8 text-blue-500 fill-blue-500" />
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <Gift className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <p className="text-center text-purple-700 font-bold text-sm">
          Win Trophies, Stars & Prizes!
        </p>
      </div>
    ),
  },
  {
    id: 2,
    title: "How to Join 🎮",
    icon: <Target className="w-12 h-12 text-blue-500" />,
    description: "Find challenges you like and click 'Join Challenge'!",
    illustration: (
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-xl text-white text-center shadow transform hover:scale-105 transition-transform cursor-pointer">
          <Flame className="w-8 h-8 mx-auto mb-1" />
          <p className="text-lg font-bold">Join Challenge</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>You're in! 🚀</span>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Complete Mission 🎯",
    icon: <Zap className="w-12 h-12 text-yellow-500" />,
    description: "Each challenge has goals like creating stories or getting likes!",
    illustration: (
      <div className="space-y-2">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-300">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-blue-900 text-sm">Goal: Create 10 Stories</span>
            <Badge className="bg-blue-500 text-xs">Active</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-blue-700">
              <span>Progress</span>
              <span className="font-bold">7/10</span>
            </div>
            <Progress value={70} className="h-2 bg-blue-200" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Track Progress 📊",
    icon: <TrendingUp className="w-12 h-12 text-green-500" />,
    description: "Watch your progress grow in 'My Challenges'!",
    illustration: (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-300">
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
            <div className="bg-green-100 p-1 rounded-full">
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-900 text-xs">Story Challenge</p>
              <Progress value={85} className="h-1.5 mt-0.5" />
            </div>
            <span className="text-green-600 font-bold text-xs">85%</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
            <div className="bg-blue-100 p-1 rounded-full">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-blue-900 text-xs">Friends Challenge</p>
              <Progress value={60} className="h-1.5 mt-0.5" />
            </div>
            <span className="text-blue-600 font-bold text-xs">60%</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Win Rewards! 🏆",
    icon: <Gift className="w-12 h-12 text-orange-500" />,
    description: "Earn points, badges, and climb the leaderboard!",
    illustration: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-300">
            <Star className="w-6 h-6 mx-auto mb-1 text-yellow-500 fill-yellow-500" />
            <p className="text-xs font-bold text-yellow-700">+500 Points</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-300">
            <Award className="w-6 h-6 mx-auto mb-1 text-purple-500" />
            <p className="text-xs font-bold text-purple-700">Special Badge</p>
          </div>
          <div className="bg-pink-50 p-3 rounded-lg text-center border border-pink-300">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-pink-500" />
            <p className="text-xs font-bold text-pink-700">Trophy</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: "Ready to Start? 🚀",
    icon: <Flame className="w-12 h-12 text-red-500" />,
    description: "You're all set! Pick a challenge and show your skills!",
    illustration: (
      <div className="bg-gradient-to-br from-orange-100 to-pink-100 p-4 rounded-xl text-center">
        <div className="flex justify-center gap-2 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <Star className="w-8 h-8 text-blue-500 fill-blue-500" />
          <Gift className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-lg font-bold text-purple-900">
          Let's Go! 💪
        </p>
      </div>
    ),
  },
];

export default function ChallengeTutorial({
  open,
  onOpenChange,
}: ChallengeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onOpenChange(false);
      localStorage.setItem("challengeTutorialCompleted", "true");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    localStorage.setItem("challengeTutorialCompleted", "true");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-300 shadow-xl">
        <DialogHeader className="text-center space-y-3 pb-1">
          {/* Progress Dots */}
          <div className="flex justify-center gap-1.5 mb-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-purple-600"
                    : index < currentStep
                    ? "w-1.5 bg-green-500"
                    : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              {step.icon}
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {step.title}
          </DialogTitle>

          {/* Description */}
          <p className="text-sm text-gray-700 font-medium px-2">
            {step.description}
          </p>
        </DialogHeader>

        {/* Illustration */}
        <div className="my-4">{step.illustration}</div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-purple-200">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium py-2 h-auto"
          >
            Skip
          </Button>

          <div className="flex gap-2 flex-1">
            {!isFirstStep && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="flex-1 border border-purple-400 text-purple-700 hover:bg-purple-50 text-sm font-medium py-2 h-auto"
              >
                Previous
              </Button>
            )}

            <Button
              onClick={handleNext}
              className={`flex-1 font-semibold text-white text-sm py-2 h-auto ${
                isLastStep
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              }`}
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Start Journey
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step Counter */}
        <div className="text-center text-xs text-gray-500 font-medium mt-1">
          {currentStep + 1} / {tutorialSteps.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}