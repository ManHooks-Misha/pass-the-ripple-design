import char7 from "@/assets/characters/char7.png";
import char2 from "@/assets/characters/char2.png";
import footprint from "@/assets/Footprint.png";
import belowOwl from "@/assets/below owl.png";
import underDialogue from "@/assets/under dialouge.png";

const HomeSliderSection = () => {
  return (
    <section className="py-8 md:py-12 relative overflow-hidden">
      {/* Footprint Graphics */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img src={footprint} alt="" className="absolute top-12 left-12 w-10 h-10 md:w-14 md:h-14 opacity-25" style={{ transform: 'rotate(15deg)' }} />
        <img src={footprint} alt="" className="absolute bottom-20 left-20 w-12 h-12 md:w-16 md:h-16 opacity-30" style={{ transform: 'rotate(-25deg)' }} />
        <img src={footprint} alt="" className="absolute top-32 right-24 w-11 h-11 md:w-15 md:h-15 opacity-25" style={{ transform: 'rotate(20deg)' }} />
      </div>
      <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 font-fuzzy">
            HOW TO PASS THE RIPPLE?
          </h2>
        </div>

        {/* Content with Characters */}
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Bird Character - Left */}
          <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32">
            <img
              src={char7}
              alt="Bird Character"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Card - Center */}
          <div className="flex-1 bg-white shadow-none relative" style={{
            borderRadius: '45px 38px 42px 40px / 42px 40px 38px 45px',
            border: '2px solid #374151',
            borderStyle: 'solid'
          }}>
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 font-fuzzy">
                Get your Ripple Cards!
              </h3>
              <div className="space-y-3 text-base md:text-lg text-gray-900 leading-relaxed">
                <p>
                  Have you read the <i>You Matter, Luma</i> book, yet? You can check it out here: <a href="https://youmatterluma.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://youmatterluma.com/</a> This will help you see how kindness can help the world.
                </p>
                <p>
                  Pass The Ripple is an idea to help people see how much they matter. and because we want to spread the word we created Ripple Cards to help the movement grow!
                </p>
                <p>
                  You can get your free Ripple Card by creating or logging into an account!
                </p>
              </div>
            </div>
          </div>

          {/* Owl Character - Right */}
          <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 relative">
            <img
              src={char2}
              alt="Owl Character"
              className="w-full h-full object-contain"
            />
            {/* Below owl image if available */}
            {belowOwl && (
              <img
                src={belowOwl}
                alt=""
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 opacity-80"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSliderSection;
