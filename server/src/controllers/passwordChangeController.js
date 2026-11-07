
import prisma from "../config/prisma.js";

import {
  comparePassword,
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

export async function requestPasswordChangeOTP(
  req,
  res
) {
  try {
    const adminId = req.admin.id;

    const {
      currentPassword,
    } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!admin || admin.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive",
      });
    }

    const passwordMatches =
      await comparePassword(
        currentPassword,
        admin.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    /*
     * Invalidate previous password-change OTPs.
     */
    await prisma.passwordChangeOTP.updateMany({
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

    await prisma.passwordChangeOTP.create({
      data: {
        adminId: admin.id,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
      },
    });

    try {
      await sendEmail({
        to: admin.email,

        subject:
          "Padmavati Jewellers — Password Change OTP",

        text: `
Hello ${admin.name},

Your Padmavati Jewellers password change OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request a password change, please secure your account immediately.

Regards,
Padmavati Jewellers
`,

        html: `
<!DOCTYPE html>

<html>

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Password Change OTP</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f6f3ee;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e0d8;
    "
  >

    <div
      style="
        padding: 28px;
        text-align: center;
        background: #111111;
        color: #ffffff;
      "
    >
      <h1
        style="
          margin: 0;
          font-size: 24px;
          letter-spacing: 1px;
        "
      >
        PADMAVATI JEWELLERS
      </h1>
    </div>

    <div style="padding: 36px 30px;">

      <h2
        style="
          margin-top: 0;
          color: #222222;
        "
      >
        Password Change Verification
      </h2>

      <p
        style="
          color: #555555;
          line-height: 1.6;
        "
      >
        Hello ${admin.name},
      </p>

      <p
        style="
          color: #555555;
          line-height: 1.6;
        "
      >
        Use the following OTP to continue changing
        your Padmavati Jewellers admin password:
      </p>

      <div
        style="
          margin: 30px 0;
          padding: 20px;
          text-align: center;
          background: #f6f3ee;
          border-radius: 10px;
        "
      >

        <span
          style="
            font-size: 34px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #111111;
          "
        >
          ${otp}
        </span>

      </div>

      <p
        style="
          color: #777777;
          line-height: 1.6;
        "
      >
        This OTP is valid for
        <strong>10 minutes</strong>.
      </p>

      <p
        style="
          color: #777777;
          line-height: 1.6;
        "
      >
        If you did not request this password change,
        please secure your account immediately.
      </p>

    </div>

    <div
      style="
        padding: 20px;
        text-align: center;
        background: #f6f3ee;
        color: #888888;
        font-size: 12px;
      "
    >
      Padmavati Jewellers
    </div>

  </div>
</body>

</html>
`,
      });
    } catch (emailError) {
      console.error(
        "PASSWORD CHANGE EMAIL ERROR:",
        emailError
      );

      await prisma.passwordChangeOTP.deleteMany({
        where: {
          adminId: admin.id,
          otpHash,
          verified: false,
        },
      });

      return res.status(500).json({
        success: false,
        message:
          "Unable to send password change email",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Password change OTP has been sent to your email",
    });
  } catch (error) {
    console.error(
      "REQUEST PASSWORD CHANGE OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while requesting password change OTP",
    });
  }
}

export async function verifyPasswordChangeOTP(
  req,
  res
) {
  try {
    const adminId = req.admin.id;

    const {
      otp,
    } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const passwordChangeOTP =
      await prisma.passwordChangeOTP.findFirst({
        where: {
          adminId,
          verified: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!passwordChangeOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (
      passwordChangeOTP.expiresAt <
      new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (
      passwordChangeOTP.attempts >= 5
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect OTP attempts. Please request a new OTP",
      });
    }

    const submittedOTP =
      otp.toString().trim();

    const submittedOTPHash =
      hashOTP(submittedOTP);

    if (
      submittedOTPHash !==
      passwordChangeOTP.otpHash
    ) {
      await prisma.passwordChangeOTP.update({
        where: {
          id: passwordChangeOTP.id,
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

    await prisma.passwordChangeOTP.update({
      where: {
        id: passwordChangeOTP.id,
      },
      data: {
        verified: true,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "VERIFY PASSWORD CHANGE OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while verifying password change OTP",
    });
  }
}

export async function changePassword(
  req,
  res
) {
  try {
    const adminId = req.admin.id;

    const {
      newPassword,
      confirmPassword,
    } = req.body;

    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Confirm password is required",
      });
    }

    /* =====================================================
       PASSWORD MATCH VALIDATION
    ===================================================== */

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    /* =====================================================
       PASSWORD LENGTH VALIDATION
    ===================================================== */

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long",
      });
    }

    /* =====================================================
       FIND VERIFIED OTP
    ===================================================== */

    const passwordChangeOTP =
      await prisma.passwordChangeOTP.findFirst({
        where: {
          adminId,
          verified: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!passwordChangeOTP) {
      return res.status(400).json({
        success: false,
        message:
          "OTP verification is required before changing the password",
      });
    }

    /* =====================================================
       CHECK OTP VERIFICATION EXPIRY
    ===================================================== */

    if (
      passwordChangeOTP.expiresAt <
      new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP verification has expired. Please request a new OTP",
      });
    }

    /* =====================================================
       HASH NEW PASSWORD
    ===================================================== */

    const newPasswordHash =
      await hashPassword(newPassword);

    /* =====================================================
       UPDATE PASSWORD + CLEAN OTP RECORDS
    ===================================================== */

    await prisma.$transaction([
      prisma.admin.update({
        where: {
          id: adminId,
        },
        data: {
          passwordHash:
            newPasswordHash,
        },
      }),

      prisma.passwordChangeOTP.deleteMany({
        where: {
          adminId,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while changing the password",
    });
  }
}
