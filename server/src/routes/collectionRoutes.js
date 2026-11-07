import express from "express";

import {
  getPublicCollections,
  getAdminCollections,
  updateCollection,
} from "../controllers/collectionController.js";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/roleMiddleware.js";

import {
  uploadCollectionBanner,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC COLLECTIONS
   Only active collections are returned by the controller.
========================================================= */

router.get("/", getPublicCollections);

/* =========================================================
   ADMIN - GET ALL COLLECTIONS
========================================================= */

router.get(
  "/admin",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  getAdminCollections
);

/* =========================================================
   ADMIN - UPDATE COLLECTION
   Supports title, description, active status and banner image.
========================================================= */

router.patch(
  "/:category",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  uploadCollectionBanner.single("bannerImage"),
  updateCollection
);

export default router;
