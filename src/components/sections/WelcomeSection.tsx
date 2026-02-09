import welcomeImg from "@/assets/ripple2/welcome.png";
import banImg from "@/assets/ripple2/ban-img.png";
import footprint1 from "@/assets/ripple2/fot1.png";
import footprint2 from "@/assets/ripple2/fot2.png";
import footprint3 from "@/assets/ripple2/fot3.png";
import footprint4 from "@/assets/ripple2/fot4.png";
import footprint5 from "@/assets/ripple2/fot5.png";
import footprint6 from "@/assets/ripple2/fot6.png";
import footprint7 from "@/assets/ripple2/fot7.png";

const WelcomeSection = () => {
  return (
    <section className="relative w-full py-4 md:py-5 overflow-hidden">
      <div className="container mx-auto px-4" style={{ position: 'relative' }}>
        {/* Footprint images positioned absolutely relative to container */}
        <img 
          src={footprint1} 
          alt="" 
          className="foot1 hidden md:block" 
        />
        <img 
          src={footprint2} 
          alt="" 
          className="foot2 hidden md:block" 
        />
        <img 
          src={footprint3} 
          alt="" 
          className="foot3 hidden md:block" 
        />
        <img 
          src={footprint4} 
          alt="" 
          className="foot4 hidden md:block" 
        />
        <img 
          src={footprint5} 
          alt="" 
          className="foot5 hidden md:block" 
        />
        <img 
          src={footprint6} 
          alt="" 
          className="foot6 hidden md:block" 
        />
        <img 
          src={footprint7} 
          alt="" 
          className="foot7 hidden md:block" 
        />

        <div className="row pt-lg-4 pb-5 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Welcome Image and Text */}
            <div className="flex flex-col items-center md:items-start">
              <div className="ban-txt pt-[125px] md:pt-[125px] pb-0">
                <img src={welcomeImg} alt="Welcome to Pass The Ripple" className="w-full max-w-md" />
              </div>
              <div className="ban-txt-p pt-[33px]">
                <p className="text-[20px] leading-[42px] text-center md:text-left text-[#364153]">
                  A kindness journey inspired by the book: <i>You Matter, Luma</i>.<br/>
                  A universe where small actions become ripples that travel the world.
                </p>
              </div>
            </div>

            {/* Right Side - Banner Image */}
            <div className="ban-img flex justify-center md:justify-end">
              <img src={banImg} alt="Banner" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
