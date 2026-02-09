import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { LogActionComponent } from "@/components/shared/LogAction";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherPostStoryTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TeacherLogAction = () => {
  const navigate = useNavigate();
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_post_story_tutorial_completed",
    steps: teacherPostStoryTutorialSteps,
  });

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Seo
        title="Post Story — Pass The Ripple"
        description="Share your kindness stories as a teacher"
        canonical={`${window.location.origin}/teacher/post-story`}
      />
      
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="teacher_log_action_tutorial_completed"
      />
      
      <main className="container p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Log Teacher Action
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Record an action as administrator
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={startTutorial}
            className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2 flex-shrink-0"
            title="Take a tour of this page"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Help</span>
          </Button>
        </div>
        <LogActionComponent
          onSuccess={() => navigate("/teacher/my-stories")}
          showSuccessModal={true}
          showCategorySelector={true}
          mode="teacher"
          showHeader={false}
        />
      </main>
    </div>
  );
};

export default TeacherLogAction;