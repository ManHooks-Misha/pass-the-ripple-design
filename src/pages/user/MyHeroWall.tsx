import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, HelpCircle, Plus } from "lucide-react";
import Seo from "@/components/Seo";
import { apiFetch } from "@/config/api";
import story1 from "@/assets/story1.jpg";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { useAuth } from "@/context/AuthContext";
import StoryCard from "@/components/StoryCard";
import { getIconByName } from "@/config/icons";
import { Star } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";
import { getPlainText } from "@/utils/textUtils";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { myStoriesTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";

const FALLBACK_IMAGE = story1;

interface User {
  id: number;
  nickname: string;
  full_name: string | null;
  avatar: string | null;
  avatar_id?: number | null;
  profile_image_path?: string | null;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Story {
  id: number;
  title: string;
  description: string;
  photo_path: string | null;
  action_type: string;
  performed_at: string;
  performed_at_formatted: string;
  created_at: string;
  created_at_formatted: string;
  user: User;
  category?: Category | null;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  is_pinned: boolean;
}

const HeroWall = () => {
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  const [regularStories, setRegularStories] = useState<Story[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingStory, setLoadingStory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await apiFetch<{ data: Category[] }>('/categories');
        setCategories(res.data || []);
      } catch (err: any) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (featuredStories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredStories.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [featuredStories.length]);

  const getApiSortParams = () => {
    switch (sortBy) {
      case "likes": return { sort_by: "likes_count", sort_order: "desc" };
      case "ripples": return { sort_by: "shares_count", sort_order: "desc" };
      case "oldest": return { sort_by: "performed_at", sort_order: "asc" };
      case "title": return { sort_by: "title", sort_order: "asc" };
      default: return { sort_by: "performed_at", sort_order: "desc" };
    }
  };

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredStories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredStories.length) % featuredStories.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Fetch ALL featured stories ONCE on mount
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingHero(true);
      try {
        const sliderRes = await apiFetch<{ data: Story[] }>("/user/global-hero-wall/sliders");
        const sliders = Array.isArray(sliderRes.data) ? sliderRes.data : [];

        // Set ALL sliders as featured stories, pinned first
        const pinnedStories = sliders.filter(s => s.is_pinned);
        const otherStories = sliders.filter(s => !s.is_pinned);
        const allFeaturedStories = [...pinnedStories, ...otherStories];

        setFeaturedStories(allFeaturedStories);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load featured stories", err);
        setError(err?.message || "Failed to load featured stories.");
      } finally {
        setLoadingHero(false);
      }
    };

    fetchFeatured();
  }, []);

  // Load regular stories
  const loadStories = async (page: number, append: boolean = false) => {
    if (!append) {
      setLoadingStory(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const { sort_by, sort_order } = getApiSortParams();
      const params = new URLSearchParams();

      // Status parameter (required for filtering, or omitted for approved/all)
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      // Sort parameters
      params.append("sort_by", sort_by);
      params.append("sort_order", sort_order);

      // Pagination parameters
      params.append("per_page", "6");
      params.append("page", String(page));

      // Category filter
      if (filter !== "all") {
        params.append("category_id", filter);
      }

      // Search query
      if (searchQuery.trim()) {
        params.append("q", searchQuery.trim());
      }

      const res = await apiFetch<{
        data: {
          data: Story[];
          current_page: number;
          last_page: number;
          next_page_url: string | null;
          total: number;
        };
      }>(`/user/global-hero-wall/stories?${params.toString()}`);

      const { data: stories, current_page, last_page } = res.data;

      setRegularStories(prev => append ? [...prev, ...stories] : stories);
      setCurrentPage(current_page);
      setLastPage(last_page);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load stories.");
      console.error("Load stories error:", err);
    } finally {
      setLoadingStory(false);
      setLoadingMore(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    loadStories(1, false);
  }, [filter, filterStatus, sortBy, searchQuery]);

  const handleLoadMore = () => {
    if (currentPage < lastPage && !loadingMore) {
      loadStories(currentPage + 1, true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (error && !featuredStories.length && loadingHero) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 p-4 text-center">
        <p>Oops! We couldn't load the stories.</p>
        <p className="text-sm mt-2 text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "my_stories_tutorial_completed",
    steps: myStoriesTutorialSteps,
  });

  return (
    <main className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      <Seo
        title="Hero Wall — Pass The Ripple"
        description="Discover inspiring stories of kindness from kids around the world."
        canonical={`${window.location.origin}/hero-wall`}
      />

      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="my_stories_tutorial_completed"
      />

      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            My Pass The Ripple Journey
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Where every act of kindness becomes a ripple that travels further than you think
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            asChild
            size="sm"
            className="flex items-center gap-2"
          >
            <Link to="/post-story">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add New Story</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={startTutorial}
            className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
            title="Take a tour of this page"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Help</span>
          </Button>
        </div>
      </div>

      <div className="space-y-8">

        {/* Featured Stories Slider */}
        {loadingHero ? (
          <div className="flex justify-center py-12">
            <PageSkeleton />
          </div>
        ) : featuredStories.length > 0 ? (
          <div className="relative group">
            {/* Slider Navigation Arrows */}
            {featuredStories.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Slider Container */}
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredStories.map((story, index) => (
                  <div key={story.id} className="w-full flex-shrink-0">
                    <Link to={user && user.role === "user" ? `/my-story/${story.slug || story.id}` : `/story/${story.slug || story.id}`}>
                      <Card className="shadow-elevated border-primary/20 hover:shadow-glow transition-all cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5 mx-2">
                        <CardHeader>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="default" className="bg-gradient-primary">
                              {story.is_pinned ? "⭐ Pinned Story" : "🌟 Featured Story"}
                            </Badge>
                            {story.category && (
                              <Badge
                                variant="outline"
                              >
                                <img src={getImageUrl(story.category.icon)} alt={story.category.name} className="w-4 h-4" />
                              </Badge>
                            )}
                            {featuredStories.length > 1 && (
                              <Badge variant="secondary" className="ml-auto">
                                {index + 1} of {featuredStories.length}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-6 md:grid-cols-2 items-center">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="text-3xl">✨</div>
                                <div>
                                  <h3 className="font-bold text-xl line-clamp-2">{story.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    by {story.user.full_name || story.user.nickname} • {story.performed_at_formatted}
                                  </p>
                                </div>
                              </div>
                              <p className="text-base leading-relaxed line-clamp-3">{getPlainText(story.description)}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <span>❤️ {story.likes_count} likes</span>
                                <span>🌊 {story.shares_count} ripples</span>
                                <span>💬 {story.comments_count} comments</span>
                              </div>
                            </div>
                            <div className="aspect-[4/3] rounded-lg border-2 border-primary/20 bg-muted/50 overflow-hidden">
                              <img
                                src={getImageUrl(story.photo_path, 'submission')}
                                alt={story.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Indicators */}
            {featuredStories.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {featuredStories.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                      ? "bg-primary scale-110"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Search & Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md"
          />

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="unpublished">Unpublished</SelectItem>
            </SelectContent>
          </Select>

          {/* Dynamic Category Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {loadingCategories ? (
                <SelectItem value="loading" disabled>Loading categories...</SelectItem>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <img src={getImageUrl(category.icon)} alt={category.name} className="w-4 h-4" />
                      {category.name}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-categories" disabled>No categories available</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="ripples">Most Ripples</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </form>

        {/* Story Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-tutorial-target="stories-list">
          {loadingStory ? (
            <div className="col-span-full flex justify-center py-12">
              <PageSkeleton />
            </div>
          ) : regularStories.length > 0 ? (
            regularStories.map((story, index) => (
              <div key={story.id} data-tutorial-target={index === 0 ? "story-card" : undefined}>
                <StoryCard story={story} showPreviewButton={true} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No stories found. Try a different search or filter.
            </div>
          )}
        </div>

        {/* Load More Button */}
        {currentPage < lastPage && !loadingStory && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More Stories"}
            </Button>
          </div>
        )}

        {/* Create Your Story CTA */}
        <Card className="text-center bg-gradient-subtle">
          <CardContent className="p-8">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">Create Your Story!</h3>
            <p className="text-muted-foreground mb-4">
              Have an amazing ripple story to share? Your kindness could inspire thousands of others!
            </p>
            <Link to="/post-story">
              <Button variant="hero">Create Story</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default HeroWall;