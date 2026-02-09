import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Globe, Loader2, TrendingUp } from "lucide-react";
import { useGlobalRippleMap } from "@/hooks/useGlobalRippleMap";

const RippleMapSection = () => {
  const { loading, countriesReached, actsOfKindness, youngHeroes, activeRipples } = useGlobalRippleMap();

  const formatNumber = (num: number | null | undefined) => {
    const value = num ?? 0;
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K+`;
    }
    return value.toString();
  };

  const stats = [
    {
      label: "Countries",
      value: countriesReached !== undefined ? `${countriesReached}+` : "-",
      emoji: "🌍"
    },
    {
      label: "Acts of Kindness",
      value: actsOfKindness !== undefined ? formatNumber(actsOfKindness) : "-",
      emoji: "💝"
    },
    {
      label: "Young Heroes",
      value: youngHeroes !== undefined ? formatNumber(youngHeroes) : "-",
      emoji: "🦸"
    },
    {
      label: "Active Ripples",
      value: activeRipples !== undefined ? activeRipples.toLocaleString() : "-",
      emoji: "🌊"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3  ">
            <Globe className="w-3 h-3" />
            Live Impact
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-3">
            <span className="text-gray-900">Watch Kindness </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Ripple Worldwide
            </span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            See how your acts create beautiful ripples 🌍✨
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="    hover:-translate-y-1 transition-all bg-white p-4 text-center"
            >
              <div className="text-3xl mb-2">{stat.emoji}</div>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-500 mx-auto mb-2" />
              ) : (
                <p className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
              )}
              <p className="text-xs font-bold text-gray-600">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* CTA Card with Real World Map Image */}
        <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:-translate-y-1 transition-all overflow-hidden">
          <div className="p-6 md:p-10 text-center relative">
            {/* Background world map image */}
            <div className="absolute inset-0 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=60"
                alt="World Map"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-bold mb-3  border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live: {loading ? "..." : activeRipples !== undefined ? `${activeRipples.toLocaleString()} ripples` : "Active now"}
              </div>

              <h3 className="text-2xl md:text-4xl font-black text-white mb-3">
                See Your Kindness
                <br />
                <span className="text-yellow-300">Travel the World!</span>
              </h3>

              <p className="text-base md:text-lg text-white/95 mb-6 max-w-xl mx-auto">
                Every act creates a ripple that inspires others!
              </p>

              <Link to="/ripple-map">
                <Button
                  size="lg"
                  className="bg-white hover:bg-yellow-300 hover:text-purple-700 font-black     hover:-translate-y-1 transition-all group"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Explore Map
                  <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default RippleMapSection;
