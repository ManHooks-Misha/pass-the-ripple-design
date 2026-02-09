import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, Styles } from "react-joyride";

interface JoyrideTutorialProps {
  steps: Step[];
  isActive: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

// Get responsive styles based on screen size
const getJoyrideStyles = (): Styles => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isSmallMobile = typeof window !== 'undefined' && window.innerWidth < 400;
  
  return {
    options: {
      primaryColor: "#a855f7", // Purple
      textColor: "#1f2937", // Dark gray
      overlayColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 10000,
      arrowColor: "#a855f7",
    },
    tooltip: {
      borderRadius: isSmallMobile ? 12 : 16,
      fontSize: isSmallMobile ? 16 : isMobile ? 17 : 18,
      padding: isSmallMobile ? 16 : isMobile ? 20 : 24,
      paddingTop: isSmallMobile ? 40 : isMobile ? 44 : 48, // Space for close button
      paddingBottom: isSmallMobile ? 20 : isMobile ? 24 : 28, // Normal padding for buttons
      background: "linear-gradient(to bottom right, #faf5ff, #fce7f3, #eff6ff)",
      border: isSmallMobile ? "3px solid #a855f7" : "4px solid #a855f7",
      boxShadow: "0 10px 40px rgba(168, 85, 247, 0.3)",
      maxWidth: isSmallMobile ? "calc(100vw - 40px)" : isMobile ? "calc(100vw - 40px)" : "min(90vw, 600px)",
      width: "auto",
      minWidth: isSmallMobile ? "260px" : "280px",
      height: "auto",
      maxHeight: "calc(100vh - 40px)",
      overflow: "visible",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    },
    tooltipContainer: {
      textAlign: "left" as const,
      padding: isMobile ? "8px" : "12px",
    },
    tooltipTitle: {
      fontSize: isSmallMobile ? 18 : isMobile ? 20 : 22,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: isMobile ? 8 : 12,
    },
    tooltipContent: {
      fontSize: isSmallMobile ? 14 : isMobile ? 15 : 16,
      lineHeight: 1.6,
      color: "#374151",
      padding: isMobile ? "4px 0" : "8px 0",
    },
    buttonNext: {
      fontSize: isSmallMobile ? 16 : isMobile ? 17 : 18,
      fontWeight: "bold",
      padding: isSmallMobile ? "12px 16px" : isMobile ? "13px 20px" : "14px 28px",
      background: "linear-gradient(to right, #a855f7, #ec4899)",
      borderRadius: isSmallMobile ? 10 : 12,
      border: "none",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(168, 85, 247, 0.4)",
      cursor: "pointer",
      transition: "all 0.2s",
      minHeight: isSmallMobile ? "44px" : isMobile ? "46px" : "48px",
      width: isMobile ? "100%" : "auto",
      flex: isMobile ? "1 1 0%" : "none",
      minWidth: isMobile ? "0" : "auto",
      margin: isMobile ? "0" : "auto",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
    },
    buttonBack: {
      fontSize: isSmallMobile ? 16 : isMobile ? 17 : 18,
      fontWeight: "bold",
      padding: isSmallMobile ? "12px 16px" : isMobile ? "13px 20px" : "14px 28px",
      border: isSmallMobile ? "2px solid #a855f7" : "3px solid #a855f7",
      borderRadius: isSmallMobile ? 10 : 12,
      background: "#ffffff",
      color: "#a855f7",
      marginRight: isMobile ? "8px" : "16px",
      cursor: "pointer",
      transition: "all 0.2s",
      minHeight: isSmallMobile ? "44px" : isMobile ? "46px" : "48px",
      width: isMobile ? "100%" : "auto",
      flex: isMobile ? "1 1 0%" : "none",
      minWidth: isMobile ? "0" : "auto",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
    },
    buttonSkip: {
      fontSize: isSmallMobile ? 14 : 16,
      color: "#6b7280",
      padding: isMobile ? "6px 12px" : "8px 16px",
    },
    buttonClose: {
      color: "#6b7280",
      fontSize: 18,
      padding: 0,
      margin: 0,
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 1000,
      background: "rgba(255, 255, 255, 0.9)",
      borderRadius: "50%",
      width: "28px",
      height: "28px",
      minWidth: "28px",
      minHeight: "28px",
      maxWidth: "28px",
      maxHeight: "28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid rgba(107, 114, 128, 0.2)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      transition: "all 0.2s",
      cursor: "pointer",
      fontWeight: 600,
      lineHeight: 1,
      outline: "none",
    },
    spotlight: {
      borderRadius: isSmallMobile ? 12 : 16,
      border: isSmallMobile ? "4px solid #a855f7" : "6px solid #a855f7",
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(168, 85, 247, 0.6)",
    },
    overlay: {
      fill: "rgba(0, 0, 0, 0.5)",
    },
    spotlightLegacy: {
      borderRadius: isSmallMobile ? 12 : 16,
    },
    beacon: {},
    beaconInner: {},
    beaconOuter: {},
    overlayLegacy: {},
    overlayLegacyCenter: {},
    tooltipFooter: {},
    tooltipFooterSpacer: {},
  };
};

const JoyrideTutorial = ({
  steps,
  isActive,
  onComplete,
  onSkip,
  storageKey = "dashboard_tutorial_completed",
}: JoyrideTutorialProps) => {
  const [run, setRun] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [styles, setStyles] = useState<Styles>(getJoyrideStyles());

  // Update mobile state and styles on resize
  useEffect(() => {
    const updateMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setStyles(getJoyrideStyles());
    };

    updateMobile();
    window.addEventListener('resize', updateMobile);
    window.addEventListener('orientationchange', updateMobile);
    
    return () => {
      window.removeEventListener('resize', updateMobile);
      window.removeEventListener('orientationchange', updateMobile);
    };
  }, []);

  useEffect(() => {
    setRun(isActive);
    // Update styles when tutorial becomes active
    if (isActive) {
      setStyles(getJoyrideStyles());
    }
  }, [isActive]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, step, index } = data;

    // When a step is shown, ensure the tooltip is visible
    if (type === 'step:after' || type === 'tooltip') {
      // Wait a bit for the scroll animation and tooltip positioning to complete
      setTimeout(() => {
        const tooltip = document.querySelector('.react-joyride__tooltip') as HTMLElement;
        if (tooltip) {
          const tooltipRect = tooltip.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          const padding = 20; // Padding from viewport edges
          const buttonAreaHeight = 100; // Extra space needed for buttons
          
          let scrollTop = 0;
          let scrollLeft = 0;
          
          // Check if tooltip is off-screen (above viewport)
          if (tooltipRect.top < padding) {
            scrollTop = tooltipRect.top - padding;
          }
          
          // Check if tooltip (including buttons) is off-screen (below viewport)
          // Add extra space for buttons at the bottom
          if (tooltipRect.bottom + buttonAreaHeight > viewportHeight - padding) {
            const bottomOverflow = (tooltipRect.bottom + buttonAreaHeight) - (viewportHeight - padding);
            scrollTop = bottomOverflow + padding; // Scroll down (positive) to show tooltip and buttons
          }
          
          // Check if tooltip is off-screen (left of viewport)
          if (tooltipRect.left < padding) {
            scrollLeft = tooltipRect.left - padding;
          }
          
          // Check if tooltip is off-screen (right of viewport)
          if (tooltipRect.right > viewportWidth - padding) {
            const rightOverflow = tooltipRect.right - (viewportWidth - padding);
            scrollLeft = -rightOverflow;
          }
          
          // Apply scroll adjustments if needed
          if (scrollTop !== 0 || scrollLeft !== 0) {
            window.scrollBy({
              top: scrollTop,
              left: scrollLeft,
              behavior: 'smooth'
            });
          }
          
          // Also ensure tooltip is centered if it's too large
          if (tooltipRect.height > viewportHeight - 40) {
            // Center vertically if tooltip is taller than viewport
            const centerScroll = (tooltipRect.top + tooltipRect.height / 2) - (viewportHeight / 2);
            window.scrollBy({
              top: centerScroll,
              behavior: 'smooth'
            });
          }
          
          // Force tooltip to stay within bounds by adjusting position if needed
          const buttonContainer = tooltip.querySelector('.react-joyride__tooltip__container > div:last-child') as HTMLElement;
          if (buttonContainer) {
            const buttonRect = buttonContainer.getBoundingClientRect();
            // If buttons are below viewport, scroll to show them
            if (buttonRect.bottom > viewportHeight - 20) {
              const scrollNeeded = buttonRect.bottom - (viewportHeight - 20);
              window.scrollBy({
                top: scrollNeeded,
                behavior: 'smooth'
              });
            }
          }
        }
      }, 500); // Wait 500ms for scroll animation and tooltip positioning to complete
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(storageKey, "true");
      
      if (status === STATUS.FINISHED && onComplete) {
        onComplete();
      } else if (status === STATUS.SKIPPED && onSkip) {
        onSkip();
      }
    }

    // Handle errors gracefully
    if (status === STATUS.ERROR) {
      console.warn("Tutorial step error:", data);
      // Continue to next step or finish
      setRun(false);
    }
  };

  if (!isActive || steps.length === 0) {
    return null;
  }

  return (
    <>
      {/* Inline styles for mobile button responsiveness and tooltip visibility */}
      <style>{`
        /* Ensure tooltip stays visible and within viewport - height auto based on content */
        .react-joyride__tooltip {
          position: fixed !important;
          z-index: 10001 !important;
          max-width: calc(100vw - 40px) !important;
          width: auto !important;
          height: auto !important;
          max-height: calc(100vh - 40px) !important;
          overflow: visible !important;
          margin: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
        }
        
        /* Ensure tooltip container fits content */
        .react-joyride__tooltip__container {
          position: relative !important;
          overflow: visible !important;
          display: flex !important;
          flex-direction: column !important;
          height: auto !important;
          min-height: auto !important;
          max-height: none !important;
        }
        
        /* Content area - no scrolling needed, just natural flow */
        .react-joyride__tooltip__container > div:first-child {
          overflow: visible !important;
          flex: 0 1 auto !important;
          height: auto !important;
          min-height: auto !important;
          max-height: none !important;
        }
        
        /* Button container at bottom */
        .react-joyride__tooltip__container > div:last-child {
          flex: 0 0 auto !important;
          margin-top: 16px !important;
          padding-top: 16px !important;
          padding-bottom: 0 !important;
          border-top: 1px solid rgba(168, 85, 247, 0.2) !important;
          position: relative !important;
          z-index: 10 !important;
          width: 100% !important;
        }
        
        /* Close button positioning - top right - EXACTLY like Ripple Card tutorial */
        .react-joyride__tooltip button[aria-label*="Close"],
        .react-joyride__tooltip button[aria-label*="close"],
        .react-joyride__tooltip button[class*="buttonClose"] {
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          z-index: 1000 !important;
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 50% !important;
          width: 28px !important;
          height: 28px !important;
          min-width: 28px !important;
          min-height: 28px !important;
          max-width: 28px !important;
          max-height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 1px solid rgba(107, 114, 128, 0.2) !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.2s !important;
          color: #6b7280 !important;
          cursor: pointer !important;
          font-size: 18px !important;
          line-height: 1 !important;
          outline: none !important;
          font-weight: 600 !important;
        }
        
        @media (min-width: 768px) {
          .react-joyride__tooltip button[aria-label*="Close"],
          .react-joyride__tooltip button[aria-label*="close"],
          .react-joyride__tooltip button[class*="buttonClose"] {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px !important;
            min-height: 30px !important;
            max-width: 30px !important;
            max-height: 30px !important;
          }
        }
        
        @media (min-width: 1024px) {
          .react-joyride__tooltip button[aria-label*="Close"],
          .react-joyride__tooltip button[aria-label*="close"],
          .react-joyride__tooltip button[class*="buttonClose"] {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            min-height: 32px !important;
            max-width: 32px !important;
            max-height: 32px !important;
          }
        }
        
        /* Force dark gray X text in close button - EXACTLY like Ripple Card - MAXIMUM PRIORITY */
        .react-joyride__tooltip button[aria-label*="Close"],
        .react-joyride__tooltip button[aria-label*="close"],
        .react-joyride__tooltip button[class*="buttonClose"],
        .react-joyride__tooltip [class*="buttonClose"],
        .react-joyride__tooltip [class*="close"],
        button[aria-label*="Close"],
        button[aria-label*="close"],
        [class*="react-joyride"] button[class*="buttonClose"],
        [class*="react-joyride"] button[aria-label*="Close"],
        .react-joyride__tooltip button[class*="buttonClose"] *,
        .react-joyride__tooltip button[aria-label*="Close"] *,
        .react-joyride__tooltip button[class*="buttonClose"]::before,
        .react-joyride__tooltip button[class*="buttonClose"]::after,
        .react-joyride__tooltip button[aria-label*="Close"]::before,
        .react-joyride__tooltip button[aria-label*="Close"]::after {
          color: #6b7280 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          line-height: 1 !important;
          text-align: center !important;
        }
        
        /* If close button has SVG, style it */
        .react-joyride__tooltip button[aria-label*="Close"] svg,
        .react-joyride__tooltip button[aria-label*="close"] svg,
        .react-joyride__tooltip button[class*="buttonClose"] svg,
        .react-joyride__tooltip button:has(svg[class*="Close"]) svg,
        .react-joyride__tooltip [class*="buttonClose"] svg,
        button[aria-label*="Close"] svg,
        button[aria-label*="close"] svg {
          color: #6b7280 !important;
          stroke: #6b7280 !important;
          fill: none !important;
          stroke-width: 2.5 !important;
          height: 16px !important;
          width: 16px !important;
        }
        
        @media (min-width: 768px) {
          .react-joyride__tooltip button[aria-label*="Close"] svg,
          .react-joyride__tooltip button[aria-label*="close"] svg,
          .react-joyride__tooltip button[class*="buttonClose"] svg {
            height: 17px !important;
            width: 17px !important;
          }
        }
        
        @media (min-width: 1024px) {
          .react-joyride__tooltip button[aria-label*="Close"] svg,
          .react-joyride__tooltip button[aria-label*="close"] svg,
          .react-joyride__tooltip button[class*="buttonClose"] svg {
            height: 18px !important;
            width: 18px !important;
          }
        }
        
        .react-joyride__tooltip button[aria-label*="Close"]:hover,
        .react-joyride__tooltip button[aria-label*="close"]:hover,
        .react-joyride__tooltip button[class*="buttonClose"]:hover {
          background: rgba(255, 255, 255, 1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          transform: scale(1.05) !important;
        }
        
        /* Make sure tooltip container itself doesn't clip */
        .react-joyride__tooltip,
        .react-joyride__tooltip * {
          box-sizing: border-box !important;
        }
        
        /* Ensure no parent is clipping the tooltip */
        body > div[class*="react-joyride"],
        body > div[id*="react-joyride"] {
          overflow: visible !important;
        }
        
        /* Ensure tutorial help buttons stay visible above overlay */
        button[title*="tour"],
        button[title*="Take a tour"],
        button[aria-label*="tour"],
        button:has(svg[class*="HelpCircle"]),
        a[href*="tour"] {
          z-index: 10002 !important;
          position: relative !important;
        }
        
        /* Ensure HelpCircle icon buttons are always visible */
        button svg[class*="HelpCircle"] {
          pointer-events: none;
        }
        
        /* Override any overlay that might cover tutorial buttons */
        .react-joyride__overlay {
          pointer-events: none !important;
        }
        
        .react-joyride__overlay ~ * button[title*="tour"],
        .react-joyride__overlay ~ * button:has(svg[class*="HelpCircle"]) {
          z-index: 10003 !important;
          position: relative !important;
        }
        
        /* Ensure all buttons are always fully visible (except close button) */
        .react-joyride__tooltip button:not([aria-label*="Close"]):not([aria-label*="close"]):not([class*="buttonClose"]),
        [class*="react-joyride"] button:not([aria-label*="Close"]):not([aria-label*="close"]):not([class*="buttonClose"]),
        [data-joyride] button:not([aria-label*="Close"]):not([aria-label*="close"]):not([class*="buttonClose"]),
        button[aria-label*="Next"],
        button[aria-label*="Back"],
        button[aria-label*="Skip"] {
          min-height: 44px !important;
          min-width: 80px !important;
          padding: 12px 20px !important;
          touch-action: manipulation !important;
          white-space: nowrap !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          visibility: visible !important;
          opacity: 1 !important;
          overflow: visible !important;
        }
        
        /* Button container - always visible at bottom */
        .react-joyride__tooltip > div:last-child,
        .react-joyride__tooltip__container > div:last-child,
        [class*="react-joyride"] > div:last-child,
        [data-joyride] > div:last-child {
          display: flex !important;
          flex-direction: row !important;
          gap: 12px !important;
          width: 100% !important;
          margin-top: 16px !important;
          padding-top: 16px !important;
          padding-bottom: 0 !important;
          flex-shrink: 0 !important;
          visibility: visible !important;
          overflow: visible !important;
          position: relative !important;
          z-index: 10 !important;
          background: transparent !important;
        }
        
        /* Remove margins between buttons */
        .react-joyride__tooltip button + button,
        [class*="react-joyride"] button + button {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        
        /* Ensure Skip button is visible */
        .react-joyride__tooltip button[aria-label*="Skip"],
        .react-joyride__tooltip button:has-text("Skip") {
          visibility: visible !important;
          display: inline-block !important;
          opacity: 1 !important;
        }
        
        @media (max-width: 767px) {
          /* Target all possible react-joyride button selectors */
          .react-joyride__tooltip button,
          [class*="react-joyride"] button,
          [data-joyride] button,
          button[aria-label*="Next"],
          button[aria-label*="Back"],
          button[aria-label*="Skip"] {
            width: 100% !important;
            flex: 1 1 0% !important;
            min-width: 0 !important;
            font-size: 16px !important;
          }
          
          /* Button container */
          .react-joyride__tooltip > div:last-child,
          .react-joyride__tooltip__container > div:last-child,
          [class*="react-joyride"] > div:last-child,
          [data-joyride] > div:last-child {
            flex-direction: row !important;
            gap: 8px !important;
          }
        }
        
        @media (max-width: 400px) {
          .react-joyride__tooltip > div:last-child,
          .react-joyride__tooltip__container > div:last-child,
          [class*="react-joyride"] > div:last-child {
            flex-direction: column !important;
          }
          
          .react-joyride__tooltip button {
            width: 100% !important;
          }
        }
      `}</style>
      <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress={false}
      showSkipButton
      disableOverlayClose={false}
      disableScrolling={false}
      scrollToFirstStep
      scrollOffset={200} // Increased offset to account for tooltip height and ensure visibility
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      styles={styles}
      locale={{
        back: "← Back",
        close: "✕",
        last: "🎉 Done!",
        next: "Next →",
        skip: "Skip",
      }}
      floaterProps={{
        disableAnimation: false,
        placement: "auto", // Auto-adjusts for mobile
        offset: 10, // Small offset from target
        styles: {
          arrow: {
            color: "#a855f7",
          },
        },
        options: {
          // Ensure tooltip stays within viewport with extra padding for buttons
          preventOverflow: {
            boundariesElement: 'viewport',
            padding: {
              top: 20,
              bottom: 120, // Extra padding at bottom to ensure buttons are visible
              left: 20,
              right: 20,
            },
          },
          flip: {
            enabled: true, // Allow flipping to opposite side
            behavior: ['top', 'bottom', 'left', 'right'],
          },
          // Keep tooltip in center if it would overflow
          shift: {
            enabled: true,
          },
        },
      }}
      // Mobile-specific props
      {...(isMobile && {
        disableScrolling: false,
        scrollOffset: 180, // Increased offset for mobile to account for tooltip
        spotlightPadding: 8,
      })}
      />
    </>
  );
};

export default JoyrideTutorial;
export type { Step };

