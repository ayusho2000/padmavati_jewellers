import { useEffect, useState } from "react";

import {
  FaGem,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
  FaUpload,
  FaSyncAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";
import { getToken } from "../../utils/auth";

import "./Products.css";

const CATEGORIES = [
  {
    key: "GOLD",
    label: "Gold",
  },
  {
    key: "DIAMOND",
    label: "Diamond",
  },
  {
    key: "POLKI",
    label: "Polki",
  },
];

const emptyForm = {
  name: "",
  description: "",
  type: "",
  purity: "",
  weight: "",
  style: "",
  displayOrder: 0,
};

function Products() {
  const [activeCategory, setActiveCategory] =
    useState("GOLD");

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [selectedImage2, setSelectedImage2] =
    useState(null);

  const [replacingImageId, setReplacingImageId] =
    useState(null);

  const [replacingImage2Id, setReplacingImage2Id] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showErrorPopup, setShowErrorPopup] =
    useState(false);

  const [errorPopupMessage, setErrorPopupMessage] =
    useState("");

  async function fetchProducts(
    category = activeCategory
  ) {
    setLoading(true);

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/products?category=${category}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load products."
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error(err);

      showError(
        err.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function showError(message) {
    setErrorPopupMessage(
      message ||
        "Something went wrong."
    );

    setShowErrorPopup(true);
  }

  function closeErrorPopup() {
    setShowErrorPopup(false);
    setErrorPopupMessage("");
  }

  function handleCategoryChange(category) {
    clearMessages();

    setActiveCategory(category);
  }

  function openAddForm() {
    clearMessages();

    setEditingProduct(null);

    setFormData({
      ...emptyForm,
      displayOrder:
        getNextDisplayOrder(),
    });

    setSelectedImage(null);
    setSelectedImage2(null);

    setShowForm(true);
  }

  function getNextDisplayOrder() {
    if (products.length === 0) {
      return 0;
    }

    const orders = products
      .map((product) =>
        Number(product.displayOrder)
      )
      .filter((order) =>
        Number.isInteger(order)
      );

    if (orders.length === 0) {
      return 0;
    }

    return Math.max(...orders) + 1;
  }

  function openEditForm(product) {
    clearMessages();

    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      description:
        product.description || "",

      type:
        product.type || "",

      purity:
        product.purity || "",

      weight:
        product.weight || "",

      style:
        product.style || "",

      displayOrder:
        product.displayOrder ?? 0,
    });

    setSelectedImage(null);
    setSelectedImage2(null);

    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);

    setEditingProduct(null);

    setFormData(emptyForm);

    setSelectedImage(null);
    setSelectedImage2(null);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateImage(file) {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      showError(
        "Please select a JPG, PNG, WebP or AVIF image."
      );

      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError(
        "Product image must be less than 10MB."
      );

      return false;
    }

    return true;
  }

  function handleImageChange(event) {
    const file =
      event.target.files?.[0];

    clearMessages();

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!validateImage(file)) {
      event.target.value = "";
      setSelectedImage(null);
      return;
    }

    setSelectedImage(file);
  }

  function handleImage2Change(event) {
    const file =
      event.target.files?.[0];

    clearMessages();

    if (!file) {
      setSelectedImage2(null);
      return;
    }

    if (!validateImage(file)) {
      event.target.value = "";
      setSelectedImage2(null);
      return;
    }

    setSelectedImage2(file);
  }

  function checkDuplicateDisplayOrder() {
    const displayOrderNumber =
      Number(formData.displayOrder);

    const duplicateProduct =
      products.find((product) => {
        const sameOrder =
          Number(product.displayOrder) ===
          displayOrderNumber;

        const isSameProduct =
          editingProduct &&
          product.id === editingProduct.id;

        return (
          sameOrder &&
          !isSameProduct
        );
      });

    if (duplicateProduct) {
      showError(
        `Display order ${displayOrderNumber} is already being used by "${duplicateProduct.name}". Please choose a different display order.`
      );

      return true;
    }

    return false;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    clearMessages();

    if (!formData.name.trim()) {
      showError(
        "Product name is required."
      );

      return;
    }

    if (!editingProduct && !selectedImage) {
      showError(
        "Product image is required."
      );

      return;
    }

    const displayOrderNumber =
      Number(formData.displayOrder);

    if (
      !Number.isInteger(
        displayOrderNumber
      ) ||
      displayOrderNumber < 0
    ) {
      showError(
        "Display order must be a non-negative integer."
      );

      return;
    }

    if (checkDuplicateDisplayOrder()) {
      return;
    }

    setSaving(true);

    try {
      const token = getToken();

      if (editingProduct) {
        const response = await fetch(
          `${API_BASE_URL}/products/${editingProduct.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name:
                formData.name.trim(),

              description:
                formData.description.trim() ||
                null,

              type:
                formData.type.trim() ||
                null,

              purity:
                formData.purity.trim() ||
                null,

              weight:
                formData.weight.trim() ||
                null,

              style:
                formData.style.trim() ||
                null,

              displayOrder:
                displayOrderNumber,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to update product."
          );
        }

        if (selectedImage) {
          const imageData =
            new FormData();

          imageData.append(
            "image",
            selectedImage
          );

          const imageResponse =
            await fetch(
              `${API_BASE_URL}/products/${editingProduct.id}/image`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: imageData,
              }
            );

          const imageResult =
            await imageResponse.json();

          if (!imageResponse.ok) {
            throw new Error(
              imageResult.message ||
                "Product details were updated, but image replacement failed."
            );
          }
        }

        setSuccess(
          "Product updated successfully."
        );
      } else {
        const dataToSend =
          new FormData();

        dataToSend.append(
          "category",
          activeCategory
        );

        dataToSend.append(
          "name",
          formData.name.trim()
        );

        if (formData.description.trim()) {
          dataToSend.append(
            "description",
            formData.description.trim()
          );
        }

        if (formData.type.trim()) {
          dataToSend.append(
            "type",
            formData.type.trim()
          );
        }

        if (formData.purity.trim()) {
          dataToSend.append(
            "purity",
            formData.purity.trim()
          );
        }

        if (formData.weight.trim()) {
          dataToSend.append(
            "weight",
            formData.weight.trim()
          );
        }

        if (formData.style.trim()) {
          dataToSend.append(
            "style",
            formData.style.trim()
          );
        }

        dataToSend.append(
          "displayOrder",
          String(displayOrderNumber)
        );

        dataToSend.append(
          "image",
          selectedImage
        );

        if (selectedImage2) {
          dataToSend.append(
            "image2",
            selectedImage2
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/products`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: dataToSend,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to create product."
          );
        }

        setSuccess(
          "Product added successfully."
        );
      }

      setShowForm(false);

      setEditingProduct(null);

      setFormData(emptyForm);

      setSelectedImage(null);
      setSelectedImage2(null);

      await fetchProducts(
        activeCategory
      );
    } catch (err) {
      console.error(err);

      showError(
        err.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReplaceImage(
    productId,
    file
  ) {
    if (!file) {
      return;
    }

    clearMessages();

    if (!validateImage(file)) {
      return;
    }

    setReplacingImageId(productId);

    try {
      const token = getToken();

      const imageData =
        new FormData();

      imageData.append(
        "image",
        file
      );

      const response =
        await fetch(
          `${API_BASE_URL}/products/${productId}/image`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to replace product image."
        );
      }

      setSuccess(
        "Product image replaced successfully."
      );

      await fetchProducts(
        activeCategory
      );
    } catch (err) {
      console.error(err);

      showError(
        err.message ||
          "Unable to replace product image."
      );
    } finally {
      setReplacingImageId(null);
    }
  }

  async function handleReplaceImage2(
    productId,
    file
  ) {
    if (!file) {
      return;
    }

    clearMessages();

    if (!validateImage(file)) {
      return;
    }

    setReplacingImage2Id(productId);

    try {
      const token = getToken();

      const imageData =
        new FormData();

      imageData.append(
        "image",
        file
      );

      const response =
        await fetch(
          `${API_BASE_URL}/products/${productId}/image2`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to replace second product image."
        );
      }

      setSuccess(
        "Second product image replaced successfully."
      );

      await fetchProducts(
        activeCategory
      );
    } catch (err) {
      console.error(err);

      showError(
        err.message ||
          "Unable to replace second product image."
      );
    } finally {
      setReplacingImage2Id(null);
    }
  }

  async function handleToggle(product) {
    clearMessages();

    setActionLoading(true);

    try {
      const token = getToken();

      const endpoint = product.active
        ? `${API_BASE_URL}/products/${product.id}/deactivate`
        : `${API_BASE_URL}/products/${product.id}/activate`;

      const response =
        await fetch(endpoint, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update product status."
        );
      }

      setSuccess(
        product.active
          ? "Product deactivated successfully."
          : "Product activated successfully."
      );

      await fetchProducts(
        activeCategory
      );
    } catch (err) {
      console.error(err);

      showError(
        err.message ||
          "Unable to update product status."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(product) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    clearMessages();

    setActionLoading(true);

    try {
      const token = getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/products/${product.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete product."
        );
      }

      setSuccess(
        "Product deleted successfully."
      );

      await fetchProducts(
        activeCategory
      );
    } catch (err) {
      console.error(err);

      showError(
        err.message ||
          "Unable to delete product."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function getImageUrl(image) {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:5000${
      image.startsWith("/")
        ? ""
        : "/"
    }${image}`;
  }

  const categoryLabel =
    CATEGORIES.find(
      (category) =>
        category.key === activeCategory
    )?.label || activeCategory;

  return (
    <div className="products-management">

      {/* ==========================================
                    PAGE HEADER
      ========================================== */}

      <div className="products-page-header">

        <div>
          <span className="products-page-eyebrow">
            WEBSITE CONTENT
          </span>

          <h2>
            Products
          </h2>

          <p>
            Manage Gold, Diamond and Polki
            jewellery products.
          </p>
        </div>

        <button
          type="button"
          className="products-add-button"
          onClick={openAddForm}
        >
          <FaPlus />
          Add Product
        </button>

      </div>

      {/* ==========================================
                    SUCCESS MESSAGE
      ========================================== */}

      {success && (
        <div className="products-message products-success">

          <FaCheckCircle />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <FaTimes />
          </button>

        </div>
      )}

      {/* ==========================================
                    CATEGORY TABS
      ========================================== */}

      <div className="products-tabs">

        {CATEGORIES.map(
          (category) => (
            <button
              key={category.key}
              type="button"
              className={`products-tab ${
                activeCategory ===
                category.key
                  ? "products-tab-active"
                  : ""
              }`}
              onClick={() =>
                handleCategoryChange(
                  category.key
                )
              }
            >
              <FaGem />

              {category.label}
            </button>
          )
        )}

      </div>

      {/* ==========================================
                    PRODUCTS AREA
      ========================================== */}

      <section className="products-card">

        <div className="products-card-header">

          <div>
            <span className="products-card-eyebrow">
              COLLECTION
            </span>

            <h3>
              {categoryLabel} Jewellery
            </h3>
          </div>

          <button
            type="button"
            className="products-refresh-button"
            onClick={() =>
              fetchProducts(
                activeCategory
              )
            }
            disabled={loading}
          >
            <FaSyncAlt
              className={
                loading
                  ? "products-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {loading ? (
          <div className="products-loading">

            <FaSyncAlt className="products-spin" />

            <span>
              Loading products...
            </span>

          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">

            <FaGem />

            <h4>
              No {categoryLabel} Products
            </h4>

            <p>
              Add your first{" "}
              {categoryLabel.toLowerCase()}
              jewellery product.
            </p>

            <button
              type="button"
              onClick={openAddForm}
            >
              <FaPlus />
              Add Product
            </button>

          </div>
        ) : (
          <div className="products-grid">

            {products.map(
              (product) => (
                <article
                  className="product-item"
                  key={product.id}
                >

                  {/* IMAGE 1 */}

                  <div className="product-image-wrapper">

                    <img
                      src={getImageUrl(
                        product.image
                      )}
                      alt={
                        product.name
                      }
                    />

                    <span
                      className={`product-status ${
                        product.active
                          ? "product-status-active"
                          : "product-status-inactive"
                      }`}
                    >
                      {product.active
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>

                    <label
                      className="product-image-replace"
                      title="Replace image"
                    >
                      <FaUpload />

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        hidden
                        onChange={(
                          event
                        ) => {
                          const file =
                            event.target
                              .files?.[0];

                          if (file) {
                            handleReplaceImage(
                              product.id,
                              file
                            );
                          }

                          event.target.value =
                            "";
                        }}
                      />
                    </label>

                    {replacingImageId ===
                      product.id && (
                      <div className="product-image-loading">

                        <FaSyncAlt className="products-spin" />

                      </div>
                    )}

                  </div>

                  {/* IMAGE 2 */}

                  <div className="product-image-wrapper product-image-wrapper-second">

                    {product.image2 ? (
                      <img
                        src={getImageUrl(
                          product.image2
                        )}
                        alt={`${product.name} second view`}
                      />
                    ) : (
                      <div className="product-second-image-empty">

                        <FaImage />

                        <span>
                          Second Image
                        </span>

                      </div>
                    )}

                    <label
                      className="product-image-replace"
                      title={
                        product.image2
                          ? "Replace second image"
                          : "Add second image"
                      }
                    >
                      <FaUpload />

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        hidden
                        onChange={(
                          event
                        ) => {
                          const file =
                            event.target
                              .files?.[0];

                          if (file) {
                            handleReplaceImage2(
                              product.id,
                              file
                            );
                          }

                          event.target.value =
                            "";
                        }}
                      />
                    </label>

                    {replacingImage2Id ===
                      product.id && (
                      <div className="product-image-loading">

                        <FaSyncAlt className="products-spin" />

                      </div>
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="product-content">

                    <div className="product-order">
                      #{product.displayOrder}
                    </div>

                    <h4>
                      {product.name}
                    </h4>

                    {product.description && (
                      <p>
                        {product.description}
                      </p>
                    )}

                    <div className="product-actions">

                      <button
                        type="button"
                        className="product-edit-button"
                        onClick={() =>
                          openEditForm(
                            product
                          )
                        }
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        type="button"
                        className={
                          product.active
                            ? "product-status-button product-deactivate-button"
                            : "product-status-button product-activate-button"
                        }
                        onClick={() =>
                          handleToggle(
                            product
                          )
                        }
                        disabled={
                          actionLoading
                        }
                      >
                        {product.active ? (
                          <>
                            <FaTimesCircle />
                            Disable
                          </>
                        ) : (
                          <>
                            <FaCheckCircle />
                            Activate
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="product-delete-button"
                        onClick={() =>
                          handleDelete(
                            product
                          )
                        }
                        disabled={
                          actionLoading
                        }
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>

      {/* ==========================================
                    ADD / EDIT MODAL
      ========================================== */}

      {showForm && (
        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >

          <div className="product-modal">

            <div className="product-modal-header">

              <div>
                <span>
                  {editingProduct
                    ? "EDIT PRODUCT"
                    : "NEW PRODUCT"}
                </span>

                <h3>
                  {editingProduct
                    ? "Edit Product"
                    : `Add ${categoryLabel} Product`}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close"
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >

              {/* ==========================================
                            PRODUCT NAME
              ========================================== */}

              <div className="product-form-group">

                <label htmlFor="product-name">
                  Product Name
                </label>

                <input
                  id="product-name"
                  name="name"
                  type="text"
                  value={
                    formData.name
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter product name"
                  disabled={saving}
                />

              </div>

              {/* ==========================================
                            DESCRIPTION
              ========================================== */}

              <div className="product-form-group">

                <label htmlFor="product-description">
                  Description
                </label>

                <textarea
                  id="product-description"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter product description"
                  rows="4"
                  disabled={saving}
                />

              </div>

              {/* ==========================================
                            PRODUCT DETAILS
              ========================================== */}

              <div className="product-form-row">

                <div className="product-form-group">

                  <label htmlFor="product-type">
                    Type
                  </label>

                  <input
                    id="product-type"
                    name="type"
                    type="text"
                    value={
                      formData.type
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. Necklace"
                    disabled={saving}
                  />

                </div>

                <div className="product-form-group">

                  <label htmlFor="product-purity">
                    Purity
                  </label>

                  <input
                    id="product-purity"
                    name="purity"
                    type="text"
                    value={
                      formData.purity
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. 22K"
                    disabled={saving}
                  />

                </div>

              </div>

              <div className="product-form-row">

                <div className="product-form-group">

                  <label htmlFor="product-weight">
                    Weight
                  </label>

                  <input
                    id="product-weight"
                    name="weight"
                    type="text"
                    value={
                      formData.weight
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. 18.5 g"
                    disabled={saving}
                  />

                </div>

                <div className="product-form-group">

                  <label htmlFor="product-style">
                    Style
                  </label>

                  <input
                    id="product-style"
                    name="style"
                    type="text"
                    value={
                      formData.style
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. Traditional"
                    disabled={saving}
                  />

                </div>

              </div>

              {/* ==========================================
                            DISPLAY ORDER / CATEGORY
              ========================================== */}

              <div className="product-form-row">

                <div className="product-form-group">

                  <label htmlFor="product-order">
                    Display Order
                  </label>

                  <input
                    id="product-order"
                    name="displayOrder"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      formData.displayOrder
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={saving}
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    Category
                  </label>

                  <div className="product-category-display">
                    {categoryLabel}
                  </div>

                </div>

              </div>

              {/* ==========================================
                            IMAGE 1
              ========================================== */}

              <div className="product-form-group">

                <label>
                  Product Image
                  {!editingProduct &&
                    " *"}
                </label>

                <label
                  htmlFor="product-image"
                  className={`product-image-input ${
                    selectedImage
                      ? "product-image-input-selected"
                      : ""
                  }`}
                >

                  <FaImage />

                  <strong>
                    {selectedImage
                      ? selectedImage.name
                      : editingProduct
                        ? "Choose new image (optional)"
                        : "Choose product image"}
                  </strong>

                  <span>
                    JPG, PNG, WebP or AVIF · Max 10MB
                  </span>

                </label>

                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  hidden
                  onChange={
                    handleImageChange
                  }
                  disabled={saving}
                />

              </div>

              {/* ==========================================
                            IMAGE 2
              ========================================== */}

              {!editingProduct && (
                <div className="product-form-group">

                  <label>
                    Second Product Image
                    {" (Optional)"}
                  </label>

                  <label
                    htmlFor="product-image-2"
                    className={`product-image-input ${
                      selectedImage2
                        ? "product-image-input-selected"
                        : ""
                    }`}
                  >

                    <FaImage />

                    <strong>
                      {selectedImage2
                        ? selectedImage2.name
                        : "Choose second product image"}
                    </strong>

                    <span>
                      JPG, PNG, WebP or AVIF · Max 10MB
                    </span>

                  </label>

                  <input
                    id="product-image-2"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    hidden
                    onChange={
                      handleImage2Change
                    }
                    disabled={saving}
                  />

                </div>
              )}

              {/* ==========================================
                            FORM ACTIONS
              ========================================== */}

              <div className="product-form-actions">

                <button
                  type="button"
                  className="product-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="product-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSyncAlt className="products-spin" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />

                      {editingProduct
                        ? "Update Product"
                        : "Add Product"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==========================================
                    ERROR POPUP
      ========================================== */}

      {showErrorPopup && (
        <div
          className="product-error-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeErrorPopup();
            }
          }}
        >

          <div
            className="product-error-popup"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="product-error-title"
          >

            <div className="product-error-icon">
              <FaExclamationTriangle />
            </div>

            <div className="product-error-content">

              <h3 id="product-error-title">
                Something went wrong
              </h3>

              <p>
                {errorPopupMessage}
              </p>

            </div>

            <button
              type="button"
              className="product-error-close"
              onClick={
                closeErrorPopup
              }
              aria-label="Close error"
            >
              <FaTimes />
            </button>

            <button
              type="button"
              className="product-error-ok"
              onClick={
                closeErrorPopup
              }
            >
              OK
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Products;