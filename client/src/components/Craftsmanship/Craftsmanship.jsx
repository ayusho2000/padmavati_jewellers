import "./Craftsmanship.css";

function Craftsmanship() {
  return (
    <section className="craftsmanship">
      <div className="craftsmanship-container">

        <div className="craftsmanship-content">

          <h5>
            Luxury Craftsmanship
          </h5>

          <h2>
            Every Detail Tells A Story Of Excellence
          </h2>

          <p>
            Our master artisans combine decades of experience with modern
            techniques to create jewellery that embodies elegance, precision
            and timeless beauty.
          </p>

          <p>
            Every Gold, Diamond, Polki and Solitaire masterpiece is handcrafted
            with passion to ensure every customer receives jewellery worthy of
            life's most cherished moments.
          </p>

        </div>

        <div className="craftsmanship-image">

          <img
            src="/images/artisan.jpg"
            alt="Craftsmanship"
          />

          <div className="highlight-box">

            <h3>
              100%
            </h3>

            <span>
              Certified Craftsmanship & Hallmarked Jewellery
            </span>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Craftsmanship;