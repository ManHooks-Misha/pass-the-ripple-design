import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { TutorialStep } from "./DashboardTutorial";

interface KidFriendlyTutorialProps {
  steps: TutorialStep[];
  isActive: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

// Version: 2.0 - Enhanced responsive tutorial with scrollable content
const KidFriendlyTutorial = ({
  steps,
  isActive,
  onComplete,
  onSkip,
  storageKey = "dashboard_tutorial_completed",
}: KidFriendlyTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateTargetElement = useCallback((stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step || step.target === "body") {
      setTargetElement(null);
      return;
    }

    let retryCount = 0;
    const maxRetries = 15; // Increased retries for elements that take longer to render
    
    const findElement = () => {
      let element: HTMLElement | null = null;
      let targetId = '';
      
      const match = step.target.match(/data-tutorial-target="([^"]+)"/);
      if (match) {
        targetId = match[1];
      }

      if (targetId) {
        // First try direct query
        element = document.querySelector(`[data-tutorial-target="${targetId}"]`) as HTMLElement;
        
        // If not found, try all elements with that attribute
        if (!element) {
          const allElements = document.querySelectorAll(`[data-tutorial-target="${targetId}"]`);
          // For elements that appear multiple times (like student-actions), use the first visible one
          if (allElements.length > 0) {
            // Find the first visible element
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              const isVisible = rect.width > 0 && rect.height > 0 && 
                               rect.top >= 0 && rect.left >= 0 &&
                               rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                               rect.right <= (window.innerWidth || document.documentElement.clientWidth);
              
              if (isVisible || allElements.length === 1) {
                element = el as HTMLElement;
                break;
              }
            }
            // If no visible element found, use the first one anyway
            if (!element && allElements.length > 0) {
              element = allElements[0] as HTMLElement;
            }
          }
        }
      }

      if (element) {
        // Check if element is actually visible and has dimensions
        const rect = element.getBoundingClientRect();
        const isElementVisible = rect.width > 0 && rect.height > 0;
        
        if (isElementVisible) {
          setTargetElement(element);
          // Scroll element into view with better positioning
          requestAnimationFrame(() => {
            if (element) {
              // Check if element is in a scrollable container
              const scrollableParent = element.closest('[style*="overflow"], [class*="overflow"]');
              if (scrollableParent) {
                element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
              } else {
                element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
              }
              // Also ensure window scrolls if needed
              const updatedRect = element.getBoundingClientRect();
              if (updatedRect.top < 0 || updatedRect.bottom > window.innerHeight) {
                window.scrollTo({
                  top: window.scrollY + updatedRect.top - window.innerHeight / 2,
                  behavior: "smooth"
                });
              }
            }
          });
        } else if (retryCount < maxRetries) {
          // Element found but not visible yet, retry
          retryCount++;
          setTimeout(findElement, 200);
        } else {
          // Element not visible after retries, still set it (might be in dropdown)
          setTargetElement(element);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(findElement, 200);
      } else {
        // If element not found after retries, don't show overlay - just skip
        console.warn(`Tutorial target not found: ${step.target}`);
        setTargetElement(null);
      }
    };

    setTimeout(findElement, 200);
  }, [steps]);

  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
      // Give more time for elements to render, especially for dynamic content
      setTimeout(() => updateTargetElement(0), 500);
    } else {
      setTargetElement(null);
    }
  }, [isActive, updateTargetElement]);
  
  // Update target element when step changes
  useEffect(() => {
    if (isActive && currentStep >= 0) {
      // Give more time for elements to render
      setTimeout(() => updateTargetElement(currentStep), 500);
    }
  }, [currentStep, isActive, updateTargetElement]);

  // State to force re-render on scroll/resize for responsive positioning
  const [positionKey, setPositionKey] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isScrolling, setIsScrolling] = useState(false); // Flag to prevent updates during programmatic scroll

  // Update viewport size on mount and resize - CRITICAL for mobile
  // Debounced to prevent shaking/jittering
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const updateViewport = () => {
      // Always use window.innerWidth/innerHeight - most reliable
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Only update if size actually changed (prevents unnecessary re-renders)
      setViewportSize(prev => {
        if (prev.width === width && prev.height === height) {
          return prev; // No change, don't update
        }
        return { width, height };
      });
    };
    
    // Debounced resize handler to prevent shaking
    const debouncedUpdateViewport = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateViewport, 150); // Debounce by 150ms
    };
    
    // Initialize immediately
    if (typeof window !== 'undefined') {
      updateViewport();
      // Also update after delays to catch any layout shifts
      setTimeout(updateViewport, 50);
      setTimeout(updateViewport, 200);
      
      window.addEventListener("resize", debouncedUpdateViewport, { passive: true });
      window.addEventListener("orientationchange", updateViewport);
      // Use visual viewport for mobile if available, but debounced
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", debouncedUpdateViewport);
        // Don't listen to scroll on visualViewport - causes too many updates
      }
      
      return () => {
        clearTimeout(resizeTimeout);
        window.removeEventListener("resize", debouncedUpdateViewport);
        window.removeEventListener("orientationchange", updateViewport);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener("resize", debouncedUpdateViewport);
        }
      };
    }
  }, []);

  // CRITICAL: Ensure body/html don't clip the tutorial popup
  useEffect(() => {
    if (!isActive) return;
    
    // Store original values
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalHtmlPosition = document.documentElement.style.position;
    
    // Force visible overflow to prevent clipping
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';
    document.body.style.position = 'relative';
    document.documentElement.style.position = 'relative';
    
    return () => {
      // Restore original values
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalBodyPosition;
      document.documentElement.style.position = originalHtmlPosition;
    };
  }, [isActive]);

  // Update target element position on window resize, scroll, and orientation change
  useEffect(() => {
    if (!isActive) return;

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      // Debounce resize to prevent shaking
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        // Only update positionKey if size actually changed significantly
        setPositionKey(prev => prev + 1);
        if (targetElement) {
          updateTargetElement(currentStep);
        }
      }, 200); // Debounce resize by 200ms
    };

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // Don't update during programmatic scroll to prevent multiple re-renders
      if (isScrolling) return;
      
      // Throttle scroll updates more aggressively to prevent shaking
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Only update positionKey on significant scroll changes
        setPositionKey(prev => prev + 1);
        if (targetElement) {
          // Re-find element to get fresh position
          const step = steps[currentStep];
          if (step && step.target !== "body") {
            let targetId = '';
            const match = step.target.match(/data-tutorial-target="([^"]+)"/);
            if (match) {
              targetId = match[1];
            } else {
              targetId = step.id.replace("button-", "").replace("sidebar-", "");
            }
            
            const element = document.querySelector(`[data-tutorial-target="${targetId}"]`) as HTMLElement;
            if (element) {
              setTargetElement(element);
            }
          }
        }
      }, 100); // Throttle scroll by 100ms
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    // Also listen to scroll on document and body
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    
    return () => {
      clearTimeout(resizeTimeout);
      clearTimeout(scrollTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("scroll", handleScroll, { capture: true });
      document.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isActive, targetElement, currentStep, updateTargetElement, steps, isScrolling]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      const nextStep = steps[nextStepIndex];
      
      // Set scrolling flag to prevent multiple re-renders during scroll
      setIsScrolling(true);
      
      // Check if next step is a sidebar/menu item
      const isNextStepSidebar = nextStep && typeof nextStep.target === 'string' && 
        (nextStep.target.includes('sidebar-') || nextStep.target.includes('menu-') || nextStep.id?.startsWith('sidebar-'));
      
      // Only scroll to top if the next step targets "body" (center popup)
      // For sidebar items, don't scroll - keep popup at bottom
      if (nextStep && nextStep.target === "body") {
        // CRITICAL: Scroll to top FIRST - scroll all the way to top (0)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        if (document.body) {
          document.body.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (isNextStepSidebar) {
        // For sidebar items, prevent scrolling - keep viewport stable
        // Don't scroll to element, just update the target
      }
      
      // Update step immediately
      setCurrentStep(nextStepIndex);
      
      // Wait for scroll to complete (if needed), then update target element
      setTimeout(() => {
        // Update target element - but skip scrolling for sidebar items
        if (!isNextStepSidebar) {
          updateTargetElement(nextStepIndex);
        } else {
          // For sidebar items, just find the element without scrolling
          const step = steps[nextStepIndex];
          if (step && step.target !== "body") {
            let targetId = '';
            const match = step.target.match(/data-tutorial-target="([^"]+)"/);
            if (match) {
              targetId = match[1];
            } else {
              targetId = step.id?.replace("button-", "").replace("sidebar-", "") || '';
            }
            
            const element = document.querySelector(`[data-tutorial-target="${targetId}"]`) as HTMLElement;
            if (element) {
              setTargetElement(element);
            }
          }
        }
        
        // After a short delay, re-enable scroll listeners
        setTimeout(() => {
          // Re-enable scroll listeners
          setIsScrolling(false);
        }, nextStep && nextStep.target === "body" ? 600 : isNextStepSidebar ? 100 : 300); // Shorter delay for sidebar items
      }, 100);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      
      // Set scrolling flag to prevent multiple re-renders during scroll
      setIsScrolling(true);
      
      // CRITICAL: Scroll to top FIRST - scroll all the way to top (0)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      if (document.body) {
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Update step immediately
      setCurrentStep(prevStepIndex);
      
      // Wait for scroll to complete, then update target element
      setTimeout(() => {
        // Update target element
        updateTargetElement(prevStepIndex);
        
        // After a short delay, re-enable scroll listeners and ensure we're at top
        setTimeout(() => {
          // Ensure we're still at top
          window.scrollTo({ top: 0, behavior: 'auto' });
          document.documentElement.scrollTo({ top: 0, behavior: 'auto' });
          if (document.body) {
            document.body.scrollTo({ top: 0, behavior: 'auto' });
          }
          
          // Re-enable scroll listeners
          setIsScrolling(false);
        }, 600); // Wait for smooth scroll to complete
      }, 100);
    }
  };

  const completeTutorial = () => {
    setTargetElement(null);
    localStorage.setItem(storageKey, "true");
    if (onComplete) onComplete();
  };

  const skipTutorial = () => {
    setTargetElement(null);
    localStorage.setItem(storageKey, "true");
    if (onSkip) onSkip();
  };

  const getHighlightPosition = () => {
    if (!targetElement) return { display: "none" };
    try {
      const rect = targetElement.getBoundingClientRect();
      // Check if element is actually visible
      if (rect.width === 0 && rect.height === 0) {
        return { display: "none" };
      }
      return {
        top: `${rect.top + window.scrollY - 8}px`,
        left: `${rect.left + window.scrollX - 8}px`,
        width: `${rect.width + 16}px`,
        height: `${rect.height + 16}px`,
        position: 'absolute' as const,
      };
    } catch {
      return { display: "none" };
    }
  };

  const getTooltipPosition = () => {
    const step = steps[currentStep];
    // Get actual window dimensions - ALWAYS use directly
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const h = typeof window !== 'undefined' ? window.innerHeight : 768;
    const isMobile = w < 768;
    const isIPad = w >= 768 && w < 1024;
    const isSmallMobile = w < 400;
    
    // Check if this is a sidebar/menu item - always use bottom-centered positioning
    const isSidebarItem = step?.target && typeof step.target === 'string' && 
      (step.target.includes('sidebar-') || step.target.includes('menu-') || step.id?.startsWith('sidebar-'));
    
    // If no target element or target is body, always center
    if (!targetElement || !step || step.target === "body") {
      const margin = isSmallMobile ? 10 : isMobile ? 15 : 20;
      const buttonH = isSmallMobile ? 80 : isMobile ? 90 : 100;
      const width = isSmallMobile 
        ? 'calc(100vw - 20px)' 
        : isMobile 
        ? 'calc(100vw - 30px)' 
        : isIPad
        ? 'calc(100vw - 80px)'
        : 'min(90vw, 500px)';
      
      return {
        bottom: isMobile || isIPad ? `${margin}px` : undefined,
        top: isMobile || isIPad ? 'auto' : '50%',
        left: '50%',
        right: 'auto',
        transform: isMobile || isIPad ? 'translate(-50%, 0)' : 'translate(-50%, -50%)',
        width: width,
        maxWidth: width,
        maxHeight: `${h - margin * 2 - buttonH}px`,
        boxSizing: 'border-box',
      };
    }
    
    // FOR SIDEBAR/MENU ITEMS: ALWAYS USE BOTTOM-CENTERED POSITIONING (like mobile/iPad)
    // This prevents the popup from moving down when clicking Next
    if (isSidebarItem) {
      const margin = isSmallMobile ? 10 : isMobile ? 15 : isIPad ? 20 : 20;
      const buttonH = isSmallMobile ? 80 : isMobile ? 90 : isIPad ? 100 : 100;
      
      let width, maxW;
      if (isSmallMobile) {
        width = "calc(100vw - 20px)";
        maxW = "calc(100vw - 20px)";
      } else if (isMobile) {
        width = "calc(100vw - 30px)";
        maxW = "calc(100vw - 30px)";
      } else if (isIPad) {
        width = "calc(100vw - 80px)";
        maxW = "calc(100vw - 80px)";
      } else {
        // Desktop - still use bottom-centered for sidebar items
        width = "min(90vw, 500px)";
        maxW = "min(90vw, 500px)";
      }
      
      return {
        bottom: `${margin}px`,
        left: "50%",
        right: "auto",
        transform: "translate(-50%, 0)",
        width: width,
        maxWidth: maxW,
        maxHeight: `${h - margin - buttonH - margin}px`,
        top: 'auto',
        boxSizing: 'border-box',
      };
    }
    
    // FOR MOBILE AND IPAD: ALWAYS CENTER - NO EXCEPTIONS
    if (isMobile || isIPad) {
      const margin = isSmallMobile ? 10 : isMobile ? 15 : 20;
      const buttonH = isSmallMobile ? 80 : isMobile ? 90 : 100; // Button area height
      
      // CRITICAL: Width must NEVER exceed viewport - use smaller safe values
      let width, maxW;
      if (isSmallMobile) {
        width = "calc(100vw - 20px)";
        maxW = "calc(100vw - 20px)";
      } else if (isMobile) {
        width = "calc(100vw - 30px)";
        maxW = "calc(100vw - 30px)"; // CRITICAL: Don't use fixed 360px, use viewport-based
      } else {
        // iPad - ensure it fits
        width = "calc(100vw - 80px)";
        maxW = "calc(100vw - 80px)"; // CRITICAL: Don't use fixed 500px, use viewport-based
      }
      
      // CRITICAL: Use bottom positioning to ensure buttons are ALWAYS visible
      // Reserve space for buttons (100px) + bottom margin (20px) = 120px
      return {
        bottom: `${margin}px`,
        left: "50%",
        right: "auto",
        transform: "translate(-50%, 0)",
        width: width,
        maxWidth: maxW,
        maxHeight: `${h - margin - buttonH - margin}px`, // Viewport - top margin - buttons - bottom margin
        top: 'auto',
        boxSizing: 'border-box', // CRITICAL: Include borders in width
      };
    }
    
    // DESKTOP ONLY: Complex positioning logic (only runs on desktop)
    const isDesktop = w >= 1024;
    
    // DESKTOP: Handle body/center targets or when targetElement is null
    if (!step || !targetElement || step.target === "body") {
      const margin = 20;
      const headerHeight = 80;
      const buttonHeight = 100; // Increased to ensure buttons are visible
      const contentHeight = 200; // Reduced to fit better
      const estimatedModalHeight = headerHeight + contentHeight + buttonHeight;
      const safeHeight = h;
      // Ensure buttons are always visible - don't let popup go below viewport
      const maxTop = Math.max(margin, safeHeight - estimatedModalHeight - margin - 10); // Extra 10px safety
      const centerTop = Math.max(margin, Math.min(safeHeight / 2 - estimatedModalHeight / 2, maxTop));
      
      return { 
        top: `${centerTop}px`, 
        left: "50%", 
        transform: "translate(-50%, 0)",
        width: "90%",
        maxWidth: `min(90vw, 380px)`, // CRITICAL: Never exceed viewport
        maxHeight: `${Math.min(estimatedModalHeight, safeHeight - margin * 2)}px`,
      };
    }

    // DESKTOP: Handle positioned targets
    const rect = targetElement.getBoundingClientRect();
    const position = step.position || "bottom";
    
    // DESKTOP: Calculate dimensions - CRITICAL: Never exceed viewport
    const tooltipWidth = Math.min(380, w - 40); // CRITICAL: Ensure it fits viewport
    const headerHeight = 80;
    const buttonHeight = 90;
    const margin = 20;
    const bottomMargin = margin + buttonHeight;
    const safeHeight = h;
    const tooltipMaxHeight = safeHeight - margin - bottomMargin;
    const contentMaxHeight = tooltipMaxHeight - headerHeight;
    const spacing = 30;
    const viewportHeight = safeHeight;
    const viewportWidth = w;
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    
    // Calculate total modal height (header + content + buttons)
    const estimatedModalHeight = headerHeight + Math.min(200, contentMaxHeight) + buttonHeight;

    // Check if target is in bottom half of screen - if so, position popup above it
    const targetBottom = rect.bottom;
    const targetTop = rect.top;
    const targetCenter = rect.top + rect.height / 2;
    const isTargetInBottomHalf = targetCenter > viewportHeight / 2;
    const spaceBelow = viewportHeight - targetBottom;
    const spaceAbove = targetTop;

    switch (position) {
      case "bottom":
        // If target is in bottom half or not enough space below, position popup above
        if (isTargetInBottomHalf || spaceBelow < estimatedModalHeight + spacing) {
          // Position above target
          const topAbove = targetTop + scrollY - estimatedModalHeight - spacing;
          const maxTopAbove = scrollY + margin;
          const finalTopAbove = Math.max(maxTopAbove, topAbove);
          
          return {
            top: `${finalTopAbove}px`,
            left: "50%",
            transform: "translate(-50%, 0)",
            maxHeight: `${tooltipMaxHeight}px`,
            width: `${tooltipWidth}px`,
            maxWidth: `min(90vw, ${tooltipWidth}px)`,
            boxSizing: 'border-box',
          };
        } else {
          // Position below target
          const topBelow = targetBottom + scrollY + spacing;
          const maxTopBelow = scrollY + viewportHeight - estimatedModalHeight - margin;
          const finalTopBelow = Math.min(maxTopBelow, topBelow);
          
          return {
            top: `${finalTopBelow}px`,
            left: "50%",
            transform: "translate(-50%, 0)",
            maxHeight: `${tooltipMaxHeight}px`,
            width: `${tooltipWidth}px`,
            maxWidth: `min(90vw, ${tooltipWidth}px)`,
            boxSizing: 'border-box',
          };
        }
      case "right":
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + spacing;
        
        // CRITICAL: Ensure modal never goes below viewport - buttons must be visible
        const maxTopForRight = scrollY + viewportHeight - estimatedModalHeight - margin;
        const rightTop = Math.max(margin, Math.min(top, maxTopForRight));
        
        // Desktop: if right side doesn't fit, show on left or center
        if (left + tooltipWidth > viewportWidth - margin) {
          // Try left side
          const leftPos = rect.left + scrollX - spacing - tooltipWidth;
          if (leftPos >= margin) {
            return {
              top: `${rightTop}px`,
              left: `${Math.max(margin, leftPos)}px`,
              transform: "translate(-100%, -50%)",
              maxHeight: `${tooltipMaxHeight}px`,
              width: `${tooltipWidth}px`,
              maxWidth: `min(90vw, ${tooltipWidth}px)`, // CRITICAL: Never exceed viewport
              boxSizing: 'border-box',
            };
          }
          // If left doesn't fit either, position above target
          const topAbove = targetTop + scrollY - estimatedModalHeight - spacing;
          const maxTopAbove = scrollY + margin;
          const finalTopAbove = Math.max(maxTopAbove, topAbove);
          return {
            top: `${finalTopAbove}px`,
            left: "50%",
            transform: "translate(-50%, 0)",
            maxHeight: `${tooltipMaxHeight}px`,
            width: `${tooltipWidth}px`,
            maxWidth: `min(90vw, ${tooltipWidth}px)`,
            boxSizing: 'border-box',
          };
        }
        
        return {
          top: `${rightTop}px`,
          left: `${Math.min(viewportWidth - tooltipWidth - margin, Math.max(margin, left))}px`,
          transform: "translate(0, -50%)",
          maxHeight: `${tooltipMaxHeight}px`,
          width: `${tooltipWidth}px`,
          maxWidth: `min(90vw, ${tooltipWidth}px)`, // CRITICAL: Never exceed viewport
          boxSizing: 'border-box',
        };
      case "left":
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - spacing;
        
        // CRITICAL: Ensure modal never goes below viewport - buttons must be visible
        const maxTopForLeft = scrollY + viewportHeight - estimatedModalHeight - margin;
        const leftTop = Math.max(margin, Math.min(top, maxTopForLeft));
        
        // Desktop: if left side doesn't fit, show on right or center
        if (left - tooltipWidth < margin) {
          // Try right side
          const rightPos = rect.right + scrollX + spacing;
          if (rightPos + tooltipWidth <= viewportWidth - margin) {
            return {
              top: `${leftTop}px`,
              left: `${Math.min(viewportWidth - tooltipWidth - margin, Math.max(margin, rightPos))}px`,
              transform: "translate(0, -50%)",
              maxHeight: `${tooltipMaxHeight}px`,
              width: `${tooltipWidth}px`,
              maxWidth: `min(90vw, ${tooltipWidth}px)`, // CRITICAL: Never exceed viewport
            };
          }
          // If right doesn't fit either, center it
          return {
            top: `${leftTop}px`,
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: `${tooltipMaxHeight}px`,
            width: `${tooltipWidth}px`,
            maxWidth: "90vw",
          };
        }
        return {
          top: `${leftTop}px`,
          left: `${Math.max(margin, left - tooltipWidth)}px`,
          transform: "translate(-100%, -50%)",
          maxHeight: `${tooltipMaxHeight}px`,
          width: `${tooltipWidth}px`,
          maxWidth: "90vw",
        };
      case "bottom":
        top = rect.bottom + scrollY + spacing;
        left = rect.left + scrollX + rect.width / 2;
        
        // CRITICAL: Ensure modal never goes below viewport - buttons must be visible
        const maxTopForBottom = scrollY + viewportHeight - estimatedModalHeight - margin;
        
        // Desktop: center horizontally
        const bottomLeft = `${Math.max(tooltipWidth / 2 + margin, Math.min(left, viewportWidth - tooltipWidth / 2 - margin))}px`;
        
        // If tooltip would go below viewport (including buttons), show above instead
        if (top + estimatedModalHeight > scrollY + viewportHeight - margin) {
          top = rect.top + scrollY - spacing;
          // Ensure it doesn't go above viewport either
          const finalTop = Math.max(margin, Math.min(top - estimatedModalHeight, maxTopForBottom));
          return {
            top: `${finalTop}px`,
            left: bottomLeft,
            transform: "translate(-50%, -100%)",
            maxHeight: `${tooltipMaxHeight}px`,
            width: `${tooltipWidth}px`,
            maxWidth: "90vw",
          };
        }
        
        // Ensure buttons are always visible - never let modal go below viewport
        const finalBottomTop = Math.min(maxTopForBottom, top);
        return {
          top: `${Math.max(margin, finalBottomTop)}px`,
          left: bottomLeft,
          transform: "translate(-50%, 0)",
          maxHeight: `${tooltipMaxHeight}px`,
          width: `${tooltipWidth}px`,
          maxWidth: "90vw",
        };
      case "top":
        top = rect.top + scrollY - spacing;
        left = rect.left + scrollX + rect.width / 2;
        
        // CRITICAL: Ensure modal never goes below viewport - buttons must be visible
        const maxTopForTop = scrollY + viewportHeight - estimatedModalHeight - margin;
        
        // If tooltip would go above viewport, show below instead
        if (top - estimatedModalHeight < scrollY + margin) {
          top = rect.bottom + scrollY + spacing;
          // Ensure buttons are always visible
          const finalTop = Math.min(maxTopForTop, top);
          return {
            top: `${Math.max(margin, finalTop)}px`,
            left: `${Math.max(tooltipWidth / 2 + margin, Math.min(left, viewportWidth - tooltipWidth / 2 - margin))}px`,
            transform: "translate(-50%, 0)",
            maxHeight: `${tooltipMaxHeight}px`,
            width: `${tooltipWidth}px`,
            maxWidth: "90vw",
          };
        }
        
        // Ensure buttons are always visible - never let modal go below viewport
        const finalTopTop = Math.min(maxTopForTop, top - estimatedModalHeight);
        return {
          top: `${Math.max(margin, finalTopTop)}px`,
          left: `${Math.max(tooltipWidth / 2 + margin, Math.min(left, viewportWidth - tooltipWidth / 2 - margin))}px`,
          transform: "translate(-50%, -100%)",
          maxHeight: `${tooltipMaxHeight}px`,
          width: `${tooltipWidth}px`,
          maxWidth: "90vw",
        };
      default:
        // Center position - ensure buttons are always visible
        const centerTop = Math.max(margin, Math.min(
          scrollY + viewportHeight / 2 - estimatedModalHeight / 2,
          scrollY + viewportHeight - estimatedModalHeight - margin
        ));
        return { 
          top: `${centerTop}px`, 
          left: "50%", 
          transform: "translate(-50%, 0)",
          maxHeight: `${tooltipMaxHeight}px`,
          width: `${tooltipWidth}px`,
          maxWidth: "90vw",
        };
    }
  };

  const currentStepData = steps[currentStep];
  if (!isActive || !currentStepData || !mounted || !steps || steps.length === 0) return null;
  
  // Check if current step is a body/center step (always show overlay and popup)
  const isBodyStep = currentStepData.target === "body";
  
  // CRITICAL: Ensure popup always renders - if target element not found, treat as body step
  const shouldCenterPopup = isBodyStep || !targetElement;

  const tutorialContent = (
    <>
      {/* Global styles to ensure tutorial popup is ALWAYS visible */}
      <style>{`
        /* CRITICAL: Force tutorial popup to be visible - highest priority */
        body > div[data-reactroot],
        body > #root > div,
        body > div:last-child,
        #root,
        body {
          overflow: visible !important;
        }
        
        /* CRITICAL: Target tutorial popup directly - FORCE viewport constraints */
        [data-tutorial-popup="true"] {
          max-width: min(calc(100vw - 20px), 500px) !important;
          width: min(calc(100vw - 20px), 500px) !important;
          left: 50% !important;
          transform: translate(-50%, 0) !important;
          transform-origin: center bottom !important;
          right: 10px !important;
          box-sizing: border-box !important;
          overflow: visible !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          /* Prevent shaking/jittering */
          will-change: transform !important;
          backface-visibility: hidden !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
        
        /* Responsive overrides for different screen sizes - CRITICAL for mobile */
        
        /* Small Mobile (< 400px) */
        @media (max-width: 399px) {
          [data-tutorial-popup="true"] {
            width: calc(100vw - 20px) !important;
            max-width: calc(100vw - 20px) !important;
            left: 50% !important;
            right: auto !important;
            transform: translate(-50%, 0) !important;
            bottom: 10px !important;
            top: auto !important;
            max-height: calc(100vh - 20px) !important;
          }
        }
        
        /* Mobile (400px - 767px) */
        @media (min-width: 400px) and (max-width: 767px) {
          [data-tutorial-popup="true"] {
            width: calc(100vw - 30px) !important;
            max-width: calc(100vw - 30px) !important;
            left: 50% !important;
            right: auto !important;
            transform: translate(-50%, 0) !important;
            bottom: 15px !important;
            top: auto !important;
            max-height: calc(100vh - 30px) !important;
          }
        }
        
        /* iPad (768px - 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          [data-tutorial-popup="true"] {
            width: calc(100vw - 80px) !important;
            max-width: 500px !important;
            left: 50% !important;
            right: auto !important;
            transform: translate(-50%, 0) !important;
            transform-origin: center bottom !important;
            bottom: 20px !important;
            top: auto !important;
            max-height: calc(100vh - 40px) !important;
            /* Prevent shaking/jittering on iPad */
            will-change: transform !important;
            backface-visibility: hidden !important;
            perspective: 1000px !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            /* Force stable positioning */
            position: fixed !important;
            transition: none !important;
          }
        }
        
        /* Desktop (>= 1024px) - ensure it doesn't exceed viewport */
        @media (min-width: 1024px) {
          [data-tutorial-popup="true"] {
            max-width: min(90vw, 500px) !important;
            box-sizing: border-box !important;
          }
        }
        
        /* Ensure popup is always visible on mobile */
        @media (max-width: 1023px) {
          [data-tutorial-popup="true"] {
            position: fixed !important;
            z-index: 99999 !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        }
        
        /* Ensure tutorial popup container is always visible */
        body > div:has(> div[data-tutorial-popup]),
        body > div:has(> div[style*="z-index: 99999"]),
        body > div:has(> div[style*="zIndex: 99999"]) {
          overflow: visible !important;
          clip: auto !important;
          clip-path: none !important;
        }
        
        /* CRITICAL: Ensure tutorial popup inner container never exceeds parent */
        [data-tutorial-popup="true"] > div {
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        
        /* CRITICAL: Ensure tutorial popup buttons are ALWAYS visible - but don't override their styles */
        [data-tutorial-popup="true"] button {
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* CRITICAL: Force close button styling - white circular button with dark gray X - ONLY target close button */
        [data-tutorial-popup="true"] button[aria-label*="Close"],
        [data-tutorial-popup="true"] button[aria-label*="close"],
        [data-tutorial-popup="true"] button.tutorial-close-button,
        [data-tutorial-popup="true"] > div > div:first-child > div:last-child > button,
        .tutorial-close-button,
        button.tutorial-close-button {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(107, 114, 128, 0.2) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          border-radius: 50% !important;
          padding: 0 !important;
          margin: 0 !important;
          color: #6b7280 !important;
        }
        
        /* Force dark gray X icon in close button - ONLY target close button */
        [data-tutorial-popup="true"] button[aria-label*="Close"] svg,
        [data-tutorial-popup="true"] button[aria-label*="close"] svg,
        [data-tutorial-popup="true"] button.tutorial-close-button svg,
        [data-tutorial-popup="true"] > div > div:first-child > div:last-child > button svg,
        .tutorial-close-button svg,
        button.tutorial-close-button svg {
          color: #6b7280 !important;
          stroke: #6b7280 !important;
          fill: none !important;
        }
        
        /* Hover state for close button - ONLY target close button */
        [data-tutorial-popup="true"] button[aria-label*="Close"]:hover,
        [data-tutorial-popup="true"] button[aria-label*="close"]:hover,
        [data-tutorial-popup="true"] button.tutorial-close-button:hover,
        .tutorial-close-button:hover,
        button.tutorial-close-button:hover {
          background: rgba(255, 255, 255, 1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Override any text-white or other color classes on close button */
        [data-tutorial-popup="true"] button.tutorial-close-button.text-white,
        .tutorial-close-button.text-white {
          color: #6b7280 !important;
        }
        
        [data-tutorial-popup="true"] button.tutorial-close-button.text-white svg,
        .tutorial-close-button.text-white svg {
          color: #6b7280 !important;
          stroke: #6b7280 !important;
        }
        
        /* Ensure popup container doesn't clip buttons */
        [data-tutorial-popup="true"] > div > div:last-child,
        [class*="tutorial"] > div:last-child,
        [class*="tutorial"] [class*="button"],
        div[style*="z-index: 99999"] > div {
          overflow: visible !important;
          clip: auto !important;
          clip-path: none !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* Force all parent containers to not clip */
        * {
          contain: none !important;
        }
        
        /* Specific override for any Dialog or Modal that might interfere */
        [role="dialog"],
        [data-radix-portal],
        [data-radix-dialog-overlay] {
          z-index: 99997 !important;
        }
      `}</style>
      
      {/* Overlay - Always show when tutorial is active */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 99998 }}
      />

      {/* Big colorful highlight box around target */}
      {targetElement && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed pointer-events-none"
          style={{
            ...getHighlightPosition(),
            zIndex: 99999,
            border: '6px solid',
            borderColor: '#a855f7',
            borderRadius: '16px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(168, 85, 247, 0.6)',
          }}
        >
          {/* Pulsing glow effect */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(168, 85, 247, 0.8)',
                '0 0 40px rgba(168, 85, 247, 0.4)',
                '0 0 20px rgba(168, 85, 247, 0.8)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-xl"
          />
          
        </motion.div>
      )}

      {/* Simple, colorful tooltip - ALWAYS RENDER */}
      <motion.div
        key={`tooltip-${currentStep}`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        // Prevent layout shifts that cause shaking
        layout={false}
        className="fixed pointer-events-auto"
        data-tutorial-popup="true"
        style={{
          zIndex: 99999,
          position: 'fixed',
          // Prevent shaking/jittering on iPad
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          display: 'flex',
          flexDirection: 'column',
          visibility: 'visible',
          opacity: 1,
          // CRITICAL: Always ensure popup fits within viewport
          // Use viewportSize state for responsive calculations
          ...(() => {
            const currentWidth = viewportSize.width || window.innerWidth;
            const currentHeight = viewportSize.height || window.innerHeight;
            const isMobile = currentWidth < 768;
            const isIPad = currentWidth >= 768 && currentWidth < 1024;
            const isSmallMobile = currentWidth < 400;
            
            // If no target element found OR it's a body step, always center the popup
            if (shouldCenterPopup) {
              if (currentWidth < 1024) {
                const margin = isSmallMobile ? 10 : isMobile ? 15 : 20;
                const width = isSmallMobile 
                  ? 'calc(100vw - 20px)' 
                  : isMobile 
                  ? 'calc(100vw - 30px)' 
                  : 'calc(100vw - 80px)';
                
                return {
                  left: '50%',
                  right: 'auto',
                  transform: 'translate(-50%, 0)',
                  bottom: `${margin}px`,
                  top: 'auto',
                  width: width,
                  maxWidth: width,
                  maxHeight: `${currentHeight - margin * 2}px`,
                  overflow: 'visible',
                  boxSizing: 'border-box',
                  marginLeft: 0,
                  marginRight: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                };
              } else {
                // Desktop: center
                const width = Math.min(500, currentWidth - 40);
                return {
                  top: '50%',
                  left: '50%',
                  right: 'auto',
                  transform: 'translate(-50%, -50%)',
                  width: `${width}px`,
                  maxWidth: `${width}px`,
                  maxHeight: `${currentHeight - 40}px`,
                  overflow: 'visible',
                  boxSizing: 'border-box',
                  marginLeft: 0,
                  marginRight: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                };
              }
            }
            
            // FORCE mobile/iPad: Always center and use bottom positioning
            if (currentWidth < 1024) {
              const margin = isSmallMobile ? 10 : isMobile ? 15 : 20;
              const width = isSmallMobile 
                ? 'calc(100vw - 20px)' 
                : isMobile 
                ? 'calc(100vw - 30px)' 
                : 'calc(100vw - 80px)';
              
              return {
                left: '50%',
                right: 'auto',
                transform: 'translate(-50%, 0)',
                bottom: `${margin}px`,
                top: 'auto',
                width: width,
                maxWidth: width,
                maxHeight: `${currentHeight - margin * 2}px`,
                overflow: 'visible',
                boxSizing: 'border-box',
                marginLeft: 0,
                marginRight: 0,
                paddingLeft: 0,
                paddingRight: 0,
              };
            }
            
            // Desktop positioning with target element
            // CRITICAL: If targetElement is null or not found, always center the popup
            if (!targetElement || shouldCenterPopup) {
              const width = Math.min(500, currentWidth - 40);
              return {
                top: '50%',
                left: '50%',
                right: 'auto',
                transform: 'translate(-50%, -50%)',
                width: `${width}px`,
                maxWidth: `${width}px`,
                maxHeight: `${currentHeight - 40}px`,
                overflow: 'visible',
                boxSizing: 'border-box',
                marginLeft: 0,
                marginRight: 0,
                paddingLeft: 0,
                paddingRight: 0,
              };
            }
            
            // Try to get position from getTooltipPosition, but have fallback
            try {
              const pos = getTooltipPosition();
              const tooltipW = typeof pos.width === 'string' 
                ? parseInt(pos.width) || 380 
                : (typeof pos.width === 'number' ? pos.width : 380);
              const maxW = Math.min(tooltipW, currentWidth - 40);
              const leftPos = typeof pos.left === 'string' 
                ? pos.left 
                : `${Math.max(10, Math.min(typeof pos.left === 'number' ? pos.left : 0, currentWidth - maxW - 10))}px`;
              
              return {
                ...pos,
                maxHeight: `${Math.min(currentHeight - 40, window.innerHeight - 40)}px`,
                // CRITICAL: Ensure desktop popup never exceeds viewport width
                maxWidth: `${maxW}px`,
                width: `${maxW}px`,
                // Ensure it doesn't overflow
                overflow: 'visible',
                boxSizing: 'border-box',
                // CRITICAL: Ensure left position never causes overflow
                left: leftPos,
                right: 'auto', // Ensure right doesn't interfere
                marginLeft: 0,
                marginRight: 0,
                paddingLeft: 0,
                paddingRight: 0,
              };
            } catch (error) {
              // Fallback to center if getTooltipPosition fails
              console.warn('Error getting tooltip position, centering popup:', error);
              const width = Math.min(500, currentWidth - 40);
              return {
                top: '50%',
                left: '50%',
                right: 'auto',
                transform: 'translate(-50%, -50%)',
                width: `${width}px`,
                maxWidth: `${width}px`,
                maxHeight: `${currentHeight - 40}px`,
                overflow: 'visible',
                boxSizing: 'border-box',
                marginLeft: 0,
                marginRight: 0,
                paddingLeft: 0,
                paddingRight: 0,
              };
            }
          })(),
        } as React.CSSProperties}
      >
        <div 
          className="shadow-2xl border-4 border-purple-400 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-lg flex flex-col"
          style={{ 
            width: '100%',
            maxWidth: '100%', // CRITICAL: Never exceed parent width
            display: 'flex',
            flexDirection: 'column',
            // CRITICAL: Use maxHeight to ensure it fits viewport, allow scrolling
            maxHeight: (viewportSize.width || window.innerWidth) < 1024 
              ? `${(viewportSize.height || window.innerHeight) - 40}px` 
              : `${Math.min((viewportSize.height || window.innerHeight) - 40, window.innerHeight - 40)}px`,
            overflow: 'hidden', // Hide overflow on container
            boxSizing: 'border-box', // CRITICAL: Include border in width calculation
            // Border width for mobile/iPad
            ...((viewportSize.width || window.innerWidth) < 400 ? { 
              borderWidth: '2px',
            } : (viewportSize.width || window.innerWidth) < 1024 ? { 
              borderWidth: '3px',
            } : {}),
          }}
        >
          {/* Fixed Header - Never scrolls - Responsive */}
          <div 
            className="pb-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-t-lg flex-shrink-0 relative"
            style={{ 
              flexShrink: 0,
              padding: (viewportSize.width || window.innerWidth) < 400 ? '12px' : (viewportSize.width || window.innerWidth) < 768 ? '14px' : (viewportSize.width || window.innerWidth) < 1024 ? '16px' : '20px',
              position: 'relative',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="flex-shrink-0"
                  style={{ fontSize: (viewportSize.width || window.innerWidth) < 400 ? '20px' : (viewportSize.width || window.innerWidth) < 768 ? '24px' : '28px' }}
                >
                  ⭐
                </motion.div>
                <h3 
                  className="font-bold text-white truncate"
                  style={{ 
                    fontSize: (viewportSize.width || window.innerWidth) < 400 ? '16px' : (viewportSize.width || window.innerWidth) < 768 ? '18px' : (viewportSize.width || window.innerWidth) < 1024 ? '20px' : '24px',
                    lineHeight: '1.2',
                  }}
                >
                  {currentStepData.title}
                </h3>
              </div>
              <button
                onClick={skipTutorial}
                className="tutorial-close-button"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  zIndex: 1000,
                  height: (viewportSize.width || window.innerWidth) < 400 ? '28px' : (viewportSize.width || window.innerWidth) < 768 ? '30px' : '32px',
                  width: (viewportSize.width || window.innerWidth) < 400 ? '28px' : (viewportSize.width || window.innerWidth) < 768 ? '30px' : '32px',
                  minWidth: (viewportSize.width || window.innerWidth) < 400 ? '28px' : (viewportSize.width || window.innerWidth) < 768 ? '30px' : '32px',
                  maxWidth: (viewportSize.width || window.innerWidth) < 400 ? '28px' : (viewportSize.width || window.innerWidth) < 768 ? '30px' : '32px',
                  padding: 0,
                  margin: 0,
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  outline: 'none',
                  visibility: 'visible',
                  opacity: 1,
                  pointerEvents: 'auto',
                }}
                aria-label="Close tutorial"
                type="button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <X 
                  style={{ 
                    height: (viewportSize.width || window.innerWidth) < 400 ? '16px' : (viewportSize.width || window.innerWidth) < 768 ? '17px' : '18px', 
                    width: (viewportSize.width || window.innerWidth) < 400 ? '16px' : (viewportSize.width || window.innerWidth) < 768 ? '17px' : '18px',
                    strokeWidth: 2.5,
                    color: '#6b7280',
                    stroke: '#6b7280',
                    fill: 'none',
                    pointerEvents: 'none',
                  }} 
                />
              </button>
            </div>
          </div>
          
          {/* Scrollable content area - ONLY this scrolls - Responsive */}
          <div 
            className="overflow-y-auto overflow-x-hidden flex-1"
            style={{
              flex: '1 1 0%', // Take remaining space
              minHeight: 0, // Critical for flex scrolling
              WebkitOverflowScrolling: 'touch',
              padding: (viewportSize.width || window.innerWidth) < 400 ? '12px' : (viewportSize.width || window.innerWidth) < 768 ? '16px' : (viewportSize.width || window.innerWidth) < 1024 ? '20px' : '24px',
            }}
          >
            <div className="space-y-3 sm:space-y-4">
              <p 
                className="text-gray-800 leading-relaxed"
                style={{
                  fontSize: (viewportSize.width || window.innerWidth) < 400 ? '14px' : (viewportSize.width || window.innerWidth) < 768 ? '15px' : (viewportSize.width || window.innerWidth) < 1024 ? '16px' : '18px',
                  lineHeight: '1.6',
                }}
              >
                {currentStepData.description}
              </p>

              {/* Big progress dots - Responsive */}
              <div className="flex items-center justify-center gap-2 py-2 sm:py-3 flex-wrap">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: index === currentStep ? 1.3 : index < currentStep ? 1 : 0.8,
                      backgroundColor: index === currentStep 
                        ? '#a855f7' 
                        : index < currentStep 
                        ? '#c084fc' 
                        : '#e9d5ff',
                    }}
                    className="rounded-full transition-colors"
                    style={{
                      width: (viewportSize.width || window.innerWidth) < 400 ? '8px' : (viewportSize.width || window.innerWidth) < 768 ? '10px' : '12px',
                      height: (viewportSize.width || window.innerWidth) < 400 ? '8px' : (viewportSize.width || window.innerWidth) < 768 ? '10px' : '12px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Fixed buttons at bottom - NEVER scrolls, ALWAYS visible - Responsive */}
          <div 
            className="flex items-center justify-between border-t-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-b-lg"
            style={{
              flexShrink: 0, // Never shrink
              flexGrow: 0, // Never grow
              width: '100%',
              maxWidth: '100%', // CRITICAL: Never exceed parent
              backgroundColor: 'inherit',
              boxSizing: 'border-box', // CRITICAL: Include padding in width
              gap: (viewportSize.width || window.innerWidth) < 400 ? '8px' : (viewportSize.width || window.innerWidth) < 768 ? '12px' : '16px',
              padding: (viewportSize.width || window.innerWidth) < 400 ? '12px' : (viewportSize.width || window.innerWidth) < 768 ? '14px' : (viewportSize.width || window.innerWidth) < 1024 ? '16px' : '20px',
            }}
          >
            {currentStep === 0 ? (
              <Button
                variant="ghost"
                size="lg"
                onClick={skipTutorial}
                className="flex-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                style={{ 
                  fontSize: (viewportSize.width || window.innerWidth) < 400 ? '14px' : (viewportSize.width || window.innerWidth) < 768 ? '16px' : '18px',
                  fontWeight: 'medium',
                  minWidth: 0,
                  flex: '1 1 0%',
                  boxSizing: 'border-box',
                  height: (viewportSize.width || window.innerWidth) < 400 ? '44px' : (viewportSize.width || window.innerWidth) < 768 ? '48px' : (viewportSize.width || window.innerWidth) < 1024 ? '52px' : '56px',
                  padding: (viewportSize.width || window.innerWidth) < 400 ? '8px 12px' : (viewportSize.width || window.innerWidth) < 768 ? '10px 16px' : '12px 20px',
                }}
              >
                <span>Skip</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={previousStep}
                className="flex-1 border-3 border-purple-400 hover:bg-purple-100 bg-white shadow-md"
                style={{ 
                  borderWidth: (viewportSize.width || window.innerWidth) < 400 ? '2px' : '3px',
                  fontSize: (viewportSize.width || window.innerWidth) < 400 ? '14px' : (viewportSize.width || window.innerWidth) < 768 ? '16px' : '18px',
                  fontWeight: 'bold',
                  minWidth: 0, // CRITICAL: Allow flex shrinking
                  flex: '1 1 0%', // CRITICAL: Equal flex distribution
                  boxSizing: 'border-box',
                  height: (viewportSize.width || window.innerWidth) < 400 ? '44px' : (viewportSize.width || window.innerWidth) < 768 ? '48px' : (viewportSize.width || window.innerWidth) < 1024 ? '52px' : '56px',
                  padding: (viewportSize.width || window.innerWidth) < 400 ? '8px 12px' : (viewportSize.width || window.innerWidth) < 768 ? '10px 16px' : '12px 20px',
                }}
              >
                <ChevronLeft style={{ 
                  height: (viewportSize.width || window.innerWidth) < 400 ? '18px' : (viewportSize.width || window.innerWidth) < 768 ? '20px' : '24px',
                  width: 'auto',
                  marginRight: (viewportSize.width || window.innerWidth) < 400 ? '4px' : '8px',
                }} />
                <span>Back</span>
              </Button>
            )}
            <Button
              onClick={nextStep}
              size="lg"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg border-0"
              style={{ 
                fontSize: (viewportSize.width || window.innerWidth) < 400 ? '14px' : (viewportSize.width || window.innerWidth) < 768 ? '16px' : '18px',
                fontWeight: 'bold',
                minWidth: 0, // CRITICAL: Allow flex shrinking
                flex: '1 1 0%', // CRITICAL: Equal flex distribution
                boxSizing: 'border-box',
                height: (viewportSize.width || window.innerWidth) < 400 ? '44px' : (viewportSize.width || window.innerWidth) < 768 ? '48px' : (viewportSize.width || window.innerWidth) < 1024 ? '52px' : '56px',
                padding: (viewportSize.width || window.innerWidth) < 400 ? '8px 12px' : (viewportSize.width || window.innerWidth) < 768 ? '10px 16px' : '12px 20px',
              }}
            >
              <span>
                {currentStep === steps.length - 1 ? "🎉 Done!" : "Next"}
              </span>
              {currentStep < steps.length - 1 && (
                <ChevronRight style={{ 
                  height: (viewportSize.width || window.innerWidth) < 400 ? '18px' : (viewportSize.width || window.innerWidth) < 768 ? '20px' : '24px',
                  width: 'auto',
                  marginLeft: (viewportSize.width || window.innerWidth) < 400 ? '4px' : '8px',
                }} />
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );

  // CRITICAL: Always render to body with portal to ensure highest z-index
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(tutorialContent, document.body);
  }
  return tutorialContent;
};

export default KidFriendlyTutorial;

