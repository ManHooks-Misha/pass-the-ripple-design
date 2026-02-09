import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Waves,
  MapPin,
  Calendar,
  ChevronLeft,
  Send,
  Smile,
  Star,
  Share2,
  X,
  MessageCircle,
  Mail,
  Link2,
  Facebook,
  Twitter,
  Instagram,
  MessageCircleDashed
} from "lucide-react";
import { apiFetch } from "@/config/api";
import story1 from "@/assets/story1.jpg";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useAuth } from "@/context/AuthContext";
import { getIconByName } from "@/config/icons";
import { useToast } from "@/components/ui/use-toast";
import { getImageUrl } from "@/utils/imageUrl";
import { UserAvatarOnly } from "@/components/UserIdentity";
import { getPlainText } from "@/utils/textUtils";
import { getUserDisplayName } from "@/utils/userDisplay";
import { UserProfilePopup } from "@/components/shared/UserProfilePopup";

interface User {
  id: number;
  nickname: string;
  full_name: string | null;
  avatar: string | null;
  profile_image_path?: string | null;
  avatar_id?: number | null;
  custom_avatar?: string | null;
  profile_image_url?: string | null;
  is_profile_public?: boolean;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    formatted_address?: string;
  } | null;
  class?: string | {
    id: number;
    name: string;
    grade?: string;
    section?: string;
  } | null;
  day_streak?: number;
  total_ripples?: number;
  badges?: Array<{
    id: number;
    name: string;
    description: string;
    icon: string | null;
    earned_at: string;
  }>;
}

interface Category {
  id: number;
  name: string;
  code: string;
}

interface Comment {
  id: number;
  user: User;
  body: string;
  created_at: string;
  likes_count?: number;
}

interface Story {
  id: number;
  slug: string;
  title: string;
  description: string;
  photo_path: string | null;
  action_type: string;
  performed_at_formatted: string;
  user: User;
  category?: Category;
  is_featured: boolean;
  location?: string;
  anonymous?: boolean;
  is_anonymous?: boolean;
}

interface SeoMetaTags {
  title: string;
  description: string;
  url: string;
  image: string;
  'og:type': string;
  'og:title': string;
  'og:description': string;
  'og:url': string;
  'og:image': string;
  'twitter:card': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  [key: string]: string;
}

interface JsonLd {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image: string;
  [key: string]: any;
}

interface UserInteractions {
  has_liked: boolean;
  has_shared: boolean;
}

// Share platform options
const SHARE_PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircleDashed,
    color: 'bg-green-500 hover:bg-green-600',
    description: 'Share via WhatsApp'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Share on Facebook'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500 hover:bg-sky-600',
    description: 'Share on Twitter'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-600 hover:bg-pink-700',
    description: 'Share on Instagram'
  },
  {
    id: 'messenger',
    name: 'Messenger',
    icon: MessageCircle,
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Share via Messenger'
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700',
    description: 'Share via Email'
  },
  {
    id: 'copy',
    name: 'Copy Link',
    icon: Link2,
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Copy story link'
  },
  {
    id: 'other',
    name: 'Other',
    icon: Share2,
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'Other platforms'
  }
];

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [story, setStory] = useState<Story | null>(null);
  const [stats, setStats] = useState({ likes_count: 0, shares_count: 0, comments_count: 0 });
  const [comments, setComments] = useState<Comment[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seoMeta, setSeoMeta] = useState<SeoMetaTags | null>(null);
  const [jsonLd, setJsonLd] = useState<JsonLd | null>(null);

  // User interaction states
  const [hasLiked, setHasLiked] = useState(false);
  const [hasRippled, setHasRippled] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);
  const [togglingRipple, setTogglingRipple] = useState(false);
  const isSubmittingCommentRef = useRef(false);
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingPlatform, setSharingPlatform] = useState<string | null>(null);
  
  // Profile popup state
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    nickname: string;
    full_name?: string | null;
    avatar_id?: number | null;
    profile_image_path?: string | null;
    profile_image_url?: string | null;
    is_profile_public?: boolean;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      formatted_address?: string;
    } | null;
    class?: string | {
      id: number;
      name: string;
      grade?: string;
      section?: string;
    } | null;
    day_streak?: number;
    total_ripples?: number;
    badges?: Array<{
      id: number;
      name: string;
      description: string;
      icon: string | null;
      earned_at: string;
    }>;
  } | null>(null);

  useEffect(() => {
    fetchStory();
  }, [id, user]);

  const fetchStory = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await apiFetch<{
        data: {
          story: Story;
          stats: { likes_count: number; shares_count: number; comments_count: number };
          comments: Comment[];
          user_interactions?: UserInteractions;
          recent_stories?: Story[];
          seo?: {
            meta_tags: SeoMetaTags;
            json_ld: JsonLd;
          };
        };
      }>(`/public/story/${id}`);

      setStory(res.data.story);
      setStats(res.data.stats);
      setComments(res.data.comments || []);
      setRecentStories(res.data.recent_stories || []);

      // Set SEO meta tags if available
      if (res.data.seo) {
        setSeoMeta(res.data.seo.meta_tags);
        setJsonLd(res.data.seo.json_ld);
      }

      // Set user's interaction status if logged in
      if (user && res.data.user_interactions) {
        setHasLiked(res.data.user_interactions.has_liked);
        setHasRippled(res.data.user_interactions.has_shared);
      }
    } catch (err: any) {
      console.error("Failed to fetch story:", err);
      setError(err?.message || "Failed to load story.");
    } finally {
      setLoading(false);
    }
  };

  const requireAuth = (action: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: `Please login to ${action}`,
        variant: "destructive",
      });
      navigate("/login", { 
        state: { from: location.pathname } 
      });
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth("like this story")) return;
    if (togglingLike) return;
    if (!story) return; // Ensure story is loaded

    setTogglingLike(true);
    const previousState = hasLiked;
    const previousCount = stats.likes_count;

    // Optimistic update
    setHasLiked(!hasLiked);
    setStats(prev => ({ 
      ...prev, 
      likes_count: hasLiked ? prev.likes_count - 1 : prev.likes_count + 1 
    }));

    try {
      // Use story.id (numeric) instead of id param (which might be slug)
      const storyId = story.id || id;
      const res = await apiFetch<{
        data: {
          liked: boolean;
          likes_count: number;
        };
      }>(`/global-hero-wall/${storyId}/like`, {
        method: 'POST',
      });

      // Update with server response
      setHasLiked(res.data.liked);
      setStats(prev => ({ 
        ...prev, 
        likes_count: res.data.likes_count 
      }));

      toast({
        title: res.data.liked ? "Story Liked!" : "Like Removed",
        description: res.data.liked ? "You liked this story ❤️" : "Like removed from story",
      });
    } catch (err: any) {
      // Revert on error
      setHasLiked(previousState);
      setStats(prev => ({ 
        ...prev, 
        likes_count: previousCount 
      }));
      
      // Check if it's a 500 error (server error - not retryable)
      const isServerError = err?.status === 500 || err?.response?.status === 500;
      const errorMessage = isServerError 
        ? "Server error. Please try again later." 
        : err?.message || "Failed to update like";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Like error:", err);
    } finally {
      setTogglingLike(false);
    }
  };

  const handleShareClick = () => {
    // if (!requireAuth("create a ripple")) return;
    setShowShareModal(true);
  };

  const handleShare = async (platform: string) => {
    if (togglingRipple) return;
    if (!story) return; // Ensure story is loaded

    setSharingPlatform(platform);
    setTogglingRipple(true);
    const previousState = hasRippled;
    const previousCount = stats.shares_count;

    // Optimistic update
    setHasRippled(true);
    if(user){
      setStats(prev => ({ 
        ...prev, 
        shares_count: prev.shares_count + 1 
      }));
    }

    try {
      if(user){
        // Use story.id (numeric) instead of id param (which might be slug)
        const storyId = story.id;
        if (!storyId) {
          throw new Error("Story ID not available");
        }
        
        const res = await apiFetch<{
          data: {
            shares_count: number;
          };
          message: string;
        }>(`/global-hero-wall/${storyId}/share`, {
          method: 'POST',
          body: JSON.stringify({
            channel: platform
          }),
        });

        setStats(prev => ({ 
          ...prev, 
          shares_count: res.data.shares_count 
        }));
      }

      // Handle actual platform sharing
      await handlePlatformShare(platform);

      if(user){
        toast({
          title: "Ripple Created! 🌊",
          description: `You've created a ripple via ${getPlatformName(platform)}`,
        });
      }else{
        toast({
          title: "Share Ripple ! 🌊",
          description: `You can share ripple via ${getPlatformName(platform)}`,
        });
      }

      setShowShareModal(false);
    } catch (err: any) {
      // Revert on error
      setHasRippled(previousState);
      setStats(prev => ({ 
        ...prev, 
        shares_count: previousCount 
      }));
      
      const isServerError = err?.status === 500 || err?.response?.status === 500;
      const errorMessage = isServerError 
        ? "Server error. Please try again later." 
        : err?.message || "Failed to share your Pass The Ripple story";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Share error:", err);
    } finally {
      setTogglingRipple(false);
      setSharingPlatform(null);
    }
  };

  const handlePlatformShare = async (platform: string) => {
    // Use slug if available, otherwise fall back to ID
    const storyIdentifier = story?.slug || id;
    const storyUrl = `${window.location.origin}/story/${storyIdentifier}`;
    const shareText = `Check out this inspiring story: "${story?.title}" on Pass The Ripple`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + storyUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storyUrl)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, open app or show message
        toast({
          title: "Share on Instagram",
          description: "Copy the link and share it on Instagram",
        });
        break;
      case 'messenger':
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(storyUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(storyUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Inspiring Story: ${story?.title}`)}&body=${encodeURIComponent(shareText + '\n\n' + storyUrl)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(storyUrl);
        toast({
          title: "Link Copied!",
          description: "Story link copied to clipboard",
        });
        break;
      case 'other':
        // Fallback to native share if available
        if (navigator.share) {
          await navigator.share({
            title: story?.title,
            text: shareText,
            url: storyUrl,
          });
        }
        break;
    }
  };

  const getPlatformName = (platform: string) => {
    return SHARE_PLATFORMS.find(p => p.id === platform)?.name || platform;
  };

  const handleAddComment = async () => {
    if (!requireAuth("comment on this story")) return;
    if (!newComment.trim()) return;
    if (!story) return; // Ensure story is loaded

    // Prevent duplicate submissions using ref (more reliable than state)
    if (isSubmittingCommentRef.current) return;
    
    isSubmittingCommentRef.current = true;
    setSubmittingComment(true);
    const commentText = newComment.trim(); // Store the comment text before clearing

    try {
      // Use story.id (numeric) instead of id param (which might be slug)
      const storyId = story.id;
      if (!storyId) {
        throw new Error("Story ID not available");
      }
      
      const res = await apiFetch<any>(`/global-hero-wall/${storyId}/comment`, {
        method: 'POST',
        body: JSON.stringify({
          body: commentText,
        }),
      });

      // Handle different response structures
      const commentData = res?.data || res?.comment || res;
      
      // Clear the input immediately to prevent duplicate submissions
      setNewComment("");
      setShowEmojiPicker(false);
      
      // Add new comment to the list if we have comment data
      if (commentData && commentData.id) {
        // Check if comment already exists to prevent duplicates
        setComments(prev => {
          const exists = prev.some(c => c.id === commentData.id);
          if (exists) return prev;
          return [commentData, ...prev];
        });
        setStats(prev => ({ 
          ...prev, 
          comments_count: prev.comments_count + 1 
        }));

        toast({
          title: "Comment Posted! 💬",
          description: "Your comment has been added",
        });
      } else {
        // Response structure unexpected, but comment might be saved
        // Update stats optimistically
        setStats(prev => ({ 
          ...prev, 
          comments_count: prev.comments_count + 1 
        }));
        
        toast({
          title: "Comment Posted! 💬",
          description: "Your comment has been added",
        });
        
        // Refresh comments after a delay to get the latest (only once)
        setTimeout(() => {
          fetchStory();
        }, 1000);
      }
    } catch (err: any) {
      // Revert the input if there was an error
      setNewComment(commentText);
      
      const isServerError = err?.status === 500 || err?.response?.status === 500;
      const errorMessage = isServerError 
        ? "Server error. Please try again later." 
        : err?.message || "Failed to post comment";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Comment error:", err);
    } finally {
      isSubmittingCommentRef.current = false;
      setSubmittingComment(false);
    }
  };

  const onEmojiSelect = (emoji: any) => {
    setNewComment(prev => prev + emoji.native);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-500 mb-4">{error || "Story not found."}</p>
        <Button onClick={() => navigate("/hero-wall")}>Back to Hero Wall</Button>
      </div>
    );
  }

  return (
    <main className="container py-8 relative">
      <Seo
        title={seoMeta?.title || `${story.title} - Pass The Ripple`}
        description={seoMeta?.description || story.description?.substring(0, 160) || story.title}
        url={seoMeta?.url || `${window.location.origin}/story/${story.slug || id}`}
        image={seoMeta?.image || getImageUrl(story.photo_path, 'submission')}
        imageAlt={`${story.title} - ${story.user?.nickname || 'User'}'s story`}
        type="article"
        jsonLd={jsonLd || undefined}
      />
      
      <div className="mx-auto">
        <Button
          variant="ghost"
          onClick={() => user && user.role === "user" ? navigate("/my-hero-wall") : navigate("/hero-wall")}
          className="mb-6 hover:bg-primary/10 group"
        >
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Hero Wall
        </Button>

        {/* Main Content Layout - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Story Content - Takes 2 columns on desktop, full width on mobile */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <Card className="overflow-hidden shadow-2xl border-0">
          {/* Hero Image */}
          <div className="aspect-[21/9] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
            <img
              src={getImageUrl(story.photo_path, 'submission')}
              alt={story.title}
              className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${
                !story.photo_path ? 'filter grayscale brightness-90 opacity-80' : ''
              }`}
            />
          </div>

          <CardContent className="p-8">
            {/* Story Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {/* {story.category ? (
                    <Badge 
                      className="px-3 py-1.5 text-sm font-medium border-2"
                    >
                      <img
                        src={story.category.icon ? getImageUrl(story.category.icon) : getIconByName('default-category-icon') || '/icons/heart.svg'}
                        alt={story.category.name}  className="w-8" />
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1.5 text-sm">
                      {story.action_type}
                    </Badge>
                  )} */}
                  
                  {story.is_featured && (
                    <Badge variant="default" className="px-3 py-1.5 text-sm bg-gradient-primary">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                  {story.title}
                </h1>
                
                {/* Author Info */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${story.user.is_profile_public ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      onClick={() => {
                        if (story.user.id && story.user.is_profile_public) {
                          setSelectedUserId(story.user.id);
                          setSelectedUser({
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
                          });
                          setShowProfilePopup(true);
                        }
                      }}
                    >
                      {(() => {
                        // Check if story is anonymous - if is_anonymous is true (1), hide user info
                        const anonymousValue = (story as any).is_anonymous ?? (story as any).anonymous;
                        const isAnonymous = anonymousValue === true || anonymousValue === 1 || anonymousValue === "1" || anonymousValue === "true";
                        
                        if (isAnonymous) {
                          return (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-base font-medium">
                              A
                            </div>
                          );
                        }
                        
                        return (
                          <UserAvatarOnly
                            nickname={story.user.nickname}
                            full_name={story.user.full_name}
                            avatar_id={story.user.avatar_id}
                            custom_avatar={story.user.custom_avatar}
                            profile_image_path={story.user.profile_image_path}
                            profile_image_url={story.user.profile_image_url}
                            size="w-12 h-12"
                          />
                        );
                      })()}
                    </div>
                    <div>
                      {(() => {
                        // Check if story is anonymous - if is_anonymous is true (1), hide user info
                        const anonymousValue = (story as any).is_anonymous ?? (story as any).anonymous;
                        const isAnonymous = anonymousValue === true || anonymousValue === 1 || anonymousValue === "1" || anonymousValue === "true";
                        
                        if (isAnonymous) {
                          return (
                            <>
                              <span className="font-semibold text-foreground block">
                                Anonymous
                              </span>
                            </>
                          );
                        }
                        
                        return (
                          <>
                            {story.user.is_profile_public ? (
                              <span
                                className="font-semibold text-foreground block cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  if (story.user.id) {
                                    setSelectedUserId(story.user.id);
                                    setSelectedUser({
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
                                    });
                                    setShowProfilePopup(true);
                                  }
                                }}
                              >
                                {getUserDisplayName(story.user, "Anonymous")}
                              </span>
                            ) : (
                              <span className="font-semibold text-foreground block">
                                {getUserDisplayName(story.user, "Anonymous")}
                              </span>
                            )}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{story.user.location?.city || story.user.location?.formatted_address || story.location || "Global"}</span>
                              </div>
                              {story.user.class && story.user.is_profile_public && (
                                <div className="flex items-center gap-1">
                                  <span>• {typeof story.user.class === 'string' ? story.user.class : story.user.class?.name || 'Class'}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{story.performed_at_formatted}</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Description */}
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-foreground/80 leading-relaxed text-lg">
                {getPlainText(story.description)}
              </p>
            </div>

            

            {/* Action Buttons */}
            <div className="flex items-center gap-4 py-6 border-t border-b border-border/50">
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="lg"
                onClick={handleLike}
                disabled={togglingLike}
                className="group relative overflow-hidden transition-all duration-300"
              >
                <Heart 
                  className={`mr-2 h-5 w-5 transition-all ${
                    hasLiked 
                      ? "fill-current text-white animate-pulse" 
                      : "group-hover:scale-110"
                  }`} 
                />
                <span className="font-semibold">
                  {stats.likes_count} {hasLiked ? "Likes" : "Likes"}
                </span>
              </Button>

              <Button
                variant={hasRippled ? "default" : "outline"}
                size="lg"
                onClick={handleShareClick}
                disabled={togglingRipple}
                className="group relative overflow-hidden transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 [&>*]:text-white"
              >
                <Share2 
                  className={`mr-2 h-5 w-5 transition-all text-white ${
                    hasRippled ? "" : "group-hover:scale-110"
                  }`} 
                />
                <span className="font-semibold ">
                  {stats.shares_count} {hasRippled ? "Share " : "Share"}
                </span>
              </Button>
            </div>

            {/* Comments Section */}
            {/*
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Comments ({stats.comments_count})
              </h3>
              */}
              {/* Add Comment */}
              {/*
              <div className="mb-8">
                {!user ? (
                  // Show login/signup instructions for non-logged-in users
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <MessageCircle className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-foreground mb-2">
                            Join the Conversation! 💬
                          </h4>
                          <p className="text-muted-foreground mb-4">
                            To share your thoughts and comment on this story, please sign in to your account or create a new one.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Link to="/login">
                              <Button 
                                variant="default"
                                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                              >
                                Sign In
                              </Button>
                            </Link>
                            <Link to="/age-gate">
                              <Button 
                                variant="outline"
                                className="border-2 border-primary/30 hover:bg-primary/10"
                              >
                                Create Account
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Show comment form for logged-in users
                  <div className="flex gap-4">
                    <UserAvatarOnly 
                      nickname={user?.nickname || "Guest"}
                      avatar_id={user?.avatar_id}
                      profile_image_path={user?.profile_image_path}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="relative">
                        <Textarea
                          placeholder="Share your thoughts... Use emojis to spread positivity! 😊"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="pr-12 min-h-[100px] text-lg resize-none border-2 focus:border-primary transition-colors"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-3 right-3 hover:bg-primary/10"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {showEmojiPicker && (
                        <div className="absolute z-50 mt-2 shadow-2xl rounded-lg overflow-hidden">
                          <Picker 
                            data={data} 
                            onEmojiSelect={onEmojiSelect}
                            theme="light"
                            previewPosition="none"
                            skinTonePosition="none"
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddComment}
                          className="px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                          disabled={!newComment.trim() || submittingComment}
                          size="lg"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {submittingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              */}

              {/* Comments List */}
              {/*
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50 hover:border-primary/20 transition-all duration-300">
                      <div
                        className={`${comment.user.is_profile_public ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} flex-shrink-0`}
                        onClick={() => {
                          if (comment.user.id && comment.user.is_profile_public) {
                            setSelectedUserId(comment.user.id);
                            setSelectedUser({
                              id: comment.user.id,
                              nickname: comment.user.nickname,
                              full_name: comment.user.full_name || null,
                              avatar_id: comment.user.avatar_id || null,
                              profile_image_path: comment.user.profile_image_path || null,
                              profile_image_url: comment.user.profile_image_url || null,
                              is_profile_public: comment.user.is_profile_public,
                              location: comment.user.location,
                              class: comment.user.class,
                              day_streak: comment.user.day_streak,
                              total_ripples: comment.user.total_ripples,
                              badges: comment.user.badges,
                            });
                            setShowProfilePopup(true);
                          }
                        }}
                      >
                        <UserAvatarOnly
                          nickname={comment.user.nickname}
                          full_name={comment.user.full_name}
                          avatar_id={comment.user.avatar_id}
                          custom_avatar={comment.user.custom_avatar}
                          profile_image_path={comment.user.profile_image_path}
                          profile_image_url={comment.user.profile_image_url}
                          size="w-10 h-10"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {comment.user.is_profile_public ? (
                            <span
                              className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => {
                                if (comment.user.id) {
                                  setSelectedUserId(comment.user.id);
                                  setSelectedUser({
                                    id: comment.user.id,
                                    nickname: comment.user.nickname,
                                    full_name: comment.user.full_name || null,
                                    avatar_id: comment.user.avatar_id || null,
                                    profile_image_path: comment.user.profile_image_path || null,
                                    profile_image_url: comment.user.profile_image_url || null,
                                    is_profile_public: comment.user.is_profile_public,
                                    location: comment.user.location,
                                    class: comment.user.class,
                                    day_streak: comment.user.day_streak,
                                    total_ripples: comment.user.total_ripples,
                                    badges: comment.user.badges,
                                  });
                                  setShowProfilePopup(true);
                                }
                              }}
                            >
                              {getUserDisplayName(comment.user, "Anonymous")}
                            </span>
                          ) : (
                            <span className="font-semibold text-foreground">
                              {getUserDisplayName(comment.user, "Anonymous")}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-foreground/80 leading-relaxed">{comment.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No comments yet.</p>
                    <p className="text-sm">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
            */}
          </CardContent>
        </Card>
          </div>

          {/* Recent Stories Sidebar */}
          {recentStories.length > 0 && (
            <div className="lg:col-span-1 order-2 lg:order-2">
              <Card className="sticky top-6 shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Recent Stories 📚
                  </h3>
                  
                  <div className="space-y-4">
                    {recentStories.map((recentStory) => (
                      <Link
                        key={recentStory.id}
                        to={`/story/${recentStory.slug || recentStory.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                          {/* Story Image */}
                          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                            <img
                              src={getImageUrl(recentStory.photo_path, 'submission')}
                              alt={recentStory.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          
                          {/* Story Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                              {recentStory.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {recentStory.category && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs px-2 py-0.5"
                                >
                                  {recentStory.category.name}
                                </Badge>
                              )}
                              <span className="truncate">
                                {recentStory.performed_at_formatted}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* View All Button */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
                      onClick={() => navigate("/hero-wall")}
                    >
                      View All Stories
                      <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-2xl border border-border max-w-md w-full animate-in fade-in-90 zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold">Share Ripple 🌊</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareModal(false)}
                className="hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <p className="text-muted-foreground mb-6 text-center">
                Share this inspiring story
              </p>
              
              <div className="grid grid-cols-4 gap-4">
                {SHARE_PLATFORMS.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform.id)}
                      disabled={togglingRipple && sharingPlatform === platform.id}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        togglingRipple && sharingPlatform === platform.id 
                          ? 'animate-pulse opacity-70' 
                          : platform.color
                      } text-white font-semibold`}
                    >
                      <IconComponent className="h-6 w-6 mb-2" />
                      <span className="text-xs">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {togglingRipple && (
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Creating ripple via {getPlatformName(sharingPlatform!)}...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Profile Popup */}
      {selectedUserId && selectedUser?.is_profile_public && (
        <UserProfilePopup
          open={showProfilePopup}
          onOpenChange={setShowProfilePopup}
          userId={selectedUserId}
          user={selectedUser || undefined}
        />
      )}
    </main>
  );
}