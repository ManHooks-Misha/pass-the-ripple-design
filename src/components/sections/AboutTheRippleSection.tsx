import banImg1a from "@/assets/ripple2/ban-img1a.png";

const AboutTheRippleSection = () => {
  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="row">
          <div className="second-ban relative">
            <img src={banImg1a} alt="About The Ripple" className="w-full object-contain" />
            <div className="second-ban-txt absolute top-[9%] left-[37.2%] px-3 md:px-[54px] py-3">
              <p className="font-normal text-[21px] leading-[24px] text-[#090909] mb-4">
                Pass The Ripple is a playful, heartfelt platform where every act of kindness creates ripples that spread across the world, helping young hearts grow stronger and more connected.
              </p>
              <p className="font-normal text-[21px] leading-[24px] text-[#090909] mb-4">
                Perfect for kids and families, this platform invites gentle conversations and big feelings. The kind that last long after the ripple spreads.
              </p>
              <ul className="list-none space-y-2">
                <li className="font-normal text-[21px] leading-[27px] text-[#090909]">
                  Builds kindness, courage, and a deep sense of belonging
                </li>
                <li className="font-normal text-[21px] leading-[27px] text-[#090909]">
                  Opens gentle conversations about big feelings and resilience
                </li>
                <li className="font-normal text-[21px] leading-[27px] text-[#090909]">
                  Brings social-emotional learning and mindfulness moments into everyday life
                </li>
                <li className="font-normal text-[21px] leading-[27px] text-[#090909]">
                  Comforts kids facing change, self-doubt, and new beginnings
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTheRippleSection;

