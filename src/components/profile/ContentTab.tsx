import React from 'react';
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar } from "lucide-react";
import { DataCard } from '@/components/admin/DataCard';
import { UserActivity } from '@/types/user';
import { getPlainText } from '@/utils/textUtils';

interface ContentTabProps {
  activity: UserActivity;
  formatDate: (date: string) => string;
}

export const ContentTab: React.FC<ContentTabProps> = ({ activity, formatDate }) => {
  return (
    <div>
      <DataCard
        title={`Ripple Stories (${activity.rippleStories})`}
        icon={BookOpen}
        description="Stories of kindness shared by this user"
      >
      {activity.recentStories && activity.recentStories.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {activity.recentStories.map((story, index) => (
            <div 
              key={index} 
              className="group p-3 sm:p-5 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer bg-white"
              onClick={() => window.open(`/story/${story.id}`, '_blank')}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 break-words">
                  {story.title}
                </h3>
                <Badge variant={story.status === 'approved' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                  {story.status}
                </Badge>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{getPlainText(story.description)}</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-2 sm:pt-3 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1 sm:gap-1.5 font-medium">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {formatDate(story.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    ❤️ {story.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {story.comments_count || 0}
                  </span>
                </div>
                {story.photo_path && (
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                    📷 Has Photo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 text-gray-500">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <p className="text-base sm:text-lg font-semibold mb-2">No Stories Yet</p>
          <p className="text-xs sm:text-sm text-gray-500">This user hasn't created any ripple stories</p>
        </div>
      )}
    </DataCard>
    </div>
  );
};