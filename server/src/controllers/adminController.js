import prisma from "../config/prisma.js";

import {
  hashPassword,
} from "../utils/password.js";

export async function getAdmins(req, res) {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("GET ADMINS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admins",
    });
  }
}

export async function getAdminById(req, res) {
  try {
    const adminId = Number(req.params.id);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("GET ADMIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin",
    });
  }
}

export async function createAdmin(req, res) {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An admin with this email already exists",
      });
    }

    const passwordHash = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create admin",
    });
  }
}

export async function updateAdmin(req, res) {
  try {
    const adminId = Number(req.params.id);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const {
      name,
      email,
      status,
    } = req.body;

    const data = {};

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      data.name = trimmedName;
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }

      const emailOwner = await prisma.admin.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (emailOwner && emailOwner.id !== adminId) {
        return res.status(409).json({
          success: false,
          message: "Another admin already uses this email",
        });
      }

      data.email = normalizedEmail;
    }

    if (status !== undefined) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid admin status",
        });
      }

      // Prevent OWNER from deactivating their own account.
      if (
        adminId === req.admin.id &&
        status === "INACTIVE"
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate your own account",
        });
      }

      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were provided",
      });
    }

    const updatedAdmin = await prisma.admin.update({
      where: {
        id: adminId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("UPDATE ADMIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update admin",
    });
  }
}

export async function deleteAdmin(req, res) {
  try {
    const adminId = Number(req.params.id);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
    }

    if (adminId === req.admin.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "OWNER accounts cannot be deleted",
      });
    }

    await prisma.admin.delete({
      where: {
        id: adminId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ADMIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete admin",
    });
  }
}