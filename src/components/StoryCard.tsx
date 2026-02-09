import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getIconByName } from "@/config/icons";
import { Star, Share2, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/imageUrl";
import { getUserDisplayName } from "@/utils/userDisplay";
import { UserAvatarOnly } from "./UserIdentity";
import { getPlainText } from "@/utils/textUtils";
import { ShareStoryDialog } from "./shared/ShareStoryDialog";
import { UserProfilePopup } from "./shared/UserProfilePopup";
import { useApplicationSettings } from "@/hooks/useSettingsGroups";
import defaultLogo from "@/assets/logo_new2.png";

interface StoryCardProps {
  story: any;
  showPreviewButton?: boolean; // Show preview button for My Stories page
  usePublicUrl?: boolean; // Force use of public URL (/story/{slug}) instead of /my-story/{slug}
}

export default function StoryCard({ story, showPreviewButton = false, usePublicUrl = false }: StoryCardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { settings: companySettings } = useApplicationSettings();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  
  // Get logo for fallback when story images are missing
  const logoUrl = getImageUrl((companySettings as any)?.header_logo, defaultLogo);

  // Use slug if available, otherwise fall back to ID
  const storyIdentifier = story.slug || story.id;

  // Check if story is anonymous - if is_anonymous is true (1), hide user info
  const anonymousValue = (story as any).is_anonymous ?? (story as any).anonymous;
  const isAnonymous = anonymousValue === true || anonymousValue === 1 || anonymousValue === "1" || anonymousValue === "true";

  // Get proper display name (nickname first, then full_name) - show "Anonymous" if story is anonymous
  const displayName = isAnonymous ? "Anonymous" : getUserDisplayName(story?.user, "Anonymous");

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareDialogOpen(true);
  };

  // Determine story URL:
  // - If usePublicUrl is true (public hero wall), always use /story/{slug}
  // - If showPreviewButton is true (My Stories page), use /my-story/{slug} for main link
  // - Otherwise, use /my-story/{slug} for logged-in users, /story/{slug} for others
  const storyUrl = usePublicUrl 
    ? `/story/${storyIdentifier}` 
    : (showPreviewButton || (user && user.role === "user"))
      ? `/my-story/${storyIdentifier}` 
      : `/story/${storyIdentifier}`;
  
  // Preview URL always uses public URL
  const previewUrl = `/story/${storyIdentifier}`;

  return (
    <>
      <Card className="shadow-elevated hover:shadow-glow transition-all duration-300 hover-scale h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
             {story.category ? (
                <Badge
                  variant="outline"
                  style={{
                    borderColor: story?.category?.color_code,
                    color: story?.category?.color_code
                  }}
                >
                  {(() => {
                    const IconComponent = getIconByName(story?.category?.icon) || Star;
                    return <IconComponent className="w-3 h-3" />;
                  })()}  {story?.category?.name || story.action_type}
                </Badge>
              ) : (story.action_type ? (
                  <Badge variant="outline" className="text-xs">
                    {story.action_type}
                  </Badge>
              ) : null)}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">
                {new Date(story.performed_at).toLocaleDateString()}
              </span>
              {showPreviewButton && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Preview Post
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAnonymous ? (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
              </div>
            ) : (
              <div
                className={`${story?.user?.is_profile_public ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} flex-shrink-0`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (story?.user?.id && story?.user?.is_profile_public) {
                    setShowProfilePopup(true);
                  }
                }}
              >
                <UserAvatarOnly
                  nickname={story?.user?.nickname}
                  full_name={story?.user?.full_name}
                  avatar_id={story?.user?.avatar_id}
                  custom_avatar={story?.user?.custom_avatar}
                  profile_image_path={story?.user?.profile_image_path}
                  profile_image_url={story?.user?.profile_image_url}
                  size="w-10 h-10"
                />
              </div>
            )}
            <div className="flex-1">
              <Link to={storyUrl} className="block">
                <CardTitle className="text-base leading-tight hover:text-primary transition-colors">
                  {story.title}
                </CardTitle>
              </Link>
              <CardDescription className="text-xs">
                by{" "}
                {isAnonymous ? (
                  <span className="font-medium">Anonymous</span>
                ) : story?.user?.is_profile_public ? (
                  <span
                    className="cursor-pointer hover:text-primary transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (story?.user?.id) {
                        setShowProfilePopup(true);
                      }
                    }}
                  >
                    {displayName}
                  </span>
                ) : (
                  <span className="font-medium">{displayName}</span>
                )}{" "}
                {!isAnonymous && (
                  <>
                    • {story?.user?.location?.city || story?.user?.location?.formatted_address || story?.location || "Unknown location"}
                    {story?.user?.class && story?.user?.is_profile_public && (
                      <> • {typeof story.user.class === 'string' ? story.user.class : story.user.class?.name || 'Class'}</>
                    )}
                  </>
                )}
              </CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-7 text-xs gap-1.5"
                onClick={handleShareClick}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to={storyUrl} className="block">
            <div className="aspect-[4/3] rounded-md border bg-muted/50 overflow-hidden cursor-pointer">
              <img
                src={story.photo_path ? getImageUrl(story.photo_path, 'submission') : logoUrl}
                alt={story.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          <Link to={storyUrl} className="block">
            <p className="text-sm leading-relaxed line-clamp-3 hover:text-primary transition-colors">
              {getPlainText(story.description)}
            </p>
          </Link>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>❤️ {story.likes_count}</span>
            <span className="flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              {story.shares_count} shares
            </span>
            <Link to={storyUrl} className="text-xs text-primary hover:underline">
              Read More →
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Share Dialog */}
      <ShareStoryDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        story={{ id: story.id, slug: story.slug, title: story.title }}
      />
      
      {/* User Profile Popup - Only show if not anonymous */}
      {!isAnonymous && story?.user?.id && story?.user?.is_profile_public && (
        <UserProfilePopup
          open={showProfilePopup}
          onOpenChange={setShowProfilePopup}
          userId={story.user.id}
          user={{
            id: story.user.id,
            nickname: story.user.nickname,
            full_name: story.user.full_name || null,
            avatar_id: story.user.avatar_id || null,
            profile_image_path: story.user.profile_image_path || null,
            profile_image_url: story.user.profile_image_url || null,
            is_profile_public: story.user.is_profile_public,
            location: story.user.location,
            class: story.user.class,
            day_streak: story.user.day_streak,
            total_ripples: story.user.total_ripples,
            badges: story.user.badges,
          }}
        />
      )}
    </>
  );
}
