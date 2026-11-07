
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { getToken } from "../../utils/auth";

import "./Collections.css";

const COLLECTION_ORDER = ["GOLD", "DIAMOND", "POLKI"];

function getErrorMessage(data, fallback) {
  return data?.message || fallback;
}

function Collections() {
  const [collections, setCollections] = useState([]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [savingCategory, setSavingCategory] = useState("");
  const [notice, setNotice] = useState(null);

  async function loadCollections() {
    setLoading(true);
    setLoadingError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/collections/admin`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to load collections.")
        );
      }

      const ordered = [...(data.collections || [])].sort(
        (a, b) =>
          COLLECTION_ORDER.indexOf(a.category) -
          COLLECTION_ORDER.indexOf(b.category)
      );

      setCollections(ordered);
    } catch (error) {
      setLoadingError(error.message || "Unable to load collections.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCollections();
  }, []);

  function updateField(category, field, value) {
    setCollections((previous) =>
      previous.map((collection) =>
        collection.category === category
          ? { ...collection, [field]: value }
          : collection
      )
    );
  }

  function handleFileChange(category, file) {
    setFiles((previous) => ({
      ...previous,
      [category]: file || null,
    }));
  }

  async function handleSave(collection) {
    setNotice(null);
    setSavingCategory(collection.category);

    try {
      const formData = new FormData();

      formData.append("title", collection.title);
      formData.append("description", collection.description);
      formData.append("active", String(collection.active));

      const selectedFile = files[collection.category];

      if (selectedFile) {
        formData.append("bannerImage", selectedFile);
      }

      const response = await fetch(
        `${API_BASE_URL}/collections/${collection.category}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to save collection.")
        );
      }

      setCollections((previous) =>
        previous.map((item) =>
          item.category === collection.category
            ? data.collection
            : item
        )
      );

      setFiles((previous) => ({
        ...previous,
        [collection.category]: null,
      }));

      setNotice({
        type: "success",
        text: `${data.collection.title} saved successfully.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Unable to save collection.",
      });
    } finally {
      setSavingCategory("");
    }
  }

  const serverBaseUrl = API_BASE_URL.replace(/\/api\/?$/, "");

  function getBannerUrl(collection) {
    const selectedFile = files[collection.category];

    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }

    if (collection.bannerImage) {
      if (/^https?:\/\//i.test(collection.bannerImage)) {
        return collection.bannerImage;
      }

      return `${serverBaseUrl}${collection.bannerImage}`;
    }

    const fallbackImages = {
      GOLD: "/images/gold.jpg",
      DIAMOND: "/images/diamond.jpg",
      POLKI: "/images/polki.jpg",
    };

    return fallbackImages[collection.category];
  }

  if (loading) {
    return <div className="collections-admin-loading">Loading collections...</div>;
  }

  return (
    <section className="collections-admin-page">
      <header className="collections-admin-heading">
        <div>
          <span className="collections-admin-eyebrow">
            WEBSITE CONTENT
          </span>
          <h2>Manage Collections</h2>
          <p>
            Update the banners, titles and descriptions shown on your
            public landing page.
          </p>
        </div>
      </header>

      {notice && (
        <div
          className={`collections-admin-notice collections-admin-notice-${notice.type}`}
          role="status"
        >
          {notice.text}
        </div>
      )}

      {loadingError && (
        <div className="collections-admin-notice collections-admin-notice-error">
          <p>{loadingError}</p>
          <button type="button" onClick={loadCollections}>
            Try again
          </button>
        </div>
      )}

      {!loadingError && collections.length === 0 && (
        <div className="collections-admin-empty">
          No collections found. Run the collection seed script first.
        </div>
      )}

      <div className="collections-admin-list">
        {collections.map((collection) => (
          <article
            className="collections-admin-card"
            key={collection.category}
          >
            <div className="collections-admin-card-header">
              <div>
                <span className="collections-admin-category">
                  {collection.category}
                </span>
                <h3>{collection.title}</h3>
              </div>

              <span
                className={`collections-admin-status ${
                  collection.active ? "is-active" : "is-inactive"
                }`}
              >
                {collection.active ? "Visible on website" : "Hidden"}
              </span>
            </div>

            <div className="collections-admin-editor">
              <div className="collections-admin-image-column">
                <div className="collections-admin-image-preview">
                  <img
                    src={getBannerUrl(collection)}
                    alt={`${collection.title} banner preview`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src =
                        `/images/${collection.category.toLowerCase()}.jpg`;
                    }}
                  />
                </div>

                <label className="collections-admin-file-label">
                  <span>Choose banner image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(event) =>
                      handleFileChange(
                        collection.category,
                        event.target.files?.[0] || null
                      )
                    }
                  />
                </label>

                <small>
                  JPG, PNG, WebP or AVIF. Maximum 10 MB.
                </small>

                {files[collection.category] && (
                  <small className="collections-admin-selected-file">
                    Selected: {files[collection.category].name}
                  </small>
                )}
              </div>

              <div className="collections-admin-fields">
                <label>
                  Collection title
                  <input
                    type="text"
                    value={collection.title}
                    onChange={(event) =>
                      updateField(
                        collection.category,
                        "title",
                        event.target.value
                      )
                    }
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={collection.description}
                    onChange={(event) =>
                      updateField(
                        collection.category,
                        "description",
                        event.target.value
                      )
                    }
                    rows={5}
                    maxLength={3000}
                    required
                  />
                </label>

                <label className="collections-admin-active-toggle">
                  <input
                    type="checkbox"
                    checked={collection.active}
                    onChange={(event) =>
                      updateField(
                        collection.category,
                        "active",
                        event.target.checked
                      )
                    }
                  />
                  Show this collection on the landing page
                </label>

                <button
                  type="button"
                  className="collections-admin-save"
                  onClick={() => handleSave(collection)}
                  disabled={savingCategory !== ""}
                >
                  {savingCategory === collection.category
                    ? "Saving..."
                    : `Save ${collection.title}`}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Collections;
