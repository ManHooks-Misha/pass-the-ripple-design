import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { ChevronDown, Trophy, Medal, Star, Calendar, Target, Flag, ArrowRight, Zap, Award, Menu, Sparkles, HandHeart } from "lucide-react";
import waterPencilTexture from "@/assets/water-pencil-texture.png";
import WaterPencilTitle from '@/components/ui/WaterPencilTitle';
import WaterPencilButton from '@/components/ui/WaterPencilButton';
import WaterPencilCard from '@/components/ui/WaterPencilCard';
import FootprintPath from '@/components/ui/FootprintPath';

const PublicChallenges = () => {
  return (
    <main className="min-h-screen font-teachers overflow-x-hidden bg-[#FFFBEB]">
      <Seo
        title="Kindness Challenges — Pass The Ripple"
        description="Optional themed missions to inspire your next act of kindness. Earn badges and conquer quests!"
        canonical={`${window.location.origin}/challenges`}
      />

      {/* ================= SECTION 1: HERO - THE ADVENTURE BEGINS ================= */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 z-0 pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm shadow-sm rounded-full text-orange-600 font-bold text-sm mb-8 border border-orange-100">
                <Sparkles className="w-4 h-4" />
                <span>Choose Your Kindness Adventure</span>
              </div>

              <div className="mb-8">
                <div className="mb-8">
                  <WaterPencilTitle text="Every Ripple Starts With a Single Act." className="justify-center lg:justify-start" />
                </div>
              </div>

              <p className="text-[20px] md:text-[24px] text-[#4A5568] mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Not sure where to begin? Pick a themed mission card, complete the quest, and become a certified Ripple Hero!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <WaterPencilButton
                  href="#themes"
                  variant="orange"
                  shape={1}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Pick a Challenge
                </WaterPencilButton>

                <WaterPencilButton href="/post-story" variant="blue" shape={2}>
                  I Have an Idea
                </WaterPencilButton>
              </div>
            </div>

            {/* Hero Image Collage */}
            <div className="relative">
              <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-700 ease-out">
                <img
                  src="/assets/images/challenges/challenges-collage.jpg"
                  alt="Kindness Adventure Map"
                  className="w-full h-auto rounded-[40px] shadow-2xl border-[8px] border-white transform rotate-2"
                />

                {/* Floating "Sticker" Elements */}
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center animate-bounce duration-[3000ms hidden md:flex]">
                  <img src="/assets/images/challenges/community-champions-card.png" alt="Badge" className="w-24 h-24 object-contain" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SECTION 2: HOW IT WORKS - ILLUSTRATED FLOW ================= */}
      <section className="py-24 bg-white relative border-y border-orange-100">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: `url(${waterPencilTexture})` }} />

        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="mb-4">
              <WaterPencilTitle text="How to Play" variant="lite" className="justify-center" size="md" />
            </div>
            <p className="text-xl text-gray-500">Three simple steps to make a difference</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center relative">
            {/* Decorative Footprint Path (Desktop) */}
            <FootprintPath className="absolute inset-0 z-0" footprints={[
              { top: "40%", left: "28%", rotation: -25, color: "#ec4899", size: 36 },
              { top: "55%", left: "35%", rotation: 15, color: "#a855f7", size: 40 },
              { top: "35%", left: "60%", rotation: -10, color: "#3b82f6", size: 38 },
              { top: "50%", left: "68%", rotation: 20, color: "#22c55e", size: 40 },
            ]} />

            {/* Step 1 */}
            <div className="text-center relative group">
              <div className="w-48 h-48 mx-auto bg-[#FFF5F5] rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white group-hover:scale-110 transition-transform duration-300">
                <img src="/assets/images/challenges/challenges-icons.jpg" alt="Choose" className="w-32 h-32 object-cover rounded-full opacity-90" style={{ objectPosition: "0 0" }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">1. Choose a Card</h3>
              <p className="text-gray-600 px-8">Find a theme that speaks to you.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative group">
              <div className="w-48 h-48 mx-auto bg-[#F0FFF4] rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white group-hover:scale-110 transition-transform duration-300">
                <HandHeart className="w-20 h-20 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">2. Do the Deed</h3>
              <p className="text-gray-600 px-8">Complete the act of kindness in real life.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative group">
              <div className="w-48 h-48 mx-auto bg-[#FFFFF0] rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-20 h-20 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">3. Earn Rewards</h3>
              <p className="text-gray-600 px-8">Log your story and collect your badge!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: THE CHALLENGES - STORYBOOK GRID ================= */}
      <section id="themes" className="py-24 bg-[#FFFBEB] relative">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4">
              Weekly Challenge #42
            </span>
            <div className="mb-6 flex justify-center">
              <WaterPencilTitle text="Global Kindness Challenge" variant="lite" className="justify-center" size="md" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of Ripplers worldwide in our mission to spread joy. This week's goal: <span className="font-bold text-pink-500">10,000 High Fives!</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

            {/* Card 1: At Home Helpers - Warm Orange Theme */}
            <WaterPencilCard variant="orange" className="h-full">
              <div className="flex flex-col md:flex-row gap-6 overflow-hidden items-center group h-full">
                <div className="w-full md:w-1/2 h-64 md:h-auto self-stretch relative overflow-hidden rounded-[24px]">
                  <img
                    src="/assets/images/challenges/at-home-helpers.jpg"
                    alt="At Home Helpers"
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                    Family First
                  </div>
                </div>
                <div className="flex-1 py-4 md:py-8 pr-4 text-center md:text-left">
                  <h3 className="font-black text-3xl text-gray-800 mb-3">At Home Helpers</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Small hands can confirm big love! Help with chores, organize your room, or surprise mom and dad.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                    <span className="px-3 py-1 bg-white/60 text-orange-700 rounded-lg text-sm font-bold border border-orange-100">Make Bed</span>
                    <span className="px-3 py-1 bg-white/60 text-orange-700 rounded-lg text-sm font-bold border border-orange-100">Set Table</span>
                  </div>
                  <WaterPencilButton variant="orange" shape={1} className="w-full">
                    Start Quest
                  </WaterPencilButton>
                </div>
              </div>
            </WaterPencilCard>

            {/* Card 2: School Superstars - Cool Purple Theme */}
            <WaterPencilCard variant="purple" className="h-full">
              <div className="flex flex-col md:flex-row gap-6 overflow-hidden items-center group h-full">
                <div className="w-full md:w-1/2 h-64 md:h-auto self-stretch relative overflow-hidden rounded-[24px]">
                  <img
                    src="/assets/images/challenges/school-superstars.jpg"
                    alt="School Superstars"
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-purple-600 shadow-sm">
                    Classroom Hero
                  </div>
                </div>
                <div className="flex-1 py-4 md:py-8 pr-4 text-center md:text-left">
                  <h3 className="font-black text-3xl text-gray-800 mb-3">School Stars</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Be the reason someone smiles at school today. Help a teacher or include a new friend.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                    <span className="px-3 py-1 bg-white/60 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">Assist Teacher</span>
                    <span className="px-3 py-1 bg-white/60 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">Share Supplies</span>
                  </div>
                  <WaterPencilButton variant="purple" shape={2} className="w-full">
                    Start Quest
                  </WaterPencilButton>
                </div>
              </div>
            </WaterPencilCard>

            {/* Card 3: Friendship Builders - Pink Theme */}
            <WaterPencilCard variant="pink" className="h-full">
              <div className="flex flex-col md:flex-row gap-6 overflow-hidden items-center group h-full">
                <div className="w-full md:w-1/2 h-64 md:h-auto self-stretch relative overflow-hidden rounded-[24px]">
                  <img
                    src="/assets/images/challenges/friendship-builders.jpg"
                    alt="Friendship Builders"
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-pink-600 shadow-sm">
                    Best Buds
                  </div>
                </div>
                <div className="flex-1 py-4 md:py-8 pr-4 text-center md:text-left">
                  <h3 className="font-black text-3xl text-gray-800 mb-3">Friend Builders</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Friends make the world go round! Share your toys, play nice, and create bonds.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                    <span className="px-3 py-1 bg-white/60 text-pink-700 rounded-lg text-sm font-bold border border-pink-100">Play Together</span>
                    <span className="px-3 py-1 bg-white/60 text-pink-700 rounded-lg text-sm font-bold border border-pink-100">Listen</span>
                  </div>
                  <WaterPencilButton variant="pink" shape={3} className="w-full">
                    Start Quest
                  </WaterPencilButton>
                </div>
              </div>
            </WaterPencilCard>

            {/* Card 4: Gratitude Giver - Yellow Theme */}
            <WaterPencilCard variant="orange" className="h-full">
              <div className="flex flex-col md:flex-row gap-6 overflow-hidden items-center group h-full">
                <div className="w-full md:w-1/2 h-64 md:h-auto self-stretch relative overflow-hidden rounded-[24px]">
                  <img
                    src="/assets/images/challenges/gratitude-giver.jpg"
                    alt="Gratitude Giver"
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-yellow-600 shadow-sm">
                    Thank You
                  </div>
                </div>
                <div className="flex-1 py-4 md:py-8 pr-4 text-center md:text-left">
                  <h3 className="font-black text-3xl text-gray-800 mb-3">Gratitude Giver</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    A simple "Thank You" can have a huge effect. Show appreciation to those around you.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                    <span className="px-3 py-1 bg-white/60 text-yellow-700 rounded-lg text-sm font-bold border border-yellow-100">Write Card</span>
                    <span className="px-3 py-1 bg-white/60 text-yellow-700 rounded-lg text-sm font-bold border border-yellow-100">Say Thanks</span>
                  </div>
                  <WaterPencilButton variant="orange" shape={1} className="w-full">
                    Start Quest
                  </WaterPencilButton>
                </div>
              </div>
            </WaterPencilCard>

          </div>
        </div>
      </section>

      {/* ================= SECTION 4: BADGES TREASURE CHEST ================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <div className="inline-block px-4 py-2 bg-yellow-50 text-yellow-600 rounded-full font-bold text-sm mb-6 border border-yellow-100">
            🏆 Your Collection
          </div>
          <h2 className="font-black text-[42px] text-[#2D3748] mb-16">The Treasure Chest</h2>

          <div className="flex flex-wrap justify-center items-center gap-12">
            {/* Featured Badge Card */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-300 to-purple-300 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <img
                src="/assets/images/challenges/school-superstars-card.png"
                alt="Badge Card"
                className="w-64 h-auto relative z-10 transform transition-transform duration-500 hover:rotate-y-12 hover:scale-105 shadow-2xl rounded-[2rem]"
              />
            </div>

            {/* Featured Badge Card 2 */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-300 to-red-300 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <img
                src="/assets/images/challenges/friendship-builders-card.png"
                alt="Badge Card"
                className="w-64 h-auto relative z-10 transform transition-transform duration-500 hover:-rotate-y-12 hover:scale-105 shadow-2xl rounded-[2rem]"
              />
            </div>

            {/* Locked Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8 bg-gray-50 rounded-[32px] border-4 border-dashed border-gray-200">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: CTA ================= */}
      <section className="py-24 text-center bg-[#FFF5F5] overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-white rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl px-4 relative z-10">
          <div className="mb-4">
            <WaterPencilTitle text="Ready to Start Your Journey?" variant="lite" className="justify-center" size="md" />
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
            <WaterPencilButton href="/register" variant="orange" shape={2}>
              Join the Adventure
            </WaterPencilButton>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PublicChallenges;