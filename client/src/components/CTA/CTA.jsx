import { Link } from "react-router-dom";
import "./CTA.css";

function CTA() {
  return (
    <section className="cta">
      <h2>Celebrate Every Moment With Timeless Jewellery</h2>

      <p>
        Experience handcrafted luxury designed for weddings,
        celebrations and every unforgettable milestone.
      </p>

      <Link to="/products/gold" className="cta-button">
        Explore Collections
      </Link>
    </section>
  );
}

export default CTA;