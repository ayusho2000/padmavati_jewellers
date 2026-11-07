import express from "express";

import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/adminController.js";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.use(requireRole("OWNER"));

router.get("/", getAdmins);

router.get("/:id", getAdminById);

router.post("/", createAdmin);

router.patch("/:id", updateAdmin);

router.delete("/:id", deleteAdmin);

export default router;