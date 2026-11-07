import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  API_BASE_URL,
  SERVER_BASE_URL,
} from "../../config/api";

import "./ProductDetails.css";

const CATEGORY_NAMES = {
  gold: "Gold Jewellery",
  diamond: "Diamond Jewellery",
  polki: "Polki Jewellery",
};

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

function ProductDetails() {
  const { category, id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [zoomImage, setZoomImage] = useState("");
  const [zoomIndex, setZoomIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `${API_BASE_URL}/products/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load product."
          );
        }

        setProduct(data.product || data.data);
      } catch (error) {
        setErrorMessage(
          error.message || "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const image1 = getImageUrl(product?.image);
  const image2 = getImageUrl(product?.image2);

  const zoomImages = [image1, image2].filter(Boolean);

  useEffect(() => {
    if (!zoomImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setZoomImage("");
        return;
      }

      if (zoomImages.length <= 1) {
        return;
      }

      if (event.key === "ArrowRight") {
        setZoomIndex((currentIndex) => {
          const nextIndex =
            (currentIndex + 1) % zoomImages.length;

          setZoomImage(zoomImages[nextIndex]);

          return nextIndex;
        });
      }

      if (event.key === "ArrowLeft") {
        setZoomIndex((currentIndex) => {
          const previousIndex =
            (currentIndex - 1 + zoomImages.length) %
            zoomImages.length;

          setZoomImage(zoomImages[previousIndex]);

          return previousIndex;
        });
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [zoomImage, zoomImages]);

  const openZoom = (image, index) => {
    setZoomIndex(index);
    setZoomImage(image);
  };

  const closeZoom = () => {
    setZoomImage("");
  };

  const showPreviousImage = (event) => {
    event.stopPropagation();

    if (zoomImages.length <= 1) return;

    const previousIndex =
      (zoomIndex - 1 + zoomImages.length) %
      zoomImages.length;

    setZoomIndex(previousIndex);
    setZoomImage(zoomImages[previousIndex]);
  };

  const showNextImage = (event) => {
    event.stopPropagation();

    if (zoomImages.length <= 1) return;

    const nextIndex =
      (zoomIndex + 1) % zoomImages.length;

    setZoomIndex(nextIndex);
    setZoomImage(zoomImages[nextIndex]);
  };

  const categoryName =
    CATEGORY_NAMES[category?.toLowerCase()] ||
    "Jewellery";

  const whatsappMessage = product
    ? encodeURIComponent(
        `Hello Padmavati Jewellers, I am interested in "${product.name}". Please share more details about this ${categoryName}.`
      )
    : "";

  if (loading) {
    return (
      <main className="product-details-state">
        <span>PADMAVATI JEWELLERS</span>

        <h1>Loading Product...</h1>

        <p>
          Please wait while we load the jewellery details.
        </p>
      </main>
    );
  }

  if (errorMessage || !product) {
    return (
      <main className="product-details-state">
        <span>PRODUCT NOT FOUND</span>

        <h1>Unable To Load Product</h1>

        <p>
          {errorMessage ||
            "The requested product could not be found."}
        </p>

        <Link
          to={`/products/${category}`}
          className="details-back-button"
        >
          Back To Collection
        </Link>
      </main>
    );
  }

  return (
    <main className="product-details-page">
      <div className="product-details-container">

        {/* =========================================
            PRODUCT IMAGES
        ========================================= */}

        <div className="product-details-image">

          <div
            className={`product-details-image-box ${
              image2
                ? "has-second-detail-image"
                : ""
            }`}
          >

            {image1 && (
              <button
                type="button"
                className="product-details-image-button"
                onClick={() =>
                  openZoom(image1, 0)
                }
                aria-label={`Zoom ${product.name}`}
              >
                <img
                  className="product-details-primary-image"
                  src={image1}
                  alt={product.name}
                />

                <span className="product-image-zoom-hint">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  Click To Zoom
                </span>
              </button>
            )}

            {image2 && (
              <button
                type="button"
                className="product-details-image-button product-details-second-image-button"
                onClick={() =>
                  openZoom(image2, 1)
                }
                aria-label={`Zoom alternate view of ${product.name}`}
              >
                <img
                  src={image2}
                  alt={`${product.name} alternate view`}
                />

                <span className="product-image-zoom-hint">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  Click To Zoom
                </span>
              </button>
            )}

          </div>


          {/* =========================================
              THUMBNAILS
          ========================================= */}

          {image2 && (
            <div className="product-details-image-thumbnails">

              <button
                type="button"
                className={`product-details-thumbnail ${
                  zoomIndex === 0
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  openZoom(image1, 0)
                }
                aria-label="Open first product image"
              >
                <img
                  src={image1}
                  alt={`${product.name} first view`}
                />
              </button>

              <button
                type="button"
                className={`product-details-thumbnail ${
                  zoomIndex === 1
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  openZoom(image2, 1)
                }
                aria-label="Open second product image"
              >
                <img
                  src={image2}
                  alt={`${product.name} second view`}
                />
              </button>

            </div>
          )}

        </div>


        {/* =========================================
            PRODUCT CONTENT
        ========================================= */}

        <div className="product-details-content">

          <Link
            to={`/products/${category}`}
            className="details-back-link"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back To Collection
          </Link>


          <span className="details-category">
            {categoryName}
          </span>


          <h1>{product.name}</h1>


          <div className="details-divider"></div>


          {product.description && (
            <p className="details-description">
              {product.description}
            </p>
          )}


          {/* =========================================
              PRODUCT INFORMATION
          ========================================= */}

          <div className="details-information">

            <div className="details-information-row">
              <span>Category</span>

              <strong>
                {categoryName}
              </strong>
            </div>


            <div className="details-information-row">
              <span>Type</span>

              <strong>
                {product.type || "—"}
              </strong>
            </div>


            <div className="details-information-row">
              <span>Purity</span>

              <strong>
                {product.purity || "—"}
              </strong>
            </div>


            <div className="details-information-row">
              <span>Weight</span>

              <strong>
                {product.weight || "—"}
              </strong>
            </div>


            <div className="details-information-row">
              <span>Style</span>

              <strong>
                {product.style || "—"}
              </strong>
            </div>

          </div>


          {/* =========================================
              ACTIONS
          ========================================= */}

          <div className="details-actions">

            <a
              href={`https://wa.me/918800304933?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="details-whatsapp"
            >
              <i className="fab fa-whatsapp"></i>
              Enquire On WhatsApp
            </a>

            <a
              href="tel:+918800304933"
              className="details-call"
            >
              <i className="fa-solid fa-phone"></i>
              Call Us
            </a>

          </div>


          <p className="details-note">
            For pricing, availability and personalised
            assistance, please contact our jewellery
            specialists.
          </p>

        </div>

      </div>


      {/* =========================================
          IMAGE LIGHTBOX
      ========================================= */}

      {zoomImage && (
        <div
          className="product-image-lightbox"
          onClick={closeZoom}
        >

          <button
            type="button"
            className="product-image-lightbox-close"
            onClick={closeZoom}
            aria-label="Close image zoom"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>


          {/* =========================================
              PREVIOUS IMAGE
          ========================================= */}

          {zoomImages.length > 1 && (
            <button
              type="button"
              className="product-image-lightbox-arrow product-image-lightbox-prev"
              onClick={showPreviousImage}
              aria-label="Previous product image"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          )}


          {/* =========================================
              IMAGE
          ========================================= */}

          <div
            className="product-image-lightbox-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={zoomImage}
              alt={product.name}
            />
          </div>


          {/* =========================================
              NEXT IMAGE
          ========================================= */}

          {zoomImages.length > 1 && (
            <button
              type="button"
              className="product-image-lightbox-arrow product-image-lightbox-next"
              onClick={showNextImage}
              aria-label="Next product image"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          )}


          {/* =========================================
              IMAGE COUNTER
          ========================================= */}

          {zoomImages.length > 1 && (
            <div className="product-image-lightbox-counter">
              {zoomIndex + 1} / {zoomImages.length}
            </div>
          )}

        </div>
      )}
    </main>
  );
}

export default ProductDetails;