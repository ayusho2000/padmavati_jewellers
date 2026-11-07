import { useEffect, useState } from "react";
import { API_BASE_URL, SERVER_BASE_URL } from "../../config/api";
import "./Instagram.css";

function Instagram() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMediaUrl = (media) => {
    if (!media) return "";

    if (media.startsWith("http://") || media.startsWith("https://")) {
      return media;
    }

    return `${SERVER_BASE_URL}${media.startsWith("/") ? "" : "/"}${media}`;
  };

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/instagram?active=true`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          const sortedPosts = [...(data.posts || [])].sort(
            (a, b) => a.displayOrder - b.displayOrder
          );

          setPosts(sortedPosts);
        }
      } catch (error) {
        console.error("Failed to load Instagram posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

  return (
    <section className="instagram-section" id="instagram">
      <div className="instagram-heading">
        <span>FOLLOW OUR JOURNEY</span>

        <h2>Life At Padmavati</h2>

        <p>
          Discover our latest jewellery creations, behind-the-scenes
          moments and stories from Padmavati Jewellers.
        </p>
      </div>

      {loading ? (
        <div className="instagram-message">
          Loading Instagram...
        </div>
      ) : posts.length > 0 ? (
        <div className="instagram-grid">
          {posts.map((post) => {
            const mediaUrl = getMediaUrl(post.media);

            const mediaContent =
              post.mediaType === "VIDEO" ? (
                <video
                  src={mediaUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={post.caption || "Padmavati Jewellers"}
                  loading="lazy"
                />
              );

            return (
              <article
                className="instagram-card"
                key={post.id}
              >
                {post.link ? (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="instagram-media"
                    aria-label="View Instagram post"
                  >
                    {mediaContent}

                    <div className="instagram-overlay">
                      <i className="fa-brands fa-instagram"></i>
                    </div>
                  </a>
                ) : (
                  <div className="instagram-media">
                    {mediaContent}

                    <div className="instagram-overlay">
                      <i className="fa-brands fa-instagram"></i>
                    </div>
                  </div>
                )}

                {post.caption && (
                  <div className="instagram-caption">
                    {post.caption}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="instagram-message">
          <p>Our latest moments will appear here soon.</p>
        </div>
      )}
    </section>
  );
}

export default Instagram;