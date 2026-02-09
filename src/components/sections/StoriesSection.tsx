import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Sparkles, Heart, Share2, ChevronLeft, ChevronRight, TrendingUp, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/admin/Avatar";
import { Link } from "react-router-dom";
import { apiFetch } from "@/config/api";
import { getImageUrl } from "@/utils/imageUrl";
import { UserAvatarOnly } from "../UserIdentity";
import { getIconByName } from "@/config/icons";

interface Story {
  id: number;
  slug: string;
  title: string;
  description: string;
  photo_path: string | null;
  action_type: string;
  performed_at: string;
  performed_at_formatted: string;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  is_pinned: boolean;
  user: {
    id: number;
    nickname: string;
    full_name: string | null;
    avatar_id: number | null;
    profile_image_path: string | null;
    location: {
      city: string;
      state: string;
      country: string;
      formatted_address: string;
    } | null;
    class: {
      id: number;
      name: string;
    } | null;
    badges: Array<{
      id: number;
      name: string;
      icon: string | null;
    }>;
    day_streak: number;
    total_ripples: number;
  };
  category: {
    id: number;
    name: string;
    code: string;
    color_code: string;
    icon: string;
  };
}

const StoriesSection = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response: any = await apiFetch('/global-hero-wall/sliders');

        if (response.success && response.data && Array.isArray(response.data)) {
          setStories(response.data);
        } else {
          setStories([]);
        }
      } catch (error) {
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (stories.length > 3) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, stories.length - 2));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [stories.length]);

  const nextStories = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, stories.length - 2));
  };

  const prevStories = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, stories.length - 2)) % Math.max(1, stories.length - 2));
  };

  // Function to strip HTML tags from description
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Function to get user display name
  const getUserDisplayName = (user: Story['user']) => {
    return user.full_name || user.nickname || 'Anonymous';
  };

  // Function to get location text
  const getLocationText = (user: Story['user']) => {
    if (user.location) {
      return user.location.city || user.location.formatted_address || 'Unknown location';
    }
    return '';
  };

  const visibleStories = stories.slice(currentIndex, currentIndex + 3);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl" />

      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3 border-2 ">
            <Star className="w-3 h-3" />
            Success Stories
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-3">
            <span className="text-gray-900">Real Stories, </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-purple-600">
              Real Impact
            </span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            See what young heroes are doing around the world! ⭐
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : stories.length > 0 ? (
          <>
            {/* Stories Carousel */}
            <div className="relative mb-8">
              {/* Navigation Arrows */}
              {stories.length > 3 && (
                <>
                  <button
                    onClick={prevStories}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-20 p-3 rounded-full bg-white border-3   hover:-translate-x-5 md:hover:-translate-x-7 transition-all"
                    aria-label="Previous stories"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-900" />
                  </button>

                  <button
                    onClick={nextStories}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-20 p-3 rounded-full bg-white border-3   hover:translate-x-5 md:hover:translate-x-7 transition-all"
                    aria-label="Next stories"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-900" />
                  </button>
                </>
              )}

              {/* Stories Grid */}
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {visibleStories.map((story, index) => {
                  const cardColors = [
                    { bg: "from-yellow-50 to-orange-50", border: "border-orange-300", accent: "text-orange-600" },
                    { bg: "from-green-50 to-teal-50", border: "border-teal-300", accent: "text-teal-600" },
                    { bg: "from-pink-50 to-purple-50", border: "border-purple-300", accent: "text-purple-600" }
                  ];
                  const colors = cardColors[index % 3];
                  const userDisplayName = getUserDisplayName(story.user);
                  const locationText = getLocationText(story.user);
                  const cleanDescription = stripHtml(story.description);

                  return (
                    <Card
                      key={story.id}
                      className={`bg-gradient-to-br ${colors.bg} border-3 ${colors.border} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all overflow-hidden group`}
                    >
                      {/* Story Image (if available) */}
                      {story.photo_path && (
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={getImageUrl(story.photo_path)}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                          {/* Category badge */}
                          {story.category && (
                            <div 
                              className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border-2  text-xs font-bold flex items-center gap-1"
                              style={{ color: story.category.color_code }}
                            >
                              {(() => {
                                const IconComponent = getIconByName(story?.category?.icon) || Star;
                                return <IconComponent className="w-3 h-3" />;
                              })()}  {story?.category?.name || story.action_type}
                            </div>
                          )}
                        </div>
                      )}

                      <CardContent className="p-5">
                        {/* Story Title */}
                        <h3 className="font-black text-lg text-gray-900 mb-2 line-clamp-2">
                          {story.title}
                        </h3>

                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-3">
                          {story.user.profile_image_path ? (
                            <UserAvatarOnly
                              nickname={story?.user?.nickname}
                              full_name={story?.user?.full_name}
                              avatar_id={story?.user?.avatar_id}
                              custom_avatar={story?.user?.custom_avatar}
                              profile_image_path={story?.user?.profile_image_path}
                              profile_image_url={story?.user?.profile_image_url}
                              size="w-10 h-10"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2  font-black text-sm">
                              {userDisplayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-gray-900 truncate">
                              {userDisplayName}
                            </p>
                            {locationText && (
                              <p className="text-xs text-gray-600 truncate">{locationText}</p>
                            )}
                          </div>
                          {story.is_pinned && (
                            <Badge className="bg-yellow-500 text-white border-2  text-xs">
                              <Star className="w-3 h-3 mr-1 fill-white" />
                              Pinned
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        {cleanDescription && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-3 leading-relaxed">
                            {cleanDescription}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span className="font-bold">{story.likes_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span className="font-bold">{story.shares_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-bold">{story.comments_count || 0}</span>
                          </div>
                          <div className="flex-1" />
                          {/* Trending badge for highly liked stories */}
                          {story.likes_count > 5 && (
                            <Badge className="bg-gradient-to-r from-orange-400 to-pink-500 text-white border-2  text-xs font-bold">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>

                        {/* Read More Button */}
                        <Link to={`/story/${story.slug || story.id}`}>
                          <Button
                            className={`w-full bg-gradient-to-r ${colors.bg.includes('yellow') ? 'from-orange-500 to-yellow-500' : colors.bg.includes('green') ? 'from-teal-500 to-green-500' : 'from-purple-500 to-pink-500'} hover:opacity-90 text-white font-black border-3 border-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all`}
                          >
                            Read Full Story
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Carousel Indicators */}
              {stories.length > 3 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: Math.max(1, stories.length - 2) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full border-2  transition-all ${
                        index === currentIndex
                          ? "w-8 bg-gradient-to-r from-green-500 to-blue-500"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link to="/hero-wall">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white font-black border-3   hover:-translate-y-1 transition-all group"
                >
                  View All Stories
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📖</div>
            <p className="text-lg text-gray-600 mb-4">No stories yet. Be the first to share!</p>
            <Link to="/post-story">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black border-3   hover:-translate-y-1 transition-all"
              >
                <Heart className="w-5 h-5 mr-2" />
                Share Your Story
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default StoriesSection;
