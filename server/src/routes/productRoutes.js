import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  replaceProductImage,
  replaceProductImage2,
  deleteProduct,
  activateProduct,
  deactivateProduct,
} from "../controllers/productController.js";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/roleMiddleware.js";

import {
  uploadProductImage,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC
========================================================= */

router.get("/", getProducts);

router.get("/:id", getProductById);

/* =========================================================
   ADMIN CREATE
   IMAGE 1 = REQUIRED
   IMAGE 2 = OPTIONAL
========================================================= */

router.post(
  "/",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  uploadProductImage.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "image2",
      maxCount: 1,
    },
  ]),
  createProduct
);

/* =========================================================
   UPDATE PRODUCT DETAILS
========================================================= */

router.patch(
  "/:id",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  updateProduct
);

/* =========================================================
   REPLACE FIRST IMAGE
========================================================= */

router.put(
  "/:id/image",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  uploadProductImage.single("image"),
  replaceProductImage
);

/* =========================================================
   REPLACE SECOND IMAGE
========================================================= */

router.put(
  "/:id/image2",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  uploadProductImage.single("image"),
  replaceProductImage2
);

/* =========================================================
   DELETE
========================================================= */

router.delete(
  "/:id",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  deleteProduct
);

/* =========================================================
   ACTIVATE
========================================================= */

router.patch(
  "/:id/activate",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  activateProduct
);

/* =========================================================
   DEACTIVATE
========================================================= */

router.patch(
  "/:id/deactivate",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  deactivateProduct
);

export default router;