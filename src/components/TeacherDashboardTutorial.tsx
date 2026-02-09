import { useState } from "react";
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
import { Users, BookOpen, FileText, BarChart3, Trophy, Target, MapPin, ChevronLeft, ChevronRight, UserPlus, Settings } from "lucide-react";
import heroRippleImage from "@/assets/hero-ripple.jpg";

const steps = [
  {
    icon: "👨‍🏫",
    title: "Welcome to Your Teacher Dashboard!",
    description: "This is your classroom command center! Here you can monitor student progress, manage your classroom, and track all the kindness happening in your class.",
    details: "Everything you need to guide your students' kindness journey is right here!",
    image: heroRippleImage
  },
  {
    icon: "📊",
    title: "Classroom Analytics",
    description: "See comprehensive statistics about your students! Total students, active students, stories posted, points earned, badges awarded, and much more.",
    details: "Track your classroom's growth and engagement at a glance!",
    image: heroRippleImage
  },
  {
    icon: "👥",
    title: "Manage Students",
    description: "Add new students, view student profiles, manage classroom rosters, and track individual student progress.",
    details: "Keep your classroom organized and engaged!",
    image: heroRippleImage
  },
  {
    icon: "📝",
    title: "Review Student Stories",
    description: "Review and moderate student submissions. Approve stories, provide feedback, and showcase your students' amazing acts of kindness.",
    details: "Help your students share their kindness with the world!",
    image: heroRippleImage
  },
  {
    icon: "🏆",
    title: "Leaderboards & Challenges",
    description: "View classroom leaderboards, create challenges, and motivate your students to spread more kindness.",
    details: "Foster healthy competition and celebrate achievements!",
    image: heroRippleImage
  },
  {
    icon: "🗺️",
    title: "Ripple Journey Map",
    description: "See where your students' kindness has traveled! Track ripples on an interactive map showing the global impact of your classroom.",
    details: "Watch your students' kindness spread around the world!",
    image: heroRippleImage
  },
  {
    icon: "📈",
    title: "Analytics & Reports",
    description: "Generate detailed reports, view analytics, track trends, and export data to share with parents or administrators.",
    details: "Get insights into your classroom's kindness journey!",
    image: heroRippleImage
  },
  {
    icon: "⚙️",
    title: "Classroom Setup",
    description: "Create and manage classrooms, set up student groups, configure settings, and customize your teaching experience.",
    details: "Organize your classroom exactly how you need it!",
    image: heroRippleImage
  },
  {
    icon: "🚀",
    title: "You're All Set!",
    description: "Now you know how to use your teacher dashboard! Start managing your classroom, tracking progress, and inspiring your students to spread kindness!",
    details: "Remember, you're guiding the next generation of kind leaders!",
    image: heroRippleImage
  }
];

interface TeacherDashboardTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export default function TeacherDashboardTutorial({
  open,
  onOpenChange,
  onComplete,
}: TeacherDashboardTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
            How to Use Your Teacher Dashboard! 🌟
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm mt-1">
            Let's learn about all the amazing features in your teacher panel!
          </DialogDescription>
        </DialogHeader>

        <div className="px-2 sm:px-0 flex-1 flex items-center justify-center overflow-hidden">
          {/* Main Tutorial Card */}
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

                {/* Action Buttons - Show on relevant steps */}
                {currentStep === 2 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900 mb-1">Manage your students! 👥</h3>
                        <p className="text-xs sm:text-sm text-slate-600">Add students or view your classroom roster!</p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                        <Button
                          variant="hero"
                          size="sm"
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm"
                          onClick={() => openInNewTab(`${window.location.origin}/teacher/manage-students`)}
                        >
                          <Users className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                          Manage Students
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm"
                          onClick={() => openInNewTab(`${window.location.origin}/teacher/add-student`)}
                        >
                          <UserPlus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                          Add Student
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900 mb-1">Review student stories! 📝</h3>
                        <p className="text-xs sm:text-sm text-slate-600">Moderate and approve student submissions!</p>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                        onClick={() => openInNewTab(`${window.location.origin}/teacher/manage-stories`)}
                      >
                        <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Manage Stories
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900 mb-1">View leaderboards! 🏆</h3>
                        <p className="text-xs sm:text-sm text-slate-600">See how your students rank and create challenges!</p>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                        onClick={() => openInNewTab(`${window.location.origin}/teacher/leaderboards`)}
                      >
                        <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        View Leaderboards
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900 mb-1">See your classroom's journey! 🗺️</h3>
                        <p className="text-xs sm:text-sm text-slate-600">Track where your students' kindness has traveled!</p>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                        onClick={() => openInNewTab(`${window.location.origin}/teacher/ripple-map`)}
                      >
                        <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        View Ripple Map
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900 mb-1">View analytics! 📈</h3>
                        <p className="text-xs sm:text-sm text-slate-600">Get detailed insights and generate reports!</p>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                        onClick={() => openInNewTab(`${window.location.origin}/teacher/analytics`)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        View Analytics
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900 mb-1">Set up your classroom! ⚙️</h3>
                        <p className="text-xs sm:text-sm text-slate-600">Create classrooms and configure settings!</p>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                        onClick={() => openInNewTab(`${window.location.origin}/teacher/classroom-setup`)}
                      >
                        <Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Classroom Setup
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
                "Got It!"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

