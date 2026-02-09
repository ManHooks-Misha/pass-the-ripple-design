"use client";

import React, { useState } from "react";
import Seo from "@/components/Seo";
import { ErrorDisplay, LoadingSpinner } from "@/components/LoadingSpinner";
import RippleTimeline from "@/components/RippleTimeline";
import RippleTree from "@/components/RippleTree";
import { useRippleJourney } from "@/hooks/useRippleJourney";
import { Button } from "@/components/ui/button";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherRippleMapTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { HelpCircle } from "lucide-react";
// import MapRippleTree from "@/components/MapRippleTree";

export default function TeacherRippleMap() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_ripple_map_tutorial_completed",
    steps: teacherRippleMapTutorialSteps,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch data using custom hook
  const { 
    data: rippleJourneyData, 
    loading: journeyLoading, 
    error: journeyError,
    refetch: refetchJourney
  } = useRippleJourney();

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
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

  return (
    <>
      <Seo
        title="Ripple Map - Teacher Panel"
        description="See where kindness has spread geographically"
        canonical={`${
          typeof window !== "undefined" ? window.location.origin : ""
        }/teacher/ripple-map`}
      />
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_ripple_map_tutorial_completed"
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Header - Dashboard Style */}
          <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
                🌈 Ripple Journey
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                See where kindness has spread geographically
              </p>
            </div>
            <Button
              onClick={startTutorial}
              variant="outline"
              size="sm"
              className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2 flex-shrink-0"
              title="Take a tour of this page"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help</span>
            </Button>
          </div>

        {/* Main Visualization */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200" data-tutorial-target="ripple-map">
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
    </>
  );
}