import React, { useRef, useEffect, useState } from "react";
import LazyImage from "@/components/ui/LazyImage";
import Seo from "@/components/Seo";
import InfoCard from "@/components/ui/InfoCard";
import FlipCard from "@/components/FlipCard";
import FlipCardSkeleton from "@/components/skeletons/FlipCardSkeleton";
import CarouselSkeleton from "@/components/skeletons/CarouselSkeleton";
import HeroSectionSkeleton from "@/components/skeletons/HeroSectionSkeleton";
import InfoCardSkeleton from "@/components/skeletons/InfoCardSkeleton";
import "@/styles/pages/_hero-wall-public.scss";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { apiFetch } from "@/lib/api-client";

// Import hero wall public assets
import heroWallTitle from "@/assets/hero-wall/public/hero wall title.png";
import firefliesLuma from "@/assets/hero-wall/public/fireflies luma.webp";
import firefliesCharacters from "@/assets/hero-wall/public/fireflies characters.webp";
import fireflies4 from "@/assets/hero-wall/public/fireflies 4.png";
import fireflies3 from "@/assets/hero-wall/public/fireflies 3.png";
import rippleHighlightsTitle from "@/assets/hero-wall/public/ripple highlights title.png";
import breakdownBackgrund from "@/assets/hero-wall/public/breakdown background.webp";
import orangeBtn from "@/assets/hero-wall/public/orange-btn.png";

// Import ripple story images
import teacherImg from "@/assets/hero-wall/public/Teacher.webp";
import playgroundImg from "@/assets/hero-wall/public/Playground.webp";
import plantasImg from "@/assets/hero-wall/public/Plantas.webp";
import snackImg from "@/assets/hero-wall/public/Snack.webp";
import grandmaImg from "@/assets/hero-wall/public/Grandma.webp";
import janitorImg from "@/assets/hero-wall/public/Janitor.webp";
import bedroomImg from "@/assets/hero-wall/public/Bedroom.webp";
import atSchool from "@/assets/hero-wall/public/at-school.png";
import atHome from "@/assets/hero-wall/public/at-home.png";
import myCommunity from "@/assets/hero-wall/public/in-my-community.png";
import myClassRoom from "@/assets/hero-wall/public/in-my-classroom.png";
import everyWhere from "@/assets/hero-wall/public/everywhere-else.png";
import challenges from "@/assets/hero-wall/public/challenges.png";
import publichero from "@/assets/hero-wall/public-hero.png";



// Import CTA images
import signUpFooter from "@/assets/hero-wall/public/sign-up-footer.webp";
import startRippleFooter from "@/assets/hero-wall/public/start rippling.png";

// Import button images from home
import blueBtn from "@/assets/home-img/desktop/Ready-to-Start-Rippling.png";
import greenBtn from "@/assets/home-img/desktop/Bring-Pass-The-Ripple-to-your-classroom.png";
import leftArrow from "@/assets/home-img/left-arrow.png";
import rightArrow from "@/assets/home-img/right-arrow.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/imageUrl";
import { getIconByName } from "@/config/icons";
import { Flashlight } from "lucide-react";
import { Shuffle } from 'lucide-react';
import HeroWall from "./HeroWallOld";



// Interface for story data from API
interface StoryData {
  id: number;
  slug: string;
  title: string;
  teacher_quote: string;
  description: string;
  photo_path: string | null;
  performed_at_formatted: string | null;
  category: {
    id: number;
    name: string;
    code: string;
  } | null;
  user: {
    id: number;
    ripple_id?: string;
  };
}

// Helper function to generate random date between 1-3 weeks ago
const getRandomPastDate = (): string => {
  const today = new Date();
  const oneWeekAgo = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  const threeWeeksAgo = 21 * 24 * 60 * 60 * 1000; // 3 weeks in milliseconds

  // Random timestamp between 1-3 weeks ago
  const randomOffset = Math.random() * (threeWeeksAgo - oneWeekAgo) + oneWeekAgo;
  const randomDate = new Date(today.getTime() - randomOffset);

  // Format as "Month, Day Year"
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const month = months[randomDate.getMonth()];
  const day = randomDate.getDate();
  const year = randomDate.getFullYear();

  return `${month} ${day}, ${year}`;
};

// Mock data for the cards (fallback)
const RIPPLE_CARDS = [
  {
    id: "1",
    title: "Shared a snack with my friend who forgot his",
    description: "One of my friends was not going to eat because he forgot his lunchbox at home, so I gave him one of my snacks. He told me he was very hungry and super happy I gave him food",
    stat: "Ripple chain reached 10 acts!",
    image: snackImg,
    rippleId: "HJG1123Y",
    date: getRandomPastDate(),
    category: "At School",
  },
  {
    id: "2",
    title: "Accompanied Ms. Smith to the doctor",
    description: "My neighbor is not able to see well, so I helped her find the way to the doctors office. She got me icecream when we finished and it was a good day!",
    stat: "This ripple has travelled through 4 states!",
    image: grandmaImg,
    rippleId: "HJG2223Y",
    date: getRandomPastDate(),
    category: "In My Community",
  },
  {
    id: "3",
    title: "Spent time with dogs at the local shelter",
    description: "I love dogs, so I told my mom I wanted to help them. She took me to the shelter and I gave Lucas food and gave Milo a bath. I love playing with dogs and will go to the shelter again",
    stat: "This Ripple has moved to a new country!",
    image: bedroomImg,
    rippleId: "HJG3323Y",
    date: getRandomPastDate(),
    category: "Challenges",
  },
  {
    id: "4",
    title: "Thanked Mr. Gainz for his help at school",
    description: "Mr. Gainz does a great job cleaning the school, so when the teacher told us to make drawings and letters to say thank you to people I made a card for him. He smiled and was very happy.",
    stat: "Ripple chain reached 10 acts!",
    image: janitorImg,
    rippleId: "HJG4423Y",
    date: getRandomPastDate(),
    category: "In My Classroom",
  },
  {
    id: "5",
    title: "Helped the environment by planting flowers",
    description: "I learnt in biology class that bees are super important for the environment and that they like flowers, so I planted new flowers in my garden with my mom. I am helping the world now!",
    stat: "This ripple has travelled through 4 states!",
    image: plantasImg,
    rippleId: "HJG5523Y",
    date: getRandomPastDate(),
    category: "At Home",
  },
  {
    id: "6",
    title: "Invited the new kid to play during recess",
    description: "Today Sarah started to go to our school with me. She was alone in the playground, so I invited her to play with me and my friends. We had fun and now she will visit my house on the weekend!",
    stat: "This Ripple has moved to a new country!",
    image: playgroundImg,
    rippleId: "HJG6623Y",
    date: getRandomPastDate(),
    category: "At School",
  },
];

const HeroWallPublic: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  // State for slider stories and regular stories
  const [sliderStories, setSliderStories] = useState<StoryData[]>([]);
  const [regularStories, setRegularStories] = useState<StoryData[]>([]);
  const [rippleInMotionStories, setRippleInMotionStories] = useState<
    StoryData[]
  >([]);
  const [rippleMilestonesStories, setRippleMilestonesStories] = useState<
    StoryData[]
  >([]);
  const [rippleAroundWorldStories, setRippleAroundWorldStories] = useState<
    StoryData[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Helper function to remove HTML tags from string
  const stripHtmlTags = (html: string): string => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Helper function to truncate description to word limit
  const truncateDescription = (
    description: string,
    wordLimit: number = 20
  ): string => {
    // First remove HTML tags
    const cleanText = stripHtmlTags(description);
    const words = cleanText.split(" ");
    if (words.length <= wordLimit) return cleanText;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  // Helper function to navigate to story detail
  const handleStoryClick = (story: StoryData) => {
    navigate(`/story/${story.slug || story.id}`);
  };

  // Fetch hero wall stories
  useEffect(() => {
    const fetchHeroWallData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch slider stories (pinned stories)
        const slidersResponse = await apiFetch<{
          success: boolean;
          data: StoryData[];
        }>("/user/global-hero-wall/sliders?is_global=false");
        if (slidersResponse.success) {

          setSliderStories(slidersResponse.data);
          console.log("sliderStories-111", sliderStories);
          console.log('slidersResponse-222', slidersResponse.data)
        }
        // Fetch regular stories
        const storiesResponse = await apiFetch<{
          success: boolean;
          data: {
            data: StoryData[];
          };
        }>("/user/global-hero-wall/stories?is_global=false&per_page=6");
        if (storiesResponse.success) {
          setRegularStories(storiesResponse.data.data);
        }
        // Fetch category-based stories in parallel
        const [rippleInMotionRes, rippleMilestonesRes, rippleAroundWorldRes] =
          await Promise.all([
            apiFetch<{ success: boolean; data: { data: StoryData[] } }>(
              "/user/global-hero-wall/stories?is_global=false&per_page=9&is_random=true"
            ),
            apiFetch<{ success: boolean; data: { data: StoryData[] } }>(
              "/user/global-hero-wall/stories?is_global=false&per_page=3&category_id=8"
            ),
            apiFetch<{ success: boolean; data: { data: StoryData[] } }>(
              "/user/global-hero-wall/stories?is_global=false&per_page=3&category_id=2"
            ),
          ]);
        if (rippleInMotionRes.success) {
          setRippleInMotionStories(rippleInMotionRes.data.data);
        }
        if (rippleMilestonesRes.success) {
          setRippleMilestonesStories(rippleMilestonesRes.data.data);
        }
        if (rippleAroundWorldRes.success) {
          setRippleAroundWorldStories(rippleAroundWorldRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching hero wall data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroWallData();
  }, [user]);

  // Add new state for shuffle loading
  const [shuffleLoading, setShuffleLoading] = useState(false);

  // Add shuffle function
  const handleShuffleStories = async () => {
    try {
      setShuffleLoading(true);
      const response = await apiFetch<{
        success: boolean;
        data: { data: StoryData[] }
      }>(
        `/global-hero-wall/stories?is_global=false&per_page=9&is_random=true&random=${Date.now()}`
      );

      if (response.success) {
        setRippleInMotionStories(response.data.data);
      }
    } catch (error) {
      console.error("Error shuffling stories:", error);
    } finally {
      setShuffleLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="Hero Wall - Pass The Ripple"
        description="Where everyday kindness becomes a story worth celebrating. See the ripples created by kids, families, and classrooms around the world."
        canonical={`${window.location.origin}/hero-wall`}
      />
{/* <section className="hero-wall-container container scroll-h" id="zoom-wrapper" style={{
        paddingTop: "0px",
        zIndex: "0", backgroundImage: `url(${publichero})`
      }}> */}

{/* style={{
        paddingTop: "0px",
        zIndex: "0", backgroundImage: `url(${publichero})`
      }} */}
      <section className="hero-wall-container container scroll-h" id="zoom-wrapper" >
        {/* Fireflies Decorations */}
        {!user && (
          <div className="firefly-decoration firefly-top-left">
            {/* <img
              src={fireflies3}
              alt=""
            /> */}
          </div>
        )}
        {user && (
          <div className="firefly-decoration with-user firefly-top-left">
            {/* <img
              src={fireflies4}
              alt=""
            /> */}
          </div>
        )}

        {/* --- HERO SECTION --- */}
        <section className={`hero-wall-section fly1 ${user ? "with-user" : ""}`}>
          <div className="hero-content-wrapper">
            {/* Fireflies Characters - Left */}
            <div className="hero-characters-left">
              <img
                src={firefliesCharacters}
                alt="Kindness characters"
                className="hero-wall-image"
              />
            </div>

            {/* Hero Content - Right */}
            <div className="hero-content-right">
              {/* Hero Wall Title */}
              <div className="hero-title-wrapper">
               <img
  src={heroWallTitle}
  alt="Hero Wall"
  className="hero-title-img"
/>

              </div>

              <div className="hero-subtitle">
                <p className="hero-subtitle-main2">
                  Where everyday kindness becomes a story worth celebrating.
                </p>
                <p className="hero-subtitle-main">
                  See the ripples created by kids, families, and classrooms
                  around the world
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- INFO GRID SECTION WITH BACKGROUND IMAGE --- */}
        {!user && (
          <section className="info-grid-section fly1" style={{ backgroundImage: `url(${breakdownBackgrund})` }}>
            <div className="info-grid">
              {/* Card 1 */}
              <InfoCard backgroundColor="#ffffff" borderColor="#ffecbb">
                <h3 className="info-card-title">
                  What lives on the Hero Wall?
                </h3>
                <p className="info-card-text">
                  On this page, you'll see real moments of kindness shared by
                  kids from different places
                </p>
                <p className="info-card-text">
                  Each highlight started as one small act and now it's part <br/>of
                  something bigger
                </p>
              </InfoCard>

              {/* Card 2 */}
              <InfoCard backgroundColor="#e1fffd" borderColor="#fff">
                <h3 className="info-card-title">
                  Why these Ripple <br />moments are shared
                </h3>
                <p className="info-card-text">
                  When kindness is shared, it helps others notice what's
                  possible
                </p>
                <p className="info-card-text">
                  Seeing one kind act can inspire another and that's how ripples
                  grow
                </p>
              </InfoCard>

              {/* Card 3 */}
              <InfoCard
                backgroundColor="#ffffff"
                borderColor="rgb(254 221 221)"
              >
                <h3 className="info-card-title">How a Ripple Gets Here</h3>
                <p className="info-card-text">
                  Every highlight begins with a kid choosing to do <br />something
                  kind
                </p>
                <p className="info-card-text">
                  Some ripples hit milestones and we share the news<br/> with
                  everyone to<br/> celebrate the growth of kindness
                </p>
              </InfoCard>

              {/* Card 4 */}
              <InfoCard
                backgroundColor="rgb(255 222 222)"
                borderColor="#ffffff"
              >
                <h3 className="info-card-title">What This Page Is For</h3>
                <p className="info-card-text">
                  The Hero Wall is here to celebrate kindness, spark ideas, and
                  remind us that small actions matter
                </p>
                <p className="info-card-text">
                  You might: Smile at a story, get an idea for your own<br/> kind act or feel proud to see kindness spreading
                </p>
              </InfoCard>

              {/* Card 5 */}
              <InfoCard
                backgroundColor="#ffffff"
                borderColor="rgb(199 255 251)"
              >
                <h3 className="info-card-title mg-secure">Security Concerns?</h3>
                <p className="info-card-text">
                  Do not worry. We keep <br/>your information safe<br/> and do not share<br/>
                  location or private details<br/> about our community
                </p>
              </InfoCard>

              {/* Card 6 - CTA */}
              <InfoCard
                backgroundColor="rgb(255 242 220)"
                borderColor="#ffffff"
              >
                <h3 className="info-card-title">Be Part of the Story</h3>
                <p className="info-card-text">
                  Your Kindness can <br/>become a ripple too
                </p>
                <Link to="/age-gate" className="info-card-cta-btn" style={{ backgroundImage: `url(${orangeBtn})` }}>
                  Start your Ripple <br />chain!
                </Link>
              </InfoCard>
            </div>
          </section>
        )}

        {/* --- RIPPLE HIGHLIGHTS TITLE --- */}
        {!user && (
          <section className="ripple-highlights-section fly2">
            {/* Character decoration - Right */}
            <div className="ripple-highlights-character-right hidden lg:block">
              <LazyImage
                src={firefliesLuma}
                alt="Character decoration"
                className="aa"
              />
            </div>

            <div className="ripple-highlights-title">
              <LazyImage
                src={rippleHighlightsTitle}
                alt="Ripple Highlights"
                className="max-w-3xl mx-auto ripple-highlights-title-img2"
              />
            </div>

            <p className="ripple-highlights-subtitle">
              A place where kindness shows up, spreads, and inspires others
            </p>
          </section>
        )}

        {/* --- MAIN FEATURED RIPPLE SLIDER --- */}
        <section className={`featured-ripple-section fly3 ${user ? 'withuser' : ''}`}>
          {loading && user ? (
            <CarouselSkeleton />
          ) : user && sliderStories.length > 0 ? (
            <Carousel className="w-full" opts={{ align: "start", loop: true }} >
              <CarouselContent>
                {sliderStories.map((story) => (
                  <CarouselItem key={story.id} className="basis-full">
                    <div
                      className="featured-ripple-card with-user cursor-pointer"
                      onClick={() => handleStoryClick(story)}
                    >
                      {/* Left Content */}
                      <div className="featured-ripple-content">
                        <div className="featured-ripple-header">
                          <div className="ripple-id-badge">
                            <span className="ripple-icon">
                              <img src={story.category?.icon ? getImageUrl(story.category.icon) : '/icons/heart.svg'} alt={story.category?.name} className="h-16" />
                            </span>
                          </div>
                          <div className="ripple-meta">
                            <p className="ripple-id-text">Ripple ID:</p>
                            <span className="ripple-id-number">
                              {/* {story.user.ripple_id || story.user.id} */}
                              {story.user.ripple_id}
                            </span>
                          </div>
                        </div>
                        <div className="featured-ripple-main">
                          <h3 className="featured-ripple-title">{story.title}</h3>

                          <p className="featured-ripple-description">
                            {truncateDescription(story.description, 30)}
                          </p>
                        </div>

                        {story.teacher_quote ? (
                          <p className="featured-ripple-tag">
                            {story.teacher_quote}

                          </p>
                        ): (
                              <p className="featured-ripple-tag">
                            {story.category?.name || 'kindness'}
                          </p>
                        )}
                      </div>

                      {/* Right Image */}
                      <div className="featured-ripple-image">
                        <span className="ripple-date">
                          {/* {story.created_at || "Recently"} */}
                          {story.created_at
                            ? new Date(story.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                            : "Recently"}

                        </span>
                        <LazyImage
                          src={getImageUrl(story.photo_path)}
                          alt={story.title}
                          className="w-full object-cover"
                          style={{ height: "400px" }}
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="carousel-control-prev absolute opacity-100 flex border-0 bg-transparent hover:bg-transparent">
                <LazyImage src={leftArrow} alt="Previous" />
              </CarouselPrevious>
              <CarouselNext className="carousel-control-next absolute opacity-100 flex border-0 bg-transparent hover:bg-transparent">
                <LazyImage src={rightArrow} alt="Next" />
              </CarouselNext>
            </Carousel>
          ) : user ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-lg">
                No featured stories available at the moment.
              </p>
            </div>
          ) : (
            <Carousel className="w-full" opts={{ align: "start", loop: true }} >
              <CarouselContent>
                <CarouselItem className="basis-full">
                  <div className="featured-ripple-card">
                    <div className="featured-ripple-content">
                      <div className="featured-ripple-header">
                        <div className="ripple-id-badge">
                          <LazyImage src={atHome} alt="" className="slider-icon-img" />
                        </div>
                        <div className="ripple-meta">
                          <p className="ripple-id-text">Ripple ID:</p>
                          <span className="ripple-id-number">123ABC</span>
                        </div>
                      </div>
                      <div className="featured-ripple-main">
                        <h3 className="featured-ripple-title">
                          Helped Ms. Johnson clean the art supplies
                        </h3>
                        <p className="featured-ripple-description">
                          We had fun in art class yesterday making cards for our
                          family. I saw the classroom was dirty and decided to
                          help the teacher and cleaning up the classroom with her
                          after class ended. She was really happy and
                          said thank you a lot. I was happy the rest of the day!
                        </p>
                      </div>
                      <p className="featured-ripple-tag">
                        This Ripple shows courage!
                      </p>
                    </div>
                    <div className="featured-ripple-image">
                      <span className="ripple-date">December, 20 2025</span>
                      <LazyImage
                        src={teacherImg}
                        alt="Helping teacher clean art supplies"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="basis-full">
                  <div className="featured-ripple-card">
                    <div className="featured-ripple-content">
                      <div className="featured-ripple-header">
                        <div className="ripple-id-badge">
                          <LazyImage src={atSchool} alt="" className="slider-icon-img" />
                        </div>
                        <div className="ripple-meta">
                          <p className="ripple-id-text">Ripple ID:</p>
                          <span className="ripple-id-number">456DEF</span>
                        </div>
                      </div>
                      <div className="featured-ripple-main">
                        <h3 className="featured-ripple-title">
                          Invited the new kid to play during recess
                        </h3>
                        <p className="featured-ripple-description">
                          There was a new student in our class and I noticed they
                          were sitting alone at recess. I went over and asked if
                          they wanted to play with me and my friends. They smiled
                          and we all played together. Now we're friends!
                        </p>
                      </div>
                      <p className="featured-ripple-tag">
                        This Ripple shows kindness!
                      </p>
                    </div>
                    <div className="featured-ripple-image">
                      <span className="ripple-date">December, 22 2025</span>
                      <LazyImage
                        src={playgroundImg}
                        alt="Playing with new friend"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="basis-full">
                  <div className="featured-ripple-card">
                    <div className="featured-ripple-content">
                      <div className="featured-ripple-header">
                        <div className="ripple-id-badge">
                          <LazyImage src={everyWhere} alt="" className="slider-icon-img" />
                        </div>
                        <div className="ripple-meta">
                          <p className="ripple-id-text">Ripple ID:</p>
                          <span className="ripple-id-number">789GHI</span>
                        </div>
                      </div>
                      <div className="featured-ripple-main">
                        <h3 className="featured-ripple-title">
                          Helped the environment by planting flowers
                        </h3>
                        <p className="featured-ripple-description">
                          My family and I planted flowers in our community garden.
                          We wanted to make our neighborhood more beautiful and
                          help the bees. Other neighbors saw us and joined in. Now
                          we have a beautiful garden that everyone enjoys!
                        </p>
                      </div>
                      <p className="featured-ripple-tag">
                        This Ripple shows care for nature!
                      </p>
                    </div>
                    <div className="featured-ripple-image">
                      <span className="ripple-date">December, 24 2025</span>
                      <LazyImage
                        src={plantasImg}
                        alt="Planting flowers"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="basis-full">
                  <div className="featured-ripple-card">
                    <div className="featured-ripple-content">
                      <div className="featured-ripple-header">
                        <div className="ripple-id-badge">
                          <LazyImage src={myClassRoom} alt="" className="slider-icon-img" />
                        </div>
                        <div className="ripple-meta">
                          <p className="ripple-id-text">Ripple ID:</p>
                          <span className="ripple-id-number">ABC123</span>
                        </div>
                      </div>
                      <div className="featured-ripple-main">
                        <h3 className="featured-ripple-title">
                          Shared a snack with my friend who forgot his
                        </h3>
                        <p className="featured-ripple-description">
                          At lunch, I noticed my friend didn't have a snack. I
                          remembered feeling sad when I forgot mine before. I
                          decided to share my apple and crackers with them. They
                          were so happy and we both enjoyed our lunch together!
                        </p>
                      </div>
                      <p className="featured-ripple-tag">
                        This Ripple shows sharing!
                      </p>
                    </div>
                    <div className="featured-ripple-image">
                      <span className="ripple-date">December, 28 2025</span>
                      <LazyImage
                        src={snackImg}
                        alt="Sharing snack with friend"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="basis-full">
                  <div className="featured-ripple-card">
                    <div className="featured-ripple-content">
                      <div className="featured-ripple-header">
                        <div className="ripple-id-badge">
                          <LazyImage src={challenges} alt="" className="slider-icon-img" />
                        </div>
                        <div className="ripple-meta">
                          <p className="ripple-id-text">Ripple ID:</p>
                          <span className="ripple-id-number">XYZ789</span>
                        </div>
                      </div>
                      <div className="featured-ripple-main">
                        <h3 className="featured-ripple-title">
                          Helped my grandma with her groceries
                        </h3>
                        <p className="featured-ripple-description">
                          I saw my grandma carrying heavy grocery bags. I ran over
                          and asked if I could help her carry them to her house.
                          She smiled and said yes. We walked together and she told
                          me stories. It made both of us happy!
                        </p>
                      </div>
                      <p className="featured-ripple-tag">
                        This Ripple shows helpfulness!
                      </p>
                    </div>
                    <div className="featured-ripple-image">
                      <span className="ripple-date">December, 05 2025</span>
                      <LazyImage
                        src={grandmaImg}
                        alt="Helping grandma"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="basis-full">
                  <div className="featured-ripple-card">
                    <div className="featured-ripple-content">
                      <div className="featured-ripple-header">
                        <div className="ripple-id-badge">
                          <LazyImage src={myCommunity} alt="" className="slider-icon-img" />
                        </div>
                        <div className="ripple-meta">
                          <p className="ripple-id-text">Ripple ID:</p>
                          <span className="ripple-id-number">DEF456</span>
                        </div>
                      </div>
                      <div className="featured-ripple-main">
                        <h3 className="featured-ripple-title">
                          Thanked the janitor for keeping our school clean
                        </h3>
                        <p className="featured-ripple-description">
                          Every day, our janitor makes our school beautiful and
                          clean. I wanted to say thank you, so I made them a thank
                          you card and gave it to them. They were so surprised and
                          happy. It felt great to make someone's day!
                        </p>
                      </div>
                      <p className="featured-ripple-tag">
                        This Ripple shows gratitude!
                      </p>
                    </div>
                    <div className="featured-ripple-image">
                      <span className="ripple-date">December, 10 2025</span>
                      <LazyImage
                        src={janitorImg}
                        alt="Thanking janitor"
                        className="w-full h-full object-contain"
                      />
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
          )}
        </section>

        {/* --- EXPLORE MORE GRID --- */}
        <section className="explore-more-section fly4 withuser">
          <h3 className="explore-more-title ">
            Explore More Ripples That Moved Us
          </h3>

          <div className="explore-more-grid">
            {loading && user ? (
              <>
                <FlipCardSkeleton />
                <FlipCardSkeleton />
                <FlipCardSkeleton />
              </>
            ) : user && regularStories.length > 0
              ? regularStories.slice(0, 3).map((story) => (
                <FlipCard
                  key={story.id}
                  id={story.id.toString()}
                  title={story.title}
                  stat={story.stat || 'Ripple chain reached 10 acts!'}
                  description={story.description}
                  image={getImageUrl(story.photo_path)}
                  // date={story.performed_at_formatted || "Recently"}
                  date={story.created_at
                    ? new Date(story.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "Recently"}
                  rippleId={story.user.ripple_id || story.user.id.toString()}
                  category={story.category?.name || "At School"}
                  onNavigate={() => handleStoryClick(story)}
                />
              ))
              : RIPPLE_CARDS.slice(0, user ? 3 : RIPPLE_CARDS.length).map(
                (card) => (
                  <FlipCard
                    key={card.id}
                    id={card.id}
                    title={card.title}
                    stat={card.stat || 'Ripple chain reached 10 acts!'}
                    description={card.description}
                    image={card.image}
                    date={card.date}
                    rippleId={card.rippleId}
                    category={card.category}
                  />
                )
              )}
          </div>
        </section>

        {/* --- RIPPLE HIGHLIGHTS TITLE --- */}
        {user && (
          <section className="ripple-highlights-section ripple-highlights-section-with-user">
            {/* Character decoration - Right */}
            <div className="ripple-highlights-character-right hidden lg:block">
              <LazyImage
                src={firefliesLuma}
                alt="Character decoration"
                className="w-full"
              />
            </div>

            <div className="ripple-highlights-title">
              <LazyImage
                src={rippleHighlightsTitle}
                alt="Ripple Highlights"
                className="w-full max-w-3xl mx-auto"
              />
            </div>

            <p className="ripple-highlights-subtitle">
              A place where kindness shows up, spreads, and inspires others
            </p>
          </section>
        )}

        {user && (
          <>
            {/* --- Ripple In Motion --- */}
            <section className="explore-more-section ripple-in-motion-section withuser margin-top-0">
              <div className="explore-more-header" style={{ textAlign: "center" }}>
                <button
                  className="btn-ripple-hero"
                  type="button"
                  onClick={handleShuffleStories}
                  disabled={shuffleLoading || loading}
                  style={{ margin: "auto" }}
                >
                  <p
                    className=""
                    style={{ backgroundImage: `url(${greenBtn})` }}
                  >
                    {shuffleLoading ? "Shuffling..." : "Shuffle Stories"}
                  </p>
                </button>
              </div>
              <div className="explore-more-grid">
                {(loading || shuffleLoading) ? (
                  <>
                    <FlipCardSkeleton />
                    <FlipCardSkeleton />
                    <FlipCardSkeleton />
                  </>
                ) : rippleInMotionStories.length > 0
                  ? rippleInMotionStories.map((story) => (
                    <FlipCard
                      key={story.id}
                      id={story.id.toString()}
                      title={story.title}
                      stat={truncateDescription(story.description, 10) || "Kindness Story"}
                      description={story.description}
                      image={getImageUrl(story.photo_path)}
                      date={story.performed_at_formatted || "Recently"}
                      rippleId={story.user.ripple_id || story.user.id.toString()}
                      category={story.category?.name || "At School"}
                      categoryIcon={story.category?.icon || null}
                      categoryName={story.category?.name || "At School"}
                      onNavigate={() => handleStoryClick(story)}
                    />
                  ))
                  : RIPPLE_CARDS.slice(0, 3).map((card) => (
                    <FlipCard
                      key={card.id}
                      id={card.id}
                      title={card.title}
                      stat={card.stat}
                      description={card.description}
                      image={card.image}
                      date={card.date}
                      rippleId={card.rippleId}
                      category={card.category}
                    />
                  ))}
              </div>
            </section>
          </>
        )}


        {/* --- CALL TO ACTION SECTION --- */}
        {!user && (
          <section className="cta-section section-with-user fly5" >
            {/* Right Side - CTA Buttons (50%) */}
            <div className="sign-wrapper2 challange">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="sign-img">
                  <LazyImage
                    src={signUpFooter}
                    alt="Sign up"
                    className="w-full"
                  />
                  <p>Share your kindness story and inspire others!</p>
                </div>
                <div className="btn-ripple-wrap">
                  <Link to="/age-gate" className="btn-ripple-hero btn-sgn1">
                    <p
                      className="first"
                      style={{ backgroundImage: `url(${blueBtn})` }}
                    >
                      Ready to Start Rippling?
                    </p>
                  </Link>
                  <Link to="/resources" className="btn-ripple-hero btn-sgn2">
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
        )}

        {user && (
          <section className="cta-section">
            <div className="cta-wrapper">
              <div>
                <div className="cta-img">
                  <LazyImage
                    src={startRippleFooter}
                    alt="create ripple"
                    className="w-full"
                  />
                  <p className="cta-f-p ripple-card-stat">Share your kindness story and inspire others!</p>
                  <Link to="/post-story" className="btn-ripple-hero">
                    <p
                      className=""
                      style={{ backgroundImage: `url(${greenBtn})` }}
                    >
                      Create a Ripple
                    </p>
                  </Link>
                </div>

              </div>
            </div>
          </section>)}

      </section>
    </>
  );
};

export default HeroWallPublic;
