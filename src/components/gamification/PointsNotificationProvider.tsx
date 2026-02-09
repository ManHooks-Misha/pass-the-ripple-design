import React, { useEffect, useState, createContext, useContext } from 'react';
import echo from '@/lib/echo';
import { CelebrationPopup } from './CelebrationPopup';
import { toast } from 'sonner';

interface PointsNotification {
  points_earned: number;
  activity_name: string;
  activity_display_name: string;
  new_total: number;
  badge_awarded?: {
    id: number;
    name: string;
    icon: string;
    description: string;
  };
  milestone_reached?: {
    points: number;
    message: string;
  };
  celebration: {
    show: boolean;
    type: 'badge' | 'milestone' | 'mega' | 'big' | 'normal';
    message: string;
    animation: 'confetti-burst' | 'fireworks' | 'sparkle' | 'bounce';
  };
  timestamp: string;
}

interface PointsContextType {
  currentPoints: number;
  updatePoints: (newTotal: number) => void;
}

const PointsContext = createContext<PointsContextType>({
  currentPoints: 0,
  updatePoints: () => {},
});

export const usePoints = () => useContext(PointsContext);

interface PointsNotificationProviderProps {
  children: React.ReactNode;
  userId?: number;
}

export const PointsNotificationProvider: React.FC<PointsNotificationProviderProps> = ({
  children,
  userId,
}) => {
  const [celebrationData, setCelebrationData] = useState<PointsNotification | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0);

  useEffect(() => {
    if (!userId) return;

    console.log(`[Points] Listening on channel: user.${userId}`);

    // Listen for point awards
    const channel = echo.channel(`user.${userId}`);

    channel.listen('.points.awarded', (event: PointsNotification) => {
      console.log('[Points] Points awarded:', event);

      // Update current points
      setCurrentPoints(event.new_total);

      // Show celebration popup
      if (event.celebration?.show) {
        setCelebrationData(event);
      }

      // Show toast notification
      const toastMessage = event.badge_awarded
        ? `🎉 Badge Unlocked: ${event.badge_awarded.name}!`
        : `+${event.points_earned} points earned!`;

      toast.success(toastMessage, {
        description: event.activity_display_name,
        duration: 5000,
      });

      // Play sound (optional)
      try {
        const audio = new Audio('/sounds/point-earned.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio play errors
        });
      } catch (error) {
        // Sound not available
      }
    });

    return () => {
      console.log(`[Points] Leaving channel: user.${userId}`);
      echo.leaveChannel(`user.${userId}`);
    };
  }, [userId]);

  const updatePoints = (newTotal: number) => {
    setCurrentPoints(newTotal);
  };

  return (
    <PointsContext.Provider value={{ currentPoints, updatePoints }}>
      {children}
      {celebrationData && (
        <CelebrationPopup
          data={celebrationData}
          onClose={() => setCelebrationData(null)}
        />
      )}
    </PointsContext.Provider>
  );
};
