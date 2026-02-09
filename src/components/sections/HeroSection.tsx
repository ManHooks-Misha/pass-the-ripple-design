import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import heroImage from "@/assets/hero-children-ripple.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden pb-24 md:pb-32 pt-24 md:pt-28">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-2xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-300" />
      <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-blue-300/20 rounded-full blur-2xl animate-pulse delay-700" />
      
      {/* Join Banner */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Join the Kindness Revolution
        </div>
      </div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 mt-12">
                Spread Kindness,
                <span className="block text-5xl md:text-6xl lg:text-7xl">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">One</span>
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent"> Ripple </span>
                  <span className="text-gray-900">at a</span>
                  <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"> Time</span>
                  <span className="text-5xl md:text-6xl lg:text-7xl ml-3">🌊✨</span>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                Join thousands of young heroes creating magical ripples of kindness around the world. Every act of kindness starts a beautiful chain reaction!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => navigate('/age-gate')}
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Start Your Kindness Journey
                </Button>
                <Button 
                  onClick={() => navigate('/resources')}
                  variant="outline"
                  className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  For Teachers
                </Button>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center lg:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-pink-500">50K+</p>
                  <p className="text-sm text-gray-600">Acts of Kindness</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-blue-500">125</p>
                  <p className="text-sm text-gray-600">Countries</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-purple-500">15K+</p>
                  <p className="text-sm text-gray-600">Young Heroes</p>
                </div>
              </div>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              {/* Decorative heart badge */}
              <div className="absolute -top-4 -right-4 z-20 bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-2xl">⭐</span>
              </div>
              
              <img 
                src={heroImage} 
                alt="Children spreading kindness with ripple cards" 
                className="rounded-3xl shadow-2xl w-full h-auto scale-105 lg:scale-110"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-purple-400/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;