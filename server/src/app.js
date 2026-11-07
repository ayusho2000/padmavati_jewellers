// import express from "express";
// import cors from "cors";
// import path from "path";

// import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import heroRoutes from "./routes/heroRoutes.js";
// import productRoutes from "./routes/productRoutes.js";
// import testimonialRoutes from "./routes/testimonialRoutes.js";
// import instagramRoutes from "./routes/instagramRoutes.js";
// import contactRoutes from "./routes/contactRoutes.js";

// const app = express();


// /* =====================================================
//    CORS
// ===================================================== */

// app.use(
//   cors({
//     origin: [
//       process.env.CLIENT_URL,
//       process.env.ADMIN_URL,
//     ],
//     credentials: true,
//   })
// );


// /* =====================================================
//    BODY PARSERS
// ===================================================== */

// app.use(
//   express.json({
//     limit: "10mb",
//   })
// );

// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );


// /* =====================================================
//    STATIC UPLOADS
// ===================================================== */

// app.use(
//   "/uploads",
//   express.static(
//     path.join(
//       process.cwd(),
//       "uploads"
//     )
//   )
// );


// /* =====================================================
//    AUTH ROUTES
// ===================================================== */

// app.use(
//   "/api/auth",
//   authRoutes
// );


// /* =====================================================
//    ADMIN MANAGEMENT ROUTES
// ===================================================== */

// app.use(
//   "/api/admins",
//   adminRoutes
// );


// /* =====================================================
//    HERO ROUTES
// ===================================================== */

// app.use(
//   "/api/hero",
//   heroRoutes
// );


// /* =====================================================
//    PRODUCT ROUTES
// ===================================================== */

// app.use(
//   "/api/products",
//   productRoutes
// );


// /* =====================================================
//    TESTIMONIAL ROUTES
// ===================================================== */

// app.use(
//   "/api/testimonials",
//   testimonialRoutes
// );


// /* =====================================================
//    INSTAGRAM ROUTES
// ===================================================== */

// app.use(
//   "/api/instagram",
//   instagramRoutes
// )


// /* =====================================================
//    CONTACT ROUTES
// ===================================================== */;

// /* CONTACT ROUTES */
// app.use(
//   "/api/contact",
//   contactRoutes
// );
// /* =====================================================
//    HEALTH CHECK
// ===================================================== */

// app.get(
//   "/api/health",
//   (req, res) => {
//     res.status(200).json({
//       success: true,
//       message:
//         "Padmavati Jewellers API is running",
//     });
//   }
// );


// /* =====================================================
//    ROOT
// ===================================================== */

// app.get(
//   "/",
//   (req, res) => {
//     res.json({
//       success: true,
//       message:
//         "Padmavati Jewellers Server",
//     });
//   }
// );


// /* =====================================================
//    MULTER / UPLOAD ERROR HANDLER
// ===================================================== */

// app.use((error, req, res, next) => {
//   if (error?.name === "MulterError") {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }

//   if (
//     error?.message ===
//     "Only JPG, PNG, WebP and AVIF image files are allowed"
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }

//   if (
//     error?.message ===
//     "Only MP4, WebM and MOV video files are allowed"
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }

//   if (
//     error?.message ===
//     "Only JPG, PNG, WebP, AVIF, MP4, WebM and MOV files are allowed"
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }

//   next(error);
// });


// export default app;





import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

/* =====================================================
   CORS
===================================================== */

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
    ],
    credentials: true,
  })
);

/* =====================================================
   BODY PARSERS
===================================================== */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =====================================================
   STATIC UPLOADS
===================================================== */

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

/* =====================================================
   AUTH ROUTES
===================================================== */

app.use("/api/auth", authRoutes);

/* =====================================================
   ADMIN MANAGEMENT ROUTES
===================================================== */

app.use("/api/admins", adminRoutes);

/* =====================================================
   HERO ROUTES
===================================================== */

app.use("/api/hero", heroRoutes);

/* =====================================================
   PRODUCT ROUTES
===================================================== */

app.use("/api/products", productRoutes);

/* =====================================================
   COLLECTION ROUTES
===================================================== */

app.use("/api/collections", collectionRoutes);

/* =====================================================
   TESTIMONIAL ROUTES
===================================================== */

app.use("/api/testimonials", testimonialRoutes);

/* =====================================================
   INSTAGRAM ROUTES
===================================================== */

app.use("/api/instagram", instagramRoutes);

/* =====================================================
   CONTACT ROUTES
===================================================== */

app.use("/api/contact", contactRoutes);

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Padmavati Jewellers API is running",
  });
});

/* =====================================================
   ROOT
===================================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Padmavati Jewellers Server",
  });
});

/* =====================================================
   MULTER / UPLOAD ERROR HANDLER
===================================================== */

app.use((error, req, res, next) => {
  if (error?.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  const uploadErrorMessages = [
    "Only JPG, PNG, WebP and AVIF image files are allowed",
    "Only MP4, WebM and MOV video files are allowed",
    "Only JPG, PNG, WebP, AVIF, MP4, WebM and MOV files are allowed",
  ];

  if (uploadErrorMessages.includes(error?.message)) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

export default app;
