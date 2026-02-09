import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit2, Ban, Trash2 } from "lucide-react";
import { getPlainText } from '@/utils/textUtils';

// Avatar component with fallback to initials
const Avatar = ({ 
  src, 
  name, 
  size = "w-8 h-8" 
}: { 
  src?: string; 
  name: string; 
  size?: string; 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${size} rounded-full object-cover`}
        onError={(e) => {
          // If image fails to load, show initials
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${size} rounded-full ${getBackgroundColor(name)} flex items-center justify-center text-white font-medium text-sm">
                ${getInitials(name)}
              </div>
            `;
          }
        }}
      />
    );
  }

  return (
    <div className={`${size} rounded-full ${getBackgroundColor(name)} flex items-center justify-center text-white font-medium text-sm`}>
      {getInitials(name)}
    </div>
  );
};

type User = {
  id: number;
  email: string;
  nickname: string;
  full_name?: string | null;
  role: string;
  account_status: string;
  registration_status: string;
  ripple_id?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  created_at: string;
  last_active: string | null;
  // Legacy fields for backward compatibility
  age_group?: string | null;
  address?: string;
  is_block?: number;
  is_delete?: number;
};

type UserActivity = {
  rippleStories: number;
  postsLiked: number;
  comments: number;
  badgesEarned: number;
  challengesCompleted: number;
  accountCreatedBy: string;
  rippleJourney: any[];
  // Add detailed activity data
  recentLikes?: any[];
  recentComments?: any[];
  recentStories?: any[];
};


interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  loadingUser: boolean;
  userActivity: UserActivity;
  onEdit: () => void;
  onBlock: () => void;
  onDelete: () => void;
  getFinalStatus: (user: User) => string;
  formatAgeGroup: (ageGroup: string | null) => string;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  onOpenChange,
  selectedUser,
  loadingUser,
  userActivity,
  onEdit,
  onBlock,
  onDelete,
  getFinalStatus,
  formatAgeGroup
}) => {

  if (!selectedUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>User Profile Details</DialogTitle>
          <DialogDescription>Comprehensive user information and activity</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loadingUser ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading user details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <Avatar 
                    src={selectedUser.profile_image_path} 
                    name={selectedUser.nickname} 
                    size="w-16 h-16 sm:w-20 sm:h-20" 
                  />
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedUser.nickname}</h2>
                    <Badge variant={selectedUser.role === 'admin' ? 'default' : selectedUser.role === 'teacher' ? 'secondary' : 'outline'}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">{selectedUser.email}</p>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <Badge 
                      variant={getFinalStatus(selectedUser) === "active" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {getFinalStatus(selectedUser) === "active" ? "✓ Active" : "⚠ " + getFinalStatus(selectedUser)}
                    </Badge>
                    {selectedUser.ripple_id && (
                      <span className="text-sm text-gray-500 font-mono">
                        ID: {selectedUser.ripple_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="ripples">Ripples</TabsTrigger>
                  <TabsTrigger value="badges">Badges</TabsTrigger>
                  <TabsTrigger value="challenges">Challenges</TabsTrigger>
                  <TabsTrigger value="journey">Journey</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">User ID</Label>
                          <p className="text-sm font-mono text-gray-900">{selectedUser.id}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Nickname</Label>
                          <p className="text-sm text-gray-900">{selectedUser.nickname}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Email</Label>
                          <p className="text-sm text-gray-900">{selectedUser.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Age Group</Label>
                          <p className="text-sm text-gray-900">{formatAgeGroup(selectedUser.age_group)}</p>
                        </div>
                        {selectedUser.address && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Address</Label>
                            <p className="text-sm text-gray-900">{selectedUser.address}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Account Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Account Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Status</Label>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={getFinalStatus(selectedUser) === "active" ? "default" : "destructive"}
                            >
                              {getFinalStatus(selectedUser)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Registration Status</Label>
                          <p className="text-sm text-gray-900">{selectedUser.registration_status}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Role</Label>
                          <Badge variant="outline">{selectedUser.role}</Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Account Created By</Label>
                          <p className="text-sm text-gray-900">{userActivity.accountCreatedBy === 'teacher' ? 'Teacher' : 'Self Registration'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Activity Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          Activity Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Created At</Label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Last Active</Label>
                          <p className="text-sm text-gray-900">
                            {selectedUser.last_active 
                              ? new Date(selectedUser.last_active).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Never'
                            }
                          </p>
                        </div>
                        {selectedUser.ripple_id && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Ripple ID</Label>
                            <p className="text-sm font-mono text-gray-900">{selectedUser.ripple_id}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          Additional Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Account Type</Label>
                          <p className="text-sm text-gray-900">
                            {selectedUser.role === 'admin' ? 'Administrator' : 
                             selectedUser.role === 'teacher' ? 'Teacher' : 'Student'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Profile Image</Label>
                          <p className="text-sm text-gray-900">
                            {selectedUser.profile_image_path ? 'Available' : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Account Age</Label>
                          <p className="text-sm text-gray-900">
                            {Math.floor((new Date().getTime() - new Date(selectedUser.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Ripple Stories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{userActivity.rippleStories}</div>
                        <p className="text-xs text-gray-500">Stories shared</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Posts Liked</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{userActivity.postsLiked}</div>
                        <p className="text-xs text-gray-500">Posts liked</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Comments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{userActivity.comments}</div>
                        <p className="text-xs text-gray-500">Comments made</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Engagement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {userActivity.rippleStories + userActivity.postsLiked + userActivity.comments}
                        </div>
                        <p className="text-xs text-gray-500">Total interactions</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>User's recent platform activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Recent Likes */}
                        {userActivity.recentLikes && userActivity.recentLikes.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Likes ({userActivity.recentLikes.length})</h4>
                            <div className="space-y-2">
                              {userActivity.recentLikes.slice(0, 3).map((like, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{like.title}</p>
                                      <p className="text-xs text-gray-500">Liked on {new Date(like.liked_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{like.action_type}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Comments */}
                        {userActivity.recentComments && userActivity.recentComments.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Comments ({userActivity.recentComments.length})</h4>
                            <div className="space-y-2">
                              {userActivity.recentComments.slice(0, 3).map((comment, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm text-gray-900">{comment.comment_text}</p>
                                      <p className="text-xs text-gray-500">On: {comment.ripple_title}</p>
                                      <p className="text-xs text-gray-400">Commented on {new Date(comment.commented_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{comment.comment_status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Stories */}
                        {userActivity.recentStories && userActivity.recentStories.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Stories ({userActivity.recentStories.length})</h4>
                            <div className="space-y-2">
                              {userActivity.recentStories.slice(0, 3).map((story, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{story.title}</p>
                                      <p className="text-xs text-gray-500">{story.action_type}</p>
                                      <p className="text-xs text-gray-400">Created on {new Date(story.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1">
                                      <span className="text-xs text-gray-400">{story.status}</span>
                                      <div className="flex space-x-2 text-xs text-gray-500">
                                        <span>❤️ {story.likes_count}</span>
                                        <span>💬 {story.comments_count}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No Activity State */}
                        {(!userActivity.recentLikes || userActivity.recentLikes.length === 0) && 
                         (!userActivity.recentComments || userActivity.recentComments.length === 0) && 
                         (!userActivity.recentStories || userActivity.recentStories.length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            <p>No recent activity</p>
                            <p className="text-sm">This user hasn't been active recently</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Ripples Tab */}
                <TabsContent value="ripples" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Ripple Stories ({userActivity.rippleStories})
                      </CardTitle>
                      <CardDescription>Stories of kindness and positive impact</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userActivity.recentStories && userActivity.recentStories.length > 0 ? (
                        <div className="space-y-4">
                          {userActivity.recentStories.map((story, index) => (
                            <div 
                              key={index} 
                              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer hover:border-blue-400 hover:shadow-md"
                              onClick={() => {
                                // Open story detail page in new tab
                                const storyUrl = `/story/${story.id}`;
                                window.open(storyUrl, '_blank');
                              }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{story.title}</h3>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={story.status === 'approved' ? 'default' : 'secondary'}>
                                    {story.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{story.action_type}</span>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-3 line-clamp-2">{getPlainText(story.description)}</p>
                              
                              <div className="flex justify-between items-center text-sm text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <span>📅 {new Date(story.created_at).toLocaleDateString()}</span>
                                  <span>❤️ {story.likes_count} likes</span>
                                  <span>💬 {story.comments_count} comments</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {story.photo_path && (
                                    <span className="text-xs">📷 Has photo</span>
                                  )}
                                  <span className="text-xs">
                                    Performed: {new Date(story.performed_at).toLocaleDateString()}
                                  </span>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    Click to view
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No ripple stories yet</p>
                          <p className="text-sm">This user hasn't created any ripple stories</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Badges Tab */}
                <TabsContent value="badges" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        Badges Earned ({userActivity.badgesEarned})
                      </CardTitle>
                      <CardDescription>Achievements and recognition</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userActivity.badgesEarned > 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Badges will be displayed here</p>
                          <p className="text-sm">This would show all badges earned by the user</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No badges earned yet</p>
                          <p className="text-sm">This user hasn't earned any badges</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Challenges Tab */}
                <TabsContent value="challenges" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Challenges Completed ({userActivity.challengesCompleted})
                      </CardTitle>
                      <CardDescription>Completed challenges and goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userActivity.challengesCompleted > 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Challenges will be displayed here</p>
                          <p className="text-sm">This would show all challenges the user has completed</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No challenges completed yet</p>
                          <p className="text-sm">This user hasn't completed any challenges</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Journey Tab */}
                <TabsContent value="journey" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        Ripple Journey
                      </CardTitle>
                      <CardDescription>User's journey through the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Journey Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{userActivity.rippleStories}</div>
                            <div className="text-xs text-gray-600">Stories Created</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{userActivity.postsLiked}</div>
                            <div className="text-xs text-gray-600">Posts Liked</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{userActivity.comments}</div>
                            <div className="text-xs text-gray-600">Comments Made</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{userActivity.badgesEarned}</div>
                            <div className="text-xs text-gray-600">Badges Earned</div>
                          </div>
                        </div>

                        {/* Ripple Stories - Clickable */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ Ripple Stories</h3>
                          <p className="text-sm text-gray-600 mb-4">Click on any story to view it in a new tab</p>
                          <div className="space-y-3">
                            {userActivity.recentStories && userActivity.recentStories.length > 0 ? (
                              userActivity.recentStories.map((story) => (
                                <div 
                                  key={story.id}
                                  className="bg-white border rounded-lg p-4 shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                                  onClick={() => {
                                    // Open story detail page in new tab
                                    const storyUrl = `/story/${story.id}`;
                                    window.open(storyUrl, '_blank');
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white text-lg">
                                      📖
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-800 hover:text-blue-600">{story.title}</h4>
                                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                          {story.likes_count + story.comments_count} engagement
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">{story.action_type}</p>
                                      <p className="text-xs text-gray-500">
                                        {story.status} • {new Date(story.created_at).toLocaleDateString()}
                                      </p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                          📖 Story
                                        </span>
                                        {story.photo_path && (
                                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            📷 Has photo
                                          </span>
                                        )}
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                          Click to view
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <p>No ripple stories yet</p>
                                <p className="text-sm">This user hasn't created any ripple stories</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                          
                          {/* Account Creation Node */}
                          <div className="relative flex items-center mb-6">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                              ✓
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-800">Account Created</h3>
                                <p className="text-sm text-green-600">
                                  Joined the platform on {selectedUser ? new Date(selectedUser.created_at).toLocaleDateString() : 'Unknown date'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {selectedUser?.registration_status === 'completed' ? 'Registration completed' : 'Registration pending'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* First Story Node */}
                          {userActivity.recentStories && userActivity.recentStories.length > 0 && (
                            <div className="relative flex items-center mb-6">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                                1
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-blue-800">First Ripple Story</h3>
                                  <p className="text-sm text-blue-600">
                                    "{userActivity.recentStories[userActivity.recentStories.length - 1]?.title}"
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Created on {new Date(userActivity.recentStories[userActivity.recentStories.length - 1]?.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Milestone Nodes */}
                          {userActivity.rippleStories >= 5 && (
                            <div className="relative flex items-center mb-6">
                              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                                5
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-yellow-800">Story Milestone</h3>
                                  <p className="text-sm text-yellow-600">Created 5+ ripple stories</p>
                                  <p className="text-xs text-gray-500 mt-1">Making a positive impact!</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {userActivity.postsLiked >= 10 && (
                            <div className="relative flex items-center mb-6">
                              <div className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                                ❤️
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-pink-800">Engagement Milestone</h3>
                                  <p className="text-sm text-pink-600">Liked 10+ posts</p>
                                  <p className="text-xs text-gray-500 mt-1">Supporting the community!</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {userActivity.comments >= 5 && (
                            <div className="relative flex items-center mb-6">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                                💬
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-purple-800">Community Contributor</h3>
                                  <p className="text-sm text-purple-600">Made 5+ comments</p>
                                  <p className="text-xs text-gray-500 mt-1">Actively engaging with others!</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Current Status Node */}
                          <div className="relative flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                              🎯
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <h3 className="font-semibold text-indigo-800">Current Status</h3>
                                <p className="text-sm text-indigo-600">
                                  {userActivity.rippleStories} stories • {userActivity.postsLiked} likes • {userActivity.comments} comments
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Total engagement: {userActivity.rippleStories + userActivity.postsLiked + userActivity.comments} interactions
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 flex justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onEdit}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit User
            </Button>
            <Button
              variant="outline"
              onClick={onBlock}
            >
              <Ban className="h-4 w-4 mr-2" />
              {selectedUser.is_block === 1 ? "Unblock" : "Block"}
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {selectedUser.is_delete === 1 ? "Restore User" : "Delete User"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
