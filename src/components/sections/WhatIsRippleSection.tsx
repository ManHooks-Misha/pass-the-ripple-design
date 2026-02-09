import rabbitImg from "@/assets/ripple2/rabbit.png";
import owlImg from "@/assets/ripple2/owl.png";

const WhatIsRippleSection = () => {
  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="row">
          <div className="rabbit-new relative mt-3">
            <img src={rabbitImg} alt="Rabbit" className="w-full" />
            <div className="border-zig absolute top-[48%] left-[18%] right-[2%]">
              <h3 className="font-teachers font-bold text-[23px] mb-1 text-black">
                What is a Ripple?
              </h3>
              <p className="font-teachers font-medium text-[18px] leading-[24px] mb-0 text-black">
                A ripple is a small act of kindness that spreads outward, inspiring more good actions from others.
                Just like a tiny pebble creates waves in a pond, one positive choice can create a chain reaction of kindness in the world.
              </p>
            </div>
          </div>
          <div className="rabbit-new mg--45 relative -mt-[45px] mb-[55px]">
            <img src={owlImg} alt="Owl" className="w-full" />
            <div className="border-zig1 absolute top-[48%] left-[4%] right-[16%]">
              <p className="font-teachers font-medium text-[18px] leading-[24px] mb-0 text-black">
                Because a single meaningful action carries forward to help others feel that they matter too. Pass The Ripple came to life as a kindness-based activity where each challenge encourages children to notice, choose, and pass on acts that make others feel seen, valued, and supported.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsRippleSection;
