import card1 from "@/assets/card-1.png";
import card2 from "@/assets/card-2.png";
import card3 from "@/assets/card-3.png";
import card4 from "@/assets/card-4.png";

const WhereWeAreGoingSection = () => {
  const steps = [
    {
      image: card1,
      title: "Every Ripple Matters",
      description: "We believe that every small act of kindness creates ripples that travel far and wide! See our latest ripple cards on the world map below!"
    },
    {
      image: card2,
      title: "See Your Ripple Travel",
      description: "Want us to show you how your kindness adds up? Watch your ripple journey on the map and see all the places your kindness reaches!"
    },
    {
      image: card3,
      title: "Join Pass The Ripple Community",
      description: "You're part of a big team of kindness heroes! Share your ripple stories, get inspired by others, and spread kindness together!"
    },
    {
      image: card4,
      title: "You're a Ripple Hero",
      description: "You have the power to make a difference! Every ripple you create helps build a better world. See how mine matter!"
    }
  ];

  return (
    <section className="py-4 md:py-6 bg-white">
      <div className="container max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3">
            <span className="text-blue-600">Why</span>{" "}
            <span className="text-purple-600">Pass The Ripple</span>
          </h2>
          <p className="text-base md:text-lg text-gray-900 max-w-2xl mx-auto leading-relaxed">
            Why we're doing this — We want every kid to know their kindness creates ripples that make the world brighter! 🌊✨
          </p>
        </div>

        {/* Grid Design - Shows all 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center pt-0 pb-4 sm:pb-6 px-4 sm:px-6 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 bg-white group relative"
            >
              {/* Card Image - Positioned slightly above the border, square shape */}
              <div className="w-full -mt-4 sm:-mt-6 mb-3 sm:mb-4 flex items-center justify-center overflow-visible px-4 sm:px-6">
                <div className="w-full aspect-square flex items-center justify-center">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-110 rounded-lg"
                  />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-600 mb-2">
                {step.title}
              </h3>
              {/* Description */}
              {step.description && (
                <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhereWeAreGoingSection;

