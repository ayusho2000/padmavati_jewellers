import { useEffect, useState } from "react";

import {
  FaVideo,
  FaUpload,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";
import { getToken } from "../../utils/auth";

import "./Hero.css";

function Hero() {
  const [hero, setHero] = useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function fetchHero() {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/hero`,
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
            "Unable to load hero video."
        );
      }

      setHero(data.hero || null);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load hero video."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHero();
  }, []);

  function handleFileChange(event) {
    const file =
      event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select an MP4, WebM or MOV video."
      );

      event.target.value = "";
      setSelectedFile(null);

      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError(
        "Video size must be less than 100MB."
      );

      event.target.value = "";
      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError(
        "Please select a video first."
      );

      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const formData = new FormData();

      formData.append(
        "video",
        selectedFile
      );

      const endpoint = hero
        ? `${API_BASE_URL}/hero`
        : `${API_BASE_URL}/hero`;

      const method = hero
        ? "PUT"
        : "POST";

      const response = await fetch(
        endpoint,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to upload hero video."
        );
      }

      setHero(data.hero);

      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "hero-video-input"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      setSuccess(
        hero
          ? "Hero video replaced successfully."
          : "Hero video uploaded successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to upload hero video."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleActivation(action) {
    if (!hero) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const endpoint =
        action === "activate"
          ? `${API_BASE_URL}/hero/activate`
          : `${API_BASE_URL}/hero/deactivate`;

      const response = await fetch(
        endpoint,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to ${action} hero video.`
        );
      }

      setHero(data.hero);

      setSuccess(
        action === "activate"
          ? "Hero video activated successfully."
          : "Hero video deactivated successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update hero video."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!hero) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete the hero video?"
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

const response = await fetch(
  `${API_BASE_URL}/hero`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete hero video."
        );
      }

      setHero(null);

      setSuccess(
        "Hero video deleted successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete hero video."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function getVideoUrl(video) {
    if (!video) {
      return "";
    }

    if (
      video.startsWith("http://") ||
      video.startsWith("https://")
    ) {
      return video;
    }

    return `http://localhost:5000${video.startsWith("/") ? "" : "/"}${video}`;
  }

  return (
    <div className="hero-management">

      {/* ==========================================
                    PAGE HEADER
      ========================================== */}

      <div className="hero-page-header">

        <div>
          <span className="hero-page-eyebrow">
            WEBSITE CONTENT
          </span>

          <h2>
            Hero Video
          </h2>

          <p>
            Manage the video displayed in
            the main website hero section.
          </p>
        </div>

        <button
          type="button"
          className="hero-refresh-button"
          onClick={fetchHero}
          disabled={loading}
        >
          <FaSyncAlt
            className={
              loading
                ? "hero-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ==========================================
                    MESSAGES
      ========================================== */}

      {error && (
        <div className="hero-message hero-error">
          <FaTimesCircle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="hero-message hero-success">
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* ==========================================
                    CONTENT
      ========================================== */}

      {loading ? (
        <div className="hero-loading">
          <FaSyncAlt className="hero-spin" />

          <span>
            Loading hero video...
          </span>
        </div>
      ) : (
        <div className="hero-management-grid">

          {/* ========================================
                    CURRENT VIDEO
          ======================================== */}

          <section className="hero-card">

            <div className="hero-card-header">

              <div>
                <span className="hero-card-number">
                  01
                </span>

                <h3>
                  Current Hero Video
                </h3>
              </div>

              {hero && (
                <span
                  className={`hero-status ${
                    hero.active
                      ? "hero-status-active"
                      : "hero-status-inactive"
                  }`}
                >
                  {hero.active ? (
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
                </span>
              )}

            </div>

            {hero ? (
              <>
                <div className="hero-video-wrapper">

                  <video
                    key={hero.video}
                    controls
                    playsInline
                    preload="metadata"
                  >
                    <source
                      src={getVideoUrl(
                        hero.video
                      )}
                    />

                    Your browser does not
                    support video playback.
                  </video>

                </div>

                <div className="hero-video-details">

                  <div>
                    <span>
                      Video
                    </span>

                    <strong>
                      {hero.video}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      {hero.active
                        ? "Published"
                        : "Not Published"}
                    </strong>
                  </div>

                </div>

                <div className="hero-actions">

                  {hero.active ? (
                    <button
                      type="button"
                      className="hero-action-button hero-deactivate"
                      onClick={() =>
                        handleActivation(
                          "deactivate"
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <FaTimesCircle />

                      {actionLoading
                        ? "Updating..."
                        : "Deactivate"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hero-action-button hero-activate"
                      onClick={() =>
                        handleActivation(
                          "activate"
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <FaCheckCircle />

                      {actionLoading
                        ? "Updating..."
                        : "Activate"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="hero-action-button hero-delete"
                    onClick={handleDelete}
                    disabled={
                      actionLoading
                    }
                  >
                    <FaTrash />

                    Delete
                  </button>

                </div>
              </>
            ) : (
              <div className="hero-empty">

                <FaVideo />

                <h4>
                  No Hero Video
                </h4>

                <p>
                  Upload a hero video to
                  display it on the website.
                </p>

              </div>
            )}

          </section>

          {/* ========================================
                    UPLOAD / REPLACE
          ======================================== */}

          <section className="hero-card">

            <div className="hero-card-header">

              <div>
                <span className="hero-card-number">
                  02
                </span>

                <h3>
                  {hero
                    ? "Replace Hero Video"
                    : "Upload Hero Video"}
                </h3>
              </div>

              <FaUpload className="hero-card-icon" />

            </div>

            <form
              className="hero-upload-form"
              onSubmit={handleUpload}
            >

              <label
                htmlFor="hero-video-input"
                className={`hero-upload-area ${
                  selectedFile
                    ? "hero-upload-selected"
                    : ""
                }`}
              >

                <FaUpload />

                <strong>
                  {selectedFile
                    ? selectedFile.name
                    : "Choose Hero Video"}
                </strong>

                <span>
                  MP4, WebM or MOV
                </span>

                <small>
                  Maximum file size: 100MB
                </small>

              </label>

              <input
                id="hero-video-input"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={
                  handleFileChange
                }
                hidden
              />

              {selectedFile && (
                <div className="hero-selected-file">

                  <div>
                    <strong>
                      Selected file
                    </strong>

                    <span>
                      {(
                        selectedFile.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(
                        null
                      );

                      const input =
                        document.getElementById(
                          "hero-video-input"
                        );

                      if (input) {
                        input.value =
                          "";
                      }
                    }}
                  >
                    Remove
                  </button>

                </div>
              )}

              <button
                type="submit"
                className="hero-upload-button"
                disabled={
                  uploading ||
                  !selectedFile
                }
              >
                <FaUpload />

                {uploading
                  ? "Uploading..."
                  : hero
                    ? "Replace Hero Video"
                    : "Upload Hero Video"}
              </button>

            </form>

            <div className="hero-upload-note">
              <strong>
                Recommended:
              </strong>

              <span>
                Use a compressed MP4 video
                optimized for web playback.
              </span>
            </div>

          </section>

        </div>
      )}

    </div>
  );
}

export default Hero;