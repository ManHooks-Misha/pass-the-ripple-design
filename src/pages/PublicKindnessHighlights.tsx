import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import {
  Heart,
  Users,
  Sparkles,
  HandHeart,
  Map,
  Globe,
  Shuffle,
  Quote,
  Navigation,
  Footprints,
  Star,
  Music,
  Home,
  Lightbulb,
  Waves
} from "lucide-react";
import waterPencilTexture from "@/assets/water-pencil-texture.png";

// User Provided Assets
import kindnessSwirl from "@/assets/highlights/kindness-swirl.jpg";
import celebrationRing from "@/assets/highlights/celebration-ring.jpg";
import morningMeeting from "@/assets/highlights/morning-meeting.jpg";
import WaterPencilButton from "@/components/ui/WaterPencilButton";
import WaterPencilCard from "@/components/ui/WaterPencilCard";
import WaterPencilTitle from "@/components/ui/WaterPencilTitle";

// Character-themed story categories inspired by Luma and friends
const characterThemes = [
  {
    character: "Luma",
    theme: "Finding Your Voice",
    tag: "Ripples still traveling",
    color: "bg-purple-100 text-purple-800",
    icon: <Sparkles className="w-5 h-5" />,
    description: "Small acts of courage"
  },
  {
    character: "Oliver",
    theme: "Listening Deeply",
    tag: "Many ripples",
    color: "bg-amber-100 text-amber-800",
    icon: <Star className="w-5 h-5" />,
    description: "Being there for others"
  },
  {
    character: "Wren",
    theme: "Creative Expression",
    tag: "Ripples reached new places",
    color: "bg-sky-100 text-sky-800",
    icon: <Music className="w-5 h-5" />,
    description: "Sharing through art"
  },
  {
    character: "Sage",
    theme: "Making Space for Others",
    tag: "Just started",
    color: "bg-green-100 text-green-800",
    icon: <Home className="w-5 h-5" />,
    description: "Creating belonging"
  },
  {
    character: "Theo",
    theme: "Trying New Things",
    tag: "Ripples growing",
    color: "bg-orange-100 text-orange-800",
    icon: <Lightbulb className="w-5 h-5" />,
    description: "Learning from mistakes"
  },
  {
    character: "Zin",
    theme: "Understanding Big Feelings",
    tag: "Many ripples",
    color: "bg-teal-100 text-teal-800",
    icon: <Waves className="w-5 h-5" />,
    description: "Taking time to calm"
  }
];

// --- REDESIGNED COMPONENT: Story-Focused, No Rankings ---
const RippleStoriesDemo = () => {
  const [view, setView] = useState("nearby");
  const [displayedStories, setDisplayedStories] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);

  // Randomize stories on mount and shuffle
  const shuffleStories = () => {
    setIsShuffling(true);
    const shuffled = [...characterThemes].sort(() => Math.random() - 0.5);
    setTimeout(() => {
      setDisplayedStories(shuffled.slice(0, 6));
      setIsShuffling(false);
    }, 300);
  };

  useEffect(() => {
    shuffleStories();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border-4 border-indigo-50 max-w-7xl mx-auto relative overflow-hidden" style={{ transform: 'rotate(-0.5deg)' }}>
      {/* Watercolor wash background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 opacity-60 blur-3xl"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* ENHANCED GUARDRAIL with Storybook Border */}
        <div className="relative mb-8">
          {/* Hand-drawn border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl blur-md opacity-50"></div>
          <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 text-center border-3 border-indigo-300/40 shadow-lg backdrop-blur-sm" style={{ transform: 'rotate(0.5deg)' }}>
            <div className="flex items-start justify-center gap-3 mb-2">
              <div className="relative">
                {/* Heart with glow */}
                <div className="absolute inset-0 bg-indigo-400 rounded-full blur-lg opacity-40"></div>
                <Heart className="relative w-5 h-5 sm:w-6 sm:h-6 fill-indigo-600 text-indigo-600 shrink-0 mt-1 animate-pulse" style={{ animationDuration: '2s' }} />
              </div>
              <div className="text-left sm:text-center">
                <p className="text-indigo-900 font-black text-base sm:text-lg mb-2 relative inline-block">
                  Ripples don't compete. They travel.
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-indigo-300/50 to-purple-300/50 blur-sm"></span>
                </p>
                <p className="text-indigo-700 text-sm sm:text-base leading-relaxed font-medium">
                  This space shows kindness in motion, not who is "best." Every ripple matters, whether it's your first one or your hundredth. <span className="text-yellow-500">✨</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* VIEW TOGGLE - Geography, not Hierarchy (Feedback #4) */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 px-2">
        <button
          onClick={() => setView("nearby")}
          className={`px-6 py-3 rounded-full font-bold transition-all text-sm sm:text-base flex items-center justify-center gap-2 ${
            view === 'nearby'
              ? 'bg-pink-500 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:scale-102'
          }`}
        >
          <Map className="w-4 h-4" />
          Nearby Ripples
        </button>
        <button
          onClick={() => setView("global")}
          className={`px-6 py-3 rounded-full font-bold transition-all text-sm sm:text-base flex items-center justify-center gap-2 ${
            view === 'global'
              ? 'bg-purple-500 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:scale-102'
          }`}
        >
          <Globe className="w-4 h-4" />
          Ripples Around the World
        </button>
      </div>

      {/* STORY CARDS - Watercolor Storybook Style (Feedback #6) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-opacity duration-300 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
        {displayedStories.map((story, i) => {
          const rotations = [-1, 0.5, -0.5, 1, -1.5, 0.5];
          const rotation = rotations[i % rotations.length];

          // Extract color properly - "bg-purple-100 text-purple-800"
          const bgColorClass = story.color.split(' ')[0]; // "bg-purple-100"
          const textColorClass = story.color.split(' ')[1]; // "text-purple-800"

          return (
            <div
              key={`${story.character}-${i}`}
              className="group relative rounded-2xl p-5 sm:p-6 hover:-translate-y-3 transition-all duration-500 shadow-lg hover:shadow-2xl bg-gradient-to-br from-white via-gray-50/50 to-white overflow-hidden border-2 border-gray-100 hover:border-gray-200"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Watercolor wash background */}
              <div className={`absolute inset-0 opacity-20 blur-2xl ${bgColorClass}`}></div>

              <div className="relative z-10">
                {/* Icon and Character Name with watercolor glow */}
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    {/* Watercolor glow behind icon */}
                    <div className={`absolute inset-0 ${bgColorClass} rounded-xl blur-lg opacity-40 scale-125`}></div>
                    <div className={`relative p-3 ${bgColorClass} rounded-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-md`}>
                      {story.icon}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${textColorClass}`}>
                      {story.character}
                    </span>
                    {/* Small decorative star */}
                    <span className="text-yellow-400 text-xs">★</span>
                  </div>
                </div>

                {/* Story Theme with hand-drawn underline */}
                <h4 className="font-bold text-lg sm:text-xl text-gray-800 mb-3 leading-tight relative inline-block">
                  {story.theme}
                  <span className={`absolute -bottom-1 left-0 right-0 h-1 ${bgColorClass} opacity-30 blur-sm`}></span>
                </h4>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 leading-relaxed font-medium">
                  {story.description}
                </p>

                {/* QUALITATIVE TAG with watercolor effect */}
                <span className={`inline-block px-3 py-2 rounded-full text-xs font-bold ${story.color} border-2 border-current shadow-sm relative overflow-hidden`}>
                  <span className="absolute inset-0 bg-white opacity-20"></span>
                  <span className="relative">{story.tag}</span>
                </span>
              </div>

              {/* Corner decoration - decorative watercolor dots */}
              <div className={`absolute top-2 right-2 w-8 h-8 border-2 ${textColorClass} rounded-full opacity-20 blur-sm`}></div>
              <div className={`absolute bottom-2 left-2 w-6 h-6 ${bgColorClass} rounded-full opacity-30 blur-md`}></div>
            </div>
          );
        })}
      </div>

      {/* SHUFFLE BUTTON - Reinforces Randomization */}
      <div className="mt-8 text-center">
        <button
          onClick={shuffleStories}
          disabled={isShuffling}
          className="text-gray-500 text-sm sm:text-base font-medium flex items-center justify-center gap-2 mx-auto hover:text-indigo-600 transition-all hover:scale-105 disabled:opacity-50 bg-gray-50 px-6 py-3 rounded-full hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200"
        >
          <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
          See Different Stories
        </button>
      </div>
      </div>
    </div>
  );
};

const PublicKindnessHighlights = () => {
  return (
    <main className="min-h-screen font-teachers overflow-x-hidden bg-white text-[#2D3748] relative">
      <Seo
        title="Ripples in Motion — Pass The Ripple"
        description="See how kindness travels. No rankings, just ripples."
        canonical={`${window.location.origin}/highlights`}
      />

      {/* Global Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0 mix-blend-multiply"
        style={{ backgroundImage: `url(${waterPencilTexture})` }}
      />

      {/* HERO SECTION - Storybook Watercolor Design */}
      <section className="relative pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 bg-gradient-to-b from-[#F0F4FF] via-[#FCF5FF] to-[#FFF] z-10 overflow-hidden">
        {/* Watercolor Splashes Background */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-center md:text-left relative">
              {/* Hand-drawn badge with watercolor effect */}
              <div className="inline-block mb-4 sm:mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-300/30 to-purple-300/30 rounded-full blur-md scale-110"></div>
                <div className="relative px-5 py-2.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full font-bold text-xs sm:text-sm border-2 border-indigo-300/50 shadow-sm backdrop-blur-sm" style={{ transform: 'rotate(-1deg)' }}>
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">🌊</span>
                    <span className="text-indigo-800 font-extrabold">Ripple Stories</span>
                  </span>
                </div>
              </div>

              <div className="mb-4 sm:mb-6 text-center md:text-left relative">
                {/* Decorative watercolor underline */}
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-pink-300/40 via-purple-300/40 to-blue-300/40 blur-sm"></div>
                <WaterPencilTitle text="Where Ripples Are Traveling" className="justify-center md:justify-start" size="lg" />
              </div>
              {/* Client Feedback #2: Movement over Status */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-lg mx-auto md:mx-0">
                This space shows how kindness moves as it's passed from person to person. Every ripple matters, whether it happens right here or travels across the globe.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start pt-2 sm:pt-4">
                <WaterPencilButton href="/register?role=teacher" variant="purple" shape={2} className="w-full sm:w-[240px]">
                  Start Your Journey
                </WaterPencilButton>
              </div>
            </div>
            <div className="relative mt-8 md:mt-0">
              {/* Storybook Frame with Watercolor Border */}
              <div className="relative z-10 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 sm:border-[8px] border-white transform rotate-1 sm:rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-105">
                {/* Watercolor border effect */}
                <div className="absolute inset-0 border-4 sm:border-8 border-transparent bg-gradient-to-br from-pink-300/30 via-purple-300/30 to-blue-300/30 rounded-2xl sm:rounded-[2.5rem] blur-sm"></div>
                <img src={celebrationRing} alt="Students connecting through kindness" className="w-full h-auto object-cover relative z-10" />

                {/* Hand-drawn corner decorations */}
                <div className="absolute top-4 right-4 w-12 h-12 border-4 border-yellow-300/60 rounded-full blur-sm"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 bg-pink-300/40 rounded-full blur-md"></div>
              </div>

              {/* Watercolor Splatter Decorations */}
              <div className="absolute -top-8 -right-8 sm:-top-10 sm:-right-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-300/50 to-pink-300/50 rounded-full blur-2xl opacity-70 -z-10 animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="absolute -bottom-8 -left-8 sm:-bottom-10 sm:-left-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-300/50 to-teal-300/50 rounded-full blur-2xl opacity-70 -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
              <div className="absolute top-1/2 -left-16 w-24 h-24 bg-yellow-300/30 rounded-full blur-xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CHARACTER-BASED RIPPLE STORIES - Storybook Style */}
      <section className="py-12 sm:py-16 md:py-20 relative z-10 overflow-hidden">
        {/* Watercolor Background Splatters */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-7xl px-4 text-center relative">
           <div className="mb-8 sm:mb-10 md:mb-12 relative">
             {/* Hand-drawn underline decoration */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent rounded-full blur-sm"></div>

             <h2 className="font-black text-xl sm:text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 uppercase tracking-widest mb-4 relative inline-block">
               Stories Over Scores
               {/* Watercolor swoosh under text */}
               <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-purple-300/40 via-pink-300/40 to-blue-300/40 blur-sm rounded-full"></div>
             </h2>

             <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mt-4 relative">
               We celebrate themes of kindness inspired by <span className="font-bold text-purple-600">Luma</span> and friends, not individual rankings.
               {/* Decorative stars */}
               <span className="inline-block ml-2 text-yellow-400">✨</span>
             </p>
           </div>

           {/* Rendering the Story-Based Component */}
           <RippleStoriesDemo />
        </div>
      </section>

      {/* JOURNEY OVER POSITION - Client Feedback #3 */}
      <section className="py-16 sm:py-20 md:py-24 bg-white relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="rounded-xl sm:rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl border-4 border-pink-50 transform -rotate-1 sm:-rotate-2 hover:rotate-0 transition-transform duration-500">
                <img src={kindnessSwirl} alt="Kindness creates beautiful patterns" className="w-full h-auto" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <WaterPencilCard variant="pink" shape={3} className="p-6 sm:p-8">
                <h2 className="font-black text-2xl sm:text-3xl md:text-[40px] lg:text-[48px] text-[#2D3748] mb-4 sm:mb-6 leading-tight">
                  See Your <span className="text-pink-500">Journey</span>,<br className="hidden sm:block" /> Not Your Position
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  Traditional leaderboards tell kids "you are here." We tell them "you went here." See the ripples you've passed and where they've traveled.
                </p>

                <div className="bg-white/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-pink-100">
                  <h3 className="font-bold text-lg sm:text-xl text-pink-900 mb-4 flex items-center gap-2">
                    <Footprints className="w-5 h-5" /> What You'll See
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    <li className="flex items-start gap-3 text-pink-800">
                      <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Globe className="w-4 h-4 text-pink-700" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">Where your ripples have traveled geographically</span>
                    </li>
                    <li className="flex items-start gap-3 text-pink-800">
                      <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Heart className="w-4 h-4 text-pink-700" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">Themes of kindness like "Helping" or "Being Brave"</span>
                    </li>
                    <li className="flex items-start gap-3 text-pink-800">
                      <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Navigation className="w-4 h-4 text-pink-700" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">Stories of how your kindness moved through the world</span>
                    </li>
                  </ul>
                </div>
              </WaterPencilCard>
            </div>
          </div>
        </div>
      </section>

      {/* MEANING OVER METRICS - Client Feedback #5 */}
      <section className="py-16 sm:py-20 md:py-24 bg-[#F7FAFC] relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center">
            <div>
              <h2 className="font-black text-2xl sm:text-3xl md:text-[42px] text-[#2D3748] mb-4 sm:mb-6 leading-tight">
                From Metrics to Meaning
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                We hide the numbers that cause anxiety and highlight the stories that build connection. No trophies, no rankings—just ripples.
              </p>

              <div className="grid gap-4 sm:gap-6">
                <WaterPencilCard variant="green" shape={1} className="p-5 sm:p-6">
                  <h4 className="font-bold text-base sm:text-lg text-green-900 mb-2 flex items-center gap-2">
                    <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                    <span>The "Why" Not The "How Many"</span>
                  </h4>
                  <p className="text-green-800 text-sm sm:text-base leading-relaxed">
                    Instead of asking "Who has the most points?", ask "Which act of kindness surprised you today?"
                  </p>
                </WaterPencilCard>

                <WaterPencilCard variant="blue" shape={2} className="p-5 sm:p-6">
                  <h4 className="font-bold text-base sm:text-lg text-blue-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                    <span>Group Celebrations, Not Individual Competition</span>
                  </h4>
                  <p className="text-blue-800 text-sm sm:text-base leading-relaxed">
                    Celebrate when the whole class's ripples reach a new place, not when one student "beats" another.
                  </p>
                </WaterPencilCard>
              </div>
            </div>
            <div className="relative mt-8 md:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-blue-100 rounded-xl sm:rounded-2xl md:rounded-[2rem] transform rotate-2 sm:rotate-3"></div>
              <img
                src={morningMeeting}
                alt="Teacher leading meaningful kindness discussion"
                className="relative z-10 rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-xl border-4 border-white w-full transform -rotate-1 sm:-rotate-2 hover:rotate-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Journey Focused */}
      <section className="py-20 sm:py-24 md:py-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-center text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-indigo-800 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-80 sm:h-80 bg-purple-800 rounded-full blur-3xl opacity-50 translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto max-w-4xl px-4 relative z-10">
          <h2 className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-[56px] mb-6 sm:mb-8 leading-tight px-4">
            Ready to Start Your Ripple Journey?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-indigo-200 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Join thousands of classrooms focusing on the journey, not the scoreboard. Every act of kindness matters.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
            <WaterPencilButton
              href="/register"
              variant="pink"
              shape={3}
              className="w-full sm:w-[280px]"
            >
              Start Passing Ripples
            </WaterPencilButton>
          </div>

          {/* Additional Reassurance Text */}
          <p className="mt-8 sm:mt-10 text-sm sm:text-base text-indigo-300 italic max-w-xl mx-auto px-4">
            No rankings. No competition. Just the simple joy of passing kindness forward.
          </p>
        </div>
      </section>

    </main>
  );
};

export default PublicKindnessHighlights;