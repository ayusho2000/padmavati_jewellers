import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-top">

        {/* ==================================
                BRAND
        =================================== */}

        <div className="footer-logo">
          <h2>
            PADMAVATI
            <span>JEWELLERS</span>
          </h2>

          <p>
            Luxury Gold, Diamond, Polki &amp; Solitaire Jewellery
            crafted with timeless elegance.
          </p>

          <div className="footer-social">


          <a
            href="https://www.facebook.com/profile.php?id=61551901749277"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            >
            <i className="fab fa-facebook-f"></i>
          </a>

            <a
              href="https://www.instagram.com/padmavatijewellerskolkata?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>


        {/* ==================================
                QUICK LINKS
        =================================== */}

        <div className="footer-links">
          <h3>Quick Links</h3>

          <a href="/">
            Home
          </a>


          <a href="/about">
            About US
          </a>

          <a href="/#collections">
            Collections
          </a>

          <a href="/contact">
            Contact
          </a>
        </div>


        {/* ==================================
                COLLECTIONS
        =================================== */}

        <div className="footer-links">
          <h3>Collections</h3>

          <Link to="/products/gold">
            Gold
          </Link>

          <Link to="/products/diamond">
            Diamond
          </Link>

          <Link to="/products/polki">
            Polki
          </Link>

          {/* <Link to="/products/solitaires">
            Solitaires
          </Link> */}
        </div>


        {/* ==================================
                CONTACT US
        =================================== */}

        <div className="footer-links footer-contact">
          <h3>Contact Us</h3>

          <div className="footer-contact-item">
            <i className="fa-solid fa-location-dot"></i>


            <span>
              4A Ganpat Bagla Road,
              <br />
              2nd Floor,
              <br />
              Burrabazar,
              <br />
              West Bengal - 700007
            </span>
          </div>

          <div className="footer-contact-item">
            <i className="fa-solid fa-phone"></i>

            <a href="tel:+919831029115">
              +91 9831029115
            </a>
          </div>

          <div className="footer-contact-item">
            <i className="fa-solid fa-envelope"></i>

            <a href="mailto:padmavatijewellers2022@gmail.com">
              padmavatijewellers2022@gmail.com
            </a>
          </div>

          <div className="footer-contact-item">
            <i className="fa-regular fa-clock"></i>

            <span>
              11:00 AM – 7:00 PM
            </span>
          </div>
        </div>
      </div>


      {/* ==================================
                FOOTER BOTTOM
      =================================== */}

      <div className="footer-bottom">
        © {currentYear} Padmavati Jewellers. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;