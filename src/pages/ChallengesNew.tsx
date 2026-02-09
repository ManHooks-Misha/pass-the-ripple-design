import React, { useState, useEffect, useRef } from "react";
import LazyImage from "@/components/ui/LazyImage";
import Seo from "@/components/Seo";
import ChallengesPageSkeleton from "@/components/skeletons/ChallengesPageSkeleton";
import ChallengeCardDisplay from "@/components/admin/ChallengeCardDisplay";
import { ChallengeCardPreview } from "@/components/ChallengeCardPreview";
import "@/styles/pages/_challenges.scss";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


// Import title images
import challengesTitle from "@/assets/Challenges/challenges title.png";
import myChallengesTitle from "@/assets/Challenges/my challenge title.png";

// Import map and main images
import heroImg from "@/assets/Challenges/hero-img.jpg";

// Import info boxes
import orangeBox from "@/assets/Challenges/orange box.png";
import blueBox from "@/assets/Challenges/blue box.png";
import purpleBox from "@/assets/Challenges/purple box.png";

// Import character message images
import stepMsg from "@/assets/Challenges/step-msg.png";

// Import other assets
import cardsAndBadges from "@/assets/Challenges/cards and badges.jpg";

// Import challenge card images slider
import sparklyBox from "@/assets/Challenges/sparkly box.jpg";
import sliderMonthly from "@/assets/Challenges/Monthly.jpg";
import sliderWeekly from "@/assets/Challenges/Weekly.jpg";
import sliderDaily from "@/assets/Challenges/Daily.jpg";
import sliderSchool from "@/assets/Challenges/School.jpg";
import sliderCommunity from "@/assets/Challenges/Community.jpg";
import sliderHome from "@/assets/Challenges/Home.jpg";

import btnOrangeBg from "@/assets/Challenges/btn-orange-bg.png";
import btnBlueBg from "@/assets/Challenges/btn-blue-bg.png";
import btnPinkBg from "@/assets/Challenges/btn-pink-bg.png";
import btnBrownBg from "@/assets/Challenges/btn-brown-bg.png";
import btnPurpleBg from "@/assets/Challenges/btn-purple-bg.png";
import btnGreenBg from "@/assets/Challenges/btn-green-bg.png";

// Import challenge card images
import challengeCard1 from "@/assets/Challenges/challenge-card-1.png";
import challengeCard2 from "@/assets/Challenges/challenge-card-2.png";
import challengeCard3 from "@/assets/Challenges/challenge-card-3.png";
import challengeCard4 from "@/assets/Challenges/challenge-card-4.png";
import challengeCard5 from "@/assets/Challenges/challenge-card-5.png";
import challengeCard6 from "@/assets/Challenges/challenge-card-6.png";

// Import button images from home
import blueBtn from "@/assets/home-img/desktop/Ready-to-Start-Rippling.png";
import greenBtn from "@/assets/home-img/desktop/Bring-Pass-The-Ripple-to-your-classroom.png";
import leftArrow from "@/assets/home-img/left-arrow.png";
import rightArrow from "@/assets/home-img/right-arrow.png";

//Footer SignUp
import beforeLoginFooter from "@/assets/Challenges/before-login-footer.png";
import afterLoginFooter from "@/assets/Challenges/after-login-footer.png";

// Import assets for logged-in users
import backOfBadges from "@/assets/Challenges/Back of Badges.jpg";
import backOfCards from "@/assets/Challenges/Back of Cards.jpg";
import chest from "@/assets/Challenges/Chest.webp";

// Import assets for non-logged-in users
import noChallenges from "@/assets/Challenges/No Challenges.jpg";
import completeChallenges from "@/assets/Challenges/Completed Challenges.jpg";
import noCommunityChall from "@/assets/Challenges/No Community Challenges.jpg";
import badgesDisplayCard from "@/assets/Challenges/badges display card.webp";
import publicchallenges from "@/assets/Challenges/public-challenges.png";


import { getImageUrl } from "@/utils/imageUrl";

import { useAuth } from "@/context/AuthContext";
import { challengeService } from "@/services/challengeService";
import { Challenge, UserChallenge, ChallengeStats } from "@/types/Challenge";
import { toast } from "sonner";
import Swal from "sweetalert2";

const ChallengesNew: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<UserChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<UserChallenge[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const myChallengesRef = useRef<HTMLElement | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);




  // Initial Data Fetch
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       // Fetch public active challenges
  //       const active = await challengeService.getActiveChallenges();
  //       setActiveChallenges(active || []);

  //       if (user) {
  //         // Fetch user specific data
  //         const [my, completed, userStats, badges] = await Promise.all([
  //           challengeService.getUserChallenges(),
  //           challengeService.getCompletedChallenges(),
  //           challengeService.getUserChallengeStats(),
  //           challengeService.getUserBadges(user.id)
  //         ]);
  //         setMyChallenges(my || []);
  //         setCompletedChallenges(completed || []);
  //         setStats(userStats);
  //         setUserBadges(badges?.badges?.data || []); // Adjust based on API structure (paginated)
  //       }
  //     } catch (error) {
  //       console.error("Failed to load challenges data", error);
  //       // toast.error("Failed to load challenges");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [user]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const active = await challengeService.getActiveChallenges();
        setActiveChallenges(active || []);

        if (user) {
          const [my, completed, userStats, badges] = await Promise.all([
            challengeService.getUserChallenges(),
            challengeService.getCompletedChallenges(),
            challengeService.getUserChallengeStats(),
            challengeService.getUserBadges(user.id)
          ]);

          setMyChallenges(my || []);
          setCompletedChallenges(completed || []);
          setStats(userStats);
          setUserBadges(badges?.badges?.data || []);
        }

      } catch (error) {
        console.error("Failed to load challenges data", error);
      } finally {
        setIsLoading(false);
        setDataLoaded(true); // 
      }
    };

    fetchData();
  }, [user]);

  // const handleJoinChallenge = async (challengeId: number) => {
  //   if (!user) return;
  //   try {
  //     await challengeService.joinChallenge(challengeId, user.id);
  //     // Open popup
  //     // setShowJoinPopup(true);
  //     // Success Popup
  //     await Swal.fire({
  //       title: "🎉 Joined Successfully!",
  //       text: "You’ve been added to My Active Ripple Challenges.",
  //       icon: "success",
  //       confirmButtonColor: "#3b82f6",
  //       confirmButtonText: "OK"
  //     });
  //     // Wait for DOM update then scroll
  //     setTimeout(() => {
  //       myChallengesRef.current?.scrollIntoView({
  //         behavior: "smooth",
  //         block: "start"
  //       });
  //     }, 300);
  //     toast.success("Joined challenge successfully!");
  //     // Refresh data
  //     const [my] = await Promise.all([
  //       challengeService.getUserChallenges()
  //     ]);
  //     setMyChallenges(my || []);
  //   } catch (error) {
  //     console.error("Failed to join challenge", error);
  //     toast.error("Failed to join challenge");
  //   }
  // };

  // const handleJoinChallenge = async (challengeId: number) => {
  //   if (!user) return;

  //   try {
  //     setIsLoading(true);

  //     await challengeService.joinChallenge(challengeId, user.id);

  //     await Swal.fire({
  //       title: "🎉 Joined Successfully!",
  //       text: "You’ve been added to My Active Ripple Challenges.",
  //       icon: "success",
  //       confirmButtonColor: "#3b82f6",
  //       confirmButtonText: "OK"
  //     });

  //     const my = await challengeService.getUserChallenges();
  //     setMyChallenges(my || []);

  //     setDataLoaded(true); // ✅ ensure empty-state never flickers

  //   } catch (error) {
  //     console.error("Failed to join challenge", error);
  //     toast.error("Failed to join challenge");
  //   } finally {
  //     setIsLoading(false);

  //     setTimeout(() => {
  //       myChallengesRef.current?.scrollIntoView({
  //         behavior: "smooth",
  //         block: "start"
  //       });
  //     }, 300);
  //   }
  // };


  const handleJoinChallenge = async (challengeId: number) => {
    if (!user) return;

    try {
      // 🔹 Keep loader ON
      setIsLoading(true);
      setMyChallenges([]);
      // 🔹 Join API
      await challengeService.joinChallenge(challengeId, user.id);

      // 🔹 Success popup
      await Swal.fire({
        title: "🎉 Joined Successfully!",
        text: "You’ve been added to My Active Ripple Challenges.",
        icon: "success",
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "OK"
      });

      // 🔹 Fetch fresh challenges (slow API)
      const my = await challengeService.getUserChallenges();


      // 🔹 Update state
      setMyChallenges(my || []);
      setDataLoaded(true);

      // 🔹 Wait one animation frame to let React commit DOM
      requestAnimationFrame(() => {
        setIsLoading(false);
      });

      // 🔹 Scroll after paint
      setTimeout(() => {
        myChallengesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 300);

      const active = await challengeService.getActiveChallenges();
      setActiveChallenges(active || []);

    } catch (error) {
      console.error("Failed to join challenge", error);
      toast.error("Failed to join challenge");
      setIsLoading(false);
    }
  };



  const noChallengeData = myChallenges.length === 0;

  return (
    <>
      {showJoinPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[350px] text-center shadow-lg">
            <h2 className="text-xl font-bold mb-2">🎉 Joined Successfully!</h2>
            <p className="mb-4">You are now part of this challenge.</p>
            <button
              onClick={() => setShowJoinPopup(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Seo
        title="Kindness Challenges For Kids - Pass The Ripple"
        description="Fun challenges and Acts of Kindness. Not sure where to begin rippling? Pick a themed adventure, complete an act of kindness, and watch your ripples grow!"
        canonical={`${window.location.origin}/challenges`}
      />

      <section className="challenges-page-container container scroll-h" id="zoom-wrapper">
        {/* SECTION 1: Hero Title */}
        {user && (
          <section className="challenges-hero">
            <div className="challenges-hero-title">
              <LazyImage
                src={myChallengesTitle}
                alt="Kindness Challenges For Kids"
                className="title-img"
              />
              <p className="challenges-hero-description">
                Not sure where to begin rippling?
                <br />Pick a themed adventure, complete an act of kindness, and watch your ripples grow!
              </p>
            </div>

          </section>
        )}

        {!user && (
          <section className="challenges-hero">
            <div className="challenges-hero-title">
              <LazyImage
                src={challengesTitle}
                alt="Kindness Challenges For Kids"
                className="title-img"
              />
              <p className="challenges-hero-subtitle">
                Fun Quests and Acts of Kindness
              </p>
            </div>
            <p className="challenges-hero-description">
              Not sure where to begin rippling? Pick a themed adventure, complete
              an act of kindness, and watch your ripples grow!
            </p>
          </section>
        )}

        {!user && (
          <>
            {/* SECTION 2: Main Content - Map + Info Boxes */}
            <section className="main-content-section">
              <div className="row">
                <div className="grid md:grid-cols-2 gap-3 mapp">
                  {/* Left: Kindness Challenges Map */}
                  <div className="map-container">
                    <LazyImage
                      src={heroImg}
                      alt="Kindness Challenges Map"
                      className="map-img"
                    />
                  </div>

                  {/* Right: Info Boxes */}
                  <div className="info-boxes-container1">
                    {/* Info Box 1 - What are challenges? */}
                    <div className="info-box-item orange-box">
                      <div
                        className="info-box-content img1"
                        style={{ backgroundImage: `url(${orangeBox})` }}
                      >
                        <h3>What are challenges?</h3>
                        <p>
                          A Kindness Challenge is a single, guided kindness
                          prompt that encourages<br /> kids to take one small action
                          to help someone feel seen or valued.
                        </p>
                      </div>
                    </div>

                    {/* Info Box 2 - How does it work? */}
                    <div className="info-box-item blue-box">
                      <div
                        className="info-box-content img2"
                        style={{ backgroundImage: `url(${blueBox})` }}
                      >
                        <h3>How does it work?</h3>
                        <p>
                          Pass the Ripple brings individual Kindness Challenges
                          together into a safe, guided experience that helps
                          kids see their impact grow over time.
                        </p>
                        <p>
                          Children complete challenges in their everyday lives
                          and then return to the platform to reflect, track, and
                          recognize the ripples they've created. Each completed
                          challenge earns a badge, giving kids a visual reminder
                          of their kindness and progress.
                        </p>
                      </div>
                    </div>

                    {/* Info Box 3 - How to participate? */}
                    <div className="info-box-item purple-box">
                      <div
                        className="info-box-content img3"
                        style={{ backgroundImage: `url(${purpleBox})` }}
                      >
                        <h3>How to participate?</h3>
                        <p>
                          Getting started is easy and guided every step of the
                          way.
                        </p>
                        <ol>
                          <li>Sign up to create a safe, protected account</li>
                          <li>Explore available Kindness Challenges</li>
                          <li>Complete a challenge in the real world</li>
                          <li>Share the ripple within the platform</li>
                          <li>Earn a badge and invite the next ripple</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: Character Messages */}
            <section className="character-messages-section">
              <div className="row">
                <LazyImage
                  src={stepMsg}
                  alt="Join and explore challenge"
                  className="character-msg"
                />
              </div>
            </section>

            {/* SECTION 4: How Badges Work */}
            <section className="badges-section">
              <h2 className="section-title-center">How Badges Work</h2>
              <div className="badges-content">
                <LazyImage
                  src={cardsAndBadges}
                  alt="Kindness Challenge: Cards and Badges"
                  className="badges-img"
                />
              </div>
            </section>

            {/* SECTION 5: Active Challenges Slider */}
           <section className="active-challenges-slider">
<h2 className="section-title-center">Active Challenges</h2>
 
              <div className="slider-wrapper">
<Carousel
                  className="challenges-carousel"
                  opts={{ align: "start", loop: true }}
>
<CarouselContent>
                    {[
                      {
                        img: sliderMonthly,
                        title: "The Little Village Kindness Challenge",
                      },
                      { img: sliderWeekly, title: "Park Cleanup Challenge" },
                      { img: sliderDaily, title: "Friendship Challenge" },
                      { img: sliderSchool, title: "Friendship Challenge" },
                      { img: sliderHome, title: "Friendship Challenge" },
                      { img: sliderCommunity, title: "Friendship Challenge" },
                    ].map((challenge, index) => (
<CarouselItem key={index} className="carousel-slide-item">
<div
                          className="active-challenge-card-wrapper"
                          style={{ backgroundImage: `url(${sparklyBox})` }}
>
<div className="active-challenge-display">
<LazyImage
                              src={challenge.img}
                              alt={challenge.title}
                              className="active-challenge-img"
                            />
</div>
 
                          <div className="challenge-info-panel">
<p className="ready-text">
                              Ready to join this challenge?
</p>
<p className="challenge-subtext">
                              Create your account
<br />
                              and join the kindness movement!
</p>
 
                            <Link
                              to="/age-gate"
                              className="btn-challenge-join btn-bg-img"
                              style={{ backgroundImage: `url(${btnOrangeBg})` }}
>
                              Join this Challenge
</Link>
</div>
</div>
</CarouselItem>
                    ))}
</CarouselContent>
 
                  <CarouselPrevious className="carousel-control-prev">
<LazyImage src={leftArrow} alt="Previous" />
</CarouselPrevious>
<CarouselNext className="carousel-control-next">
<LazyImage src={rightArrow} alt="Next" />
</CarouselNext>
</Carousel>
</div>
</section>

            {/* SECTION 6: Explore Completed Challenges */}
            <section className="completed-challenges-section">
              <h2 className="section-title-center">
                Explore Completed Challenges
              </h2>

              <div className="row">
                <div className="grid grid-cols-3 gap-x-12 gap-y-8">
                  {[
                    {
                      img: challengeCard1,
                      title: "Invited my new neighbor to my house",
                      rippleId: "JHV01GT1",
                      relDate: "December 1,2025",
                    },
                    {
                      img: challengeCard2,
                      title: "Cleaned the park on a Saturday afternoon",
                      rippleId: "JHV02GT2",
                      relDate: "December 2,2025",
                    },
                    {
                      img: challengeCard3,
                      title: "Invited a kid to play with me and my friend",
                      rippleId: "JHV03GT3",
                      relDate: "December 3,2025",
                    },
                    {
                      img: challengeCard4,
                      title: "Complimented my friend",
                      rippleId: "JHV04GT4",
                      relDate: "December 4,2025",
                    },
                    {
                      img: challengeCard5,
                      title: "Let a grandma go first at the grocery store",
                      rippleId: "JHV05GT5",
                      relDate: "December 5,2025",
                    },
                    {
                      img: challengeCard6,
                      title: "Helped my friend with his math homework",
                      rippleId: "JHV06GT6",
                      relDate: "December 6,2025",
                    },
                  ].map((card, index) => (
                    <div key={index} className="completed-card">
                      <LazyImage
                        src={card.img}
                        alt={card.title}
                        className="completed-card-img"
                        showSkeleton={false}
                      />
                      <div className="completed-card-body">
                        <h2>{card.title}</h2>
                        <div className="completed-card-subbody">
                          <p className="card-idd">{card.rippleId}</p>
                          <p className="card-datee">{card.relDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 7: Sign Up and Start a Ripple Challenge */}
            <section className="cta-section challenges">
              {/* Right Side - CTA Buttons (50%) */}
              <div className="sign-wrapper challenge-sign">
                <div className="grid grid-cols-2 gap-5">
                  <div className="sign-img">
                    <LazyImage
                      src={beforeLoginFooter}
                      alt="Sign up"
                      className="w-full"
                    />
                    <p>Be part of the kindness chain today</p>
                  </div>
                  <div className="btn-ripple-wrap">
                    <Link to="/age-gate" className="btn-ripple-hero">
                      <p
                        className="first"
                        style={{ backgroundImage: `url(${blueBtn})` }}
                      >
                        Ready to Start Rippling?
                      </p>
                    </Link>
                    <Link to="/resources" className="btn-ripple-hero">
                      <p
                        className=""
                        style={{ backgroundImage: `url(${greenBtn})` }}
                      >
                        Bring Pass The Ripple to your Classroom!
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {(user) && (
          <>

            {/* SECTION 1: My Active Ripple Challenges */}
            <section className="my-active-challenges-section" ref={myChallengesRef}>
              <h2 className="section-title-center">My Active Ripple Challenges</h2>

              <div className="row section-active-challenge">
                {isLoading ? (
                  // Loader
                  <div className="flex flex-col justify-center items-center min-h-[300px] w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
                    <p className="mt-3 text-gray-500 text-sm">
                      Loading your active challenges...
                    </p>
                  </div>
                ) : !dataLoaded ? (
                  // Still waiting for first API response (extra safety)
                  <div className="flex justify-center items-center min-h-[300px] w-full">
                    <p className="text-gray-400 text-sm">Preparing your challenges...</p>
                  </div>
                ) :

                  myChallenges.length > 0 ? (
                    <Carousel className="w-full max-w-4xl mx-auto" opts={{ align: "start", loop: true }}>
                      <CarouselContent>
                        {myChallenges.map((userChallenge) => {
                          const challenge = userChallenge.challenge;
                          if (!challenge) return null;

                          const endDate = new Date(challenge.end_date);
                          const now = new Date();
                          const diffTime = Math.max(0, endDate.getTime() - now.getTime());
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                          const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

                          const postStoryLink = user?.role === 'admin'
                            ? `/admin/post-story?challengeId=${challenge.id}`
                            : `/post-story?challengeId=${challenge.id}`;

                          return (
                            <CarouselItem key={userChallenge.id}>
                              <div
                                className="active-challenge-card-wrapper grid md:grid-cols-2 gap-4 items-center p-8 rounded-3xl"
                                style={{ backgroundImage: `url(${sparklyBox})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                              >
                                {/* Left Side: Card Preview */}
                                <div className="active-challenge-display flex justify-center items-center h-full min-h-[400px]">
                                  <div className="transform scale-90 hover:scale-95 transition-transform duration-300">
                                    <ChallengeCardPreview
                                      challenge={challenge}
                                      scale={0.7}
                                    />
                                  </div>
                                </div>

                                {/* Right Side: Info Panel */}
                                <div className="challenge-info-panel flex flex-col justify-center items-center text-center space-y-6 bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm">
                                  {/* Title (Hidden as it's on the card, but good for accessibility/layout if needed. Using remaining time as header per design) */}

                                  <div className="time-section space-y-1">
                                    <h3 className="text-2xl font-bold font-heading text-primary">Remaining Time</h3>
                                    <p className="time-display text-lg font-medium">
                                      {diffDays} Days / {diffHours} Hours / {diffMinutes} Minutes
                                    </p>
                                  </div>

                                  <div className="challenge-actions space-y-4 w-full flex flex-col items-center">
                                    {/* Complete Challenge Button */}
                                    <Link
                                      to={postStoryLink}
                                      className="btn-challenge-action block w-full max-w-[280px] hover:scale-105 transition-transform"
                                    >
                                      <p className="btn-bg-img py-3 px-6 text-white font-bold rounded-full shadow-lg flex items-center justify-center h-14" style={{ backgroundImage: `url(${btnBlueBg})`, backgroundSize: 'cover' }}>
                                        Complete this Challenge
                                      </p>
                                    </Link>

                                    {/* Next Challenge Button (Carousel Next) */}
                                    {/* We use CarouselNext but style it as a static button in the layout */}
                                    <div className="relative w-full max-w-[280px] h-14">
                                      <CarouselNext className="static transform-none top-auto right-auto left-auto bottom-auto w-full h-full p-0 border-0 bg-transparent hover:bg-transparent hover:scale-105 transition-transform">
                                        <p className="btn-bg-img w-full h-full text-white font-bold rounded-full shadow-lg flex items-center justify-center" style={{ backgroundImage: `url(${btnPinkBg})`, backgroundSize: 'cover' }}>
                                          Next Challenge
                                        </p>
                                      </CarouselNext>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CarouselItem>
                          );
                        })}
                      </CarouselContent>

                      {/* Optional: Add Previous arrow if needed, or rely on loop */}
                      {/* <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" /> */}
                      {/* <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden" />  We have custom next button */}
                    </Carousel>
                  ) : (

                    <div className="row">
                      <div className="no-challenge-display">
                        <LazyImage
                          src={noChallenges}
                          alt="Looks like you haven't joined a challenge yet"
                          className="no-challenge-img"
                        />
                        <Link
                          to="/age-gate"
                          className="btn-join-challenge"
                        >
                          <p className="btn-bg-img" style={{ backgroundImage: `url(${btnOrangeBg})` }}>
                            Join a Challenge
                          </p>
                        </Link>
                      </div>
                    </div>
                  )}
              </div>
            </section>



            {/* SECTION 3: My Badges Treasure Chest */}
            < section className="treasure-chest-section" >
              <h3 className="section-title-center">
                My Badges Treasure Chest
                {stats?.current_tier && (
                  <span className="block text-xl font-bold mt-2 text-[#fbbf24] drop-shadow-md">
                    Current Tier: {stats.current_tier.name} (Level {stats.current_tier.level})
                  </span>
                )}
              </h3>
              <div className="treasure-chest-display grid md:grid-cols-2 gap-8">
                <Link
                  to="/badges"
                  className="btn-chest "

                >
                  <p className="btn-bg-img" style={{ backgroundImage: `url(${btnGreenBg})` }}>
                    Open my Badges Chest
                  </p>
                </Link>
                <LazyImage
                  src={chest}
                  alt="Treasure Chest"
                  className="chest-img"
                />

              </div>
            </section >

            {/* SECTION 4: Active Challenges */}
            < section className="active-challenges-slider" >
              <h2 className="section-title-center">Active Challenges</h2>

              <div className="slider-wrapper">
                {activeChallenges.filter(c => !c.user_joined).length > 0 ? (
                  <Carousel
                    className="challenges-carousel"
                    opts={{ align: "start", loop: true }}
                  >
                    <CarouselContent>

                      {activeChallenges.filter(c => !c.user_joined).map((challenge) => (
                        <CarouselItem key={challenge.id} className="carousel-slide-item">
                          <div
                            className="active-challenge-card-wrapper"
                            style={{ backgroundImage: `url(${sparklyBox})` }}
                          >
                            <div className="active-challenge-display" style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
                              <div className="transform-gpu origin-center">
                                <ChallengeCardPreview
                                  challenge={challenge}
                                  scale={0.65}
                                />
                              </div>
                            </div>

                            <div className="challenge-info-panel">
                              <h3 className="text-xl font-bold mb-2 text-center px-4 line-clamp-2">{challenge.name}</h3>

                              <button
                                onClick={() => handleJoinChallenge(challenge.id)}
                                className="btn-challenge-join border-0 bg-transparent cursor-pointer w-full"
                              >
                                <p className="btn-bg-img" style={{ backgroundImage: `url(${btnOrangeBg})` }}>
                                  Join this Challenge
                                </p>
                              </button>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}

                    </CarouselContent>

                    <CarouselPrevious className="carousel-control-prev">
                      <LazyImage src={leftArrow} alt="Previous" />
                    </CarouselPrevious>
                    <CarouselNext className="carousel-control-next">
                      <LazyImage src={rightArrow} alt="Next" />
                    </CarouselNext>
                  </Carousel>
                ) : (
                  <div className="row">
                    <div className="no-active-challenges-display">
                      <LazyImage
                        src={completeChallenges}
                        alt="It looks like you have completed all available challenges!"
                        className="no-challenge-img"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section >

            {/* SECTION 5: Explore Community Completed Challenges */}
            < section className="completed-challenges-section" >
              <h2 className="section-title-center">
                Explore Community Completed Challenges
              </h2>

              <div className="row">
                <div className="grid md:grid-cols-3 gap-12">
                  {[
                    {
                      img: challengeCard1,
                      title: "Smiled my new neighbor",
                      rippleId: "JHV01GT1",
                      relDate: "December 1,2025",
                    },
                    {
                      img: challengeCard2,
                      title: "Cleaned the park on a Saturday afternoon",
                      rippleId: "JHV02GT2",
                      relDate: "December 2,2025",
                    },
                    {
                      img: challengeCard3,
                      title: "Helped a kid to play with me and my friend",
                      rippleId: "JHV03GT3",
                      relDate: "December 3,2025",
                    },
                    {
                      img: challengeCard4,
                      title: "Complimented my friend",
                      rippleId: "JHV04GT4",
                      relDate: "December 4,2025",
                    },
                    {
                      img: challengeCard5,
                      title: "Let a grandma go first at the grocery store",
                      rippleId: "JHV05GT5",
                      relDate: "December 5,2025",
                    },
                    {
                      img: challengeCard6,
                      title: "Helped my friend with his math homework",
                      rippleId: "JHV06GT6",
                      relDate: "December 6,2025",
                    },
                  ].map((card, index) => (
                    <div key={index} className="completed-card">
                      <LazyImage
                        src={card.img}
                        alt={card.title}
                        className="completed-card-img"
                        showSkeleton={false}
                      />
                      <div className="completed-card-body">
                        <h2>{card.title}</h2>
                        <div className="completed-card-subbody">
                          <p className="card-idd">{card.rippleId}</p>
                          <p className="card-datee">{card.relDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shuffle-cards-btn text-center">
                <Link
                  to="#"
                  className="btn-shuffle"
                >
                  <p className="btn-bg-img" style={{ backgroundImage: `url(${btnPurpleBg})` }}>
                    Shuffle Cards
                  </p>
                </Link>
              </div>
            </section >

            {/* SECTION 6: Start a Ripple Challenge Footer */}
            < section className="cta-section after-login" >
              <LazyImage
                src={afterLoginFooter}
                alt="Sign up"
                className="w-full"
              />
              <p className="cta-subtitle">Be part of kindness chain today</p>

              <div className="cta-button-wrapper">
                <Link
                  to="#"
                  className="btn-start-now"

                >
                  <p className="btn-bg-img btn-startt" style={{ backgroundImage: `url(${btnGreenBg})` }}>

                    Start now!
                  </p>
                </Link>
              </div>
            </section >
          </>
        )}

        {
          (user && noChallengeData) && (
            <>
              {/* SECTION 1: My Active Ripple Challenges - Not Logged In */}
              <section className="my-active-challenges-section not-logged-in">
                <h2 className="section-title-center">My Active Ripple Challenges</h2>
              </section>

              {/* SECTION 2: My Collected Badges & Cards - Not Logged In */}
              <section className="my-collections-section not-logged-in">
                <div className="row">
                  <div className="collection-wrapp gap-8">
                    {/* My Collected Badges */}
                    <div className="collection-item">
                      <h3 className="collection-title">My Collected Badges</h3>
                      <div className="collection-display">
                        <LazyImage
                          src={badgesDisplayCard}
                          alt="Kindness Badge Collection"
                          className="collection-img"
                        />
                        <Link
                          to="#"
                          className="btn-collection"
                        >
                          <p className="btn-bg-img" style={{ backgroundImage: `url(${btnOrangeBg})` }}>
                            Next Ripple Challenge Badge
                          </p>
                        </Link>
                      </div>
                    </div>

                    {/* My Collected Ripple Challenge Cards */}
                    <div className="collection-item">
                      <h3 className="collection-title">My Collected Ripple Challenge Cards</h3>
                      <div className="collection-display">
                        <LazyImage
                          src={sliderDaily}
                          alt="Kindness Challenge Card Collection"
                          className="collection-img"
                        />
                        <Link
                          to="#"
                          className="btn-collection"
                        >
                          <p className="btn-bg-img" style={{ backgroundImage: `url(${btnOrangeBg})` }}>
                            Next Ripple Challenge Badge
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: My Badges Treasure Chest - Not Logged In */}
              <section className="treasure-chest-section not-logged-in">
                <h3 className="section-title-center">My Badges Treasure Chest</h3>
                <div className="treasure-chest-display grid md:grid-cols-2 gap-8">
                  <Link
                    to="/badges"
                    className="btn-chest"
                  >
                    <p className="btn-bg-img" style={{ backgroundImage: `url(${btnGreenBg})` }}>
                      Open my Badges Chest
                    </p>
                  </Link>
                  <LazyImage
                    src={chest}
                    alt="Treasure Chest"
                    className="chest-img"
                  />
                </div>
              </section>

              {/* SECTION 4: Active Challenges - Not Logged In */}
              <section className="active-challenges-slider not-logged-in">
                <h2 className="section-title-center">Active Challenges</h2>


              </section>

              {/* SECTION 5: Explore Community Completed Challenges - Not Logged In */}
              <section className="completed-challenges-section not-logged-in">
                <h2 className="section-title-center">
                  Explore Community Completed Challenges
                </h2>

                <div className="row">
                  <div className="no-community-challenges-display">
                    <LazyImage
                      src={noCommunityChall}
                      alt="Looks like there are no completed challenges yet"
                      className="no-community-img"
                    />
                    <Link
                      to="#"
                      className="btn-join-ex-challenge"
                    >
                      <p className="btn-bg-img" style={{ backgroundImage: `url(${btnOrangeBg})` }}>
                        Join a Challenge
                      </p>
                    </Link>
                  </div>
                </div>
              </section>

              {/* SECTION 6: Start a Ripple Challenge Footer */}
              <section className="cta-section after-login">
                <LazyImage
                  src={afterLoginFooter}
                  alt="Sign up"
                  className="w-full"
                />
                <p className="cta-subtitle">Be part of kindness chain today</p>

                <div className="cta-button-wrapper">
                  <Link
                    to="#"
                    className="btn-start-now"

                  >
                    <p className="btn-bg-img btn-startt" style={{ backgroundImage: `url(${btnGreenBg})` }}>

                      Start now!
                    </p>
                  </Link>
                </div>
              </section>
            </>
          )
        }


      </section >
    </>
  );
};

export default ChallengesNew;
