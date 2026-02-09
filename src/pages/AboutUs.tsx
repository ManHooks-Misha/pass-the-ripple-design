import React from 'react';
import Seo from '@/components/Seo';
import '@/styles/pages/_about-us.scss';

// Import rope
import ropeImg from "@/assets/About Us/rope.png";

// Import heading images
import aboutUsTitle from "@/assets/About Us/about us.png";
import ourStoryTitle from "@/assets/About Us/our-story.png";
import whoWeAreTitle from "@/assets/About Us/who-we-are-what-we-do.png";
import whyMatteringTitle from "@/assets/About Us/why-mattering-matter.png";
import ourValuesTitle from "@/assets/About Us/our-values.png";
import missionTitle from "@/assets/About Us/mission.png";
import visionTitle from "@/assets/About Us/vision.png";

const AboutUs = () => {
  return (
    <main className="about-us-container">
      <Seo
        title="About Us | Pass The Ripple"
        description="Learn more about Pass The Ripple and our mission to spread kindness worldwide."
        canonical={`${window.location.origin}/about-us`}
      />

      <div className='about-us-wrapper'>
        {/* Left side - Rope only - starts from top */}
        <div className="rope-section">
          <img src={ropeImg} alt="Rope" className="rope-line" />
        </div>

        {/* Right side - Content */}
        <div className="content-area">

          {/* Title Section */}
          <div className="about-us-title">
            <img src={aboutUsTitle} alt="About Us" />
            <p className="about-us-subtitle">
              Pass the Ripple invites children, families, and educators to be part of something bigger,
              where kindness is practiced, mattering is felt, and ripples continue to spread.
            </p>
          </div>

          {/* Our Story Section */}
          <section>
            <img src={ourStoryTitle} alt="Our Story" className='title-img' />
            <div className="section-text">
              <p>
                Pass the Ripple began with a simple but powerful question
What if every child grew up knowing they matter and could see the impact they
have on others?
              </p>
              <p>
                That question became the heart of the book You Matter, Luma. Through Luma's story
children are invited to understand something essential: that being seen, valued, and
included can change everything.
              </p>
              <p>
                But stories are only the beginning.
              </p>
              <p>
                Pass the Ripple was created as the living extension of that message, bringing the lessons
of the book into everyday life. It transforms kindness from a concept into action, helping
children practice empathy, care, and courage in real moments with real people.
              </p>
              <p>
                At its core, Pass the Ripple is rooted in a clear belief:
              <br/>
When children feel they matter, they act differently, and when they see their impact,
they begin to lead.
              </p>
            </div>
          </section>

          {/* Who We Are and What We Do Section */}
          <section>
            <img src={whoWeAreTitle} alt="Who We Are and What We Do" className='title-img' />
            <div className="section-text">
              <p>
                Pass the Ripple is a children's kindness and social emotional learning platform designed
to help kids build empathy through action.
              </p>
              <p>
                We offer guided Ripple Challenges, which are simple, age appropriate prompts that
encourage children to take small actions that help others feel seen and valued. These
actions happen offline in real life and are supported by reflection, recognition, and
encouragement in a safe, adult led digital environment.
              </p>
              <p>
                Pass the Ripple is also part of the MatteringVerse, a growing ecosystem of stories, tools,
and experiences designed to help children understand that they matter and that their
actions make a difference.
              </p>
              <p >
              We are not a game.<br/>
We are not a social network.<br/>
We are a movement grounded in kindness, mattering, and meaningful growth.
              </p>
            </div>
          </section>

          {/* Why Mattering Matters Section */}
          <section>
            <img src={whyMatteringTitle} alt="Why Mattering Matters" className='title-img' />
            <div className="section-text">
              <p>
                When children do not feel seen, they withdraw.<br />
                When they do not feel valued, they disconnect.<br />
                And when they do not believe they matter, they stop trying to make a difference.
              </p>
              <p >
                Mattering is the foundation of empathy, confidence, and belonging.
              </p>
              <p>
                Pass the Ripple helps children experience mattering firsthand, not by being told they
                matter, but by showing them. When a child completes a ripple and sees how their
                action affected someone else, they begin to understand a powerful truth:
              </p>
              <p >
                I matter, and what I do matters too.
              </p>
              <p >
                That understanding changes how children show up in classrooms, families, and
                communities.
              </p>
            </div>
          </section>

          {/* Our Values Section */}
          <section>
            <img src={ourValuesTitle} alt="Our Values" className='title-img' />
            <div className="values-grid">
              <div className="value-item">
                <h3 className="value-title">Mattering First</h3>
                <p className="value-description">
                  Every child deserves to feel seen, valued, and important.
                </p>
              </div>

              <div className="value-item">
                <h3 className="value-title">Small Actions, Real Impact</h3>
                <p className="value-description">
                  Kindness does not have to be big to be meaningful.
                </p>
              </div>

              <div className="value-item">
                <h3 className="value-title">Practice and Reflection</h3>
                <p className="value-description">
                  Growth happens through trying, reflecting, and trying again.
                </p>
              </div>

              <div className="value-item">
                <h3 className="value-title">Guided, Not Gamified</h3>
                <p className="value-description">
                  Recognition supports growth without pressure or competition.
                </p>
              </div>

              <div className="value-item">
                <h3 className="value-title">Safe by Design</h3>
                <p className="value-description">
                  Children learn best in spaces that are protected, trusted, and adult-led.
                </p>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section>
            <img src={missionTitle} alt="Mission" className='title-img' />
            <div className="section-text">
              <p>
                To help children feel that they matter and to empower them to create positive impact
                through everyday acts of kindness.
              </p>
            </div>
          </section>

          {/* Vision Section */}
          <section>
            <img src={visionTitle} alt="Vision" className='title-img' />
            <div className="section-text">
              <p>
                A world where children grow up believing in their worth, recognizing the value of others,
                and confidently passing kindness forward one ripple at a time.
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
};

export default AboutUs;
