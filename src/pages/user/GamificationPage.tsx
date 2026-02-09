import React from 'react';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';

const GamificationPage: React.FC = () => {
  return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Earn & Unlock</h1>
          <p className="text-muted-foreground text-lg">
            Complete activities to earn points and unlock amazing badges!
          </p>
        </div>

        <GamificationDashboard />
      </div>
  );
};

export default GamificationPage;
