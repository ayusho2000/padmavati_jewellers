import { useState } from "react";
import "./ContactUs.css";

import { API_BASE_URL } from "../../config/api";

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
          data.message || "Unable to submit your enquiry."
        );
      }

      setSuccessMessage(
        "Thank you for contacting Padmavati Jewellers. We will get back to you soon."
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
    <main className="contact-page">
      {/* =====================================================
          CONTACT HERO
      ===================================================== */}

      <section className="contact-page-hero">
        <div className="contact-page-hero-content">
          <span>GET IN TOUCH</span>

          <h1>
            Let's Create
            <br />
            <em>Something Timeless.</em>
          </h1>

          <p>
            Whether you're looking for a special piece, planning a
            celebration, or simply want to explore our collections,
            we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* =====================================================
          CONTACT SECTION
      ===================================================== */}

      <section className="contact-page-section">
        <div className="contact-page-container">

          {/* CONTACT INFORMATION */}

          <div className="contact-page-info">
            <span className="contact-page-kicker">
              PADMAVATI JEWELLERS
            </span>

            <h2>
              We Would Love
              <br />
              <em>To Hear From You.</em>
            </h2>

            <p className="contact-page-description">
              Our team is here to assist you with jewellery
              enquiries, collection details, appointments and
              anything else you may need.
            </p>

            <div className="contact-details">

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <i className="fa-solid fa-location-dot"></i>
                </div>

                <div>
                  <span>Visit Us</span>
                  <p>
                    4A Ganpat Bagla Road,
                    <br />
                    2nd Floor,
                    <br />
                    Burrabazar,
                    <br />
                    West Bengal - 700007
                  </p>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <i className="fa-solid fa-phone"></i>
                </div>

                <div>
                  <span>Call Us</span>
                  <a href="tel:+919831029115">
                    +91 9831029115
                  </a>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <i className="fa-solid fa-envelope"></i>
                </div>

                <div>
                  <span>Email Us</span>
                  <a href="mailto:padmavatijewellers2022@gmail.com">
                    padmavatijewellers2022@gmail.com
                  </a>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <i className="fa-regular fa-clock"></i>
                </div>

                <div>
                  <span>Opening Hours</span>
                  <p>11:00 AM – 7:00 PM</p>
                </div>
              </div>

            </div>
          </div>

          {/* CONTACT FORM */}

          <div className="contact-page-form-wrapper">

            <div className="contact-page-form-heading">
              <span>ENQUIRE WITH US</span>

              <h3>
                Tell Us What
                <br />
                <em>You're Looking For.</em>
              </h3>
            </div>

            <form
              className="contact-page-form"
              onSubmit={handleSubmit}
            >

              <div className="contact-form-row">

                <div className="contact-form-group">
                  <label htmlFor="contact-name">
                    Your Name
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-email">
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="contact-form-group">
                <label htmlFor="contact-phone">
                  Phone Number
                </label>

                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="contact-message">
                  Your Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  rows="6"
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              {successMessage && (
                <div className="contact-form-success">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="contact-form-error">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="contact-submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Sending..."
                  : "Send Enquiry"}
                <span>↗</span>
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* =====================================================
          CONTACT BANNER
      ===================================================== */}

      <section className="contact-page-banner">
        <div>
          <span>PADMAVATI JEWELLERS</span>

          <h2>
            Every Conversation
            <br />
            Begins With A Story.
          </h2>

          <p>
            Let us help you find the jewellery that becomes
            part of yours.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Contact;