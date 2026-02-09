import React from 'react';
import { Calendar, BookOpen, TrendingUp, Activity, Heart, MessageSquare } from "lucide-react";
import { DataCard } from '@/components/admin/DataCard';
import { User, UserActivity } from '@/types/user';

interface TimelineTabProps {
  user: User;
  activity: UserActivity;
  formatDate: (date: string) => string;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ user, activity, formatDate }) => {
  const totalEngagement = activity.rippleStories + activity.postsLiked + activity.comments;

  return (
    <div>
      <DataCard
        title="User Journey"
        icon={Activity}
        description="Timeline of milestones and activities"
      >
      <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 pt-2">
        <div className="absolute left-2 sm:left-2.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500"></div>
        
        {/* Account Creation */}
        <div className="relative">
          <div className="absolute -left-[1.25rem] sm:-left-[1.875rem] w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 sm:border-4 border-white shadow-md"></div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
              <h3 className="font-bold text-green-800 text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Account Created
              </h3>
              <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 sm:px-3 py-1 rounded-full">
                {formatDate(user.created_at)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 font-medium">
              Joined the Ripple Effect community
            </p>
          </div>
        </div>

        {/* First Story */}
        {activity.recentStories && activity.recentStories.length > 0 && (
          <div className="relative">
            <div className="absolute -left-[1.25rem] sm:-left-[1.875rem] w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 sm:border-4 border-white shadow-md"></div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
                <h3 className="font-bold text-blue-800 text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  First Story Published
                </h3>
                <span className="text-xs text-blue-700 font-semibold bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
                  {formatDate(activity.recentStories[activity.recentStories.length - 1].created_at)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-700 font-medium break-words">
                Shared their first ripple story: "{activity.recentStories[activity.recentStories.length - 1].title}"
              </p>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="relative">
          <div className="absolute -left-[1.25rem] sm:-left-[1.875rem] w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full border-2 sm:border-4 border-white shadow-md animate-pulse"></div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
              <h3 className="font-bold text-purple-800 text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Current Status
              </h3>
              <span className="text-xs text-purple-700 font-semibold bg-purple-100 px-2 sm:px-3 py-1 rounded-full">
                Active Now
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-purple-700 font-medium">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{activity.rippleStories} stories</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{activity.postsLiked} likes</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{activity.comments} comments</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{totalEngagement} total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataCard>
    </div>
  );
};