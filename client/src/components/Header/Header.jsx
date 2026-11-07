import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  API_BASE_URL,
  SERVER_BASE_URL,
} from "../../config/api";

import "./Header.css";

function getImageUrl(image) {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${SERVER_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function Header() {
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [searchProducts, setSearchProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const category = location.pathname
    .split("/")[2]
    ?.toLowerCase();

  const isProductPage =
    location.pathname.startsWith("/products/") &&
    ["gold", "diamond", "polki"].includes(category);

  /* =======================================================
     HEADER SCROLL BEHAVIOUR
  ======================================================= */

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 80) {
        setHeaderVisible(true);
        setScrolled(false);
        lastScrollY = currentScrollY;
        return;
      }

      setScrolled(true);

      if (currentScrollY > lastScrollY) {
        setHeaderVisible(false);
      }

      if (currentScrollY < lastScrollY) {
        setHeaderVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =======================================================
     OPEN SEARCH
  ======================================================= */

  const openSearch = () => {
    setSearchOpen(true);
    setSearchValue("");
    setSearchProducts([]);
    setSearchError("");
  };

  /* =======================================================
     CLOSE SEARCH
  ======================================================= */

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
    setSearchProducts([]);
    setSearchError("");
  };

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!searchOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [searchOpen]);

  /* =======================================================
     SEARCH PRODUCTS
  ======================================================= */

  useEffect(() => {
    const query = searchValue.trim().toLowerCase();

    if (!searchOpen || !query) {
      setSearchProducts([]);
      setSearchLoading(false);
      setSearchError("");
      return;
    }

    let cancelled = false;

    const searchProducts = async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

        const categories = [
          "GOLD",
          "DIAMOND",
          "POLKI",
        ];

        const responses = await Promise.all(
          categories.map((productCategory) =>
            fetch(
              `${API_BASE_URL}/products?category=${productCategory}&active=true`
            )
          )
        );

        const data = await Promise.all(
          responses.map(async (response) => {
            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(
                result.message ||
                  "Unable to search products."
              );
            }

            return Array.isArray(result.products)
              ? result.products
              : Array.isArray(result.data)
                ? result.data
                : [];
          })
        );

        if (cancelled) return;

        const allProducts = data.flat();

        const matchedProducts = allProducts
          .filter((product) => {
            const name =
              product.name?.toLowerCase() || "";

            const description =
              product.description?.toLowerCase() || "";

            return (
              name.includes(query) ||
              description.includes(query)
            );
          })
          .sort(
            (a, b) =>
              (a.displayOrder || 0) -
              (b.displayOrder || 0)
          );

        setSearchProducts(matchedProducts);
      } catch (error) {
        if (cancelled) return;

        setSearchProducts([]);
        setSearchError(
          error.message ||
            "Unable to search products."
        );
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      searchProducts();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchValue, searchOpen]);

  /* =======================================================
     PRODUCT CATEGORY
  ======================================================= */

  const getProductCategory = (product) => {
    return product.category?.toLowerCase() || "";
  };

  return (
    <>
      <header
        className={`
          site-header
          ${scrolled ? "scrolled" : ""}
          ${headerVisible
            ? "header-visible"
            : "header-hidden"}
          ${
            isProductPage
              ? `product-header product-header-${category}`
              : ""
          }
          ${searchOpen ? "search-active" : ""}
        `}
      >
        <div className="header-inner">

          {/* =================================================
              SOCIAL ICONS
          ================================================= */}

          <div className="header-socials">
            <a
              href="https://www.instagram.com/padmavatijewellerskolkata?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              aria-label="Instagram"
              className="header-icon"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61551901749277"
              aria-label="Facebook"
              className="header-icon"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
          </div>


          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            className="header-logo"
            aria-label="Padmavati Jewellers Home"
          >
            <img
              src="/images/logo.png"
              alt="Padmavati Jewellers"
            />
          </Link>


          {/* =================================================
              RIGHT ACTIONS / SEARCH
          ================================================= */}

          <div className="header-actions">

            {!searchOpen && (
              <button
                type="button"
                className="header-icon header-button search-trigger"
                aria-label="Open search"
                onClick={openSearch}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            )}


            {searchOpen && (
              <div className="header-search">

                <i className="fa-solid fa-magnifying-glass header-search-icon"></i>

                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(event.target.value)
                  }
                  placeholder="Search jewellery..."
                  aria-label="Search jewellery"
                  autoFocus
                />

                {searchValue && (
                  <button
                    type="button"
                    className="header-search-clear"
                    aria-label="Clear search"
                    onClick={() => setSearchValue("")}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}

                <button
                  type="button"
                  className="header-search-close"
                  aria-label="Close search"
                  onClick={closeSearch}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>

              </div>
            )}

          </div>
        </div>


        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="main-nav">



      <a
        href="/"
        className="nav-link"
      >
        Home
      </a>

          

          <Link
            to="/about"
            className="nav-link"
          >
            About Us
          </Link>

          <Link
            to="/products/gold"
            className="nav-link"
          >
            Gold
          </Link>

          <Link
            to="/products/diamond"
            className="nav-link"
          >
            Diamond
          </Link>

          <Link
            to="/products/polki"
            className="nav-link"
          >
            Polki
          </Link>

          <Link
            to="/contact"
            className="nav-link"
          >
            Contact Us
          </Link>

        </nav>


        {/* ===================================================
            SEARCH RESULTS
        =================================================== */}

        {searchOpen && searchValue.trim() && (
          <div className="header-search-results">

            {searchLoading && (
              <div className="header-search-message">
                <div className="header-search-loader"></div>
                <span>
                  Searching our collections...
                </span>
              </div>
            )}


            {!searchLoading &&
              searchError && (
                <div className="header-search-message header-search-error">
                  <i className="fa-solid fa-circle-exclamation"></i>

                  <span>
                    {searchError}
                  </span>
                </div>
              )}


            {!searchLoading &&
              !searchError &&
              searchProducts.length === 0 && (
                <div className="header-search-message">
                  <i className="fa-regular fa-face-frown"></i>

                  <span>
                    No jewellery found for "
                    {searchValue}"
                  </span>
                </div>
              )}


            {!searchLoading &&
              !searchError &&
              searchProducts.length > 0 && (
                <>
                  <div className="header-search-result-heading">
                    {searchProducts.length}{" "}
                    {searchProducts.length === 1
                      ? "creation"
                      : "creations"}{" "}
                    found
                  </div>

                  <div className="header-search-result-list">

                    {searchProducts.map((product) => {
                      const productCategory =
                        getProductCategory(product);

                      return (
                        <Link
                          key={`${productCategory}-${product.id}`}
                          to={`/products/${productCategory}/${product.id}`}
                          className="header-search-result"
                          onClick={closeSearch}
                        >

                          <div className="header-search-result-image">

                            {product.image ? (
                              <img
                                src={getImageUrl(
                                  product.image
                                )}
                                alt={product.name}
                              />
                            ) : (
                              <div className="header-search-no-image">
                                <i className="fa-regular fa-gem"></i>
                              </div>
                            )}

                          </div>


                          <div className="header-search-result-content">

                            <span>
                              {productCategory} Jewellery
                            </span>

                            <h3>
                              {product.name}
                            </h3>

                          </div>


                          <div className="header-search-result-arrow">
                            <i className="fa-solid fa-arrow-right"></i>
                          </div>

                        </Link>
                      );
                    })}

                  </div>
                </>
              )}

          </div>
        )}

      </header>
    </>
  );
}

export default Header;