import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import "./Testimonials.css";

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/testimonials?active=true`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          const sortedTestimonials = [...(data.testimonials || [])].sort(
            (a, b) => a.displayOrder - b.displayOrder
          );

          setTestimonials(sortedTestimonials);
        }
      } catch (error) {
        console.error("Failed to load testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="testimonials">
        <div className="testimonials-heading">
          <span>TESTIMONIALS</span>
          <h2>What Our Clients Say</h2>
        </div>

        <div className="testimonials-loading">
          Loading testimonials...
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-heading">
        <span>TESTIMONIALS</span>

        <h2>What Our Clients Say</h2>

        <p>
          Every piece we create becomes part of someone's special
          story. Here's what our clients have to say about their
          Padmavati Jewellers experience.
        </p>
      </div>

      {testimonials.length > 0 ? (
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <article
              className="testimonial-card"
              key={testimonial.id}
            >
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      index < testimonial.rating
                        ? "star active"
                        : "star"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="testimonial-text">
                "{testimonial.text}"
              </p>

              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {testimonial.customerName
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>
                  <h3>{testimonial.customerName}</h3>

                  {testimonial.designation && (
                    <span>{testimonial.designation}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="testimonials-empty">
          <p>
            Our clients' stories will appear here soon.
          </p>
        </div>
      )}
    </section>
  );
}

export default Testimonials;