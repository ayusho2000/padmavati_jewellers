import prisma from "../config/prisma.js";

import {
  comparePassword,
} from "../utils/password.js";

import {
  generateToken,
} from "../utils/jwt.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    // Don't reveal whether the email exists
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (admin.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your admin account is inactive",
      });
    }

    // Verify password
    const passwordMatches = await comparePassword(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    // Generate JWT
    const token = generateToken({
      adminId: admin.id,
      role: admin.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });
} catch (error) {
  console.error("LOGIN ERROR NAME:", error?.name);
  console.error("LOGIN ERROR MESSAGE:", error?.message);
  console.error("LOGIN ERROR DETAILS:", error);

  return res.status(500).json({
    success: false,
    message: "Something went wrong while logging in",
  });
}
}
