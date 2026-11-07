
import express from "express";

import {
  getInstagramPosts,
  getInstagramPostById,
  createInstagramPost,
  updateInstagramPost,
  replaceInstagramMedia,
  deleteInstagramPost,
  activateInstagramPost,
  deactivateInstagramPost,
} from "../controllers/instagramController.js";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/roleMiddleware.js";

import {
  uploadInstagramMedia,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();


/* =========================================================
   PUBLIC ROUTES
========================================================= */

router.get(
  "/",
  getInstagramPosts
);

router.get(
  "/:id",
  getInstagramPostById
);


/* =========================================================
   ADMIN CREATE
========================================================= */

router.post(
  "/",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  uploadInstagramMedia.single("media"),
  createInstagramPost
);


/* =========================================================
   ADMIN UPDATE
========================================================= */

router.patch(
  "/:id",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  updateInstagramPost
);


/* =========================================================
   ADMIN REPLACE MEDIA
========================================================= */

router.put(
  "/:id/media",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  uploadInstagramMedia.single("media"),
  replaceInstagramMedia
);


/* =========================================================
   ADMIN DELETE
========================================================= */

router.delete(
  "/:id",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  deleteInstagramPost
);


/* =========================================================
   ADMIN ACTIVATE
========================================================= */

router.patch(
  "/:id/activate",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  activateInstagramPost
);


/* =========================================================
   ADMIN DEACTIVATE
========================================================= */

router.patch(
  "/:id/deactivate",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  deactivateInstagramPost
);


export default router;
