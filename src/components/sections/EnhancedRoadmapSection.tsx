import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

const EnhancedRoadmapSection = () => {
  const navigate = useNavigate();

  const journeySteps = [
    {
      number: "1",
      title: "Get Your Ripple Card",
      description: "Sign up in 2 minutes! Pick your nickname and avatar to become a kindness hero!",
      color: "from-blue-400 to-blue-600",
      link: "/age-gate",
      emoji: "👋",
      image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=500&auto=format&fit=crop&q=80"
    },
    {
      number: "2",
      title: "Create a Ripple of Kindness",
      description: "Help someone, share, or be kind. Every act creates a ripple that spreads!",
      color: "from-pink-400 to-pink-600",
      link: "/hero-wall",
      emoji: "💝",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500&auto=format&fit=crop&q=80"
    },
    {
      number: "3",
      title: "Share Your Ripple Story",
      description: "Tell what you did! Add photos and watch your ripple inspire others!",
      color: "from-purple-400 to-purple-600",
      link: "/post-story",
      emoji: "📖",
      image: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=500&auto=format&fit=crop&q=80"
    },
    {
      number: "4",
      title: "Watch Your Ripple Spread",
      description: "See your kindness travel around the world on the ripple map!",
      color: "from-green-400 to-green-600",
      link: "/ripple-map",
      emoji: "🗺️",
      image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop&q=80"
    },
    {
      number: "5",
      title: "Collect Ripple Badges",
      description: "Complete challenges and earn cool badges as your ripples grow!",
      color: "from-orange-400 to-orange-600",
      link: "/challenges-leaderboard",
      emoji: "🏆",
      image: "https://images.unsplash.com/photo-1579389083395-4507e98b5e67?w=500&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <div className="container max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3 ">
            <Sparkles className="w-3 h-3" />
            How It Works
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-3">
            <span className="text-gray-900">Your </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Kindness Journey
            </span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Making a difference is super easy! Follow these 5 simple steps ✨
          </p>
        </div>

        {/* Journey Steps - Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="grid md:grid-cols-5 gap-4 mb-10">
          {journeySteps.map((step, index) => (
            <Card
              key={index}
              className="    hover:-translate-y-2 transition-all overflow-hidden group cursor-pointer bg-white"
              onClick={() => navigate(step.link)}
            >
              {/* Image with gradient overlay */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-70`} />

                {/* Number badge */}
                <div className="absolute top-3 left-3 bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl   shadow-md">
                  {step.number}
                </div>

                {/* Emoji */}
                <div className="absolute bottom-3 right-3 text-4xl drop-shadow-lg">
                  {step.emoji}
                </div>

                {/* Arrow indicator for flow */}
                {index < journeySteps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-gray-800 drop-shadow-lg" />
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4 text-center bg-white">
                <h3 className="text-base md:text-lg font-black text-gray-900 mb-1 leading-tight">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Card */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500    hover:-translate-y-1 transition-all overflow-hidden">
          <CardContent className="p-6 md:p-8 text-center relative">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '30px 30px'
              }} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-center gap-3 mb-4 text-4xl">
                <span>🌟</span>
                <span>💖</span>
                <span>🎉</span>
              </div>

              <h3 className="text-2xl md:text-4xl font-black text-white mb-2">
                Ready to Start Your Adventure?
              </h3>

              <p className="text-base md:text-lg text-white/95 mb-5 max-w-xl mx-auto">
                Join thousands of young heroes making the world a better place!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/age-gate')}
                  size="lg"
                  className="bg-white  hover:bg-yellow-300 hover:text-purple-700 font-black     hover:-translate-y-1 transition-all group"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Start Free Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  onClick={() => navigate('/hero-wall')}
                  size="lg"
                  className="bg-transparent text-white hover:bg-white/20 font-black  hover:-translate-y-1 transition-all"
                >
                  View Success Stories
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-3 mt-6 text-white/90 text-sm font-semibold">
                <span>✓ No Credit Card Required</span>
                <span>✓ Safe for Kids</span>
                <span>✓ Parent Approved</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EnhancedRoadmapSection;
