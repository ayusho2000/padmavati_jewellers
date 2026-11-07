import express from "express";

import {
  getActiveHero,
  getHero,
  createHero,
  replaceHero,
  removeHero,
  activateHero,
  deactivateHero,
} from "../controllers/heroController.js";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/roleMiddleware.js";

import {
  uploadHeroVideo,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();


/* =====================================================
   PUBLIC
===================================================== */

router.get(
  "/active",
  getActiveHero
);


/* =====================================================
   ADMIN
===================================================== */

router.get(
  "/",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  getHero
);


/* =====================================================
   CREATE HERO
===================================================== */

router.post(
  "/",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  uploadHeroVideo.single("video"),
  createHero
);


/* =====================================================
   REPLACE HERO
===================================================== */

router.put(
  "/",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  uploadHeroVideo.single("video"),
  replaceHero
);


/* =====================================================
   REMOVE HERO
===================================================== */

router.delete(
  "/",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  removeHero
);


/* =====================================================
   ACTIVATE HERO
===================================================== */

router.patch(
  "/activate",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  activateHero
);


/* =====================================================
   DEACTIVATE HERO
===================================================== */

router.patch(
  "/deactivate",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  deactivateHero
);


export default router;