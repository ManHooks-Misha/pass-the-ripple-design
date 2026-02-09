import char1 from "@/assets/characters/char1.png";
import char2 from "@/assets/characters/char2.png";
import char5 from "@/assets/characters/char5.png";
import char7 from "@/assets/characters/char7.png";
import defaultLogo from "@/assets/ripple-logo.png";
import { useApplicationSettings } from "@/hooks/useSettingsGroups";
import { getImageUrl } from "@/utils/imageUrl";

const WhyYouAreHereSection = () => {
  const { settings: companySettings } = useApplicationSettings();
  const logo = getImageUrl((companySettings as any)?.header_logo, defaultLogo);

  const processSteps = [
    {
      title: "Feel Valued",
      text: "You understand that small acts of kindness matter. You're ready to start your ripple and see the impact of passing kindness forward in your community.",
      icon: char5, // hedgehog
    },
    {
      title: "Change Lives",
      text: "You believe in creating meaningful moments with your family or students. Pass The Ripple gives you a simple, powerful way to teach kindness through action.",
      icon: char2, // owl
    },
    {
      title: "Safe Platform",
      text: "You're excited to track your ripple's journey and see the real-world connections your kindness creates. It's not just theory —it's visible, shareable impact.",
      icon: char7, // bird
    },
  ];

  const timelineItems = [
    { 
      text: "You want your child to feel seen and valued.", 
      numberBg: "bg-red-500",
      borderColor: "border-red-500"
    },
    { 
      text: "You believe kindness can change a life.", 
      numberBg: "bg-orange-500",
      borderColor: "border-orange-500"
    },
    { 
      text: "You want a simple, safe way to help them see their impact.", 
      numberBg: "bg-blue-500",
      borderColor: "border-blue-500"
    },
    { 
      text: "You're ready to start a family kindness adventure.", 
      numberBg: "bg-green-500",
      borderColor: "border-green-500"
    },
  ];

  return (
    <section className="py-4 md:py-6">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Left Section - Light Beige Background */}
          <div className="w-full lg:w-1/2 bg-amber-50 rounded-2xl p-4 md:p-5">
            {/* Three Process Steps */}
            <div className="space-y-3 mb-4">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-xl p-3 md:p-4 border border-gray-300 shadow-sm flex items-start gap-3"
                >
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                    <img
                      src={step.icon}
                      alt={step.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Light Blue Background */}
          <div className="w-full lg:w-1/2 bg-blue-50 rounded-2xl p-4 md:p-5">
            {/* Heading */}
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2">
                <span className="text-blue-600">Why You're</span>{" "}
                <span className="text-purple-600">Here</span>
              </h2>
              <p className="text-base md:text-lg text-gray-900 leading-relaxed">
                You're here because you're ready to start your ripple journey and make the world brighter! Every small act creates ripples that spread far and wide.
              </p>
            </div>

            {/* Four Numbered Statements */}
            <div className="space-y-2">
              {timelineItems.map((item, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-2 border-2 ${item.borderColor} flex items-center gap-2 shadow-sm`}
                >
                  <div className={`w-8 h-8 flex-shrink-0 ${item.numberBg} rounded-md flex items-center justify-center shadow-sm`}>
                    <span className="text-base font-black text-white">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium leading-relaxed flex-1">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyYouAreHereSection;
