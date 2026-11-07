import { useEffect, useState } from "react";

import {
  API_BASE_URL,
  SERVER_BASE_URL,
} from "../../config/api";

import "./Hero.css";

function Hero() {
  const [heroVideo, setHeroVideo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchHeroVideo() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/hero/active`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load hero video"
          );
        }

        if (isMounted && data.hero?.video) {
          const videoPath = data.hero.video;

          const videoUrl = videoPath.startsWith("http")
            ? videoPath
            : `${SERVER_BASE_URL}${videoPath}`;

          setHeroVideo(videoUrl);
        }
      } catch (error) {
        console.error(
          "HERO VIDEO LOAD ERROR:",
          error
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHeroVideo();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="hero" id="home">

      {/* =========================================
          HERO VIDEO
      ========================================== */}

      {heroVideo && (
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source
            src={heroVideo}
            type="video/mp4"
          />

          Your browser does not support HTML5 video.
        </video>
      )}


      {/* =========================================
          FALLBACK BACKGROUND
      ========================================== */}

      {!heroVideo && !loading && (
        <div className="hero-fallback" />
      )}


      {/* =========================================
          DARK OVERLAY
      ========================================== */}

      <div className="hero-overlay" />


      {/* =========================================
          BOTTOM FADE
      ========================================== */}

      <div className="hero-bottom-fade" />


      {/* =========================================
          HERO CONTENT
      ========================================== */}

      <div className="hero-content">

        <p className="hero-kicker">
          Luxury Jewellery Since 2022
        </p>

        <h1>
          Jewellery that{" "}
          <em>becomes</em>{" "}
          your story.
        </h1>

        <p className="hero-description">
          Discover Gold, Diamond and Polki creations
          thoughtfully crafted for life's most
          meaningful moments and the generations
          that follow.
        </p>


        {/* =====================================
            HERO ACTIONS
        ====================================== */}

        <div className="hero-actions">

          <a
            href="#collections"
            className="hero-button hero-button-primary"
          >
            Explore Collections

            <span className="hero-button-arrow">
              →
            </span>
          </a>


          <a
            href="/about"
            className="hero-button hero-button-secondary"
          >
            Discover Our Story

            <span className="hero-button-arrow">
              →
            </span>
          </a>

        </div>

      </div>


      {/* =========================================
          SCROLL INDICATOR
      ========================================== */}

      <div className="hero-scroll">

        <span className="hero-scroll-line" />

        <span className="hero-scroll-text">
          Scroll
        </span>

      </div>

    </section>
  );
}

export default Hero;