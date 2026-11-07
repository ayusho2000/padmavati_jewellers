import { useEffect, useState } from "react";

import {
  FaStar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaTimes,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";
import { getToken } from "../../utils/auth";

import "./Testimonials.css";

const emptyForm = {
  customerName: "",
  designation: "",
  text: "",
  rating: 5,
  displayOrder: 1,
  active: true,
};

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [success, setSuccess] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  /* =========================================================
     FETCH TESTIMONIALS
  ========================================================= */

  async function fetchTestimonials() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/testimonials`,
        {
          method: "GET",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(
          "The server returned an invalid response. Please make sure the backend is running."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load testimonials."
        );
      }

      setTestimonials(data.testimonials || []);
    } catch (error) {
      showError(
        error.message || "Unable to load testimonials."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     ERROR POPUP
  ========================================================= */

  function showError(message) {
    setErrorPopupMessage(message);
    setShowErrorPopup(true);
  }

  /* =========================================================
     SUCCESS MESSAGE
  ========================================================= */

  function showSuccess(message) {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  /* =========================================================
     FORM
  ========================================================= */

  function openAddForm() {
    setEditingTestimonial(null);

    setFormData({
      ...emptyForm,
      displayOrder: getNextDisplayOrder(),
    });

    setShowForm(true);
  }

  function openEditForm(testimonial) {
    setEditingTestimonial(testimonial);

    setFormData({
      customerName: testimonial.customerName || "",
      designation: testimonial.designation || "",
      text: testimonial.text || "",
      rating: testimonial.rating ?? 5,
      displayOrder: testimonial.displayOrder ?? 1,
      active: testimonial.active !== false,
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingTestimonial(null);
    setFormData(emptyForm);
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /* =========================================================
     NEXT DISPLAY ORDER
  ========================================================= */

  function getNextDisplayOrder() {
    if (!testimonials.length) {
      return 1;
    }

    const orders = testimonials
      .map((item) => Number(item.displayOrder))
      .filter((order) => Number.isInteger(order));

    if (!orders.length) {
      return 1;
    }

    return Math.max(...orders) + 1;
  }

  /* =========================================================
     DUPLICATE DISPLAY ORDER
  ========================================================= */

  function checkDuplicateDisplayOrder() {
    const order = Number(formData.displayOrder);

    const duplicate = testimonials.find(
      (testimonial) =>
        Number(testimonial.displayOrder) === order &&
        testimonial.id !== editingTestimonial?.id
    );

    if (duplicate) {
      showError(
        `Display order ${order} is already being used by "${duplicate.customerName}". Please choose a different display order.`
      );

      return true;
    }

    return false;
  }

  /* =========================================================
     VALIDATION
  ========================================================= */

  function validateForm() {
    const customerName =
      formData.customerName.trim();

    const text =
      formData.text.trim();

    const rating = Number(formData.rating);

    const displayOrder =
      Number(formData.displayOrder);

    if (!customerName) {
      showError("Customer name is required.");
      return false;
    }

    if (customerName.length > 100) {
      showError(
        "Customer name cannot exceed 100 characters."
      );
      return false;
    }

    if (!text) {
      showError("Testimonial text is required.");
      return false;
    }

    if (text.length > 1000) {
      showError(
        "Testimonial text cannot exceed 1000 characters."
      );
      return false;
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      showError(
        "Rating must be a whole number between 1 and 5."
      );
      return false;
    }

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0
    ) {
      showError(
        "Display order must be a non-negative whole number."
      );
      return false;
    }

    if (checkDuplicateDisplayOrder()) {
      return false;
    }

    return true;
  }

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

async function handleSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    setSaving(true);

    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please login again.");
    }

    const payload = {
      customerName: formData.customerName.trim(),
      designation: formData.designation.trim() || null,
      text: formData.text.trim(),
      rating: Number(formData.rating),
      displayOrder: Number(formData.displayOrder),
      active: Boolean(formData.active),
    };

    const isEditing = Boolean(editingTestimonial);

    const url = isEditing
      ? `${API_BASE_URL}/testimonials/${editingTestimonial.id}`
      : `${API_BASE_URL}/testimonials`;

    const response = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    /*
      Read the response safely.

      Some backend responses can occasionally have an unexpected
      content-type even when the body itself is valid JSON.
    */
    const responseText = await response.text();

    let data = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "The server returned an invalid response. Please check the backend."
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          (isEditing
            ? "Unable to update testimonial."
            : "Unable to create testimonial.")
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
          (isEditing
            ? "Unable to update testimonial."
            : "Unable to create testimonial.")
      );
    }

    showSuccess(
      isEditing
        ? "Testimonial updated successfully."
        : "Testimonial added successfully."
    );

    closeForm();

    await fetchTestimonials();
  } catch (error) {
    console.error("TESTIMONIAL SAVE ERROR:", error);

    showError(
      error.message ||
        "Something went wrong while saving the testimonial."
    );
  } finally {
    setSaving(false);
  }
}

  /* =========================================================
     ACTIVATE / DEACTIVATE
  ========================================================= */

  async function handleToggle(testimonial) {
    try {
      setActionLoading(testimonial.id);

      const token = getToken();

      const endpoint = testimonial.active
        ? "deactivate"
        : "activate";

      const response = await fetch(
        `${API_BASE_URL}/testimonials/${testimonial.id}/${endpoint}`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to change testimonial status."
        );
      }

      showSuccess(
        testimonial.active
          ? "Testimonial deactivated successfully."
          : "Testimonial activated successfully."
      );

      await fetchTestimonials();
    } catch (error) {
      showError(
        error.message ||
          "Unable to change testimonial status."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(testimonial) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the testimonial from "${testimonial.customerName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(testimonial.id);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/testimonials/${testimonial.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete testimonial."
        );
      }

      showSuccess(
        "Testimonial deleted successfully."
      );

      await fetchTestimonials();
    } catch (error) {
      showError(
        error.message ||
          "Unable to delete testimonial."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /* =========================================================
     RATING
  ========================================================= */

  function renderStars(rating) {
    return (
      <div className="testimonial-card-stars">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <FaStar
              key={index}
              className={
                index < rating
                  ? "star-active"
                  : "star-inactive"
              }
            />
          )
        )}
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="testimonials-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="testimonials-page-header">

        <div>
          <span className="testimonials-page-label">
            WEBSITE CONTENT
          </span>

          <h1>Testimonials</h1>

          <p>
            Manage customer testimonials,
            ratings and display order.
          </p>
        </div>

        <button
          type="button"
          className="testimonial-add-button"
          onClick={openAddForm}
        >
          <FaPlus />
          Add Testimonial
        </button>

      </div>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="testimonial-success-message">
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="testimonials-toolbar">

        <div className="testimonials-count">
          <strong>
            {testimonials.length}
          </strong>

          <span>
            {testimonials.length === 1
              ? "Testimonial"
              : "Testimonials"}
          </span>
        </div>

        <button
          type="button"
          className="testimonial-refresh-button"
          onClick={fetchTestimonials}
          disabled={loading}
        >
          <FaSyncAlt
            className={
              loading
                ? "testimonial-spin"
                : ""
            }
          />
          Refresh
        </button>

      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="testimonial-loading">
          <FaSyncAlt className="testimonial-spin" />

          <p>
            Loading testimonials...
          </p>
        </div>
      ) : testimonials.length === 0 ? (

        /* ===================================================
           EMPTY
        =================================================== */

        <div className="testimonial-empty">

          <div className="testimonial-empty-icon">
            <FaStar />
          </div>

          <h3>
            No testimonials yet
          </h3>

          <p>
            Add your first customer
            testimonial to display it
            on the website.
          </p>

          <button
            type="button"
            onClick={openAddForm}
          >
            <FaPlus />
            Add Testimonial
          </button>

        </div>

      ) : (

        /* ===================================================
           TESTIMONIAL GRID
        =================================================== */

        <div className="testimonials-grid">

          {testimonials.map(
            (testimonial) => (
              <div
                className={`testimonial-card ${
                  !testimonial.active
                    ? "testimonial-card-inactive"
                    : ""
                }`}
                key={testimonial.id}
              >

                <div className="testimonial-card-top">

                  <div className="testimonial-order">
                    #{testimonial.displayOrder}
                  </div>

                  <div
                    className={`testimonial-status ${
                      testimonial.active
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {testimonial.active ? (
                      <>
                        <FaCheckCircle />
                        Active
                      </>
                    ) : (
                      <>
                        <FaTimesCircle />
                        Inactive
                      </>
                    )}
                  </div>

                </div>

                <div className="testimonial-card-content">

                  <div className="testimonial-rating">
                    {renderStars(
                      testimonial.rating
                    )}
                  </div>

                  <p className="testimonial-text">
                    “{testimonial.text}”
                  </p>

                  <div className="testimonial-customer">

                    <div className="testimonial-avatar">
                      {testimonial.customerName
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </div>

                    <div>
                      <h3>
                        {testimonial.customerName}
                      </h3>

                      {testimonial.designation && (
                        <span>
                          {testimonial.designation}
                        </span>
                      )}
                    </div>

                  </div>

                </div>

                <div className="testimonial-card-actions">

                  <button
                    type="button"
                    className="testimonial-edit-button"
                    onClick={() =>
                      openEditForm(testimonial)
                    }
                    disabled={
                      actionLoading ===
                      testimonial.id
                    }
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="testimonial-toggle-button"
                    onClick={() =>
                      handleToggle(testimonial)
                    }
                    disabled={
                      actionLoading ===
                      testimonial.id
                    }
                  >
                    {testimonial.active ? (
                      <>
                        <FaTimesCircle />
                        Deactivate
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
                    className="testimonial-delete-button"
                    onClick={() =>
                      handleDelete(testimonial)
                    }
                    disabled={
                      actionLoading ===
                      testimonial.id
                    }
                  >
                    <FaTrash />
                    Delete
                  </button>

                </div>

              </div>
            )
          )}

        </div>
      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <div className="testimonial-modal-overlay">

          <div className="testimonial-modal">

            <div className="testimonial-modal-header">

              <div>
                <span>
                  {editingTestimonial
                    ? "EDIT TESTIMONIAL"
                    : "NEW TESTIMONIAL"}
                </span>

                <h2>
                  {editingTestimonial
                    ? "Edit Testimonial"
                    : "Add Testimonial"}
                </h2>
              </div>

              <button
                type="button"
                className="testimonial-modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="testimonial-form"
              onSubmit={handleSubmit}
            >

              {/* CUSTOMER NAME */}

              <div className="testimonial-form-group">

                <label htmlFor="customerName">
                  Customer Name
                  <span>*</span>
                </label>

                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  maxLength={100}
                  disabled={saving}
                />

              </div>

              {/* DESIGNATION */}

              <div className="testimonial-form-group">

                <label htmlFor="designation">
                  Designation
                  <small>Optional</small>
                </label>

                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Verified Customer"
                  maxLength={100}
                  disabled={saving}
                />

              </div>

              {/* TESTIMONIAL */}

              <div className="testimonial-form-group">

                <label htmlFor="text">
                  Customer Testimonial
                  <span>*</span>
                </label>

                <textarea
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Enter what the customer said..."
                  rows={6}
                  maxLength={1000}
                  disabled={saving}
                />

                <div className="testimonial-character-count">
                  {formData.text.length}/1000
                </div>

              </div>

              {/* RATING + DISPLAY ORDER */}

              <div className="testimonial-form-row">

                <div className="testimonial-form-group">

                  <label htmlFor="rating">
                    Rating
                    <span>*</span>
                  </label>

                  <select
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <option value={5}>
                      5 Stars
                    </option>

                    <option value={4}>
                      4 Stars
                    </option>

                    <option value={3}>
                      3 Stars
                    </option>

                    <option value={2}>
                      2 Stars
                    </option>

                    <option value={1}>
                      1 Star
                    </option>
                  </select>

                </div>

                <div className="testimonial-form-group">

                  <label htmlFor="displayOrder">
                    Display Order
                    <span>*</span>
                  </label>

                  <input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    disabled={saving}
                  />

                  <small>
                    Lower numbers appear first.
                  </small>

                </div>

              </div>

              {/* ACTIVE */}

              <label className="testimonial-active-toggle">

                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <span className="testimonial-toggle-slider"></span>

                <span className="testimonial-toggle-text">
                  Active on website
                </span>

              </label>

              {/* FORM ACTIONS */}

              <div className="testimonial-form-actions">

                <button
                  type="button"
                  className="testimonial-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="testimonial-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSyncAlt className="testimonial-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {editingTestimonial
                        ? "Update Testimonial"
                        : "Save Testimonial"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          ERROR POPUP
      ===================================================== */}

      {showErrorPopup && (
        <div className="testimonial-error-overlay">

          <div className="testimonial-error-popup">

            <button
              type="button"
              className="testimonial-error-close"
              onClick={() =>
                setShowErrorPopup(false)
              }
            >
              <FaTimes />
            </button>

            <div className="testimonial-error-icon">
              <FaExclamationTriangle />
            </div>

            <div className="testimonial-error-content">

              <h3>
                Something went wrong
              </h3>

              <p>
                {errorPopupMessage}
              </p>

            </div>

            <button
              type="button"
              className="testimonial-error-ok"
              onClick={() =>
                setShowErrorPopup(false)
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

export default Testimonials;