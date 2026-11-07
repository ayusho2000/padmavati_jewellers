import express from "express";

import {
  getContactSubmissions,
  getContactSubmissionById,
  createContactSubmission,
  updateContactSubmissionStatus,
  deleteContactSubmission,
} from "../controllers/contactController.js";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */

/* CREATE CONTACT SUBMISSION */
router.post(
  "/",
  createContactSubmission
);


/* =========================================================
   ADMIN ROUTES
========================================================= */

/* GET ALL CONTACT SUBMISSIONS */
router.get(
  "/",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  getContactSubmissions
);


/* GET CONTACT SUBMISSION BY ID */
router.get(
  "/:id",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  getContactSubmissionById
);


/* UPDATE CONTACT STATUS */
router.patch(
  "/:id/status",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  updateContactSubmissionStatus
);


/* DELETE CONTACT SUBMISSION */
router.delete(
  "/:id",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  deleteContactSubmission
);

export default router;