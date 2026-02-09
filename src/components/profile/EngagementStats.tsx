import React from 'react';
import { TrendingUp, BookOpen, Heart, MessageSquare } from "lucide-react";
import { UserActivity } from '@/types/user';

const StatsCard = ({ icon: Icon, label, value, color = "blue" }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex-shrink-0 p-1.5 sm:p-2 bg-white/50 rounded-lg">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        <div className="text-xs font-medium opacity-80 truncate">{label}</div>
      </div>
    </div>
  );
};

interface EngagementStatsProps {
  activity: UserActivity;
}

export const EngagementStats: React.FC<EngagementStatsProps> = ({ activity }) => {
  const totalEngagement = activity.rippleStories + activity.postsLiked + activity.comments;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <StatsCard icon={TrendingUp} label="Total Engagement" value={totalEngagement} color="blue" />
      <StatsCard icon={BookOpen} label="Ripple Stories" value={activity.rippleStories} color="purple" />
      <StatsCard icon={Heart} label="Likes Given" value={activity.postsLiked} color="green" />
      <StatsCard icon={MessageSquare} label="Comments" value={activity.comments} color="orange" />
    </div>
  );
};