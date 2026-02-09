import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Hash, 
  Activity, 
  Calendar, 
  Clock, 
  Copy, 
  Share2,
  BookOpen,
  Heart,
  MessageSquare,
  Award,
  Target
} from "lucide-react";
import { DataCard } from '@/components/admin/DataCard';
import { User, UserActivity } from '@/types/user';

interface ProfileDetailsTabProps {
  user: User;
  activity: UserActivity;
  onShare: (rippleId: string, nickname: string) => void;
  formatDate: (date: string) => string;
  formatDateTime: (date: string) => string;
  showReferralInfo?: boolean;
}

const InfoItem = ({ icon: Icon, label, value }: { 
  icon?: React.ElementType; 
  label: string; 
  value: string | React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />}
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
    <div className="text-xs sm:text-sm text-gray-900 font-medium break-words">{value}</div>
  </div>
);

export const ProfileDetailsTab: React.FC<ProfileDetailsTabProps> = ({
  user,
  activity,
  onShare,
  formatDate,
  formatDateTime,
  showReferralInfo = true
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Account Information */}
      <DataCard 
        title="Account Information" 
        icon={Hash}
        description="User account details and status"
      >
        <div className="space-y-3 sm:space-y-4">
          <InfoItem 
            icon={Calendar} 
            label="Member Since" 
            value={formatDate(user.created_at)} 
          />
          <InfoItem 
            icon={Clock} 
            label="Last Active" 
            value={user.last_active ? formatDateTime(user.last_active) : 'Never'} 
          />
          <InfoItem 
            label="Registration Status" 
            value={
              <Badge variant={user.registration_status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                {user.registration_status}
              </Badge>
            } 
          />
          {showReferralInfo && (
            <>
              <InfoItem
                label="Account Referral By" 
                value={user?.referral_stats?.referred_by?.nickname || 'Self Registration'} 
              />
              {user?.referral_stats?.referred_by?.ripple_id && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 font-mono bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border break-all">
                    {user?.referral_stats?.referred_by?.ripple_id}
                  </span>
                  <Button 
                    onClick={() => onShare(
                      user?.referral_stats?.referred_by?.ripple_id!, 
                      user?.referral_stats?.referred_by?.nickname!
                    )} 
                    size="sm" 
                    variant="outline" 
                    className="h-7 sm:h-8 px-2 text-xs sm:text-sm"
                    title="Copy Ripple ID"
                  >
                    <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Button>
                  <Button 
                    onClick={() => onShare(
                      user?.referral_stats?.referred_by?.ripple_id!, 
                      user?.referral_stats?.referred_by?.nickname!
                    )} 
                    size="sm" 
                    variant="outline" 
                    className="h-7 sm:h-8 px-2 sm:px-3 gap-1 text-xs sm:text-sm"
                    title="Share Profile"
                  >
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DataCard>

      {/* Activity Summary */}
      <DataCard 
        title="Activity Summary" 
        icon={Activity}
        description="User engagement metrics"
      >
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Ripple Stories</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900">{activity.rippleStories}</span>
          </div>
          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Posts Liked</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900">{activity.postsLiked}</span>
          </div>
          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Comments Made</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900">{activity.comments}</span>
          </div>
          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Badges Earned</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900">{activity.badgesEarned}</span>
          </div>
          <div className="flex justify-between items-center py-2 sm:py-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Challenges Completed</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900">{activity.challengesCompleted}</span>
          </div>
        </div>
      </DataCard>
    </div>
  );
};