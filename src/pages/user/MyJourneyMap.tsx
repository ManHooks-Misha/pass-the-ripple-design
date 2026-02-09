"use client";

import React, { useState, useMemo } from "react";
import Seo from "@/components/Seo";
import { ErrorDisplay, LoadingSpinner } from "@/components/LoadingSpinner";
import RippleTimeline from "@/components/RippleTimeline";
import RippleTree from "@/components/RippleTree";
import { useRippleJourney } from "@/hooks/useRippleJourney";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { rippleJourneyTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
// import MapRippleTree from "@/components/MapRippleTree";

export default function RippleJourneyPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

  // Fetch data using custom hook
  const { 
    data: rippleJourneyData, 
    loading: journeyLoading, 
    error: journeyError,
    refetch: refetchJourney
  } = useRippleJourney();

  // Check if only current user is in the journey
  const isOnlyCurrentUser = useMemo(() => {
    if (!user || !rippleJourneyData || journeyLoading) return false;
    // Check if there's only one node (the root user) or all nodes belong to current user
    return rippleJourneyData.nodes.length <= 1 || 
           (rippleJourneyData.nodes.length > 0 && rippleJourneyData.nodes.every(node => 
             !node.parent || node.id === user.ripple_id
           ));
  }, [rippleJourneyData, user, journeyLoading]);

  // Generate dynamic tutorial steps
  const dynamicTutorialSteps = useMemo(() => {
    const baseSteps = [...rippleJourneyTutorialSteps];
    
    // If only current user is present, replace the final step with encouragement
    if (isOnlyCurrentUser && baseSteps.length > 0 && !journeyLoading) {
      const finalStepIndex = baseSteps.length - 1;
      baseSteps[finalStepIndex] = {
        ...baseSteps[finalStepIndex],
        title: "Share Your Ripple Card! 💳",
        content: "Great start! Right now, only you are in your ripple journey. Share your Ripple Card with friends and family! When they register using your Ripple ID, you'll both earn awesome points! The more people join, the bigger your kindness tree grows! 🌟",
        placement: "center",
        disableBeacon: true,
      };
    }
    
    return baseSteps;
  }, [isOnlyCurrentUser, journeyLoading]);

  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "ripple_journey_tutorial_completed",
    steps: dynamicTutorialSteps,
  });

  // Handle node selection
  const handleNodeClick = (id: string) => {
    setSelectedId(id);
  };

  // Handle story card click
  const handleStoryClick = (id: string) => {
    setSelectedId(id);
  };

  // Loading state
  if (journeyLoading) {
    return <LoadingSpinner message="Loading Ripple Journey..." />;
  }

  // Error state
  if (journeyError) {
    return (
      <ErrorDisplay 
        error={journeyError} 
        onRetry={() => refetchJourney()} 
      />
    );
  }

  // No data state
  if (!rippleJourneyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Seo
        title="Ripple Journey — Pass The Ripple"
        description="Discover inspiring stories of kindness from kids around the world."
        canonical={`${
          typeof window !== "undefined" ? window.location.origin : ""
        }/ripple-journey`}
      />

      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="ripple_journey_tutorial_completed"
      />

      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Ripple Journey
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Watch your kindness travel farther than you think
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

        {/* Main Visualization */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
          <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
            {/* <MapRippleTree 
              data={rippleJourneyData}
              googleMapsApiKey={GOOGLE_MAPS_KEY}
            /> */}
            <RippleTree
              data={rippleJourneyData}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>

        {/* Timeline Section (Optional - can be toggled) */}
        <div className="mt-4 sm:mt-6 md:mt-8 bg-white rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border-2 border-purple-200">
          <h2 className="text-xl sm:text-2xl font-bold text-pink-600 mb-3 sm:mb-4 flex items-center gap-2">
            ✨ Ripple Stories
          </h2>
          <div className="max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto">
            <RippleTimeline
              stories={rippleJourneyData.stories}
              nodes={rippleJourneyData.nodes}
              edges={rippleJourneyData.edges}
              selectedId={selectedId}
              onStoryClick={handleStoryClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}