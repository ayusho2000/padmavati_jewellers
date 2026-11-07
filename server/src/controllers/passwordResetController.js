import prisma from "../config/prisma.js";

import {
  hashPassword,
} from "../utils/password.js";

import {
  generateOTP,
  getOTPExpiry,
  hashOTP,
} from "../utils/otp.js";

import {
  sendEmail,
} from "../config/email.js";

import {
  passwordResetOTPEmail,
} from "../utils/emailTemplates.js";

export async function requestPasswordResetOTP(req, res) {
  try {
    const {
      email,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await prisma.admin.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    /*
     * We intentionally return the same response
     * for an unknown email to avoid revealing
     * whether an admin account exists.
     */
    if (!admin || admin.status !== "ACTIVE") {
      return res.status(200).json({
        success: true,
        message:
          "If an active account exists with this email, a password reset OTP has been sent",
      });
    }

    /*
     * Invalidate all previous unused reset OTPs.
     */
    await prisma.passwordResetOTP.updateMany({
      where: {
        adminId: admin.id,
        verified: false,
      },
      data: {
        verified: true,
      },
    });

    const otp = generateOTP();

    const otpHash = hashOTP(otp);

    const expiresAt = getOTPExpiry();

    await prisma.passwordResetOTP.create({
      data: {
        adminId: admin.id,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
      },
    });

    const emailContent = passwordResetOTPEmail({
      name: admin.name,
      otp,
    });

    try {
      await sendEmail({
        to: admin.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error(
        "PASSWORD RESET EMAIL ERROR:",
        emailError
      );

      /*
       * Remove the OTP if the email could not
       * actually be sent.
       */
      await prisma.passwordResetOTP.deleteMany({
        where: {
          adminId: admin.id,
          otpHash,
          verified: false,
        },
      });

      return res.status(500).json({
        success: false,
        message:
          "Unable to send password reset email",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an active account exists with this email, a password reset OTP has been sent",
    });
  } catch (error) {
    console.error(
      "REQUEST PASSWORD RESET OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while requesting password reset",
    });
  }
}

export async function verifyPasswordResetOTP(req, res) {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await prisma.admin.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!admin || admin.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const resetOTP =
      await prisma.passwordResetOTP.findFirst({
        where: {
          adminId: admin.id,
          verified: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!resetOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (resetOTP.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (resetOTP.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect OTP attempts. Please request a new OTP",
      });
    }

    const submittedOTP = otp.toString().trim();

    const submittedOTPHash = hashOTP(
      submittedOTP
    );

    if (submittedOTPHash !== resetOTP.otpHash) {
      await prisma.passwordResetOTP.update({
        where: {
          id: resetOTP.id,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await prisma.passwordResetOTP.update({
      where: {
        id: resetOTP.id,
      },
      data: {
        verified: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "VERIFY PASSWORD RESET OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while verifying OTP",
    });
  }
}


export async function resetPassword(req, res) {
  try {
    const {
      email,
      newPassword,
    } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await prisma.admin.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!admin || admin.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Unable to reset password",
      });
    }

    const verifiedOTP =
      await prisma.passwordResetOTP.findFirst({
        where: {
          adminId: admin.id,
          verified: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!verifiedOTP) {
      return res.status(400).json({
        success: false,
        message:
          "OTP verification has expired. Please request a new OTP",
      });
    }

    if (verifiedOTP.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "OTP verification is required before resetting the password",
      });
    }

    const passwordHash =
      await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.admin.update({
        where: {
          id: admin.id,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.passwordResetOTP.deleteMany({
        where: {
          adminId: admin.id,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while resetting the password",
    });
  }
}