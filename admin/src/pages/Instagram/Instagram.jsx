import { useEffect, useState } from "react";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaTimes,
  FaExclamationTriangle,
  FaSave,
  FaImage,
  FaVideo,
  FaExternalLinkAlt,
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";
import { getToken } from "../../utils/auth";

import "./Instagram.css";

const emptyForm = {
  mediaType: "IMAGE",
  media: null,
  link: "",
  caption: "",
  displayOrder: 1,
  active: true,
};

function Instagram() {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [mediaPreview, setMediaPreview] = useState("");

  const [success, setSuccess] = useState("");

  const [showErrorPopup, setShowErrorPopup] =
    useState(false);

  const [errorPopupMessage, setErrorPopupMessage] =
    useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  /* =========================================================
     MEDIA URL
  ========================================================= */

  function getMediaUrl(media) {
    if (!media) {
      return "";
    }

    if (
      media.startsWith("http://") ||
      media.startsWith("https://")
    ) {
      return media;
    }

    return `http://localhost:5000${media.startsWith("/") ? "" : "/"}${media}`;
  }

  /* =========================================================
     FETCH POSTS
  ========================================================= */

  async function fetchPosts() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/instagram`
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The server returned an invalid response. Please make sure the backend is running."
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load Instagram posts."
        );
      }

      setPosts(data.posts || []);
    } catch (error) {
      showError(
        error.message ||
          "Unable to load Instagram posts."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     ERROR
  ========================================================= */

  function showError(message) {
    setErrorPopupMessage(message);
    setShowErrorPopup(true);
  }

  /* =========================================================
     SUCCESS
  ========================================================= */

  function showSuccess(message) {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  /* =========================================================
     NEXT DISPLAY ORDER
  ========================================================= */

  function getNextDisplayOrder() {
    if (!posts.length) {
      return 1;
    }

    const orders = posts
      .map((post) => Number(post.displayOrder))
      .filter((order) =>
        Number.isInteger(order)
      );

    if (!orders.length) {
      return 1;
    }

    return Math.max(...orders) + 1;
  }

  /* =========================================================
     OPEN ADD
  ========================================================= */

  function openAddForm() {
    setEditingPost(null);

    setFormData({
      ...emptyForm,
      displayOrder: getNextDisplayOrder(),
    });

    setMediaPreview("");

    setShowForm(true);
  }

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  function openEditForm(post) {
    setEditingPost(post);

    setFormData({
      mediaType: post.mediaType || "IMAGE",
      media: null,
      link: post.link || "",
      caption: post.caption || "",
      displayOrder:
        post.displayOrder ?? 1,
      active: post.active !== false,
    });

    setMediaPreview(
      post.media
        ? getMediaUrl(post.media)
        : ""
    );

    setShowForm(true);
  }

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingPost(null);
    setFormData(emptyForm);
    setMediaPreview("");
  }

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  function handleInputChange(event) {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = event.target;

    if (type === "file") {
      const file = files?.[0] || null;

      setFormData((previous) => ({
        ...previous,
        media: file,
      }));

      if (file) {
        const previewUrl =
          URL.createObjectURL(file);

        setMediaPreview(previewUrl);
      }

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /* =========================================================
     DUPLICATE DISPLAY ORDER
  ========================================================= */

  function checkDuplicateDisplayOrder() {
    const order =
      Number(formData.displayOrder);

    const duplicate = posts.find(
      (post) =>
        Number(post.displayOrder) === order &&
        post.id !== editingPost?.id
    );

    if (duplicate) {
      showError(
        `Display order ${order} is already being used. Please choose a different display order.`
      );

      return true;
    }

    return false;
  }

  /* =========================================================
     VALIDATION
  ========================================================= */

  function validateForm() {
    const displayOrder =
      Number(formData.displayOrder);

    if (!editingPost && !formData.media) {
      showError("Please select an image or video.");
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

    if (
      formData.link.trim() &&
      !/^https?:\/\/.+/i.test(
        formData.link.trim()
      )
    ) {
      showError(
        "Please enter a valid URL starting with http:// or https://."
      );

      return false;
    }

    if (
      formData.caption.trim().length > 500
    ) {
      showError(
        "Caption cannot exceed 500 characters."
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
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      const isEditing =
        Boolean(editingPost);

      /*
        CREATE
        Uses multipart/form-data.

        UPDATE
        Sends the editable text fields first.
        Media replacement is handled separately by the
        backend replace-media endpoint.
      */

      let response;

      if (!isEditing) {
        const formDataToSend =
          new FormData();

        formDataToSend.append(
          "mediaType",
          formData.mediaType
        );

        formDataToSend.append(
          "media",
          formData.media
        );

        if (formData.link.trim()) {
          formDataToSend.append(
            "link",
            formData.link.trim()
          );
        }

        if (formData.caption.trim()) {
          formDataToSend.append(
            "caption",
            formData.caption.trim()
          );
        }

        formDataToSend.append(
          "displayOrder",
          String(
            Number(formData.displayOrder)
          )
        );

        formDataToSend.append(
          "active",
          String(formData.active)
        );

        response = await fetch(
          `${API_BASE_URL}/instagram`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formDataToSend,
          }
        );
      } else {
        const payload = {
          mediaType: formData.mediaType,

          link:
            formData.link.trim() || null,

          caption:
            formData.caption.trim() || null,

          displayOrder:
            Number(formData.displayOrder),

          active:
            Boolean(formData.active),
        };

        response = await fetch(
          `${API_BASE_URL}/instagram/${editingPost.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(payload),
          }
        );
      }

      const contentType =
        response.headers.get("content-type") ||
        "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "The server returned an invalid response. Please check the backend."
        );
      }

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Unable to update Instagram post."
              : "Unable to create Instagram post.")
        );
      }

      /*
        If editing and a new media file was selected,
        replace the existing media after updating
        the post information.
      */

      if (
        isEditing &&
        formData.media
      ) {
        const mediaFormData =
          new FormData();

        mediaFormData.append(
          "media",
          formData.media
        );

        const replaceResponse =
          await fetch(
            `${API_BASE_URL}/instagram/${editingPost.id}/media`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body: mediaFormData,
            }
          );

        const replaceContentType =
          replaceResponse.headers.get(
            "content-type"
          ) || "";

        if (
          !replaceContentType.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "The server returned an invalid response while replacing media."
          );
        }

        const replaceData =
          await replaceResponse.json();

        if (
          !replaceResponse.ok ||
          !replaceData.success
        ) {
          throw new Error(
            replaceData.message ||
              "Unable to replace Instagram media."
          );
        }
      }

      showSuccess(
        isEditing
          ? "Instagram post updated successfully."
          : "Instagram post added successfully."
      );

      closeForm();

      await fetchPosts();
    } catch (error) {
      console.error(
        "INSTAGRAM SAVE ERROR:",
        error
      );

      showError(
        error.message ||
          "Something went wrong while saving the Instagram post."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     ACTIVATE / DEACTIVATE
  ========================================================= */

  async function handleToggle(post) {
    try {
      setActionLoading(post.id);

      const token = getToken();

      const endpoint = post.active
        ? "deactivate"
        : "activate";

      const response = await fetch(
        `${API_BASE_URL}/instagram/${post.id}/${endpoint}`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to change Instagram post status."
        );
      }

      showSuccess(
        post.active
          ? "Instagram post deactivated successfully."
          : "Instagram post activated successfully."
      );

      await fetchPosts();
    } catch (error) {
      showError(
        error.message ||
          "Unable to change Instagram post status."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(post) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this Instagram post?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(post.id);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/instagram/${post.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete Instagram post."
        );
      }

      showSuccess(
        "Instagram post deleted successfully."
      );

      await fetchPosts();
    } catch (error) {
      showError(
        error.message ||
          "Unable to delete Instagram post."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /* =========================================================
     RENDER MEDIA
  ========================================================= */

  function renderMedia(post) {
    const mediaUrl =
      getMediaUrl(post.media);

    if (
      post.mediaType === "VIDEO"
    ) {
      return (
        <video
          src={mediaUrl}
          className="instagram-card-media"
          muted
          loop
          playsInline
          controls
        />
      );
    }

    return (
      <img
        src={mediaUrl}
        alt={
          post.caption ||
          "Instagram post"
        }
        className="instagram-card-media"
      />
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="instagram-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="instagram-page-header">

        <div>
          <span className="instagram-page-label">
            WEBSITE CONTENT
          </span>

          <h1>Instagram</h1>

          <p>
            Manage Instagram images,
            videos and links.
          </p>
        </div>

        <button
          type="button"
          className="instagram-add-button"
          onClick={openAddForm}
        >
          <FaPlus />
          Add Post
        </button>

      </div>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="instagram-success-message">
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="instagram-toolbar">

        <div className="instagram-count">
          <strong>
            {posts.length}
          </strong>

          <span>
            {posts.length === 1
              ? "Post"
              : "Posts"}
          </span>
        </div>

        <button
          type="button"
          className="instagram-refresh-button"
          onClick={fetchPosts}
          disabled={loading}
        >
          <FaSyncAlt
            className={
              loading
                ? "instagram-spin"
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
        <div className="instagram-loading">

          <FaSyncAlt className="instagram-spin" />

          <p>
            Loading Instagram posts...
          </p>

        </div>
      ) : posts.length === 0 ? (

        /* ===================================================
           EMPTY
        =================================================== */

        <div className="instagram-empty">

          <div className="instagram-empty-icon">
            <FaInstagramIcon />
          </div>

          <h3>
            No Instagram posts yet
          </h3>

          <p>
            Add your first Instagram
            image or video.
          </p>

          <button
            type="button"
            onClick={openAddForm}
          >
            <FaPlus />
            Add Post
          </button>

        </div>

      ) : (

        /* ===================================================
           GRID
        =================================================== */

        <div className="instagram-grid">

          {posts.map((post) => (
            <div
              className={`instagram-card ${
                !post.active
                  ? "instagram-card-inactive"
                  : ""
              }`}
              key={post.id}
            >

              <div className="instagram-media-wrapper">

                {renderMedia(post)}

                <div className="instagram-media-type">

                  {post.mediaType ===
                  "VIDEO" ? (
                    <>
                      <FaVideo />
                      VIDEO
                    </>
                  ) : (
                    <>
                      <FaImage />
                      IMAGE
                    </>
                  )}

                </div>

                <div
                  className={`instagram-status ${
                    post.active
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {post.active ? (
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

              <div className="instagram-card-content">

                <div className="instagram-card-top">

                  <span>
                    #{post.displayOrder}
                  </span>

                  {post.link && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noreferrer"
                      className="instagram-link"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  )}

                </div>

                {post.caption && (
                  <p className="instagram-caption">
                    {post.caption}
                  </p>
                )}

              </div>

              <div className="instagram-card-actions">

                <button
                  type="button"
                  className="instagram-edit-button"
                  onClick={() =>
                    openEditForm(post)
                  }
                  disabled={
                    actionLoading ===
                    post.id
                  }
                >
                  <FaEdit />
                  Edit
                </button>

                <button
                  type="button"
                  className="instagram-toggle-button"
                  onClick={() =>
                    handleToggle(post)
                  }
                  disabled={
                    actionLoading ===
                    post.id
                  }
                >
                  {post.active ? (
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
                  className="instagram-delete-button"
                  onClick={() =>
                    handleDelete(post)
                  }
                  disabled={
                    actionLoading ===
                    post.id
                  }
                >
                  <FaTrash />
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <div className="instagram-modal-overlay">

          <div className="instagram-modal">

            <div className="instagram-modal-header">

              <div>
                <span>
                  {editingPost
                    ? "EDIT INSTAGRAM POST"
                    : "NEW INSTAGRAM POST"}
                </span>

                <h2>
                  {editingPost
                    ? "Edit Instagram Post"
                    : "Add Instagram Post"}
                </h2>
              </div>

              <button
                type="button"
                className="instagram-modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="instagram-form"
              onSubmit={handleSubmit}
            >

              {/* MEDIA TYPE */}

              <div className="instagram-form-group">

                <label htmlFor="mediaType">
                  Media Type
                  <span>*</span>
                </label>

                <select
                  id="mediaType"
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="IMAGE">
                    Image
                  </option>

                  <option value="VIDEO">
                    Video
                  </option>
                </select>

              </div>

              {/* MEDIA */}

              <div className="instagram-form-group">

                <label htmlFor="media">
                  {editingPost
                    ? "Replace Media"
                    : "Media"}

                  {!editingPost && (
                    <span>*</span>
                  )}
                </label>

                <input
                  id="media"
                  name="media"
                  type="file"
                  accept={
                    formData.mediaType ===
                    "VIDEO"
                      ? "video/mp4,video/webm,video/quicktime"
                      : "image/jpeg,image/png,image/webp,image/avif"
                  }
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <small>
                  {formData.mediaType ===
                  "VIDEO"
                    ? "MP4, WebM or MOV"
                    : "JPG, PNG, WebP or AVIF"}
                </small>

              </div>

              {/* PREVIEW */}

              {mediaPreview && (
                <div className="instagram-preview">

                  <span>
                    Preview
                  </span>

                  {formData.mediaType ===
                    "VIDEO" ? (
                    <video
                      src={mediaPreview}
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Instagram preview"
                    />
                  )}

                </div>
              )}

              {/* LINK */}

              <div className="instagram-form-group">

                <label htmlFor="link">
                  Instagram Link
                  <small>Optional</small>
                </label>

                <input
                  id="link"
                  name="link"
                  type="url"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/..."
                  disabled={saving}
                />

              </div>

              {/* CAPTION */}

              <div className="instagram-form-group">

                <label htmlFor="caption">
                  Caption
                  <small>Optional</small>
                </label>

                <textarea
                  id="caption"
                  name="caption"
                  value={formData.caption}
                  onChange={handleInputChange}
                  placeholder="Enter Instagram caption..."
                  rows={4}
                  maxLength={500}
                  disabled={saving}
                />

                <div className="instagram-character-count">
                  {formData.caption.length}/500
                </div>

              </div>

              {/* DISPLAY ORDER */}

              <div className="instagram-form-group">

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

              {/* ACTIVE */}

              <label className="instagram-active-toggle">

                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <span className="instagram-toggle-slider"></span>

                <span className="instagram-toggle-text">
                  Active on website
                </span>

              </label>

              {/* ACTIONS */}

              <div className="instagram-form-actions">

                <button
                  type="button"
                  className="instagram-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="instagram-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSyncAlt className="instagram-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />

                      {editingPost
                        ? "Update Post"
                        : "Save Post"}
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
        <div className="instagram-error-overlay">

          <div className="instagram-error-popup">

            <button
              type="button"
              className="instagram-error-close"
              onClick={() =>
                setShowErrorPopup(false)
              }
            >
              <FaTimes />
            </button>

            <div className="instagram-error-icon">
              <FaExclamationTriangle />
            </div>

            <div className="instagram-error-content">

              <h3>
                Something went wrong
              </h3>

              <p>
                {errorPopupMessage}
              </p>

            </div>

            <button
              type="button"
              className="instagram-error-ok"
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

/* =========================================================
   INSTAGRAM ICON
========================================================= */

function FaInstagramIcon() {
  return (
    <span className="instagram-empty-instagram-icon">
      ◎
    </span>
  );
}

export default Instagram;