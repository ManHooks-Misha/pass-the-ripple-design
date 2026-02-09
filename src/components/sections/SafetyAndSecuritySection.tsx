import banImg2a from "@/assets/ripple2/ban-img2a.png";

const SafetyAndSecuritySection = () => {
  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="row mg-0-mob">
          <h3 className="ripple-heading font-teachers font-bold text-[28px] leading-[41px] mb-[50px] text-center w-full">
            SAFETY AND SECURITY
          </h3>
          <div className="third-ban relative">
            <img src={banImg2a} alt="Safety and Security" className="w-full" />
            <div className="third-ban-wrap absolute top-[12%] left-[7.5%] right-[49%]">
              <div className="third-ban-txt mb-[26px] px-[45px]">
                <h4 className="font-teachers font-bold text-[20px] leading-[26px] text-center text-black mb-1">
                  Parent Controls & Visibility
                </h4>
                <p className="font-teachers font-normal text-[16.5px] leading-[20px] text-center text-black mb-0">
                  Parents can review activity, manage permissions, and stay connected to their child's experience
                </p>
              </div>
              <div className="third-ban-txt mb-[26px] px-[45px]">
                <h4 className="font-teachers font-bold text-[20px] leading-[26px] text-center text-black mb-1">
                  Human-Moderated Environment
                </h4>
                <p className="font-teachers font-normal text-[16.5px] leading-[20px] text-center text-black mb-0">
                  All submissions, stories, and interactions are reviewed by aduits
                </p>
              </div>
              <div className="third-ban-txt mb-[26px] px-[45px]">
                <h4 className="font-teachers font-bold text-[20px] leading-[26px] text-center text-black mb-1">
                  No Public Chat or Open Messaging
                </h4>
                <p className="font-teachers font-normal text-[16.5px] leading-[20px] text-center text-black mb-0">
                  Kids cannot message strangers. There are zero open communication channels
                </p>
              </div>
              <div className="third-ban-txt mb-[26px] px-[45px]">
                <h4 className="font-teachers font-bold text-[20px] leading-[26px] text-center text-black mb-1">
                  No Ads. No Algorithms. No Data Selling
                </h4>
                <p className="font-teachers font-normal text-[16.5px] leading-[20px] text-center text-black mb-0">
                  Kids are never tracked, targeted, or exposed to advertising
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyAndSecuritySection;


