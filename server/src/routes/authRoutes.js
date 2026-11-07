import express from "express";

import {
  login,
} from "../controllers/authController.js";

import {
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
} from "../controllers/passwordResetController.js";

import {
  requestPasswordChangeOTP,
  verifyPasswordChangeOTP,
  changePassword,
} from "../controllers/passwordChangeController.js";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   LOGIN
===================================================== */

router.post(
  "/login",
  login
);


/* =====================================================
   FORGOT PASSWORD
===================================================== */

router.post(
  "/forgot-password",
  requestPasswordResetOTP
);

router.post(
  "/verify-reset-otp",
  verifyPasswordResetOTP
);

router.post(
  "/reset-password",
  resetPassword
);


/* =====================================================
   CHANGE PASSWORD
   AUTHENTICATED ADMIN ONLY
===================================================== */

router.post(
  "/change-password/request-otp",
  authenticate,
  requestPasswordChangeOTP
);

router.post(
  "/change-password/verify-otp",
  authenticate,
  verifyPasswordChangeOTP
);

router.post(
  "/change-password",
  authenticate,
  changePassword
);


/* =====================================================
   CURRENT ADMIN
===================================================== */

router.get(
  "/me",
  authenticate,
  (req, res) => {
    return res.status(200).json({
      success: true,
      admin: req.admin,
    });
  }
);

export default router;