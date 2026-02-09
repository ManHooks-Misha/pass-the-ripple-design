import { Shield, CheckCircle, Loader2, Lock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useGlobalRippleMap } from "@/hooks/useGlobalRippleMap";

const SafetySection = () => {
  const { loading, countriesReached, actsOfKindness, youngHeroes } = useGlobalRippleMap();

  const formatNumber = (num: number | null | undefined) => {
    const value = num ?? 0;
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K+`;
    }
    return value.toString();
  };

  const features = [
    {
      title: "COPPA Compliant",
      description: "Fully compliant with children's privacy laws",
      emoji: "🛡️",
    },
    {
      title: "Moderated Community",
      description: "All content reviewed by our safety team",
      emoji: "✅",
    },
    {
      title: "Global & Inclusive",
      description: "Welcoming all backgrounds and cultures",
      emoji: "🌍",
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3  ">
            <Shield className="w-3 h-3" />
            Safety First
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-3">
            <span className="text-gray-900">Safe, Fun & </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Inclusive
            </span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Safety and inclusivity at our heart! 🛡️💖
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">

          {/* Features Column */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="   hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all p-4"
              >
                <div className="flex gap-3 items-start">
                  <div className="text-3xl">{feature.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-black text-base text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </Card>
            ))}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link to="/privacy" className="flex-1">
                <Button
                  className="w-full bg-white  hover:bg-gray-50 font-bold   shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]  hover:-translate-y-0.5 transition-all"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Safety Guidelines
                </Button>
              </Link>
              <Link to="/about-us" className="flex-1">
                <Button
                  className="w-full bg-white  hover:bg-gray-50 font-bold   shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]  hover:-translate-y-0.5 transition-all"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Community Card with Image */}
          <Card className="  shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all overflow-hidden">
            <div className="relative">
              {/* Background image of diverse children */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=60"
                  alt="Diverse children"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/80 to-transparent" />
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <h3 className="text-2xl md:text-3xl font-black mb-2 text-gray-900 text-center">
                  Everyone Belongs! 🌈
                </h3>

                <p className="text-sm text-gray-700 mb-4 text-center font-medium">
                  Join kids from <span className="font-black text-purple-600">
                    {loading ? "..." : countriesReached !== undefined ? `${countriesReached}+` : "125+"}
                  </span> countries!
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-xl p-3   text-center">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500 mx-auto" />
                    ) : (
                      <p className="text-lg font-black text-purple-600">
                        {countriesReached !== undefined ? `${countriesReached}+` : "125+"}
                      </p>
                    )}
                    <p className="text-xs font-bold text-gray-600">Countries</p>
                  </div>
                  <div className="bg-white rounded-xl p-3   text-center">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-pink-500 mx-auto" />
                    ) : (
                      <p className="text-lg font-black text-pink-600">
                        {youngHeroes !== undefined ? formatNumber(youngHeroes) : "15K+"}
                      </p>
                    )}
                    <p className="text-xs font-bold text-gray-600">Heroes</p>
                  </div>
                  <div className="bg-white rounded-xl p-3   text-center">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500 mx-auto" />
                    ) : (
                      <p className="text-lg font-black text-blue-600">
                        {actsOfKindness !== undefined ? formatNumber(actsOfKindness) : "50K+"}
                      </p>
                    )}
                    <p className="text-xs font-bold text-gray-600">Acts</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
