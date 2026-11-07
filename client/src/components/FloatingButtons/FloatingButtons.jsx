import "./FloatingButtons.css";

function FloatingButtons() {
  return (
    <div className="floating-buttons">
      {/* CALL */}
      <a
        href="tel:+919831029115"
        className="floating-btn floating-call"
        aria-label="Call Padmavati Jewellers"
      >
        <i className="fa-solid fa-phone"></i>
      </a>

      {/* WHATSAPP */}
      <a
        href="https://wa.me/919831029115"
        className="floating-btn floating-whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Padmavati Jewellers"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  );
}

export default FloatingButtons;
