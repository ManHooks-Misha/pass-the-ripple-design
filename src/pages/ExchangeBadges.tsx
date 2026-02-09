import { useEffect } from "react";
import "@/styles/pages/_exchange-badges.scss";

import waterPencilTexture from "@/assets/water-pencil-texture.png";
 import leftArrow from '@/assets/badges/arrows-left.png';
 import rightArrow from '@/assets/badges/arrows-right.png';
 import kindnessCard from '@/assets/badges/card2.png';
 import starKindness from '@/assets/badges/star.png';
 import blankPaper from '@/assets/badges/card4.png';
 import  bluebutton  from '@/assets/badges/bluebutton.png'; 
 import  yellowbutton  from '@/assets/badges/yellowbutton.png'; 
 import  badgesbackground2 from '@/assets/badges/badges-background4.png'; 
import  badgesbackground5 from '@/assets/badges/badges-background5.png'; 
import  badgesbackgroundm from '@/assets/badges/badges-backgroundm.png'; 
    import  happy from '@/assets/badges/happy.png'; 
 import  orangeBtn from '@/assets/badges/orange-btn.png';
 import badgebox from '@/assets/badges/badge-box.png';
  import afterlogin from '@/assets/badges/after-login-footer.png';
import  box1  from '@/assets/badges/box11.png';
import  nobadges  from '@/assets/badges/nobadges.png';
import  box  from '@/assets/badges/box.png';
import  boox6  from '@/assets/badges/box6.png';
import  badgebg  from '@/assets/badges/badge-bg.webp';
import  greenbtn  from '@/assets/badges/btn-green-bg.png';
import  billboard  from '@/assets/badges/bill-board.png';
import  sadbooth  from '@/assets/badges/sadbooth.png';
const ExchangeBadges = () => {

  useEffect(() => {
    new Swiper(".bannerSlider2", {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      delay: 4000,
      speed: 800,
      navigation: {
        prevEl: ".slider2-prev",
        nextEl: ".slider2-next",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        576: { slidesPerView: 1 },
        992: { slidesPerView: 1 },
        1024: { slidesPerView: 1 },
      },
    });

    new Swiper(".bannerSlider1", {
      slidesPerView: 1,
      spaceBetween: 10,
      delay: 4000,
      speed: 800,
      loop: true,
      navigation: {
        prevEl: ".slider1-prev",
        nextEl: ".slider1-next",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        992: { slidesPerView: 1 },
        1024: { slidesPerView: 1 },
      },
    });

    new Swiper(".bannerSlider3", {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      delay: 4000,
      speed: 800,
      navigation: {
        prevEl: ".slider3-prev",
        nextEl: ".slider3-next",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        576: { slidesPerView: 1 },
        992: { slidesPerView: 1 },
        1024: { slidesPerView: 1 },
      },
    });

    new Swiper(".bannerSlider4", {
      slidesPerView: 1,
      spaceBetween: 10,
      delay: 4000,
      speed: 800,
      loop: true,
      navigation: {
        prevEl: ".slider4-prev",
        nextEl: ".slider4-next",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        576: { slidesPerView: 1 },
       992: { slidesPerView: 1 },
        1024: { slidesPerView: 1 },
      },
    });

    new Swiper(".bannerSlider5", {
      slidesPerView: 1,
      spaceBetween: 10,
      delay: 4000,
      speed: 800,
      loop: true,
      navigation: {
        prevEl: ".slider5-prev",
        nextEl: ".slider5-next",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        576: { slidesPerView: 1 },
       992: { slidesPerView: 1 },
        1024: { slidesPerView: 1 },
      },
    });

      new Swiper(".bannerSlider6", {
      slidesPerView: 1,
      spaceBetween: 10,
      delay: 4000,
      speed: 800,
      loop: true,
      navigation: {
        prevEl: ".slider6-prev",
        nextEl: ".slider6-next",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        576: { slidesPerView: 1 },
        992: { slidesPerView: 1 },
      },
    });
  }, []);

  return (
    <>
  <div className="badgesbackgroundm" style={{ backgroundImage: `url(${badgesbackgroundm})`, backgroundSize: 'cover', backgroundPosition: 'bottom' }}>
    <div className="container">
      <div className="bg-slider-wrapper">
        <img src={happy} className="slider_img w-100" alt="" />
      </div>
    </div>
    <div className="container">
      <div className="badges-container mt_5 position-relative2 first" style={{ backgroundImage: `url(${box1})` }}>
        <div className="blue-button" style={{ backgroundImage: `url(${bluebutton})` }}>CARDS</div>
        <div className="sliderwidth">
          <div className="slider-wrapper mb-5 p-50">
            <div className="custom-prev slider1-prev">
              <img src={leftArrow} alt="Prev" />
            </div>
            <div className="custom-next slider1-next">
              <img src={rightArrow} alt="Next" />
            </div>
            <div className="swiper bannerSlider1">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="badges-container mt_10 position-relative2" style={{ backgroundImage: `url(${box})` }}>
        <div className="blue-button" style={{ backgroundImage: `url(${bluebutton})` }}>TIER 2</div>
        <div className="sliderwidth">
          <div className="slider-wrapper mb-5 p-50">
            <div className="custom-prev slider3-prev">
              <img src={leftArrow} alt="Prev" />
            </div>
            <div className="custom-next slider3-next">
              <img src={rightArrow} alt="Next" />
            </div>
            <div className="swiper bannerSlider3">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="badges-container mt_10 position-relative2" style={{ backgroundImage: `url(${box})` }}>
        <div className="blue-button" style={{ backgroundImage: `url(${bluebutton})` }}>TIER 3</div>
        <div className="sliderwidth">
          <div className="slider-wrapper mb-5 p-50">
            <div className="custom-prev slider4-prev">
              <img src={leftArrow} alt="Prev" />
            </div>
            <div className="custom-next slider4-next">
              <img src={rightArrow} alt="Next" />
            </div>
            <div className="swiper bannerSlider4">
             <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="badges-container mt_10 position-relative2" style={{ backgroundImage: `url(${box})` }}>
        <div className="blue-button" style={{ backgroundImage: `url(${bluebutton})` }}>TIER 4</div>
        <div className="sliderwidth">
          <div className="slider-wrapper mb-5 p-50">
            <div className="custom-prev slider5-prev">
              <img src={leftArrow} alt="Prev" />
            </div>
            <div className="custom-next slider5-next">
              <img src={rightArrow} alt="Next" />
            </div>
            <div className="swiper bannerSlider5">
             <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="badges-container mt_10 position-relative2 last" style={{ backgroundImage: `url(${boox6})` }}>
        <div className="blue-button" style={{ backgroundImage: `url(${bluebutton})` }}>ULTIMATE</div>
        <div className="sliderwidth">
          <div className="slider-wrapper mb-5 p-50">
            <div className="custom-prev slider6-prev">
              <img src={leftArrow} alt="Prev" />
            </div>
            <div className="custom-next slider6-next">
              <img src={rightArrow} alt="Next" />
            </div>
            <div className="swiper bannerSlider6">
               <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="exchange-wrap">
                    <div className="card">
                      <img src={kindnessCard} alt="badge" className="badge-img" />
                    </div>
                    <div className="scroll-box" style={{ backgroundImage: `url(${blankPaper})` }}> {/* <img src={blankPaper} alt="Card" /> */} <div className="ticker">
                        <span className="led"> DO YOU WANT TO EXCHANGE __ CARDS FOR __ BADGES? </span>
                        <a href="">
                          <div className="yellow-button" style={{ backgroundImage: `url(${yellowbutton})` }}>YES</div>
                        </a>
                      </div>
                    </div>
                    <div className="card star">
                      <img src={starKindness} alt="Card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="badgesbackground" style={{ backgroundImage: `url(${badgesbackground2})`, backgroundSize: 'cover' }}>
    <div className="container">
      <div className="width-80 text-center pt-20 mx-auto">
        <img src={nobadges} alt="" />
      </div>
      <div className="bg-transparent" style={{ backgroundImage: `url(${afterlogin})`, backgroundSize: 'contain' }}>
        <div className="paper">
          <p className="cta-subtitle">Be part of kindness chain today</p>
          <div className="position-relative text-center">
            <a href="/challenges">
              <img src={greenbtn} alt="" />
              <span className="btntext">Start now!</span>
            </a>
          </div>
        </div>
      </div>
      <div className="slider-wrapper text-center mt-4">
        <div className="screen">
          <div className="paper">
            <h2>Return to My Challenges page</h2>
            <div className="position-relative">
              <a href="/challenges">
                <img src={orangeBtn} alt="" />
                <span className="btntext">Close my Badges Treasure Chest</span>
              </a>
            </div>
          </div>
          <div className="art1">
            <img src={badgebox} alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="badgesbackground2" style={{ backgroundImage: `url(${badgesbackground5})`, backgroundSize: 'cover' }}>
    <section className="section pt-0">
      <div className="container p-5">
        <div className="how-grid">
          <div className="soft-block pink2" style={{ backgroundImage: `url(${billboard})` }}>
            <div className="kindness-privacy-box">
              <h3 className="mb-4">Complete Challenges to collect cards and start swapping to get your Ultimate Badges!</h3>
              <div className="position-relative">
                <a href="/challenges">
                  <img src={orangeBtn} alt="" />
                  <span className="btntext">Join a Challenge</span>
                </a>
              </div>
            </div>
          </div>
          <div className="do-dont pt-4">
            <img src={sadbooth} alt="Privacy comparison" />
          </div>
        </div>
      </div>
    </section>
  </div>
  
  

    </>
  );
};

export default ExchangeBadges;
