import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Heart, Calendar, Activity } from "lucide-react";
import { DataCard } from '@/components/admin/DataCard';
import { UserActivity } from '@/types/user';

interface ActivityTabProps {
  activity: UserActivity;
  formatDate: (date: string) => string;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ activity, formatDate }) => {
  return (
    <div>
      <DataCard
        title="Recent Activity"
        icon={Activity}
        description="Latest interactions and engagement on the platform"
      >
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-1 sm:gap-2">
          <TabsTrigger value="comments" className="text-xs sm:text-sm px-2 sm:px-4">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Comments</span>
            <span className="sm:hidden">Comments</span>
            <span className="ml-1">({activity.recentComments?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="likes" className="text-xs sm:text-sm px-2 sm:px-4">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Likes</span>
            <span className="sm:hidden">Likes</span>
            <span className="ml-1">({activity.recentLikes?.length || 0})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
          {activity.recentComments && activity.recentComments.length > 0 ? (
            activity.recentComments.slice(0, 5).map((comment, index) => (
              <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                  <p className="text-xs sm:text-sm text-gray-900 font-medium flex-1 break-words">{comment.comment_text}</p>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {comment.comment_status}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs text-gray-600">
                  <span className="font-medium break-words">On: {comment.ripple_title}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(comment.commented_at)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base font-medium">No comments yet</p>
              <p className="text-xs mt-1">This user hasn't commented on any posts</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="likes" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
          {activity.recentLikes && activity.recentLikes.length > 0 ? (
            activity.recentLikes.slice(0, 5).map((like, index) => (
              <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                  <p className="text-xs sm:text-sm text-gray-900 font-medium flex-1 break-words">{like.title}</p>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    Liked
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs text-gray-600">
                  <span className="font-medium break-words">{like.action_type}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(like.liked_at)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base font-medium">No likes yet</p>
              <p className="text-xs mt-1">This user hasn't liked any posts</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DataCard>
    </div>
  );
};