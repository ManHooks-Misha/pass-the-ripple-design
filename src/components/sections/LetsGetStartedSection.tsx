import { Link } from "react-router-dom";
import signImg from "@/assets/ripple2/sign-img.png";
import blueBtn from "@/assets/ripple2/blue.png";
import greenBtn from "@/assets/ripple2/green.png";

const LetsGetStartedSection = () => {
  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="sign-wrapper py-[85px] px-[40px] md:px-[70px]">
          <div className="row">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="sign-img flex justify-center md:justify-start">
                <img src={signImg} alt="Sign up" className="w-full" />
              </div>
              <div className="btn-ripple-wrap flex flex-col justify-center items-center md:items-start">
                <Link to="/age-gate" className="btn-ripple1 mg-ripp relative flex justify-center mb-[50px] mt-[10px]">
                  <img src={blueBtn} alt="Ready to Start Rippling?" className="h-[55px] md:h-[55px]" />
                  <p className="absolute top-[12px] text-black font-normal text-[18px] pointer-events-none">
                    Ready to Start Rippling? 
                  </p>
                </Link>
                <Link to="/resources" className="btn-ripple1 relative flex justify-center">
                  <img src={greenBtn} alt="Bring Pass The Ripple to your Classroom!" className="h-[55px] md:h-[55px]" />
                  <p className="absolute top-[12px] text-black font-normal text-[18px] pointer-events-none">
                    Bring Pass The Ripple to your Classroom!
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LetsGetStartedSection;

