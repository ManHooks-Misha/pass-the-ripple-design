import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

interface PointsData {
  total_points: number;
  current_points: number;
  lifetime_points: number;
}

/**
 * Hook to check for point changes and show notifications
 * Uses polling (checks every 30 seconds)
 */
export const usePointsNotification = () => {
  const { user } = useAuth();
  const [currentPoints, setCurrentPoints] = useState(0);
  const previousPoints = useRef(0);

  useEffect(() => {
    if (!user) return;

    const checkPoints = async () => {
      try {
        const response = await apiFetch<{ success: boolean; data: { points: PointsData } }>(
          '/user/gamification/dashboard'
        );

        if (response.success && response.data.points) {
          const newPoints = response.data.points.lifetime_points;
          setCurrentPoints(newPoints);

          // If points increased, show notification
          if (previousPoints.current > 0 && newPoints > previousPoints.current) {
            const pointsEarned = newPoints - previousPoints.current;
            toast.success(`+${pointsEarned} points earned!`, {
              description: 'Keep up the great work!',
              duration: 5000,
            });
          }

          previousPoints.current = newPoints;
        }
      } catch (error) {
        // Silent fail - don't spam user with errors
        console.error('Points check error:', error);
      }
    };

    // Initial check
    checkPoints();

    // Poll every 30 seconds
    const interval = setInterval(checkPoints, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  return { currentPoints };
};
