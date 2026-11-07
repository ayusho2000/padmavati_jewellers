import "./BrandValues.css";

function BrandValues() {
  return (
    <section className="brand-values-section">
      <div className="brand-values-heading">
        <span>WHAT WE STAND FOR</span>

        <h2>
          Craftsmanship. Authenticity.
          <br />
          <em>Trust.</em>
        </h2>

        <p>
          Every Padmavati Jewellers creation reflects our commitment
          to authenticity, craftsmanship and timeless beauty.
        </p>
      </div>

      <div className="brand-values-grid">
        {/* CERTIFIED JEWELLERY */}
        <article className="brand-value-card">
          <div className="brand-value-image">
            <img
              src="/images/certified.jpg"
              alt="Certified Jewellery"
            />
          </div>

          <div className="brand-value-content">
            <span>01</span>

            <h3>Certified Jewellery</h3>

            <p>
              Every piece is carefully selected with quality,
              authenticity and transparency at its heart, giving
              you confidence in every creation you choose.
            </p>
          </div>
        </article>

        {/* MASTER CRAFTSMANSHIP */}
        <article className="brand-value-card">
          <div className="brand-value-image">
            <img
              src="/images/craftsmanship.jpg"
              alt="Master Craftsmanship"
            />
          </div>

          <div className="brand-value-content">
            <span>02</span>

            <h3>Master Craftsmanship</h3>

            <p>
              From intricate details to refined finishing, our
              jewellery celebrates the skill and dedication behind
              every beautifully crafted piece.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default BrandValues;