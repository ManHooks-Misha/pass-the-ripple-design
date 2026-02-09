import { useState, useEffect, useCallback } from "react";
import { Step } from "react-joyride";

interface UsePageTutorialOptions {
  storageKey: string;
  steps: Step[];
}

export const usePageTutorial = ({ storageKey, steps }: UsePageTutorialOptions) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    setIsCompleted(completed === "true");
    
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [storageKey]);

  const startTutorial = useCallback(() => {
    setIsActive(true);
  }, []);

  const completeTutorial = useCallback(() => {
    setIsCompleted(true);
    setIsActive(false);
    localStorage.setItem(storageKey, "true");
  }, [storageKey]);

  const skipTutorial = useCallback(() => {
    setIsCompleted(true);
    setIsActive(false);
    localStorage.setItem(storageKey, "true");
  }, [storageKey]);

  const resetTutorial = useCallback(() => {
    setIsCompleted(false);
    setIsActive(false);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Get filtered steps based on device type
  const getTutorialSteps = useCallback((isMobile: boolean): Step[] => {
    // Filter out steps that should be skipped on mobile
    return steps.filter(step => {
      // Skip steps targeting sidebar items on mobile
      if (isMobile && step.target && typeof step.target === 'string' && step.target.includes('sidebar-')) {
        return false;
      }
      return true;
    });
  }, [steps]);

  const tutorialSteps = getTutorialSteps(isMobile);

  return {
    isCompleted,
    isActive,
    isMobile,
    tutorialSteps,
    startTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
};


