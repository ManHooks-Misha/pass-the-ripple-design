import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map } from "lucide-react";
import { ProfileHeader } from './ProfileHeader';
import { EngagementStats } from './EngagementStats';
import { ProfileDetailsTab } from './ProfileDetailsTab';
import { ActivityTab } from './ActivityTab';
import { ContentTab } from './ContentTab';
import { TimelineTab } from './TimelineTab';
import { JourneyTab } from './JourneyTab';
import { User, UserActivity } from '@/types/user';

interface ProfileViewProps {
  user: User;
  activity: UserActivity;
  onShare: (rippleId: string, nickname: string) => void;
  onCopyRippleId: (rippleId: string) => void;
  showQRCode?: boolean;
  showShareButtons?: boolean;
  showReferralInfo?: boolean;
  showJourneyTab?: boolean;
  visibleTabs?: ('details' | 'activity' | 'content' | 'timeline' | 'journey')[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  activity,
  onShare,
  onCopyRippleId,
  showQRCode = true,
  showShareButtons = true,
  showReferralInfo = true,
  showJourneyTab = true,
  visibleTabs = ['details', 'activity', 'content', 'timeline', 'journey']
}) => {
  const [activeTab, setActiveTab] = useState('details');

  // Utility functions
  const getFinalStatus = (user: User) => {
    if (user.is_delete === 1) return "deleted";
    if (user.is_block === 1) return "blocked";
    return "active";
  };

  const formatAgeGroup = (ageGroup: string | null) => {
    if (!ageGroup) return "Not specified";
    if (ageGroup === "above_13") return "13+ years";
    if (ageGroup === "below_13") return "Under 13";
    return ageGroup;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      {/* Profile Header */}
      <ProfileHeader
        user={user}
        onShare={onShare}
        onCopyRippleId={onCopyRippleId}
        showQRCode={showQRCode}
        showShareButtons={showShareButtons}
        formatAgeGroup={formatAgeGroup}
        getFinalStatus={getFinalStatus}
      />

      {/* Engagement Stats */}
      <EngagementStats activity={activity} />

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          <TabsList className="inline-flex w-auto min-w-full gap-1 sm:gap-2" style={{ gridTemplateColumns: visibleTabs.length <= 3 ? `repeat(${visibleTabs.length}, 1fr)` : undefined }}>
            {visibleTabs.includes('details') && (
              <TabsTrigger value="details" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 flex-shrink-0 whitespace-nowrap">
                Details
              </TabsTrigger>
            )}
            {visibleTabs.includes('activity') && (
              <TabsTrigger value="activity" className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 flex-shrink-0 whitespace-nowrap">
                Activity
              </TabsTrigger>
            )}
            {visibleTabs.includes('content') && (
              <TabsTrigger value="content" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 flex-shrink-0 whitespace-nowrap">
                Content
              </TabsTrigger>
            )}
            {visibleTabs.includes('timeline') && (
              <TabsTrigger value="timeline" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 flex-shrink-0 whitespace-nowrap">
                Timeline
              </TabsTrigger>
            )}
            {visibleTabs.includes('journey') && showJourneyTab && (
              <TabsTrigger value="journey" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 flex-shrink-0 whitespace-nowrap">
                <Map className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Journey
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Tab Contents */}
        {visibleTabs.includes('details') && (
          <TabsContent value="details" className="mt-4 sm:mt-6">
            <ProfileDetailsTab
              user={user}
              activity={activity}
              onShare={onShare}
              formatDate={formatDate}
              formatDateTime={formatDateTime}
              showReferralInfo={showReferralInfo}
            />
          </TabsContent>
        )}

        {visibleTabs.includes('activity') && (
          <TabsContent value="activity" className="mt-4 sm:mt-6">
            <ActivityTab activity={activity} formatDate={formatDate} />
          </TabsContent>
        )}

        {visibleTabs.includes('content') && (
          <TabsContent value="content" className="mt-4 sm:mt-6">
            <ContentTab activity={activity} formatDate={formatDate} />
          </TabsContent>
        )}

        {visibleTabs.includes('timeline') && (
          <TabsContent value="timeline" className="mt-4 sm:mt-6">
            <TimelineTab user={user} activity={activity} formatDate={formatDate} />
          </TabsContent>
        )}

        {visibleTabs.includes('journey') && showJourneyTab && (
          <TabsContent value="journey" className="mt-4 sm:mt-6">
            <JourneyTab user={user} isActive={activeTab === 'journey'} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};