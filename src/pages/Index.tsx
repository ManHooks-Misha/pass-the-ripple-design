import "@/styles/pages/_home.scss"; // Kept for safety if not fully migrated yet, or can be removed if strictly following previous plan. Using user file content shows it's there.
import Seo from "@/components/Seo";

import LazyImage from "@/components/ui/LazyImage";

// IndexPageSkeleton removed
import { useState } from "react"; // useEffect removed if not used elsewhere
import bgImg from "@/assets/home-img/desktop/bg-img.png";
import welcomeImgFull from "@/assets/home-img/desktop/welcome-img.webp";
import banImg from "@/assets/home-img/desktop/book-img.webp";
import footprint1 from "@/assets/home-img/desktop/fot1.webp";
import footprint2 from "@/assets/home-img/desktop/fot2.webp";
import footprint3 from "@/assets/home-img/desktop/fot3.webp";
import footprint4 from "@/assets/home-img/desktop/fot4.webp";
import footprint5 from "@/assets/home-img/desktop/fot5.webp";
import footprint6 from "@/assets/home-img/desktop/fot6.webp";
import footprint7 from "@/assets/home-img/desktop/fot7.webp";
import banImg1a from "@/assets/home-img/desktop/Sad-Zin-1.webp";
import rabbitImg from "@/assets/home-img/desktop/bunny-banner.png";
import owlImg from "@/assets/home-img/desktop/owl-banner.png";
import purpleBox from "@/assets/home-img/desktop/purple.png";
import yellowBox from "@/assets/home-img/desktop/yellow.png";
import redBox from "@/assets/home-img/desktop/red.png";
import blueBox from "@/assets/home-img/desktop/sky.png";
import banImg2a from "@/assets/home-img/desktop/Sad-Zin-2.webp";
import blueBtn from "@/assets/home-img/desktop/Ready-to-Start-Rippling.png";
import greenBtn from "@/assets/home-img/desktop/Bring-Pass-The-Ripple-to-your-classroom.png";
import signImg from "@/assets/home-img/desktop/signup-box.webp";
import banner1 from "@/assets/home-img/desktop/banner1.webp";
import banner2 from "@/assets/home-img/desktop/banner2.webp";
import banner3 from "@/assets/home-img/desktop/banner3.webp";
import banner4 from "@/assets/home-img/desktop/banner4.webp";
import banner5 from "@/assets/home-img/desktop/banner5.webp";
// import bgorange from "@/assets/home-img/desktop/bg-orange.png";
import bgorange from "@/assets/home-img/bgorange.png";
import greenbg from "@/assets/home-img/greenbg.png";


import orangeBtn from "@/assets/home-img/orange.png";
import redBtn from "@/assets/home-img/red.png";
import leftArrow from "@/assets/home-img/left-arrow.png";
import rightArrow from "@/assets/home-img/right-arrow.png";

import footP3 from "@/assets/home-img/mobile/foot-p3.webp";
import footP4 from "@/assets/home-img/mobile/foot-p4.webp";
import footP5 from "@/assets/home-img/mobile/foot-p5.webp";
import footP6 from "@/assets/home-img/mobile/foot-p6.webp";
import footP7 from "@/assets/home-img/mobile/foot-p7.webp";
import footP8 from "@/assets/home-img/mobile/foot-p8.webp";
import footP9 from "@/assets/home-img/mobile/foot-p9.webp";
import mobBan1 from "@/assets/home-img/mobile/mob-ban1.webp";
import mobRabbit from "@/assets/home-img/mobile/mob-rabbit.webp";
import mobOwl from "@/assets/home-img/mobile/mob-owl.webp";
import mobSlide1 from "@/assets/home-img/mobile/mob-slide1.webp";
import mobSlide2 from "@/assets/home-img/mobile/mob-slide2.webp";
import mobSlide3 from "@/assets/home-img/mobile/mob-slide3.webp";
import mobSlide4 from "@/assets/home-img/mobile/mob-slide4.webp";
import mobSlide5 from "@/assets/home-img/mobile/mob-slide5.webp";
import mobBan2 from "@/assets/home-img/mobile/mob-ban2.webp";
import homebg from "@/assets/home-img/homepage2.png";
import { Link } from "react-router-dom";


import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import WavyBanner from "@/components/ui/WavyBanner";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";




const Index = () => {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  // Loading logic removed in favor of global loader
  

  return (
    <>
      <Seo
        title="Pass The Ripple — Spread Kindness, One Ripple at a Time"
        description="Join thousands of young heroes creating magical ripples of kindness around the world. Every act of kindness starts a beautiful chain reaction!"
        canonical={`${window.location.origin}/`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Pass The Ripple",
          url: window.location.origin,
          description:
            "A playful kindness-tracking platform where kids spread kindness worldwide through Ripple Cards.",
        }}
      />




     <section className="mobile-none scroll-h" id="zoom-wrapper">


        <div
          className="container mx-auto px-4"
          style={{ position: "relative" }}
        >

          {/* Welcome Section */}
          <div className="row pt-lg-4">
            <div className="grid grid-cols-2 gap-8 mb-5">
              <div className="col-md-6 ml_20" style={{ position: "relative" }}>
                <div className="ban-txt ">
                  <LazyImage
                    src={welcomeImgFull}
                    alt="Welcome"
                    className="w-full welcom" showSkeleton={false}
                  />
                </div>
                <div className="ban-txt-p">
                  <p className="text-[18px] leading-[42px] text-center text-[#364153]">A kindness journey inspired by the book: You Matter, Luma.
                    <br />A universe where small actions become ripples that
                    travel the world
                   
                  </p>
                </div>
                <LazyImage src={footprint1} alt="Footprint decoration" className="foot1" showSkeleton={false} />
              </div>
              <div className="col-md-6">
                <div className="ban-img">
                  <LazyImage src={banImg} alt="Banner" className="w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* About The Ripple Section */}
          <div className="row">
            <div className="second-ban">
              <LazyImage
                src={banImg1a}
                alt="About The Ripple"
                className="w-full object-contain"
              />
              <div className="second-ban-txt">
                <p>
                    Pass The Ripple is a playful, heartfelt platform where every
                    act of kindness creates<br /> ripples that spread across the
                    world, helping young hearts grow stronger and<br /> more
                    connected.
                  </p>
                  <p>
                    Perfect for kids and families, this platform invites gentle
                    conversations and big<br /> feelings. The kind that last long
                    after the ripple spreads.
                  </p>
                <ul>
                  <li>
                    Builds kindness, courage, and a deep sense of belonging
                  </li>
                  <li>
                    Opens gentle conversations about big feelings and resilience
                  </li>
                  <li>
                    Brings social-emotional learning and mindfulness moments
                    into everyday life
                  </li>
                  <li>
                    Comforts kids facing change, self-doubt, and new beginnings
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* What is a Ripple Section */}
          <div className="row wavybanner-section">
            <div className="rabbit-new mt-3" style={{ position: "relative" }}>
              <LazyImage src={footprint2} alt="Footprint decoration" className="foot2" showSkeleton={false} />
              <div className="rabbit-main-container flex gap-2">
                <div className="rabbit-img-container" style={{ position: "relative" }}>
                  <LazyImage src={rabbitImg} alt="Rabbit" className="rabbit-img" />
                  <LazyImage src={footprint3} alt="Footprint decoration" className="foot3" showSkeleton={false} />
                </div>
               <div className="wavy-banner-container flex-1 w-full bg-img" style={{ backgroundImage: `url(${bgorange})` }}>
                  {/* <WavyBanner color="#f1c4af">   </WavyBanner> */}
                    <h3 className="font-teachers font-bold text-[16px] mb-0 mt-1 text-black">
                      What is a Ripple?
                    </h3>
                    <p className="leading-[18px] mb-0 text-black">
                      A ripple is a small act of kindness that spreads outward,
                      inspiring more good actions from others.<br />  Just like a tiny
                      pebble creates waves in a pond, one positive choice can
                      create a chain reaction of kindness in the world.
                    </p>
               
                </div>
              </div>
            </div>
            
            <div className="rabbit-new mg--45">
              <div className="flex flex-row-reverse md:items-center md:gap-1">
                <div className="owl-img-container">
                  <LazyImage src={owlImg} alt="Owl" className="owl-img" />
                </div>
                <div className="wavy-banner-container flex-1 w-full greenbg" style={{ backgroundImage: `url(${greenbg})` }}>
                  {/* <WavyBanner color="#caeec2"> </WavyBanner> */}
                    <p className="mb-0 text-black pt-3">
                      Because a single meaningful action carries forward to help
                      others feel that they matter too. Pass The Ripple came to
                      life<br /> as a kindness-based activity where each challenge
                      encourages children to notice, choose, and pass on acts
                      that make<br />  others feel seen, valued, and supported.
                    </p>
                 
                </div>
              </div>
            </div>
          </div>

          {/* How to Pass The Ripple Section */}
          <div className="row mr_45" style={{ position: "relative" }}>
            <LazyImage src={footprint4} alt="Footprint decoration" className="foot4" showSkeleton={false} />
            <h1 className="ripple-heading font-teachers font-bold text-[28px] leading-[41px] mb-[50px] text-center">
              HOW TO PASS THE RIPPLE? 
            </h1>
            <div
              id="carouselExampleCaptions"
              className="carousel slide slider-hme"
              style={{ position: "relative" }}
            >
              <Carousel
                className="w-full"
                opts={{ align: "start", loop: true }}
              >
                <CarouselContent>
                  <CarouselItem className="basis-full">
                    <div className="relative w-full">
                      <LazyImage
                        src={banner1}
                        alt="Carousel slide 1"
                        className="d-block w-100"
                      />
                      <div className="carousel-caption d-none d-md-block absolute left-[40%] right-[30px] bottom-[30px] top-[8%]">
                        <h5 className="font-teachers font-medium text-[20px] leading-[41px] text-center text-black mb-5">
                          Be a Part of the Ripple!
                        </h5>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black mb-0">
                            Have you read the story of You Matter, Luma, yet?
                          </p>
                          {/* <p className="font-normal text-[18px] leading-[26px] text-center text-black mb-0">
                            You can find the book here:{" "}
                            <a
                              href="https://youmatterluma.com/"
                              className="text-[#9F00C7]"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              https://youmatterluma.com/
                            </a>
                          </p>
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black mb-0">
                            It’s the first step in discovering that no matter how quiet or small we feel, we all have a "ripple" of kindness to share.
                          </p> */}

                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">You can find the book here: You Matter, <a
                              href="https://youmatterluma.com/"
                              className="text-[#9F00C7]"
                              target="_blank"
                              rel="noopener noreferrer"
                            >Luma</a>. It's the first step in discovering that we all have a "ripple" of kindness to share.</p> 
                        </div>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                           Ready to make your own splash?<br />
{/* Pass The Ripple is our global mission to show every person that they matter. We created Ripple Cards to help kids and grown-ups alike start a wave of kindness! */}
                          </p>
                        </div>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            For the Little Ripples: Use your card to be a kindness superhero! Give it to a friend, a teacher, or a neighbor to brighten their day.
                          </p>
                        </div>

                         <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                       For the Grown-Ups: These cards are a tangible way to teach children about their intrinsic worth and track their positive impact on our global kindness map.  </p>
                        </div>  
                        
                           <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                       Log in or create an account to get your free Ripple Card and start your journey today!   </p>
                        </div>

                         {/* <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            For the Little Ripples: Use your card to be a kindness superhero! Give it to a friend, a teacher, or a neighbor to brighten their day.
                          </p>
                        </div> */}
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="relative w-full">
                      <LazyImage
                        src={banner2}
                        alt="Carousel slide 2"
                        className="d-block w-100"
                      />
                      <div className="carousel-caption d-none d-md-block absolute left-[40%] right-[30px] bottom-[30px] top-[10%]">
                        <h5 className="font-medium text-[27px] leading-[41px] text-center text-black mb-5">
                          Do Something Kind
                        </h5>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black mb-0">
                            Look around you
                          </p>
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black mb-0">
                            Who might need help, a smile, a friend, or a little
                            extra kindness?
                          </p>
                        </div>
                        <div className="slider-bn-p">
                          <p className="font-teachers font-normal text-[18px] leading-[26px] text-center text-black">
                            Pick one thing you can do for someone else with your
                            words,<br /> your actions, or your choices. Go do it!
                          </p>
                        </div>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black mb-0">
                            Watch what happens next.
                          </p>
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black mb-0">
                            Did someone smile, relax, feel included, or feel
                            seen?
                          </p>
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            That's your ripple working!
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="relative w-full">
                      <LazyImage
                        src={banner3}
                        alt="Carousel slide 3"
                        className="d-block w-100"
                      />
                      <div className="carousel-caption d-none d-md-block absolute left-[40%] right-[30px] bottom-[30px] top-[10%]">
                        <h5 className="font-medium text-[27px] leading-[41px] text-center text-black mb-5">
                          Share your Ripple Cards
                        </h5>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            Invite the next Ripple by asking someone you helped<br />
                            or someone you want to participate in the kindness
                            challenges:<br /> 'Do you want to Pass the Ripple too?'
                          </p>
                        </div>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            That's how your one kind act turns into many!
                          </p>
                        </div>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            Share a Ripple Card with them so a new ripple can
                            start
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="relative w-full">
                      <LazyImage
                        src={banner4}
                        alt="Carousel slide 4"
                        className="d-block w-100"
                      />
                      <div className="carousel-caption d-none d-md-block absolute left-[40%] right-[30px] bottom-[30px] top-[10%]">
                        <h5 className="font-medium text-[27px] leading-[41px] text-center text-black mb-5">
                          Watch your Ripple Travel
                        </h5>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            Tell your teacher, family, and friends about your
                            ripple<br /> and share what you did on the Pass the Ripple
                            website
                          </p>
                        </div>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            You're not bragging, you're showing how kindness
                            spreads!
                          </p>
                        </div>
                        <div className="slider-bn-p">
                          <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                            Watch your card's journey on your kindness map as it
                            gets<br /> passed forward and repeat. Keep noticing. Keep
                            acting.<br /> Keep Passing the Ripple!
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="relative w-full">
                      <LazyImage
                        src={banner5}
                        alt="Carousel slide 5"
                        className="d-block w-100"
                      />
                      <div className="carousel-caption1">
                        <div className="box-slidee">
                          <h4>Start Passing the Ripple!</h4>
                          <a href="/age-gate" className="btn-bg-link">
                            <p className="btn-bg-img btn-1" style={{ backgroundImage: `url(${orangeBtn})` }}>Get Started!</p>
                          </a>
                          <a href="/login" className="btn-bg-link">
                            <p className="btn-bg-img" style={{ backgroundImage: `url(${redBtn})` }}>I have a Ripple Card</p>
                          </a>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="carousel-control-prev absolute opacity-100 flex border-0 bg-transparent hover:bg-transparent">
                  <LazyImage src={leftArrow} alt="Previous" />
                </CarouselPrevious>
                <CarouselNext className="carousel-control-next absolute opacity-100 flex border-0 bg-transparent hover:bg-transparent">
                  <LazyImage src={rightArrow} alt="Next" />
                </CarouselNext>
              </Carousel>
              <LazyImage src={footprint5} alt="Footprint decoration" className="foot5" showSkeleton={false} />
            </div>
          </div>

          {/* Why Luma Section */}
          <div className="row box-luma">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-md-3">
                <div className="box-back">
                  <h4 className="font-teachers font-bold text-[23px] leading-[41px] mb-4 text-center">
                    WHY LUMA?
                  </h4>
                  <div className="box-back-txt">
                    <LazyImage src={purpleBox} alt="Purple Box" className="w-full" />
                    <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                      Luma bridges the storybook<br /> world with real life. This<br />
                      digital extension of <i> You<br /> Matter, Luma</i> helps kids
                      feel<br /> that they matter while<br /> showing them how their<br />
                      everyday actions can<br /> brighten someone's world<br /> one ripple
                      at a time
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="box-back">
                  <h4 className="font-teachers font-bold text-[23px] leading-[41px] mb-4 text-center">
                    WHY KINDNESS?
                  </h4>
                  <div className="box-back-txt">
                    <LazyImage src={yellowBox} alt="Yellow Box" className="w-full" />
                    <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                      Passing the Ripple empowers<br /> kids to recognize their own<br />
                      influence. By taking simple<br /> actions and seeing their<br />
                      impact, children build<br /> confidence, empathy, and the<br /> belief
                      that they can create<br /> positive change
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="box-back">
                  <h4 className="font-teachers font-bold text-[23px] leading-[41px] mb-4 text-center">
                    WHY PARTICIPATE?
                  </h4>
                  <div className="box-back-txt">
                    <LazyImage src={redBox} alt="Red Box" className="w-full" />
                    <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                      Every child deserves<br /> to feel seen and meaningful.<br /> Doing
                      this helps them<br /> understand their own power<br /> to uplift
                      others and create<br /> positive change in their world
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="box-back">
                  <h4 className="font-teachers font-bold text-[23px] leading-[41px] mb-4 text-center">
                    WHY IT MATTERS?
                  </h4>
                  <div className="box-back-txt">
                    <LazyImage src={blueBox} alt="Blue Box" className="w-full" />
                    <p className="font-normal text-[18px] leading-[26px] text-center text-black">
                      The neuroscience is clear:<br /> Building a habit of kindness<br />
                      wires a child's brain for lifelong<br /> resilience and
                      well-being.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety and Security Section */}
          <div className="row mg-0-mob safety_security" style={{ position: "relative" }}>
            <LazyImage src={footprint6} alt="Footprint decoration" className="foot6" showSkeleton={false} />
            <h3 className="ripple-heading font-teachers font-bold text-[28px] leading-[41px] mb-[50px] text-center w-full">
              SAFETY AND SECURITY
            </h3>
            <div className="third-ban">
              <LazyImage
                src={banImg2a}
                alt="Safety and Security"
                className="w-full"
              />
              <div className="third-ban-wrap">
                <div className="third-ban-txt">
                  <h4>Parent Controls &amp; Visibility</h4>
                  <p>
                    Parents can review activity, manage permissions, and stay
                    connected to their child's experience
                  </p>
                </div>
                <div className="third-ban-txt">
                  <h4>Human-Moderated Environment</h4>
                  <p>
                    All submissions, stories, and interactions are reviewed by
                    aduits
                  </p>
                </div>
                <div className="third-ban-txt">
                  <h4>No Public Chat or Open Messaging</h4>
                  <p>
                    Kids cannot message strangers. There are zero open<br />
                    communication channels
                  </p>
                </div>
                <div className="third-ban-txt">
                  <h4>No Ads. No Algorithms. No Data Selling</h4>
                  <p>
                    Kids are never tracked, targeted, or exposed to advertising
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up Section */}
          <div className="sign-wrapper home" style={{ position: "relative" }}>
            <LazyImage src={footprint7} alt="Footprint decoration" className="foot7" showSkeleton={false} />
            <div className="row">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-md-6 home">
                  <div className="sign-img">
                    <LazyImage src={signImg} alt="Sign up" className="w-full" />
                    <p>It takes less than 2 minutes!</p>
                  </div>
                </div>
                <div className="col-md-6 home" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <div className="btn-ripple-wrap" style={{ textAlign: "center" }}>
                    <Link to="/age-gate" className="btn-bg-link" style={{ textAlign: "center", display: "inline-grid", justifyItems: "center" }}>
                      <p style={{ backgroundImage: `url(${blueBtn})`, width: "15rem" }} className="btn-bg-img btn-1">
                        Ready to Start Rippling?
                      </p>
                    </Link>
                    <Link to="/resources" className="btn-bg-link">
                      <p style={{ backgroundImage: `url(${greenBtn})`, width: "24rem" }} className="btn-bg-img btn2">
                        Bring Pass The Ripple to your Classroom!
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
     
        
      </section>

        {/* <div className="zoom-badge" id="zoomBadge">Zoom: 100%</div> */}
    </>
  );
};

export default Index;
