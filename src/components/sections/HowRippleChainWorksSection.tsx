import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Share2, QrCode, Sparkles, MapPin, UserPlus, GitBranch } from "lucide-react";

const HowRippleChainWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Get Your Unique Ripple ID",
      description: "When you sign up, you receive your very own unique Ripple ID - like a special code that's just yours!",
      icon: QrCode,
      color: "from-blue-500 to-blue-600",
      emoji: "🎫"
    },
    {
      number: "2",
      title: "Share Your Ripple ID",
      description: "Share your Ripple ID with friends, family, or anyone you want to invite! They can scan your code to join.",
      icon: Share2,
      color: "from-purple-500 to-purple-600",
      emoji: "📤"
    },
    {
      number: "3",
      title: "They Register & Get Their Own ID",
      description: "When someone scans your code and registers, they automatically get their own unique Ripple ID!",
      icon: UserPlus,
      color: "from-pink-500 to-pink-600",
      emoji: "✨"
    },
    {
      number: "4",
      title: "The Ripple Chain Grows",
      description: "They can continue your ripple AND start their own! Each person creates new ripples while keeping the chain going.",
      icon: GitBranch,
      color: "from-green-500 to-green-600",
      emoji: "🌊"
    },
    {
      number: "5",
      title: "Track Your Ripple Journey",
      description: "See who referred you (your upline) and who you've referred (your downline) on your journey map!",
      icon: MapPin,
      color: "from-orange-500 to-orange-600",
      emoji: "🗺️"
    }
  ];

  return (
    <section id="how-ripple-chain-works" className="py-12 md:py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl" />

      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3 border-2 border-gray-800">
            <Sparkles className="w-3 h-3" />
            How It Works
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-3">
            <span className="text-gray-900">How the </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Ripple Chain Works
            </span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how one act of kindness creates an endless chain of ripples! 🌊✨
          </p>
        </div>

        {/* Visual Example */}
        <Card className="border-3 border-gray-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all overflow-hidden bg-white mb-10">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Example Ripple Chain</h3>
              <p className="text-sm text-gray-600">See how ripples spread from person to person!</p>
            </div>

            {/* Ripple Chain Visualization */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6">
              {/* Level 1 - Admin/John */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg border-3 border-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2">
                  👤
                </div>
                <p className="text-xs font-bold text-gray-900">Admin/John</p>
                <p className="text-xs text-gray-600">Ripple ID #1</p>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-8 h-8 text-gray-800 rotate-90 md:rotate-0" />

              {/* Level 2 - First Referral */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-orange-600 flex items-center justify-center text-white font-black text-lg border-3 border-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2">
                  👤
                </div>
                <p className="text-xs font-bold text-gray-900">Person A</p>
                <p className="text-xs text-gray-600">Ripple ID #2</p>
                <p className="text-xs text-purple-600 font-bold">Scanned ID #1</p>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-8 h-8 text-gray-800 rotate-90 md:rotate-0" />

              {/* Level 3 - Second Referral */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-black text-lg border-3 border-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2">
                  👤
                </div>
                <p className="text-xs font-bold text-gray-900">Person B</p>
                <p className="text-xs text-gray-600">Ripple ID #3</p>
                <p className="text-xs text-purple-600 font-bold">Scanned ID #2</p>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-gray-800">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-bold">Each person gets their own unique Ripple ID!</span> When Person A scans Admin/John's code and registers, they get Ripple ID #2. When Person B scans Person A's code, they get Ripple ID #3. The chain keeps growing, and each person can start their own ripple too! 🌊
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="grid md:grid-cols-5 gap-4 mb-10">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="border-3 border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all overflow-hidden group cursor-pointer bg-white"
            >
              {/* Image with gradient overlay */}
              <div className="relative h-32 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-80`} />
                
                {/* Number badge */}
                <div className="absolute top-3 left-3 bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl border-3 border-gray-800 shadow-md">
                  {step.number}
                </div>

                {/* Emoji */}
                <div className="absolute bottom-3 right-3 text-4xl drop-shadow-lg">
                  {step.emoji}
                </div>

                {/* Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <step.icon className="w-12 h-12 text-white/90 drop-shadow-lg" />
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4 text-center bg-white">
                <h3 className="text-base font-black text-gray-900 mb-2 leading-tight">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Card className="border-3 border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🌊</div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 mb-2">Continue & Start Your Own</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    When you scan someone's code, you continue their ripple chain. After you register, you get your own Ripple ID, which lets you start your own ripple too! You can do both!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-3 border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-green-50 to-teal-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔗</div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 mb-2">Track Your Connections</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    The system shows you who referred you (your upline) and who you've referred (your downline). See your entire ripple network!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Card */}
        <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border-3 border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all overflow-hidden">
          <CardContent className="p-6 md:p-8 text-center relative">
            <div className="relative z-10">
              <div className="flex justify-center gap-3 mb-4 text-4xl">
                <span>🗺️</span>
                <span>✨</span>
                <span>🌊</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                Ready to See Your Ripple Journey?
              </h3>

              <p className="text-base md:text-lg text-white/95 mb-6 max-w-xl mx-auto">
                Sign up to get your unique Ripple ID and start tracking your ripple chain! You'll be able to see your journey map, who referred you, and who you've referred.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/age-gate">
                  <Button
                    size="lg"
                    className="bg-white hover:bg-yellow-300 hover:text-purple-700 font-black border-3 border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Your Ripple ID
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link to="/ripple-map">
                  <Button
                    size="lg"
                    className="bg-transparent border-3 border-white text-white hover:bg-white/20 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    View Public Map
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-white/90 mt-6 font-semibold">
                💡 Sign up first to see your personal journey map and track your ripple chain!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HowRippleChainWorksSection;

