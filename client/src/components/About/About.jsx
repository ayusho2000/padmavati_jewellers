import "./About.css";

function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-container">

        {/* IMAGE */}
        <div className="about-image-wrapper">
          <img
            src="/images/about.jpg"
            alt="Padmavati Jewellers"
            className="about-image"
          />
        </div>

        {/* CONTENT */}
        <div className="about-content">

          <span className="about-kicker">
            ABOUT PADMAVATI JEWELLERS
          </span>

          <h2>
            Jewellery That
            <br />
            <em>Becomes Your Story.</em>
          </h2>

          <p className="about-intro">
            At Padmavati Jewellers, we believe jewellery is more than
            something you wear. It is an expression of who you are,
            a celebration of your milestones, and a memory that stays
            with you for generations.
          </p>

          <p>
            Since 2022, we have been creating thoughtfully crafted
            Gold, Diamond and Polki jewellery that brings together
            timeless elegance and contemporary design.
          </p>

          <p>
            Every creation is selected with an eye for detail,
            craftsmanship and lasting beauty, because the jewellery
            you choose should feel as meaningful as the moment
            behind it.
          </p>

          {/* STATS */}
          <div className="about-stats">

            <div className="about-stat">
              <strong>25+</strong>
              <span>
                Years of
                <br />
                Excellence
              </span>
            </div>

            <div className="about-stat">
              <strong>10K+</strong>
              <span>
                Happy
                <br />
                Customers
              </span>
            </div>

            <div className="about-stat">
              <strong>100%</strong>
              <span>
                Quality &
                <br />
                Trust
              </span>
            </div>

          </div>

          <a href="/about" className="about-button">
            Know More
            <span>↗</span>
          </a>

        </div>
      </div>
    </section>
  );
}

export default About;