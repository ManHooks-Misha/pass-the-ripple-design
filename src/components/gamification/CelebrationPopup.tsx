import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebrationData {
  points_earned: number;
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
}

interface CelebrationPopupProps {
  data: CelebrationData;
  onClose: () => void;
}

export const CelebrationPopup: React.FC<CelebrationPopupProps> = ({ data, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show confetti for certain celebration types
    if (['confetti-burst', 'fireworks'].includes(data.celebration.animation)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose, data.celebration.animation]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 500);
  };

  const getIcon = () => {
    if (data.badge_awarded) return <Trophy className="w-16 h-16 text-yellow-400" />;
    if (data.milestone_reached) return <Star className="w-16 h-16 text-purple-400" />;
    return <Zap className="w-16 h-16 text-blue-400" />;
  };

  const getGradient = () => {
    switch (data.celebration.type) {
      case 'badge':
        return 'from-yellow-500 to-orange-500';
      case 'milestone':
        return 'from-purple-500 to-pink-500';
      case 'mega':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={data.celebration.animation === 'fireworks' ? 300 : 200}
              recycle={false}
              gravity={0.3}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className={`bg-gradient-to-br ${getGradient()} rounded-3xl p-8 max-w-md w-full text-white text-center relative shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>

              {data.badge_awarded ? (
                <div className="space-y-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="flex justify-center"
                  >
                    {data.badge_awarded.icon ? (
                      <img
                        src={data.badge_awarded.icon}
                        alt={data.badge_awarded.name}
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      getIcon()
                    )}
                  </motion.div>

                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold"
                  >
                    {data.celebration.message}
                  </motion.h1>

                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg opacity-90"
                  >
                    {data.badge_awarded.description}
                  </motion.p>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                    className="flex justify-center"
                  >
                    {getIcon()}
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                    className="text-7xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent"
                  >
                    +{data.points_earned}
                  </motion.div>

                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-semibold"
                  >
                    {data.celebration.message}
                  </motion.h2>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg opacity-90"
                  >
                    Total: <span className="font-bold">{data.new_total}</span> points
                  </motion.div>

                  {data.activity_display_name && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm opacity-75"
                    >
                      {data.activity_display_name}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
