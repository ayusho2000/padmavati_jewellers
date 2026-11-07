import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to send your message."
        );
      }

      setSuccessMessage(
        "Thank you. Your message has been sent successfully."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-wrapper">
        {/* ==========================================
                CONTACT INFORMATION
        ========================================== */}

        <div className="contact-info">
          <h2>Visit Our Showroom</h2>

          <p>
            We invite you to explore our exclusive collections
            of Gold, Diamond, Polki &amp; Solitaire jewellery.
          </p>

          <div className="contact-box">
            <i className="fa-solid fa-location-dot"></i>

            <div>
              <h4>Address</h4>

              <p>
                4A Ganpat Bagla Road,,
                <br />
                2nd Floor,
                <br />
                Burrabazar,
                <br />
                West Bengal - 700007
              </p>
            </div>
          </div>

          <div className="contact-box">
            <i className="fa-solid fa-phone"></i>

            <div>
              <h4>Phone</h4>

              <p>
                +91 90320879762
              </p>
            </div>
          </div>

          <div className="contact-box">
            <i className="fa-solid fa-envelope"></i>

            <div>
              <h4>Email</h4>

              <p>
                padmavatijewellers2022@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
                CONTACT FORM
        ========================================== */}

        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          {successMessage && (
            <div className="contact-success">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="contact-error">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;