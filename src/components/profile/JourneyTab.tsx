import React, { useState, useEffect } from 'react';
import { Map } from "lucide-react";
import { DataCard } from '@/components/admin/DataCard';
import { useRippleJourney } from '@/hooks/useRippleJourney';
import RippleTree from '@/components/RippleTree';
import RippleTimeline from '@/components/RippleTimeline';
import { ErrorDisplay, LoadingSpinner } from '@/components/LoadingSpinner';
import { User } from '@/types/user';

interface JourneyTabProps {
  user: User;
  isActive: boolean;
}

export const JourneyTab: React.FC<JourneyTabProps> = ({ user, isActive }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { 
    data: rippleJourneyData, 
    loading: journeyLoading, 
    error: journeyError,
    refetch: refetchJourney
  } = useRippleJourney({ 
    rippleId: user?.ripple_id || null,
    immediate: false
  });

  useEffect(() => {
    if (isActive && user?.ripple_id && !rippleJourneyData && !shouldFetch) {
      setShouldFetch(true);
      refetchJourney(user.ripple_id);
    }
  }, [isActive, user?.ripple_id, rippleJourneyData, shouldFetch]);

  const handleNodeClick = (id: string) => {
    setSelectedId(id);
  };

  const handleStoryClick = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div>
      <DataCard
        title="Ripple Journey Map"
        icon={Map}
        description="Visual representation of kindness spreading across the network"
      >
      {!user.ripple_id ? (
        <div className="text-center py-16 text-gray-500">
          <Map className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold mb-2">No Ripple ID</p>
          <p className="text-sm text-gray-500">This user doesn't have a ripple journey yet</p>
        </div>
      ) : journeyLoading ? (
        <LoadingSpinner message="Loading ripple journey..." />
      ) : journeyError ? (
        <ErrorDisplay
          error={journeyError} 
          onRetry={() => window.location.reload()} 
        />
      ) : !rippleJourneyData ? (
        <div className="text-center py-16 text-gray-500">
          <Map className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold mb-2">No Journey Data</p>
          <p className="text-sm text-gray-500">No ripple journey data available for this user</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Journey Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700">{rippleJourneyData.nodes.length}</div>
              <div className="text-xs sm:text-sm text-purple-600 font-medium">Total Ripples</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700">{rippleJourneyData.edges.length}</div>
              <div className="text-xs sm:text-sm text-blue-600 font-medium">Connections</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700">{rippleJourneyData.totalDistance}</div>
              <div className="text-xs sm:text-sm text-green-600 font-medium">Distance Covered</div>
            </div>
          </div>

          {/* Journey Visualization */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
            <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
              <RippleTree
                data={rippleJourneyData}
                onNodeClick={handleNodeClick}
              />
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border-2 border-purple-200">
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
      )}
    </DataCard>
    </div>
  );
};