import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Seo from "@/components/Seo";
import { useState, useEffect } from "react";
import {
  BookHeart,
  Sparkles,
  Lock,
  Smile,
  Heart,
  HandHeart,
  User,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Shield,
  BookOpen,
  MessageCircle,
  Zap,
  Globe,
  Award,
  FolderHeart,
  Target,
  Brain,
  Palette,
  Eye,
  ChevronLeft,
  ChevronRight,
  Hand
} from "lucide-react";

// Assets
import waterPencilTexture from "@/assets/water-pencil-texture.png";

// User Provided Assets
import heroWall1 from "@/assets/hero-wall/hero-wall-1.webp";
import heroWall2 from "@/assets/hero-wall/hero-wall-2.webp";
import heroWall3 from "@/assets/hero-wall/hero-wall-3.webp";
import heroWall4 from "@/assets/hero-wall/hero-wall-4.webp";
import heroWall5 from "@/assets/hero-wall/hero-wall-5.webp";
import heroWall6 from "@/assets/hero-wall/hero-wall-6.webp";

import storyScene from "@/assets/hero-wall/story-scene.jpg";
import cardHelper from "@/assets/hero-wall/card-helper.png";
import cardShare from "@/assets/hero-wall/card-share.png";
import cardInvite from "@/assets/hero-wall/card-invite.png";
import cardThankYou from "@/assets/hero-wall/card-thankyou.png";
import communityHands from "@/assets/hero-wall/community-hands.jpg";
import WaterPencilButton from "@/components/ui/WaterPencilButton";
import WaterPencilCard from "@/components/ui/WaterPencilCard";
import WaterPencilTitle from "@/components/ui/WaterPencilTitle";
import { image, style } from "d3";
import StoryFlipCard from "@/components/StoryFlipCard";
import { apiFetch } from "@/config/api";
import WatercolorTypography from "@/components/ui/WatercolorTypography";

interface ApiStory {
  id: number;
  title: string;
  description: string;
  photo_path: string | null;
  action_type: string;
  performed_at_formatted: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  // Add other fields as needed
}

// Storybook Carousel Component
const StorybookCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [nextIndex, setNextIndex] = useState(0);

  // Carousel cards data - images only
  const carouselCards = [
    {
      id: 1,
      image: heroWall1,
      color: "from-pink-400 to-purple-400"
    },
    {
      id: 2,
      image: heroWall2,
      color: "from-blue-400 to-teal-400"
    },
    {
      id: 3,
      image: heroWall3,
      color: "from-green-400 to-emerald-400"
    },
    {
      id: 4,
      image: heroWall4,
      color: "from-orange-400 to-amber-400"
    },
    {
      id: 5,
      image: heroWall5,
      color: "from-rose-400 to-pink-400"
    },
    {
      id: 6,
      image: heroWall6,
      color: "from-rose-400 to-pink-400"
    }
  ];

  const handlePrevious = () => {
    if (isTransitioning) return;
    const newIndex = currentIndex === 0 ? carouselCards.length - 1 : currentIndex - 1;
    setNextIndex(newIndex);
    setIsTransitioning(true);
    setDirection('left');
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 400);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    const newIndex = currentIndex === carouselCards.length - 1 ? 0 : currentIndex + 1;
    setNextIndex(newIndex);
    setIsTransitioning(true);
    setDirection('right');
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 400);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isTransitioning]);

  // Touch swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      handleNext();
    }
    if (touchStart - touchEnd < -75) {
      handlePrevious();
    }
  };

  const currentCard = carouselCards[currentIndex];
  const nextCard = carouselCards[nextIndex];

  // Calculate previous and next card indices for preview
  const prevCardIndex = currentIndex === 0 ? carouselCards.length - 1 : currentIndex - 1;
  const nextCardIndex = currentIndex === carouselCards.length - 1 ? 0 : currentIndex + 1;

  return (
    <div className="relative h-full flex items-center justify-center mt-8 md:mt-0 pb-4 px-4 sm:px-8">
      <div className="relative w-full max-w-2xl mx-auto">
        {/* Animated watercolor splashes behind carousel */}
        <div className="absolute -top-6 -left-6 w-20 h-20 sm:w-28 sm:h-28 bg-pink-300/30 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 sm:w-32 sm:h-32 bg-purple-300/30 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }}></div>

        {/* Decorative stars with better positioning */}
        <div className="absolute -top-3 -right-3 text-yellow-400 animate-pulse z-20" style={{ animationDuration: '2s' }}>
          <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 drop-shadow-md" />
        </div>
        <div className="absolute top-1/4 -left-4 text-pink-400 animate-pulse z-20" style={{ animationDuration: '3s' }}>
          <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-pink-400 drop-shadow-md" />
        </div>
        <div className="absolute bottom-1/3 -right-4 text-purple-400 animate-pulse z-20" style={{ animationDuration: '2.5s' }}>
          <Star className="w-4 h-4 fill-purple-400 drop-shadow-md" />
        </div>

        {/* Main Carousel Card Container with Stack Preview */}
        <div
          className="relative perspective-1000"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Previous Card Preview (Left Side) */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-16 sm:w-24 md:w-32 h-48 sm:h-56 -translate-x-8 sm:-translate-x-12 md:-translate-x-16 opacity-40 hover:opacity-60 transition-all duration-300 cursor-pointer z-0"
            onClick={handlePrevious}
          >
            <div className="relative w-full h-full bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-4 border-white transform -rotate-6 scale-90">
              <img
                src={carouselCards[prevCardIndex].image}
                alt="Previous card"
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${carouselCards[prevCardIndex].color} opacity-60`}></div>
            </div>
          </div>

          {/* Next Card Preview (Right Side) */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-16 sm:w-24 md:w-32 h-48 sm:h-56 translate-x-8 sm:translate-x-12 md:translate-x-16 opacity-40 hover:opacity-60 transition-all duration-300 cursor-pointer z-0"
            onClick={handleNext}
          >
            <div className="relative w-full h-full bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-4 border-white transform rotate-6 scale-90">
              <img
                src={carouselCards[nextCardIndex].image}
                alt="Next card"
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${carouselCards[nextCardIndex].color} opacity-60`}></div>
            </div>
          </div>

          {/* Storybook frame - layered shadow cards */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl transform rotate-3 shadow-lg opacity-20 blur-sm -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-pink-100 rounded-3xl transform -rotate-2 shadow-md opacity-30 -z-10"></div>

          {/* Card Stack Container - for 3D flip effect */}
          <div className="relative w-full max-w-lg mx-auto" style={{ perspective: '1000px' }}>
            {/* Current Card */}
            <div
              className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-6 sm:border-8 border-white transition-all duration-400 ease-out ${
                isTransitioning
                  ? direction === 'right'
                    ? 'animate-flip-out-right'
                    : 'animate-flip-out-left'
                  : 'animate-flip-in'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Watercolor border glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-br ${currentCard.color} opacity-30 blur-lg rounded-2xl sm:rounded-3xl -z-10`}></div>

              {/* Card Layout: Full Width Image Only */}
              <div className="relative w-full h-full min-h-[350px] sm:min-h-[350px]">
                {/* Full Image Display */}
                <img
                  src={currentCard.image}
                  alt="Kindness story card"
                  className="w-full h-full object-cover object-center min-h-[350px] sm:min-h-[350px]"
                />
                {/* Watercolor overlay gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.color} opacity-20`}></div>

                {/* Decorative watercolor splash on image */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              </div>

              {/* Enhanced hand-drawn corner decorations */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-6 h-6 sm:w-8 sm:h-8 border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-white/60 rounded-tl-xl sm:rounded-tl-2xl"></div>
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-white/60 rounded-tr-xl sm:rounded-tr-2xl"></div>
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 w-6 h-6 sm:w-8 sm:h-8 border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-white/60 rounded-bl-xl sm:rounded-bl-2xl"></div>
              <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 border-b-3 sm:border-b-4 border-r-3 sm:border-r-4 border-white/60 rounded-br-xl sm:rounded-br-2xl"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Buttons with Hand Icons */}
        <button
          onClick={handlePrevious}
          disabled={isTransitioning}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-100 to-pink-800 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-3 border-pink-300 hover:border-pink-500 disabled:opacity-40 disabled:cursor-not-allowed group z-30 hover:shadow-2xl"
          aria-label="Previous card"
          style={{ transform: 'rotate(-40deg) translateY(-50%)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200/50 to-pink-200/50 rounded-full blur-md group-hover:blur-lg transition-all"></div>
          <Hand
            className="w-7 h-6 sm:w-8 sm:h-8 text-white group-hover:text-white-300 relative z-10 transition-all group-hover:-translate-x-1 group-hover:scale-110"
            style={{ transform: 'scaleX(-1)' }}
          />
        </button>

        <button
          onClick={handleNext}
          disabled={isTransitioning}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-800 to-pink-100 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-3 border-pink-300 hover:border-pink-500 disabled:opacity-40 disabled:cursor-not-allowed group z-30 hover:shadow-2xl"
          aria-label="Next card"
          style={{ transform: 'rotate(40deg) translateY(-50%)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200/50 to-pink-200/50 rounded-full blur-md group-hover:blur-lg transition-all"></div>
          <Hand className="w-7 h-6 sm:w-8 sm:h-8 text-white group-hover:text-white-300 relative z-10 transition-all group-hover:translate-x-1 group-hover:scale-110" />
        </button>

        {/* Enhanced Indicator Dots */}
        <div className="flex justify-center gap-2 mt-5 sm:mt-6">
          {carouselCards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isTransitioning && index !== currentIndex) {
                  setNextIndex(index);
                  setIsTransitioning(true);
                  setDirection(index > currentIndex ? 'right' : 'left');
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsTransitioning(false);
                  }, 400);
                }
              }}
              className={`relative transition-all duration-400 rounded-full ${
                index === currentIndex
                  ? 'w-10 h-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 shadow-lg scale-110'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-110'
              }`}
              aria-label={`Go to slide    ${index + 1}`}
            >
              {index === currentIndex && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-sm opacity-50"></div>
              )}
            </button>
          ))}
        </div>

        {/* Additional watercolor splatter decorations */}
        <div className="absolute top-1/3 -left-10 w-16 h-16 bg-blue-300/15 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 -right-10 w-14 h-14 bg-yellow-300/15 rounded-full blur-lg"></div>
      </div>

      {/* Custom CSS for flip animations */}
      <style>{`
        @keyframes flip-out-right {
          0% {
            transform: perspective(1000px) rotateY(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: perspective(1000px) rotateY(20deg) scale(0.95);
            opacity: 0;
          }
        }

        @keyframes flip-out-left {
          0% {
            transform: perspective(1000px) rotateY(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: perspective(1000px) rotateY(-20deg) scale(0.95);
            opacity: 0;
          }
        }

        @keyframes flip-in {
          0% {
            transform: perspective(1000px) rotateY(0deg) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: perspective(1000px) rotateY(0deg) scale(1);
            opacity: 1;
          }
        }

        .animate-flip-out-right {
          animation: flip-out-right 0.4s ease-out forwards;
        }

        .animate-flip-out-left {
          animation: flip-out-left 0.4s ease-out forwards;
        }

        .animate-flip-in {
          animation: flip-in 0.4s ease-out forwards;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

// Add this component inside your HeroWall component file
const StoriesFromAPI = () => {
  const [apiStories, setApiStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('/global-hero-wall/sliders');
        
        if (response.success && response.data) {
          // Map the API data to match our component's expected format
          const stories = response.data.map((story: any) => ({
            id: story.id,
            title: story.title,
            description: story.description,
            photo_path: story.photo_path,
            category: story.category,
            action_type: story.action_type,
            performed_at_formatted: story.performed_at_formatted
          }));
          
          setApiStories(stories);
        } else {
          setError("Failed to load stories: Invalid response format");
        }
      } catch (err: any) {
        console.error("Error fetching stories:", err);
        setError("Failed to load stories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(apiStories.map(story => story.category.name)))];

  // Filter stories by active category
  const filteredStories = activeCategory === "All" 
    ? apiStories 
    : apiStories.filter(story => story.category.name === activeCategory);

  return (
    <>
      {/* Theme Selection Tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm border transition-all duration-300 ${
              activeCategory === category
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-md scale-105"
                : "bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:shadow-md"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-10 h-10 text-pink-400 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-600 text-lg">Loading kindness stories...</p>
            <p className="text-gray-400 text-sm mt-2">Just like Luma gathering courage</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Story cards - using flip cards */}
      {!loading && !error && (
        <>
          {filteredStories.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => (
                  <StoryFlipCard
                    key={story.id}
                    story={story}
                  />
                ))}
              </div>

              {/* Show total count */}
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  Showing <span className="font-semibold text-pink-600">{filteredStories.length}</span> kindness stories
                  {activeCategory !== "All" && (
                    <span> in <span className="font-semibold text-purple-600">{activeCategory}</span></span>
                  )}
                </p>
              </div>
            </>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center">
                <Heart className="w-10 h-10 text-pink-500" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No stories found in this category.</p>
              <p className="text-gray-500 text-sm mb-6">Just like an empty storybook waiting for your first ripple.</p>
              <button
                onClick={() => setActiveCategory("All")}
                className="px-6 py-2 text-pink-600 hover:text-pink-700 font-medium border border-pink-200 rounded-full hover:bg-pink-50 transition-colors"
              >
                View all stories
              </button>
            </div>
          )}
        </>
      )}

      {/* Anti-Feed Statement */}
      <div className="text-center mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-gray-600 text-sm sm:text-base">
            <span className="font-bold text-pink-600">No endless scrolling. No "load more."</span>
          </p>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            We limit visible stories each day so each one gets the attention it deserves. This is a curated gallery of meaning, not a competition for visibility.
          </p>
        </div>
      </div>
    </>
  );
};

const HeroWall = () => {
  const { user } = useAuth();

  // if (user) {
  //   return <Navigate to="/my-hero-wall" replace />;
  // }

  // Sample kindness stories for the gallery
  const kindnessStories = [
    {
      id: 1,
      theme: "Helping Friends",
      title: "Shared my art supplies",
      content: "My friend forgot their colored pencils, so I shared mine. We made a rainbow drawing together!",
      reflection: "How did helping your friend make you feel?",
      color: "blue" as const,
      character: "Wren",
      icon: <Heart className="w-4 h-4" />
    },
    {
      id: 2,
      theme: "Brave Choices",
      title: "Stood up for someone",
      content: "I saw someone being teased for their drawing. I said I liked it and we became drawing buddies.",
      reflection: "What gives you courage to stand up for others?",
      color: "purple" as const,
      character: "Luma",
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: 3,
      theme: "Including Others",
      title: "Invited a new friend to play",
      content: "There was a new kid at the playground looking lonely. I asked if they wanted to join our game of tag.",
      reflection: "How does it feel when someone includes you?",
      color: "green" as const,
      character: "Sage",
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 4,
      theme: "First Ripples",
      title: "My first kind note",
      content: "I wrote a note to my mom telling her she's the best. She put it on the fridge with a magnet!",
      reflection: "What small kindness could you try today?",
      color: "orange" as const,
      character: "Zin",
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 5,
      theme: "Creative Kindness",
      title: "Built a fort for my sister",
      content: "My little sister was sad, so I used blankets and chairs to build her a special reading fort.",
      reflection: "How can creativity make kindness more fun?",
      color: "pink" as const,
      character: "Theo",
      icon: <Palette className="w-4 h-4" />
    },
    {
      id: 6,
      theme: "Thoughtful Moments",
      title: "Remembered Oliver's advice",
      content: "When I felt nervous about the school play, I remembered Oliver's words about taking deep breaths.",
      reflection: "Whose advice helps you feel calm?",
      color: "purple" as const,
      character: "Oliver",
      icon: <Brain className="w-4 h-4" />
    }
  ];

  const characterTraits = [
      { 
        name: "Luma", 
        trait: "Brave Heart", 
        color: "from-pink-100 to-pink-50", 
        icon: <Sparkles className="w-5 h-5 text-pink-600" />,
        description: "Helps you find courage in small moments, just like she does in her adventures.",
        image: "https://youmatterluma.com/wp-content/uploads/2025/09/Instagram-Grey-Passion-Struck-podcast-with-John-R.-Miles-Instagram-White-Solo-Cover-for-Episode-663.png",
        style: { position: "absolute" as const,width: "auto",height: "13rem",bottom: "0rem",left: "14rem", transform: 'scaleX(-1)' }
      },
    { 
      name: "Oliver", 
      trait: "Wise Friend", 
      color: "from-amber-100 to-amber-50", 
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      description: "Reminds you to listen deeply and offer wise, comforting words.",
      image: "https://youmatterluma.com/wp-content/uploads/2025/09/Instagram-Grey-Passion-Struck-podcast-with-John-R.-Miles-Instagram-White-Solo-Cover-for-Episode-663-1.png",
      style: { position: "absolute" as const,width: "auto",height: "13rem",bottom: "0rem",left: "14rem" }
    },
    { 
      name: "Wren", 
      trait: "Creative Voice", 
      color: "from-blue-100 to-blue-50", 
      icon: <MessageCircle className="w-5 h-5 text-blue-600" />,
      description: "Encourages creative expressions of kindness through art and music.",
      image: "https://youmatterluma.com/wp-content/uploads/2025/09/bird_1.png",
      style: { position: "absolute" as const,width: "auto",height: "13rem",bottom: "0rem",left: "14rem" }
    },
    { 
      name: "Sage", 
      trait: "Loyal Companion", 
      color: "from-green-100 to-green-50", 
      icon: <Users className="w-5 h-5 text-green-600" />,
      description: "Shows how loyalty and making others feel welcome creates belonging.",
      image: "https://youmatterluma.com/wp-content/uploads/2025/09/base_2.png",
      style: { position: "absolute" as const,width: "auto",height: "13rem",bottom: "0rem",left: "14rem" }
    },
    { 
      name: "Theo", 
      trait: "Imaginative Builder", 
      color: "from-orange-100 to-orange-50", 
      icon: <Zap className="w-5 h-5 text-orange-600" />,
      description: "Inspires imaginative ways to solve problems and build connections.",
      image: "https://youmatterluma.com/wp-content/uploads/2025/09/base_3.png",
      style: { position: "absolute" as const,width: "auto",height: "13rem",bottom: "-1rem",left: "13rem" }
    },
    { 
      name: "Zin", 
      trait: "Emotional Guide", 
      color: "from-teal-100 to-teal-50", 
      icon: <Heart className="w-5 h-5 text-teal-600" />,
      description: "Teaches how understanding big feelings leads to compassionate actions.",
      image: "https://youmatterluma.com/wp-content/uploads/2025/09/tortoise_1.png",
      style: { position: "absolute" as const,width: "auto",height: "15rem",bottom: "-2rem",left: "15rem" }
    }
  ];

  return (
    <main className="min-h-screen font-teachers overflow-x-hidden bg-white text-[#2D3748] relative">
      {/* Global Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-15 z-0 mix-blend-multiply"
        style={{ backgroundImage: `url(${waterPencilTexture})` }}
      />

      <Seo
        title="Hero Wall — Pass The Ripple"
        description="A storybook where every act of kindness becomes a page in your personal journey. Join Luma and friends in celebrating what truly matters."
        canonical={`${window.location.origin}/hero-wall`}
      />

      {/* ================= SECTION 1: STORYBOOK HERO BANNER ================= */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 md:pb-24 px-4 bg-gradient-to-b from-[#FFF5F7] via-[#FFE4F1] to-white z-10 overflow-hidden">
        {/* Animated Watercolor Clouds */}
        <div className="absolute top-10 left-10 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-pink-200/30 blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-20 right-20 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-purple-200/30 blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
        <div className="absolute bottom-20 right-10 w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-blue-200/25 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-32 h-32 rounded-full bg-yellow-200/20 blur-2xl"></div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid md:grid-cols-[70%_30%] gap-8 sm:gap-10 md:gap-12 items-center min-h-[400px] sm:min-h-[500px]">
            <div className="text-center md:text-left relative">
              {/* Hand-drawn badge with watercolor splash */}
              <div className="inline-block mb-4 sm:mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-300/40 to-purple-300/40 rounded-full blur-lg scale-125"></div>
                <div className="relative px-4 sm:px-5 py-2.5 bg-gradient-to-r from-pink-50 to-purple-50 backdrop-blur-sm rounded-full font-bold text-xs sm:text-sm border-2 border-pink-300/50 shadow-md" style={{ transform: 'rotate(-1.5deg)' }}>
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 animate-pulse" />
                    <span className="hidden sm:inline text-pink-800">Where Everyday Kindness Becomes a Story</span>
                    <span className="sm:hidden text-pink-800">Your Kindness Story</span>
                  </span>
                </div>
              </div>

              <div className="mb-4 sm:mb-6 relative">
                {/* Watercolor Title with Enhanced Design */}
                <div className="relative inline-block">
                  <h1 className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#2D3748] mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
                    Your Personal <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500">
                      Kindness Storybook
                      {/* Watercolor splash under gradient text */}
                      <span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-pink-300/50 via-purple-300/50 to-pink-300/50 blur-md"></span>
                    </span>
                  </h1>
                  {/* Hand-drawn decorative underline */}
                  <div className="h-1.5 w-20 sm:w-32 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full mx-auto md:mx-0 mt-2 shadow-sm" style={{ transform: 'rotate(-1deg)' }}></div>
                </div>
              </div>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-lg mx-auto md:mx-0 px-2 sm:px-0">
                A magical place where every kind thing you do becomes a colorful page in your journey.
                Each ripple tells your unique story of courage, care, and connection—just like Luma's adventures.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start pt-2">
                <WaterPencilButton
                  href="/register"
                  variant="pink"
                  shape={1}
                  className="w-full sm:w-auto min-w-[200px] group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Your Storybook
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </WaterPencilButton>
                <WaterPencilButton
                  href="#how-it-works"
                  variant="purple"
                  shape={2}
                  className="w-full sm:w-auto min-w-[180px]"
                >
                  How It Works
                </WaterPencilButton>
              </div>
              
              {/* Character badges */}
              {/* <div className="mt-10 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Meet your kindness guides:</p>
                <div className="flex flex-wrap gap-2">
                  {characterTraits.slice(0, 4).map((char, index) => (
                    <div key={index} className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${char.color} text-sm font-medium text-gray-700 flex items-center gap-1.5`}>
                      {char.icon}
                      <span>{char.name}</span>
                      <span className="text-gray-500 text-xs">• {char.trait}</span>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>

            <StorybookCarousel />
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: ONE RIPPLE, ONE STORY ================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-amber-50/20 relative">
        <div className="container mx-auto max-w-6xl px-4 relative">
          <div className="rounded-3xl overflow-hidden border-2 border-amber-100 bg-white shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full text-white font-bold text-xs sm:text-sm shadow-md">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">One Ripple, One Story</span>
                <span className="sm:hidden">Today's Story</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="pt-12 pb-8 px-4 sm:px-6 md:px-8">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-800 mb-3 px-2">Helping a New Friend Feel Welcome</h3>
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-blue-50/80 backdrop-blur-sm rounded-full text-blue-700 text-xs sm:text-sm font-semibold border border-blue-200">
                  <Heart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chosen because it showed courage to reach out</span>
                  <span className="sm:hidden">Courage to reach out</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                <div className="lg:w-[60%] flex flex-col">
                  <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                    <div className="h-64 sm:h-80 lg:h-96">
                      <img
                        src={storyScene}
                        alt="Featured ripple story with Luma character"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:w-[40%] flex flex-col">
                  <div className="bg-gradient-to-br from-white to-amber-50/50 p-6 rounded-2xl border border-amber-100 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <MessageCircle className="w-5 h-5 text-pink-500" />
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg leading-relaxed italic mb-4">
                          "I saw someone sitting alone at lunch today. I remembered how Luma felt in the story when she was new to the forest, so I took a deep breath and went over. I asked if they wanted to join our table. We talked about our favorite animals and now we're going to draw dinosaurs together tomorrow!"
                        </p>
                      </div>
                    </div>

                    {/* Reflection prompt */}
                    {/* <div className="mt-6 p-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-3 mb-2">
                        <HandHeart className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-amber-800">Reflection Prompt</h4>
                      </div>
                      <p className="text-amber-700">
                        How would you help someone feel included? Remember what Oliver says: "Sometimes the bravest thing is to be the first to say hello."
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>
              
              {/* Rotation and Context Statement - Critical for Client Feedback */}
              <div className="text-center mt-6 sm:mt-8 pt-6 border-t border-amber-100">
                <div className="max-w-2xl mx-auto space-y-2">
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
                    <span className="text-amber-600">Every story gets its turn to shine.</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    We rotate stories daily by theme—not by popularity or size. Tomorrow might feature a first-time rippler, a creative act, or a quiet moment of bravery. All kindness matters equally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-blue-50/20 relative">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full font-bold text-sm mb-6 border border-blue-200">
              <BookOpen className="w-4 h-4" />
              Your Kindness Journey
            </div>
            <h2 className="font-black text-3xl md:text-4xl lg:text-5xl text-[#2D3748] mb-6">
              How Your Storybook <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Grows</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Just like Luma's adventures, your kindness journey unfolds one beautiful page at a time.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            <div className="relative h-full min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-blue-50 rounded-3xl transform rotate-3 shadow-lg"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-full">
                <div className="h-full w-full">
                  <img
                    src={communityHands}
                    alt="Children creating kindness stories together"
                    className="w-full h-full object-fit"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="mb-8">
                <h3 className="font-bold text-2xl md:text-3xl text-gray-800 mb-4">
                  Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Kindness Legacy</span>
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  Imagine a storybook that grows with every kind thing you do. Each act becomes a colorful page, and together they tell the story of your heart.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 flex-1">
                {[
                  { step: 1, title: "Notice", desc: "Spot an opportunity for kindness", color: "bg-blue-50", icon: <Target className="w-6 h-6 text-blue-600" /> },
                  { step: 2, title: "Act", desc: "Do something kind from your heart", color: "bg-pink-50", icon: <Heart className="w-6 h-6 text-pink-600" /> },
                  { step: 3, title: "Share", desc: "Tell your story in the storybook", color: "bg-green-50", icon: <BookHeart className="w-6 h-6 text-green-600" /> },
                  { step: 4, title: "Grow", desc: "Watch your kindness collection grow", color: "bg-amber-50", icon: <Sparkles className="w-6 h-6 text-amber-600" /> }
                ].map((item, index) => (
                  <WaterPencilCard 
                    key={index} 
                    variant={index === 0 ? "blue" : index === 1 ? "pink" : index === 2 ? "green" : "orange"} 
                    shape={(index % 3 + 1) as 1 | 2 | 3}
                    className="h-full"
                  >
                    <div className="flex items-start gap-4 h-full">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-sm font-bold">
                            {item.step}
                          </div>
                          <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
                        </div>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  </WaterPencilCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: STORIES BY THEME (FROM API) ================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-pink-50/10">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Anti-Ranking Guardrail Statement */}
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-4 sm:p-6 border-2 border-pink-200 shadow-sm mb-8">
              <div className="flex items-start justify-center gap-3">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-pink-500 text-pink-500 shrink-0 mt-1" />
                <div className="text-left sm:text-center">
                  <p className="text-pink-900 font-bold text-base sm:text-lg mb-2">
                    Stories, Not Scores
                  </p>
                  <p className="text-pink-700 text-sm sm:text-base leading-relaxed">
                    These ripples are grouped by theme, not ranked by size or "likes." Your kitchen-table kindness matters just as much as a classroom project. This is a gallery, not a feed.
                  </p>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full font-bold text-xs sm:text-sm mb-4 sm:mb-6 border border-pink-200">
              <FolderHeart className="w-4 h-4" />
              Kindness by Theme
            </div>
            <WaterPencilTitle text="Stories That Moved Us" variant="lite" size="lg" className="mb-3 sm:mb-4" />
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Organized by the kind of kindness shown—not by who did "most" or "best."
            </p>
          </div>

          {/* Stories Section Component */}
          <StoriesFromAPI />
        </div>
      </section>

      {/* ================= SECTION 5: CHARACTER CONNECTIONS ================= */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full font-bold text-sm mb-6 border border-blue-200">
              <Users className="w-4 h-4" />
              Your Kindness Companions
            </div>
            <WaterPencilTitle text="Meet Your Storybook Friends" variant="lite" size="lg" className="mb-4" />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Just like in Luma's adventures, each character represents a different way of showing kindness.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characterTraits.map((char, index) => (
              <WaterPencilCard 
                key={index} 
                variant={index === 0 ? "pink" : index === 1 ? "orange" : index === 2 ? "blue" : index === 3 ? "green" : index === 4 ? "purple" : "blue"} 
                shape={((index % 3) + 1) as 1 | 2 | 3}
                className="h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    {/* <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white to-gray-50 border-4 border-white shadow-md flex items-center justify-center flex-shrink-0"> */}
                      <img
                        style={char.style}
                        src={char.image}
                        alt={char.name}
                        className="w-12 h-12 object-contain"
                      />
                    {/* </div> */}
                    <div>
                      <h4 className="font-bold text-xl text-gray-800">{char.name}</h4>
                      <p className="text-gray-600 text-sm">{char.trait}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 flex-1" style={{width:"75%"}}>{char.description}</p>
                </div>
              </WaterPencilCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: YOUR COLLECTION ================= */}
      <section className="py-20 bg-gradient-to-b from-white to-amber-50/20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full font-bold text-sm mb-6 border border-amber-200">
              <Award className="w-4 h-4" />
              Your Future Collection
            </div>
            <WaterPencilTitle text="See Your Storybook Grow!" variant="lite" size="lg" className="mb-4" />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Each kindness creates a unique, beautiful page in your personal storybook.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {[cardHelper, cardShare, cardInvite, cardThankYou].map((card, index) => (
              <div key={index} className="group cursor-pointer relative">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white transform group-hover:-translate-y-2 transition-all duration-300">
                  {/* <div className="aspect-square bg-gradient-to-br from-white to-gray-50"> */}
                    <img
                      src={card}
                      alt="Kindness card example"
                      className="w-full h-full object-fit"
                    />
                  {/* </div> */}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <WaterPencilButton
              href="/register"
              variant="gradient"
              shape={2}
              className="w-full sm:w-auto min-w-[240px]"
            >
              <span className="flex items-center justify-center gap-2">
                Start Adding Pages
              </span>
            </WaterPencilButton>
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: VALUES & PRIVACY ================= */}
<section className="py-20 bg-gradient-to-b from-white to-pink-50/20">
  <div className="container mx-auto max-w-6xl px-4">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full font-bold text-sm mb-6 border border-pink-200">
        <Shield className="w-4 h-4" />
        Your Safe Storybook Space
      </div>
      <h2 className="font-black text-3xl md:text-4xl text-[#2D3748] mb-6">
        A Space That <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Grows With You</span>
      </h2>
      <p className="text-gray-600 max-w-2xl mx-auto text-lg">
        Where memories are treasured and privacy is protected—creating a safe haven for your kindness journey.
      </p>
    </div>

    {/* Combined two-column layout */}
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: More Than Just Memories */}
      <WaterPencilCard variant="pink" shape={1} className="h-full flex flex-col border-2 border-pink-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-100 to-pink-50 rounded-full font-bold text-sm mb-6 border border-pink-200">
            <BookHeart className="w-4 h-4" />
            More Than Just Memories
          </div>
          <h3 className="font-bold text-2xl text-gray-800 mb-6">Your Kindness Legacy</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 flex-1">
          {[
            {
              icon: <BookHeart className="w-6 h-6 text-pink-600" />,
              title: "Remember Your Growth",
              description: "Watch how your courage and kindness grow with each ripple, like Luma's journey.",
              color: "from-pink-50 to-pink-100/50"
            },
            {
              icon: <Smile className="w-6 h-6 text-blue-600" />,
              title: "Celebrate What Matters",
              description: "Not scores or likes, but the real moments where you made someone's world brighter.",
              color: "from-blue-50 to-blue-100/50"
            },
            {
              icon: <Sparkles className="w-6 h-6 text-amber-600" />,
              title: "Inspire Your Heart",
              description: "Return to your stories when you need a reminder of the good you carry within.",
              color: "from-amber-50 to-amber-100/50"
            }
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-xl bg-gradient-to-br ${item.color} border border-white/50 flex items-start gap-4`}>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-pink-100">
          <p className="text-gray-600 italic text-center text-sm">
            "We don't remember days, we remember moments. Your kindness storybook is a collection of moments that matter."
          </p>
        </div>
      </WaterPencilCard>

      {/* Right: Your Private Sanctuary */}
      <WaterPencilCard variant="green" shape={2} className="h-full flex flex-col border-2 border-green-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-100 to-emerald-50 rounded-full font-bold text-sm mb-6 border border-green-200">
            <Shield className="w-4 h-4" />
            Your Private Sanctuary
          </div>
          <h3 className="font-bold text-2xl text-gray-800 mb-6">Safe & Protected</h3>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Lock className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-center mb-8">
            Your kindness storybook is 100% private—a safe space just for you and your grown-ups. 
            No strangers, no judgments, no comparisons.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, text: "COPPA Compliant" },
            { icon: <User className="w-5 h-5 text-green-600" />, text: "Parent Verified" },
            { icon: <Eye className="w-5 h-5 text-green-600" />, text: "No Public Sharing" },
            { icon: <Shield className="w-5 h-5 text-green-600" />, text: "Human Moderated" }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center p-3 rounded-xl bg-white/80 border border-green-100">
              <div className="mb-2">{item.icon}</div>
              <span className="text-xs font-bold text-green-700 text-center">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-green-100">
          <p className="text-gray-600 text-center text-sm">
            <span className="font-medium text-green-600">Like Sage's den in the forest</span>—a safe, warm place where you can be yourself.
          </p>
        </div>
      </WaterPencilCard>
    </div>

    {/* Combined CTA */}
    <div className="text-center mt-12">
      <WaterPencilButton
        href="/register"
        variant="gradient"
        shape={2}
        className="w-full sm:w-auto min-w-[240px]"
      >
        <span className="flex items-center justify-center gap-2">
          Start Your Safe Journey
          <ArrowRight className="w-5 h-5" />
        </span>
      </WaterPencilButton>
    </div>
  </div>
</section>

      {/* ================= SECTION 9: FINAL CTA ================= */}
      <section className="py-28 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('/assets/water-pencil-texture.png')] mix-blend-overlay"></div>
        
        <div className="container mx-auto max-w-4xl px-4 relative z-10 text-white">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full font-bold text-sm mb-8 border border-white/30">
              <Sparkles className="w-4 h-4" />
              Your Story Awaits
              <Sparkles className="w-4 h-4" />
            </div>
            
            <h2 className="font-black text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
              Ready to Begin Your <span className="text-yellow-300">Kindness Journey</span>?
            </h2>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
              Join Luma, Oliver, Wren, Sage, Theo, and Zin in creating a storybook filled with moments that matter. 
              Your first ripple is waiting to become a beautiful page in your personal adventure.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <WaterPencilButton
              href="/register"
              shape={3}
              variant="white"
              className="w-full sm:w-auto min-w-[240px]"
            >
              <span className="flex items-center justify-center gap-2 font-bold">
                Create My Storybook
                <ArrowRight className="w-5 h-5" />
              </span>
            </WaterPencilButton>
            
            <WaterPencilButton
              href="/about"
              shape={1}
              className="w-full sm:w-auto min-w-[200px]"
            >
              Meet All the Characters
            </WaterPencilButton>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm">
              Every child's kindness story matters. No rankings, no competition—just celebration.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HeroWall;