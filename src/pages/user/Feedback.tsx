import React from 'react';
import FeedbackForm from '@/components/shared/FeedbackForm';
import Seo from '@/components/Seo';
import KidFriendlyTutorial from '@/components/KidFriendlyTutorial';
import { usePageTutorial } from '@/hooks/usePageTutorial';
import { feedbackTutorialSteps } from '@/hooks/usePageTutorialSteps';
import { convertStepsToTutorialSteps } from '@/utils/convertTutorialSteps';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserFeedback = () => {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "feedback_tutorial_completed",
    steps: feedbackTutorialSteps,
  });

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      <Seo
        title="Feedback | My Ripples"
        description="Share your feedback about Pass The Ripple"
      />
      
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="feedback_tutorial_completed"
      />
      
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Feedback
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Share your feedback about Pass The Ripple
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
      
      <FeedbackForm type="user" />
    </div>
  );
};

export default UserFeedback;

