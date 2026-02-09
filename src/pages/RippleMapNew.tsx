import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import {
  Globe,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Heart,
  Users,
  Star,
} from "lucide-react";
import waterPencilTexture from "@/assets/water-pencil-texture.png";
import yellowbg from "@/assets/kindness-map/yellow-bg.png";
import sky1 from "@/assets/kindness-map/sky2.png";
import steps from "@/assets/kindness-map/steps.png";
import topmap from "@/assets/kindness-map/Top Map.png";
import kindnesstitles from "@/assets/kindness-map/kindness-titles.png";
import redCIlutEUc2 from "@/assets/kindness-map/red-CIlutEUc2.png";
import chainexample from "@/assets/kindness-map/chain example.png";
import greenCIlutEUc2 from "@/assets/kindness-map/green-CIlutEUc2.png";
import purpleDLiGO25m2 from "@/assets/kindness-map/purple-DLiGO25m2.png";
import purpleDLiGO25m4 from "@/assets/kindness-map/purple-DLiGO25m4.png";
import redCIlutEUc4 from "@/assets/kindness-map/red-CIlutEUc4.png";
import privacycomparison from "@/assets/kindness-map/privacy-comparison.png";
import KindnessMap from "@/assets/kindness-map/Kindness Map.png";

import WaterPencilTitle from "@/components/ui/WaterPencilTitle";
import WaterPencilButton from "@/components/ui/WaterPencilButton";
import WaterPencilCard from "@/components/ui/WaterPencilCard";
import FootprintPath from "@/components/ui/FootprintPath";
import "@/styles/pages/_kindness-map.scss";
import WorldMapZoom from "@/components/WorldMapZoom";
const RippleMapNew = () => {
  return (
    <main className="min-h-screen font-teachers overflow-x-hidden bg-gradient-to-b from-[#F0F4FF] to-[#E6F4F1] relative">
      {/* Global Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0 mix-blend-multiply"
        style={{ backgroundImage: `url(${waterPencilTexture})`, backgroundSize: 'cover' }}
      />

      <Seo
        title="Kindness Map — Pass The Ripple"
        description="Watch your kindness travel! See how ripples spread connection around the world safely."
        canonical={`${window.location.origin}/kindness-map`}
      />

      {/* ================= SECTION 2: HOW IT WORKS ================= */}
      <section className="hero mt-50">
        <div className="container1">
          {/* Title image */}
          <img
            className="hero-title-img"
            src={kindnesstitles}
            alt="The Kindness Map Title"
          />

          <div className="hero-subtitle">Watch Your Ripples Travel the World</div>

          <div className="hero-desc mt-20">
            A2 world connected by heart — where every act of kindness travels far.
          </div>

          <div className="hero-grid w">
            {/* Left big illustration */}
            <div className="card1">
              <img src={topmap} alt="Kindness world illustration" />
            </div>


            {/* Right info cards */}
             <div className="tab">
              <div className="note yellow"  style={{ backgroundImage: `url(${yellowbg})` }}>
                <div>
                  <p className="para-font">
                    Watch your acts of kindness travel across the world, creating magical
                    connections from classroom to classroom, school to school, and heart
                    to heart.
                  </p>
                  <p className="para-font">
                    Every ripple you pass lights up the map — showing how small acts
                    create big belonging.
                  </p>
                </div>
              </div>

              <div className="note green" style={{ backgroundImage: `url(${sky1})` }}>
                <div>
                  <h3>The Kindness Map:</h3>
                  <ul>
                    <li>- Help kids see that kindness travels</li>
                    <li>
                      - Turn abstract “impact” into a concrete, emotional experience
                    </li>
                    <li>- Small actions matter</li>
                    <li>- Connect individual stories to a global movement</li>
                  </ul>
                </div>
              </div>
            </div> 
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
       <section className="section">
        <div className="container1">
          <h2>How Your Kindness Ripple Travels the World</h2>

          <div className="how-grid">
            <div className="soft-block pink" style={{ backgroundImage: `url(${redCIlutEUc2})` }}>
              <div>
                <p className="para-font mb-20">
                  Every time a child starts a ripple by doing something kind, that action
                  can travel farther than expected.
                </p>
                <p className="para-font mb-20">
                  The Kindness Map shows how kindness connects people and communities,
                  and how one small act can grow into something bigger.
                </p>

                <p className="para-font">
                  This map is personal and private. It focuses on impact and connection,
                  not identities or exact locations. It shows the journey of kindness.
                </p>
              </div>
            </div>

            <div className="img-frame">
              <img src={steps} alt="How the ripple map works" />
            </div>

            <div className="img-frame">
              <img src={chainexample} alt="Kindness chain example" />
            </div>

            <div className="soft-block mint" style={{ backgroundImage: `url(${greenCIlutEUc2})` }}>
              <div>
                <h3>1. A Ripple Begins</h3>
                <p className="para-font">
                  When a child completes a kind act and adds it to Pass the Ripple, they
                  begin a Ripple Chain.
                </p>

                <div style={{ height: 10 }} />

                <h3>2. Kindness Grows</h3>
                <p className="para-font">
                When someone, inspired by the kind act, logs their own ripple, kindness is passed forward and that is reflected 
                on the first child’s personal Kindness Map.
                 This helps children understand that their actions matter and can influence others in meaningful ways.
                </p>
              </div>
            </div>

            <div className="soft-block lav" style={{ backgroundImage: `url(${purpleDLiGO25m2})` }}>
              <div>
                <h3>3. Exploring Impact</h3>
                <p className="para-font">Children can explore:</p>
                <ul className="mb-20">
                  <li>- One ripple at a time</li>
                  <li>- See how all of their ripples connect</li>
                </ul>
                <p className="para-font mt-20">This encourages reflection, curiosity,<br /> and a sense of purpose over time.</p>
              </div>
            </div>

            <div className="soft-block sand" style={{ backgroundImage: `url(${purpleDLiGO25m4})` }}>
             <div>
                <h3>3. Exploring Impact</h3>
                <p className="para-font">The Kindness Map helps children see that:</p>
                <ul className="mb-20">
                  <li>- Small actions can create meaningful change</li>
                  <li>- Kindness connects people</li>  
                     <li>- Their choices have value</li>
                </ul>
                <p className="para-font mt-20">It supports social-emotional growth through experience, not comparison.</p>
              </div>
            </div>
          </div>
        </div>
      </section> 

      {/* PRIVACY */}
<section className="section">
        <div className="container1">
          <div className="privacy-grid">
            <div className="soft-block pink2" style={{ backgroundImage: `url(${redCIlutEUc4})` }}>
              <div className="kindness-privacy-box">
                <h3 className="mb-20">5. Built with Care, Safety, and Privacy in Mind</h3>

                <p className="para-font mb-0 mt-10">
                  To protect children and families, the Kindness Map never displays:
                </p>

                <ul>
                  <li>- Names of children, parents, teachers, or schools</li>
                  <li>- Exact addresses, cities, or locations</li>
                  <li>- Real-time location data</li>
                  <li>- Personal profiles or contact information</li>
                </ul>

                <p className="para-font mt-20 mb-0">
                  All ripple connections are shown anonymously and at a high level.
                </p>

                <p className="para-font mb-20">
                  Photos are never required. If photo sharing is enabled:
                </p>

                <ul>
                  <li>- It is strictly optional</li>
                  <li>- Photos are not shown on the map itself</li>
                  <li>- Families remain in control of what is shared</li>
                </ul>
              </div>
            </div>

            <div className="do-dont">
              <img src={privacycomparison} alt="Privacy comparison" />
            </div>
          </div>

          <div className="bg-gray mb-40">
            <p className="para-font">
              We are committed to creating a space where children can explore kindness
              safely, thoughtfully, and responsibly. If you have questions about privacy
              or safety, we encourage families and educators to review our policies or
              contact us directly.
            </p>
          </div>
        </div>
      </section> 

      {/* MY KINDNESS MAP */}
     <section className="section">
        <div className="container1">
          <img
            className="hero-title-img2"
            src={kindnesstitles}
            alt="The Kindness Map Title"
          />

          <div className="hero-desc" style={{ marginTop: -4 }}>
            <p className="para-font">Every ripple you start can travel farther than you imagine. <br />This map shows
            how your kindness has grown and connected across the world.</p>
            
          </div>

          <div className="filter-row">
            <span style={{ fontWeight: 900, fontSize: 13, color: "rgba(0,0,0,.7)" }}>
              Filter by:
            </span>

            <select className="select" aria-label="Filter Mode" defaultValue="All my Ripples">
              <option>All my Ripples</option>
              <option>Individual Ripples</option>
            </select>

            <select className="select" aria-label="Time Range" defaultValue="All time">
              <option>All time</option>
              <option>This month</option>
              <option>This week</option>
            </select>
          </div>

          <div className="card map-wrap">
          {/*   <div className="map-caption">
              Viewing: “Helped Mrs. Rose give food to the homeless”
            </div> */}
            <img src={KindnessMap} alt="Kindness Map" />
          </div>
          <div className="card map-wrap">
            <WorldMapZoom/>
          </div>

    
        </div>
      </section>
    </main>
  );
};

export default RippleMapNew;
