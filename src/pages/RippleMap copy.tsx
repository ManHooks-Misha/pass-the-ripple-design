import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import {
  Globe,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Heart,
  Users,
  Star,
} from "lucide-react";
import waterPencilTexture from "@/assets/water-pencil-texture.png";
import WaterPencilTitle from "@/components/ui/WaterPencilTitle";
import WaterPencilButton from "@/components/ui/WaterPencilButton";
import WaterPencilCard from "@/components/ui/WaterPencilCard";
import FootprintPath from "@/components/ui/FootprintPath";

const RippleMap = () => {
  return (
    <main className="min-h-screen font-teachers overflow-x-hidden bg-gradient-to-b from-[#F0F4FF] to-[#E6F4F1] relative">
      {/* Global Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0 mix-blend-multiply"
        style={{ backgroundImage: `url(${waterPencilTexture})`, backgroundSize: 'cover' }}
      />

      <Seo
        title="Kindness Map — Pass The Ripple"
        description="Watch your kindness travel! See how ripples spread connection around the world safely."
        canonical={`${window.location.origin}/kindness-map`}
      />

      {/* ================= SECTION 1: HERO ================= */}
      <section className="relative pt-32 pb-20 px-4 z-10 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 z-0 pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm shadow-sm rounded-full text-blue-600 font-bold text-sm mb-8 border border-blue-100">
                <Globe className="w-4 h-4" />
                <span>A World Connected by Heart</span>
              </div>

              <div className="mb-8">
                <WaterPencilTitle text="The Kindness Journey" className="justify-center md:justify-start" />
              </div>

              <p className="text-[20px] md:text-[22px] text-[#4A5568] mb-10 leading-relaxed max-w-xl mx-auto md:mx-0">
                Watch your ripples of kindness travel from person to person, creating magical connections across classrooms, schools, and communities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <WaterPencilButton href="/register" variant="blue" shape={1}>
                  Start Your Journey
                </WaterPencilButton>
                <WaterPencilButton href="#how-it-works" variant="purple" shape={2}>
                  See How It Works
                </WaterPencilButton>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-700 ease-out">
                <img
                  src="/assets/ripple-map/world-journey-hero.jpg"
                  alt="The Kindness Journey: A World Connected by Heart"
                  className="w-full h-auto rounded-[40px] shadow-2xl border-[8px] border-white"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-blue-100 hidden md:flex items-center gap-3">
                <Heart className="w-8 h-8 text-pink-500 fill-pink-100" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">Celebrating</p>
                  <p className="text-xs text-gray-500">Global Community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-24 bg-white relative z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: `url(${waterPencilTexture})` }} />

        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="text-center mb-16">
            <WaterPencilTitle text="How Your Kindness Travels" variant="lite" className="justify-center mb-4" size="md" />
            <p className="text-xl text-gray-600">Every act creates a ripple that connects us all</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 md:order-1">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-[2rem] transform -rotate-3"></div>
              <img
                src="/assets/ripple-map/journey-example.jpg"
                alt="Kindness Connects Us All: A Journey"
                className="relative z-10 rounded-[2rem] shadow-xl border-4 border-white w-full transform rotate-2 hover:rotate-0 transition-all duration-500"
              />
            </div>

            {/* Steps */}
            <div className="order-1 md:order-2 space-y-6 relative">
              <FootprintPath className="absolute inset-0 z-0" footprints={[
                { top: "15%", left: "5%", rotation: -15, color: "#3b82f6", size: 30 },
                { top: "45%", left: "8%", rotation: 20, color: "#22c55e", size: 34 },
                { top: "75%", left: "3%", rotation: -10, color: "#a855f7", size: 32 },
              ]} />

              <WaterPencilCard variant="blue" className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-black shadow-lg shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">You Do Something Kind</h3>
                    <p className="text-gray-600">Share your toys, help a friend, or say something nice. Every kindness starts a journey!</p>
                  </div>
                </div>
              </WaterPencilCard>

              <WaterPencilCard variant="green" className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-black shadow-lg shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">They Pass It Forward</h3>
                    <p className="text-gray-600">The person you helped feels good and does something kind for someone else!</p>
                  </div>
                </div>
              </WaterPencilCard>

              <WaterPencilCard variant="purple" className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-black shadow-lg shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Watch the Magic!</h3>
                    <p className="text-gray-600">See a glowing path form on the map as your kindness travels from room to room, school to school!</p>
                  </div>
                </div>
              </WaterPencilCard>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: EXAMPLE JOURNEY ================= */}
      <section className="py-24 bg-[#FFFBEB] relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-4">
              ★ Example Scenario ★
            </span>
            <WaterPencilTitle text="Your Small Act Made a BIG Difference" variant="lite" className="justify-center" size="md" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Journey Detail Image */}
            <div className="relative">
              <img
                src="/assets/ripple-map/journey-detail.jpg"
                alt="Journey Detail"
                className="w-full rounded-[2rem] shadow-2xl border-4 border-white"
              />
            </div>

            {/* Story */}
            <div>
              <WaterPencilCard variant="orange" className="mb-6">
                <h3 className="font-black text-2xl text-gray-800 mb-4">Maria's Kindness Chain</h3>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                    <p><strong>Room 5A:</strong> Maria shared her drawing with Leo</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                    <p><strong>Art Room:</strong> Leo helped clean up for the teacher</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                    <p><strong>Cafeteria:</strong> The teacher invited a new student to sit</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                    <p><strong>Room 3B:</strong> The new student shared their snack!</p>
                  </div>
                </div>
              </WaterPencilCard>
              <p className="text-center text-lg text-gray-600 font-medium italic">
                "One small act of kindness created a journey that touched 4 different places!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: CLASSROOM IMPACT ================= */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <WaterPencilTitle text="See Your Class's Impact" variant="lite" className="justify-center mb-4" size="md" />
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Watch kindness ripple through your classroom, connecting to other rooms and schools!
          </p>

          <div className="relative max-w-4xl mx-auto">
            <img
              src="/assets/ripple-map/class-impact.png"
              alt="The Kindness Ripple: Our Class's Impact"
              className="w-full rounded-[2rem] shadow-2xl border-4 border-white"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="text-4xl font-black text-blue-600 mb-2">247</div>
              <div className="text-sm font-bold text-blue-800">Ripple Count</div>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <div className="text-lg font-black text-green-600 mb-1">Sharing, Helping</div>
              <div className="text-sm font-bold text-green-800">Ripple Themes</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
              <div className="text-lg font-black text-purple-600 mb-1">Including, Thanking</div>
              <div className="text-sm font-bold text-purple-800">Kindness Acts</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <div className="text-lg font-black text-orange-600 mb-1">5 Schools</div>
              <div className="text-sm font-bold text-orange-800">Reach in District</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: PRIVACY ================= */}
      <section className="py-24 bg-[#F0FDF4] relative z-10">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <WaterPencilTitle text="Your Privacy on the Map" variant="lite" className="justify-center mb-4" size="md" />
            <p className="text-xl text-gray-600">We keep kindness magical AND safe!</p>
          </div>

          <div className="relative max-w-3xl mx-auto mb-12">
            <img
              src="/assets/ripple-map/privacy-comparison.png"
              alt="What We Don't Do vs What We Do"
              className="w-full rounded-[2rem] shadow-xl border-4 border-white"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <WaterPencilCard variant="green" className="text-center">
              <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-xl text-green-800 mb-4">Magical, Abstract Map</h3>
              <ul className="space-y-3 text-left text-green-700">
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> General locations only (School, Library)</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> No real addresses or exact locations</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Stories, not personal data</li>
              </ul>
            </WaterPencilCard>

            <WaterPencilCard variant="blue" className="text-center">
              <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-xl text-blue-800 mb-4">Safe & Private</h3>
              <ul className="space-y-3 text-left text-blue-700">
                <li className="flex gap-2"><span className="text-blue-500 font-bold">✓</span> Only you see your own journey</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">✓</span> Kids stay anonymous</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">✓</span> COPPA compliant</li>
              </ul>
            </WaterPencilCard>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: KINDNESS CONNECTS ================= */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <WaterPencilTitle text="Kindness Connects Us All" variant="lite" className="justify-start mb-6" size="md" />
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                When you're kind, you're not just helping one person. You're joining hands with children all over the world who believe in making things better.
              </p>
              <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-2xl border border-pink-100">
                <Users className="w-10 h-10 text-pink-500" />
                <div>
                  <p className="font-bold text-pink-800">Global Ripple Community</p>
                  <p className="text-sm text-pink-600">Thousands of kids spreading joy every day!</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/ripple-map/kindness-connects.jpg"
                alt="Kindness Connects Us All"
                className="w-full rounded-[2rem] shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: CTA ================= */}
      <section className="py-32 text-center bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/assets/water-pencil-texture.png')] mix-blend-overlay"></div>
        <div className="container mx-auto max-w-4xl px-4 relative z-10 text-white">
          <h2 className="font-black text-[36px] md:text-[56px] mb-8 leading-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join the global kindness movement and watch your ripples travel!
          </p>
          <WaterPencilButton href="/register" variant="pink" shape={3} className="w-[280px]">
            Create First Ripple
          </WaterPencilButton>
        </div>
      </section>
    </main>
  );
};

export default RippleMap;
