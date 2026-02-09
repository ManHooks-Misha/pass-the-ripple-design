import { useState, useEffect, useCallback } from "react";
import { Step } from "react-joyride";

const STORAGE_KEY = "dashboard_tutorial_completed";

export const useDashboardTutorial = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    setIsCompleted(completed === "true");
    
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startTutorial = useCallback(() => {
    setIsActive(true);
  }, []);

  const completeTutorial = useCallback(() => {
    setIsCompleted(true);
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const skipTutorial = useCallback(() => {
    setIsCompleted(true);
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const resetTutorial = useCallback(() => {
    setIsCompleted(false);
    setIsActive(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    isCompleted,
    isActive,
    isMobile,
    startTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
};

// Define tutorial steps for user dashboard
// Base steps - includes all steps for desktop
export const dashboardTutorialStepsBase: Step[] = [
  {
    target: "body",
    title: "Welcome! 🎉",
    content: "Hi there! Let's learn about your dashboard together! I'll show you where everything is. Ready to start?",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-dashboard"]',
    title: "🏠 Dashboard",
    content: "This is your home page! Here you can see all your badges, points, and fun things you've done. You're here right now!",
    placement: "right",
    disableBeacon: true,
    disableScrolling: false,
  },
  {
    target: '[data-tutorial-target="sidebar-post-story"]',
    title: "✏️ Post Story",
    content: "Click here to share your kindness story! Tell everyone about the nice things you did today!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-my-stories"]',
    title: "📚 My Stories",
    content: "See all the stories you shared! Look at all the nice things you've done!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-ripple-tracker"]',
    title: "🗺️ Ripple Tracker",
    content: "Watch your kindness travel around the world! See a cool map showing where your kindness went!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-leaderboard"]',
    title: "🏆 Leaderboard",
    content: "See who's doing the most kindness! Check your ranking and see how awesome you are!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-challenges"]',
    title: "🎮 Challenges",
    content: "Play fun games and earn cool badges! Complete missions to get rewards!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-ripple-card"]',
    title: "💳 Ripple Card",
    content: "This is your special card! It's like your kindness ID card that travels with you!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-notifications"]',
    title: "🔔 Notifications",
    content: "Get messages about new badges, challenges, and fun updates! Check here for exciting news!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-analytics"]',
    title: "📊 Analytics",
    content: "See how much you've grown! Watch your progress and see all your achievements!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-feedback"]',
    title: "💬 Feedback",
    content: "Tell us what you think! Share your ideas to help us make things even better!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="sidebar-settings"]',
    title: "⚙️ Settings",
    content: "Change your profile picture, name, and other fun stuff! Make it yours!",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="stats-section"]',
    title: "📊 Your Stats",
    content: "Look at all these cool numbers! See your badges, points, and how many cities you've reached!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="button-post-story"]',
    title: "❤️ Post New Story",
    content: "Click this big purple button to share your kindness story! Tell everyone about the nice thing you did!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="button-view-journey"]',
    title: "🌍 View Your Journey",
    content: "See a cool map showing where your kindness traveled! Watch your ripples spread around the world!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="button-read-stories"]',
    title: "📖 Read Stories",
    content: "Read stories from other kids doing kind things! Get inspired and see how awesome everyone is!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="button-leaderboard"]',
    title: "🏆 Leaderboard",
    content: "See who's doing the most kindness! Check if you're in the top rankings!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "You're All Set! 🎊",
    content: "Awesome! You learned everything! Now go spread kindness and have fun! Remember, every kind act makes the world better! 🌟",
    placement: "center",
    disableBeacon: true,
  },
];

// Get filtered steps based on device type
export const getDashboardTutorialSteps = (isMobile: boolean): Step[] => {
  if (isMobile) {
    // On mobile, skip all sidebar steps (steps 1-11 are sidebar steps)
    // Keep: welcome (0), stats (12), buttons (13-16), complete (17)
    const mobileSteps = [
      dashboardTutorialStepsBase[0], // Welcome
      ...dashboardTutorialStepsBase.slice(12), // Stats, buttons, complete
    ];
    return mobileSteps;
  }
  // On desktop, show all steps
  return dashboardTutorialStepsBase;
};

// Export for backward compatibility
export const dashboardTutorialSteps = dashboardTutorialStepsBase;

