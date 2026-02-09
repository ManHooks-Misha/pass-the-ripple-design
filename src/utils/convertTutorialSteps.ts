import { Step } from "react-joyride";
import { TutorialStep } from "@/components/DashboardTutorial";

/**
 * Converts react-joyride Step format to TutorialStep format for KidFriendlyTutorial
 */
export function convertStepsToTutorialSteps(steps: Step[]): TutorialStep[] {
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return [];
  }
  
  return steps.map((step, index) => {
    // Extract target ID from data-tutorial-target attribute if present
    let targetId = '';
    if (step.target && step.target.includes('data-tutorial-target=')) {
      const match = step.target.match(/data-tutorial-target="([^"]+)"/);
      if (match) {
        targetId = match[1];
      }
    }
    
    // Generate ID if not present
    const id = targetId || `step-${index}`;
    
    // Convert placement to position
    const positionMap: Record<string, "top" | "bottom" | "left" | "right" | "center"> = {
      top: "top",
      bottom: "bottom",
      left: "left",
      right: "right",
      center: "center",
    };
    
    const position = step.placement 
      ? (positionMap[step.placement] || "center")
      : "center";
    
    return {
      id,
      target: step.target || "body",
      title: step.title || "",
      description: step.content || "",
      position,
    };
  });
}

