// import { Link } from "react-router-dom";

// import "./Collections.css";


// function Collections() {
//   return (
//     <>
//       {/* ===================================
//           PREMIUM COLLECTIONS HEADING
//       =================================== */}

//       <section className="collection-heading">

//         <span>PADMAVATI JEWELLERS</span>

//         <h2>
//           Explore Our Signature Creations
//         </h2>

//         <p>
//           From timeless Gold and dazzling Diamonds to exquisite Polki and
//           brilliant Solitaires, discover jewellery crafted to celebrate
//           every milestone with elegance and unmatched craftsmanship.
//         </p>

//       </section>


//       {/* ===================================
//           PREMIUM COLLECTIONS
//       =================================== */}

//       <section className="collections" id="collections">

//         {/* ===================================
//             GOLD
//         =================================== */}

//         <div className="collection-row">

//           <div className="collection-image">

//             <img
//               src="/images/gold.jpg"
//               alt="Gold Jewellery"
//             />

//           </div>


//           <div className="collection-content">

//             <span className="collection-subtitle">
//               PADMAVATI JEWELLERS
//             </span>

//             <h2>
//               Gold Jewellery
//             </h2>

//             <p>
//               Discover handcrafted gold jewellery designed for every
//               celebration. Every masterpiece reflects timeless elegance,
//               exceptional craftsmanship and unmatched luxury.
//             </p>

//             <Link
//               to="/products/gold"
//               className="collection-btn"
//             >
//               Explore Collection →
//             </Link>

//           </div>

//         </div>


//         {/* ===================================
//             DIAMOND
//         =================================== */}

//         <div className="collection-row reverse">

//           <div className="collection-image">

//             <img
//               src="/images/diamond.jpg"
//               alt="Diamond Jewellery"
//             />

//           </div>


//           <div className="collection-content">

//             <span className="collection-subtitle">
//               PADMAVATI JEWELLERS
//             </span>

//             <h2>
//               Diamond Jewellery
//             </h2>

//             <p>
//               Brilliant diamonds crafted to celebrate life's precious
//               moments with elegance and everlasting beauty.
//             </p>

//             <Link
//               to="/products/diamond"
//               className="collection-btn"
//             >
//               Explore Collection →
//             </Link>

//           </div>

//         </div>


//         {/* ===================================
//             POLKI
//         =================================== */}

//         <div className="collection-row">

//           <div className="collection-image">

//             <img
//               src="/images/polki.jpg"
//               alt="Polki Jewellery"
//             />

//           </div>


//           <div className="collection-content">

//             <span className="collection-subtitle">
//               PADMAVATI JEWELLERS
//             </span>

//             <h2>
//               Polki Jewellery
//             </h2>

//             <p>
//               Royal Polki creations inspired by Indian heritage,
//               handcrafted to perfection for weddings and grand occasions.
//             </p>

//             <Link
//               to="/products/polki"
//               className="collection-btn"
//             >
//               Explore Collection →
//             </Link>

//           </div>

//         </div>

//       </section>
//     </>
//   );
// }


// export default Collections;




import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { API_BASE_URL, SERVER_BASE_URL } from "../../config/api";
import "./Collections.css";

const DEFAULT_COLLECTIONS = [
  {
    category: "GOLD",
    title: "Gold Jewellery",
    description:
      "Discover handcrafted gold jewellery designed for every celebration. Every masterpiece reflects timeless elegance, exceptional craftsmanship and unmatched luxury.",
    bannerImage: "/images/gold.jpg",
  },
  {
    category: "DIAMOND",
    title: "Diamond Jewellery",
    description:
      "Brilliant diamonds crafted to celebrate life's precious moments with elegance and everlasting beauty.",
    bannerImage: "/images/diamond.jpg",
  },
  {
    category: "POLKI",
    title: "Polki Jewellery",
    description:
      "Royal Polki creations inspired by Indian heritage, handcrafted to perfection for weddings and grand occasions.",
    bannerImage: "/images/polki.jpg",
  },
];

const COLLECTION_LINKS = {
  GOLD: "/products/gold",
  DIAMOND: "/products/diamond",
  POLKI: "/products/polki",
};

function getImageUrl(image) {
  if (!image) return "";

  if (/^(https?:|data:|blob:)/i.test(image)) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${SERVER_BASE_URL}${image}`;
  }

  return `${SERVER_BASE_URL}/${image}`;
}

function Collections() {
  const [collections, setCollections] = useState(DEFAULT_COLLECTIONS);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCollections() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/collections`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load collections.");
        }

        const data = await response.json();

        if (Array.isArray(data.collections)) {
          const order = ["GOLD", "DIAMOND", "POLKI"];

          const received = data.collections
            .filter((item) => item.active !== false)
            .sort(
              (a, b) =>
                order.indexOf(a.category) -
                order.indexOf(b.category)
            );

          setCollections(
            received.length > 0 ? received : []
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          // Keep the existing local fallback content if the API is unavailable.
          console.error("Unable to load collections:", error);
        }
      }
    }

    fetchCollections();

    return () => controller.abort();
  }, []);

  return (
    <>
      <section className="collection-heading">
        <span>PADMAVATI JEWELLERS</span>

        <h2>Explore Our Signature Creations</h2>

        <p>
          From timeless Gold and dazzling Diamonds to exquisite Polki and
          brilliant Solitaires, discover jewellery crafted to celebrate
          every milestone with elegance and unmatched craftsmanship.
        </p>
      </section>

      <section className="collections" id="collections">
        {collections.map((collection, index) => {
          const fallback = DEFAULT_COLLECTIONS.find(
            (item) => item.category === collection.category
          );

          const fallbackImage =
            fallback?.bannerImage || "/images/gold.jpg";

          const imageUrl = collection.bannerImage
            ? getImageUrl(collection.bannerImage)
            : fallbackImage;

          return (
            <div
              className={`collection-row ${
                index % 2 === 1 ? "reverse" : ""
              }`}
              key={collection.category}
            >
              <div className="collection-image">
                <img
                  src={imageUrl}
                  alt={collection.title}
                  onError={(event) => {
                    if (event.currentTarget.src.endsWith(fallbackImage)) {
                      return;
                    }

                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImage;
                  }}
                  loading="lazy"
                />
              </div>

              <div className="collection-content">
                <span className="collection-subtitle">
                  PADMAVATI JEWELLERS
                </span>

                <h2>{collection.title}</h2>

                <p>{collection.description}</p>

                <Link
                  to={COLLECTION_LINKS[collection.category] || "/products"}
                  className="collection-btn"
                >
                  Explore Collection →
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

export default Collections;
