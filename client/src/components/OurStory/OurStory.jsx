import "./OurStory.css";

function OurStory() {
  return (
    <section className="story">
      <div className="story-title">
        <h2>Our Journey</h2>

        <p>
          A legacy built on trust, craftsmanship and timeless elegance.
        </p>
      </div>

      <div className="timeline">
        <div className="timeline-box">
          <h3>2022</h3>
          <h4>The Beginning</h4>
          <p>
            Padmavati Jewellers was established with a vision of offering
            premium jewellery.
          </p>
        </div>

        <div className="timeline-box">
          <h3>2023</h3>
          <h4>Growing Trust</h4>
          <p>
            Hundreds of families trusted us for life's most precious
            celebrations.
          </p>
        </div>

        <div className="timeline-box">
          <h3>2024</h3>
          <h4>Exclusive Collections</h4>
          <p>
            Expanded into Gold, Diamond, Polki and Solitaire collections.
          </p>
        </div>

        <div className="timeline-box">
          <h3>Today</h3>
          <h4>Luxury Experience</h4>
          <p>
            Continuing our journey with exceptional craftsmanship and
            customer satisfaction.
          </p>
        </div>
      </div>
    </section>
  );
}

export default OurStory;