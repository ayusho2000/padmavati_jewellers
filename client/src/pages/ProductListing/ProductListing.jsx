import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  API_BASE_URL,
  SERVER_BASE_URL,
} from "../../config/api";

import "./ProductListing.css";

const CATEGORY_NAMES = {
  gold: "Gold Jewellery",
  diamond: "Diamond Jewellery",
  polki: "Polki Jewellery",
};

const CATEGORY_VALUES = {
  gold: "GOLD",
  diamond: "DIAMOND",
  polki: "POLKI",
};

const CATEGORY_BANNERS = {
  gold: "product-hero-gold",
  diamond: "product-hero-diamond",
  polki: "product-hero-polki",
};

const PRODUCTS_PER_PAGE = 12;

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

function ProductListing() {
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const categoryKey = category?.toLowerCase();
  const categoryName =
    CATEGORY_NAMES[categoryKey] || "Jewellery";

  const categoryValue = CATEGORY_VALUES[categoryKey];

  const bannerClass =
    CATEGORY_BANNERS[categoryKey] || "product-hero-gold";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setCurrentPage(1);

        const response = await fetch(
          `${API_BASE_URL}/products?category=${categoryValue}&active=true`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load products."
          );
        }

        setProducts(data.products || data.data || []);
      } catch (error) {
        setProducts([]);
        setErrorMessage(
          error.message || "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    if (categoryValue) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
      setErrorMessage("Invalid jewellery category.");
    }
  }, [categoryValue]);

  /*
   * SORT PRODUCTS
   */
  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    if (sortBy === "name-asc") {
      sorted.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    }

    if (sortBy === "name-desc") {
      sorted.sort((a, b) =>
        (b.name || "").localeCompare(a.name || "")
      );
    }

    if (sortBy === "order-asc") {
      sorted.sort(
        (a, b) =>
          Number(a.displayOrder || 0) -
          Number(b.displayOrder || 0)
      );
    }

    if (sortBy === "order-desc") {
      sorted.sort(
        (a, b) =>
          Number(b.displayOrder || 0) -
          Number(a.displayOrder || 0)
      );
    }

    return sorted;
  }, [products, sortBy]);

  /*
   * PAGINATION
   */
  const totalPages = Math.ceil(
    sortedProducts.length / PRODUCTS_PER_PAGE
  );

  const paginatedProducts = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PRODUCTS_PER_PAGE;

    const endIndex =
      startIndex + PRODUCTS_PER_PAGE;

    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage]);

  /*
   * Make sure current page remains valid
   * after sorting or product changes.
   */
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /*
   * When sorting changes, always return
   * to page 1.
   */
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * Pagination button list.
   */
  const paginationItems = useMemo(() => {
    if (totalPages <= 1) {
      return [];
    }

    const items = [];

    /*
     * For small number of pages,
     * show every page.
     */
    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page++) {
        items.push(page);
      }

      return items;
    }

    /*
     * Always show first page.
     */
    items.push(1);

    /*
     * Left ellipsis.
     */
    if (currentPage > 4) {
      items.push("left-ellipsis");
    }

    /*
     * Pages around current page.
     */
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      if (!items.includes(page)) {
        items.push(page);
      }
    }

    /*
     * Right ellipsis.
     */
    if (currentPage < totalPages - 3) {
      items.push("right-ellipsis");
    }

    /*
     * Always show last page.
     */
    if (!items.includes(totalPages)) {
      items.push(totalPages);
    }

    return items;
  }, [currentPage, totalPages]);

  /*
   * INVALID CATEGORY
   */
  if (!categoryValue) {
    return (
      <main className="product-error-page">
        <span>COLLECTION</span>

        <h1>Category Not Found</h1>

        <p>
          The jewellery collection you are looking for
          does not exist.
        </p>

        <Link
          to="/"
          className="product-back-button"
        >
          Back To Home
        </Link>
      </main>
    );
  }

  return (
    <main className="product-page">
      {/* =====================================================
          CATEGORY HERO
      ===================================================== */}
      <section
        className={`product-hero ${bannerClass}`}
        aria-label={`${categoryName} collection`}
      />

      {/* =====================================================
          TOOLBAR
      ===================================================== */}
      <div className="product-toolbar">
        <div className="product-count">
          {loading
            ? "Loading Products..."
            : `${sortedProducts.length} Products`}
        </div>

        <div className="product-sort">
          <label htmlFor="product-sort">
            Sort By
          </label>

          <select
            id="product-sort"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="default">
              Default
            </option>

            <option value="order-asc">
              Display Order
            </option>

            <option value="order-desc">
              Display Order — Reverse
            </option>

            <option value="name-asc">
              Name — A to Z
            </option>

            <option value="name-desc">
              Name — Z to A
            </option>
          </select>
        </div>
      </div>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}
      {loading ? (
        <div className="products-grid">
          <div className="products-state">
            <div className="products-loader"></div>

            <h3>Loading Collection</h3>

            <p>
              Please wait while we bring the latest
              {` ${categoryName.toLowerCase()}`} for you.
            </p>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="products-grid">
          <div className="products-state products-error">
            <h3>Unable To Load Products</h3>

            <p>{errorMessage}</p>
          </div>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="products-grid">
          <div className="products-state">
            <h3>No Products Available</h3>

            <p>
              There are currently no products available
              in this collection.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {paginatedProducts.map((product) => {
              const image1 = getImageUrl(product.image);
              const image2 = getImageUrl(product.image2);

              return (
                <Link
                  key={product.id}
                  to={`/products/${categoryKey}/${product.id}`}
                  className="product-card"
                >
                  <div
                    className={`product-card-image ${
                      image2
                        ? "has-second-image"
                        : ""
                    }`}
                  >
                    {/* =================================================
                        IMAGE 1
                    ================================================= */}
                    {image1 && (
                      <img
                        className="product-card-image-primary"
                        src={image1}
                        alt={product.name}
                        loading="lazy"
                      />
                    )}

                    {/* =================================================
                        IMAGE 2 — SHOWS ON HOVER
                    ================================================= */}
                    {image2 && (
                      <img
                        className="product-card-image-secondary"
                        src={image2}
                        alt={`${product.name} alternate view`}
                        loading="lazy"
                      />
                    )}

                    {/* =================================================
                        CARD OVERLAY
                    ================================================= */}
                    <div className="product-card-overlay">
                      <span>
                        View Product
                        <i className="fa-solid fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>

                  <div className="product-card-content">
                    <span className="product-card-category">
                      {categoryName}
                    </span>

                    <h2>{product.name}</h2>

                    {product.description && (
                      <p>{product.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* =====================================================
              PAGINATION
          ===================================================== */}
          {totalPages > 1 && (
            <nav
              className="products-pagination"
              aria-label="Product pagination"
            >
              <button
                type="button"
                className="pagination-arrow"
                onClick={() =>
                  handlePageChange(currentPage - 1)
                }
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>

              <div className="pagination-pages">
                {paginationItems.map((item, index) => {
                  if (
                    item === "left-ellipsis" ||
                    item === "right-ellipsis"
                  ) {
                    return (
                      <span
                        key={`${item}-${index}`}
                        className="pagination-ellipsis"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={item}
                      type="button"
                      className={`pagination-number ${
                        currentPage === item
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handlePageChange(item)
                      }
                      aria-label={`Go to page ${item}`}
                      aria-current={
                        currentPage === item
                          ? "page"
                          : undefined
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="pagination-arrow"
                onClick={() =>
                  handlePageChange(currentPage + 1)
                }
                disabled={
                  currentPage === totalPages
                }
                aria-label="Next page"
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

export default ProductListing;