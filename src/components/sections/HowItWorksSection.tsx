import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Heart, Users2 } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-pink-50 via-yellow-50 to-blue-50">
      <div className="container">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">How Pass The Ripple Works</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Creating ripples of kindness is easy! Follow these simple steps to start your journey.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "1",
              icon: <Gift className="h-12 w-12 text-white" />,
              title: "Get a Ripple Card",
              description: "Register and receive your unique Ripple Card to start your kindness adventure!",
              bgGradient: "bg-gradient-to-br from-blue-400 to-purple-500",
              shadowColor: "shadow-blue-200",
            },
            {
              step: "2",
              icon: <Heart className="h-12 w-12 text-white" />,
              title: "Do a Kind Act",
              description: "Perform acts of kindness in your community and share your story with the world.",
              bgGradient: "bg-gradient-to-br from-pink-400 to-red-500",
              shadowColor: "shadow-pink-200",
            },
            {
              step: "3",
              icon: <Users2 className="h-12 w-12 text-white" />,
              title: "Pass It On!",
              description: "Pass your Ripple Card to someone else and watch kindness spread around the world!",
              bgGradient: "bg-gradient-to-br from-green-400 to-teal-500",
              shadowColor: "shadow-green-200",
            },
          ].map((item, index) => (
            <div key={item.step} className="relative">
              {/* Arrow between cards */}
              {index < 2 && (
                <div className="hidden md:block absolute top-1/3 -right-4 z-10">
                  <div className="text-3xl sm:text-4xl text-gray-300">→</div>
                </div>
              )}
              
              <Card className={`text-center h-full hover:shadow-2xl ${item.shadowColor} transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden bg-white`}>
                {/* Step number badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-orange-400 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-lg">
                  {item.step}
                </div>
                
                <CardHeader className="pb-3 sm:pb-4">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${item.bgGradient} rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform`}>
                    {item.icon}
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base text-gray-600">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;