import { useEffect } from "react";
import "@/styles/pages/_badges.scss";
import  badgesbackgroundm from '@/assets/badges/badges-backgroundm.png'; 
import  badge2  from '@/assets/badges/1.png';
import badge1 from '@/assets/badges/2.png';
import badgetBoard from '@/assets/badges/badget-board.png';
import leftArrow from '@/assets/badges/arrows-left.png';
import rightArrow from '@/assets/badges/arrows-right.png';
import badgebox from '@/assets/badges/badge-box.png';
import button from '@/assets/badges/button2.png';
import orangeBtn from "@/assets/home-img/orange.png";
const BadgesPage = () => {

  useEffect(() => {
    new Swiper(".bannerSlider", {
      slidesPerView: 4,
      spaceBetween: 30,
      loop: true,
      navigation: {
        prevEl: ".slider1-prev",
        nextEl: ".slider1-next",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        576: { slidesPerView: 2 },
        992: { slidesPerView: 4 },
      },
    });

    new Swiper(".bannerSlider1", {
      slidesPerView: 4,
      spaceBetween: 30,
      loop: true,
      navigation: {
        prevEl: ".slider2-prev",
        nextEl: ".slider2-next",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        576: { slidesPerView: 2 },
        992: { slidesPerView: 4 },
      },
    });
  }, []);

  return (
    <>
    <div className="badgesbackgroundm" style={{ backgroundImage: `url(${badgesbackgroundm})`, backgroundSize: 'cover', backgroundPosition: 'bottom' }}>
      {/* ===== SLIDER 1 TITLE ===== */}
      <div className="badges-container" >
      <div className="slider-wrapper text-center">
        <div className="slider-wrapper2">
          <img src={badgetBoard} className="slider-img" alt="" />
          <div className="badge-text">Tier 1 Badges</div>
        </div>
      </div>

      {/* ===== SLIDER 1 ===== */}
      <div className="slider-wrapper mb-5">
        <div className="custom-prev slider1-prev">
          <img src={leftArrow} alt="Prev" />
        </div>

        <div className="custom-next slider1-next">
          <img src={rightArrow} alt="Next" />
        </div>

        <div className="swiper bannerSlider">
          <div className="swiper-wrapper">
            {[1,2,1,2,1,2,1,2].map((img, i) => (
              <div className="swiper-slide" key={i}>
                {/* <img src={`/${badge1}.png`} alt="" /> */}
                <img src={i === 1 ? badge1 : badge2}  alt="badge" />
                <div className="ticker">
                  <span className="led">SAVE ENVIRONMENT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SLIDER 2 TITLE ===== */}
      <div className="slider-wrapper text-center">
        <div className="slider-wrapper2">
          <img src={badgetBoard} className="slider-img" alt="" />
          <div className="badge-text">Tier 2 Badges</div>
        </div>
      </div>

      {/* ===== SLIDER 2 ===== */}
      <div className="slider-wrapper mb-5">
        <div className="custom-prev slider1-prev">
          <img src={leftArrow} alt="Prev" />
        </div>

        <div className="custom-next slider1-next">
          <img src={rightArrow} alt="Next" />
        </div>

         <div className="swiper bannerSlider1">
          <div className="swiper-wrapper">
            {[1,2,1,2,1,2,1,2].map((img, i) => (
              <div className="swiper-slide" key={i}>
                {/* <img src={`/${badge1}.png`} alt="" /> */}
                <img src={i === 1 ? badge1 : badge2}  alt="badge" />
                <div className="ticker">
                  <span className="led">SAVE ENVIRONMENT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BOTTOM SECTION ===== */}
      <div className="slider-wrapper text-center mt-5">
      <div className="screen">
        <div className="paper">
          <h2>Return to My Challenges page</h2>
            <div className="position-relative">
               <a href="/challenges"><img src={orangeBtn} alt="" />     <span className="btntext">Close my Badges Treasure Chest</span></a>
 
            </div>
     
        </div>

        <div className="art1">
          <img src={badgebox} alt="" />
        </div>
      </div>
      </div>
        </div>
        </div>
    </>
  );
};

export default BadgesPage;
