import express from "express";

import {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  activateTestimonial,
  deactivateTestimonial,
} from "../controllers/testimonialController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC TESTIMONIAL ROUTES
========================================================= */

router.get("/", getTestimonials);

router.get("/:id", getTestimonialById);

/* =========================================================
   ADMIN TESTIMONIAL ROUTES
========================================================= */

router.post(
  "/",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  createTestimonial
);

router.patch(
  "/:id",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  updateTestimonial
);

router.delete(
  "/:id",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  deleteTestimonial
);

router.patch(
  "/:id/activate",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  activateTestimonial
);

router.patch(
  "/:id/deactivate",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  deactivateTestimonial
);

export default router;