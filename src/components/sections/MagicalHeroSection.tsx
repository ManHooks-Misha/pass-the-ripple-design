import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Heart, ArrowRight, ChevronLeft, ChevronRight, Target, Users, Globe, Zap, Smile, Gift, Star, CheckCircle, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Import slider images
import slider1 from "@/assets/slider1.jpeg";
import slider2 from "@/assets/slider2.jpeg";
import slider3 from "@/assets/slider3.jpeg";
import heroKindness from "@/assets/hero-kindness.jpg";
import heroChildrenRipple from "@/assets/hero-children-ripple.jpg";

const MagicalHeroSection = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = [
    {
      id: 1,
      image: slider1,
      headline: "Hey Superhero! Ready to Create Ripples?",
      subtext: "A place where every act of kindness creates ripples that spread across the world. Join thousands of young heroes making a real difference!",
      primaryButton: { text: "Start Your Journey", icon: Sparkles, link: "/age-gate" },
      keyPoints: [
        { icon: Heart, text: "Spread Kindness", color: "text-purple-600" },
        { icon: Star, text: "Easy to Start", color: "text-green-600" },
        { icon: Shield, text: "Safe & Moderated", color: "text-blue-600" },
        { icon: Users, text: "Join 10,000+ Heroes", color: "text-pink-600" }
      ]
    },
    {
      id: 2,
      image: slider2,
      headline: "Why Every Ripple Matters!",
      subtext: "We believe kindness is the most powerful force for positive change. Every small act creates a ripple effect that reaches far beyond what we can see. We're building a platform where you can see the real impact of your actions!",
      primaryButton: { text: "Learn More", icon: Heart, link: "/age-gate" },
      keyPoints: [
        { icon: Globe, text: "Make Kindness Visible", color: "text-blue-600" },
        { icon: Target, text: "Track Your Impact", color: "text-red-600" },
        { icon: Zap, text: "Watch It Spread", color: "text-yellow-600" },
        { icon: Smile, text: "Inspire Others", color: "text-pink-600" }
      ]
    },
    {
      id: 3,
      image: slider3,
      headline: "You're a Kindness Hero!",
      subtext: "You care about making a difference! You believe your actions matter and that kindness can change the world. Whether you want to see your impact, find inspiration, or join a global movement—you're in the right place!",
      primaryButton: { text: "Join the Movement", icon: Users, link: "/age-gate" },
      keyPoints: [
        { icon: Heart, text: "You Care", color: "text-red-600" },
        { icon: Star, text: "You Want to Help", color: "text-orange-600" },
        { icon: Gift, text: "You're Ready", color: "text-purple-600" },
        { icon: CheckCircle, text: "You're Here!", color: "text-green-600" }
      ]
    },
    {
      id: 4,
      image: heroKindness,
      headline: "Let's Make Waves of Kindness Together!",
      subtext: "Together, we're building a global network of kindness! Our shared goal is to create millions of ripples that connect people across cities, countries, and continents. Let's make the world a kinder place—one ripple at a time!",
      primaryButton: { text: "See Our Goals", icon: Target, link: "/age-gate" },
      keyPoints: [
        { icon: Globe, text: "Global Network", color: "text-blue-600" },
        { icon: Heart, text: "Millions of Ripples", color: "text-red-600" },
        { icon: Users, text: "Connect Everyone", color: "text-indigo-600" },
        { icon: Star, text: "Change the World", color: "text-yellow-600" }
      ]
    },
    {
      id: 5,
      image: heroChildrenRipple,
      headline: "Ready to Make Your First Ripple?",
      subtext: "Ready to start your kindness journey? Create your account, share your stories, watch them spread, earn badges, and inspire others. It's free, safe, and takes less than a minute!",
      primaryButton: { text: "Ready to start your first ripple?", icon: Sparkles, link: "/age-gate" },
      keyPoints: [
        { icon: CheckCircle, text: "Create Account", color: "text-green-600" },
        { icon: Heart, text: "Share Stories", color: "text-red-600" },
        { icon: Gift, text: "Earn Badges", color: "text-purple-600" },
        { icon: Star, text: "Inspire Others", color: "text-yellow-600" }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      changeSlide((currentSlide + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);

  const changeSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const nextSlide = () => {
    changeSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    changeSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-[65vh] bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
      <div className="container mx-auto px-4 h-full">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[65vh] py-8 md:py-10">

          {/* Left Side - Content (50%) */}
          <div className="space-y-5 z-10 order-2 md:order-1">
            {/* Brand Badge */}
            <div className="inline-block">
              <div className="bg-white rounded-2xl px-5 py-2.5  hover:-translate-y-1 transition-all">
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  Pass The Ripple
                </h1>
              </div>
            </div>

            {/* Slide Content */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-4xl font-black text-gray-800 leading-tight">
                {currentSlideData.headline}
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                {currentSlideData.subtext}
              </p>
            </div>

            {/* Key Points Grid with staggered animation */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {currentSlideData.keyPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2.5   shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                >
                  <point.icon className={`w-5 h-5 ${point.color} flex-shrink-0`} />
                  <span className="text-xs font-bold text-gray-800">{point.text}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to={currentSlideData.primaryButton.link}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black  hover:-translate-y-1 transition-all group"
                >
                  <currentSlideData.primaryButton.icon className="w-5 h-5 mr-2 animate-spin-slow" />
                  {currentSlideData.primaryButton.text}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {!user && (
                <Link to="/login">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white  hover:bg-gray-100 font-bold  hover:-translate-y-1 transition-all"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center gap-3 pt-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => changeSlide(index)}
                  disabled={isAnimating}
                  className={`h-2 rounded-full   transition-all ${
                    index === currentSlide
                      ? "w-12 sm:w-16 bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse"
                      : "w-8 sm:w-10 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Image Slider */}
          <div className="relative order-1 md:order-2">
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden  shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              {/* Image Slider */}
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.headline}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                disabled={isAnimating}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white  shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 transition-all disabled:opacity-50 z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>

              <button
                onClick={nextSlide}
                disabled={isAnimating}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white  shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 transition-all disabled:opacity-50 z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>

              {/* Slide counter badge */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full   font-black text-sm shadow-md">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-yellow-300 rounded-full  -z-10" />
            <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-pink-400 rounded-full  -z-10" />
          </div>
        </div>
      </div>

      {/* Add custom animations via style tag */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in { animation: slide-in 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.4s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-gradient-shift { 
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default MagicalHeroSection;
