import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ExploreSection = () => {
  const exploreCards = [
    {
      title: "Hero Wall",
      description: "Read amazing kindness stories from young heroes worldwide and get inspired!",
      link: "/hero-wall",
      image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&auto=format&fit=crop&q=80",
      color: "from-purple-500 to-purple-700",
      emoji: "🦸‍♂️"
    },
    {
      title: "Leaderboard",
      description: "See top kindness champions and join the global movement of change-makers!",
      link: "/leaderboard",
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80",
      color: "from-yellow-500 to-orange-600",
      emoji: "🏆"
    },
    {
      title: "Get Ripple Card",
      description: "Request your unique Ripple Card and start your kindness journey today!",
      link: "/age-gate",
      image: "https://images.unsplash.com/photo-1607827448387-a67db1383b59?w=600&auto=format&fit=crop&q=80",
      color: "from-blue-500 to-teal-600",
      emoji: "🎴"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      <div className="container max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3  ">
            <Sparkles className="w-3 h-3" />
            Explore
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-3">
            <span className="text-gray-900">Discover </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">
              Amazing Ways
            </span>
            <br />
            <span className="text-gray-900">to Spread Kindness</span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Explore fun ways to make a difference! ⭐
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {exploreCards.map((card, index) => (
            <Card
              key={index}
              className="    hover:-translate-y-2 transition-all overflow-hidden bg-white group"
            >
              {/* Image Section with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-60 group-hover:opacity-70 transition-opacity`} />

                {/* Emoji badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-14 h-14 rounded-2xl flex items-center justify-center text-3xl   shadow-lg">
                  {card.emoji}
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-tr-full" />
              </div>

              {/* Content Section */}
              <div className="p-6 text-center">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                  {card.title}
                </h3>

                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  {card.description}
                </p>

                <Link to={card.link}>
                  <Button
                    className={`w-full bg-gradient-to-r ${card.color} hover:opacity-90 text-white font-bold  hover:-translate-y-0.5 transition-all group/btn`}
                  >
                    Explore Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;
