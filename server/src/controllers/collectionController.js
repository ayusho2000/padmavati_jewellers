
import fs from "fs";
import path from "path";

import prisma from "../config/prisma.js";

const categoryOrder = {
  GOLD: 1,
  DIAMOND: 2,
  POLKI: 3,
};

const allowedCategories = Object.keys(categoryOrder);

function sortCollections(collections) {
  return collections.sort(
    (a, b) => categoryOrder[a.category] - categoryOrder[b.category]
  );
}

function collectionResponse(collection) {
  return {
    id: collection.id,
    category: collection.category,
    title: collection.title,
    description: collection.description,
    bannerImage: collection.bannerImage,
    active: collection.active,
    updatedAt: collection.updatedAt,
  };
}

// Public: GET /api/collections
export async function getPublicCollections(req, res) {
  try {
    const collections = await prisma.collection.findMany({
      where: { active: true },
    });

    return res.status(200).json({
      success: true,
      collections: sortCollections(collections).map(collectionResponse),
    });
  } catch (error) {
    console.error("Get public collections error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load collections.",
    });
  }
}

// Admin: GET /api/collections/admin
export async function getAdminCollections(req, res) {
  try {
    const collections = await prisma.collection.findMany();

    return res.status(200).json({
      success: true,
      collections: sortCollections(collections).map(collectionResponse),
    });
  } catch (error) {
    console.error("Get admin collections error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load collections.",
    });
  }
}

// Admin: PATCH /api/collections/:category
export async function updateCollection(req, res) {
  try {
    const category = String(req.params.category || "").toUpperCase();

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection category.",
      });
    }

    const existing = await prisma.collection.findUnique({
      where: { category },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Collection not found. Run the collection seed script first.",
      });
    }

    const { title, description, active } = req.body;

    const data = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Collection title is required.",
        });
      }

      data.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Collection description is required.",
        });
      }

      data.description = description.trim();
    }

    if (active !== undefined) {
      if (active === "true" || active === true) {
        data.active = true;
      } else if (active === "false" || active === false) {
        data.active = false;
      } else {
        return res.status(400).json({
          success: false,
          message: "Active must be true or false.",
        });
      }
    }

    if (req.file) {
      data.bannerImage = `/uploads/collections/${req.file.filename}`;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a title, description, active status, or banner image.",
      });
    }

    const updated = await prisma.collection.update({
      where: { category },
      data,
    });

    // Remove the previous locally stored banner only after the database update succeeds.
    if (
      req.file &&
      existing.bannerImage?.startsWith("/uploads/collections/")
    ) {
      const oldFileName = path.basename(existing.bannerImage);
      const oldFilePath = path.join(
        process.cwd(),
        "uploads",
        "collections",
        oldFileName
      );

      fs.promises.unlink(oldFilePath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.error("Unable to remove old collection banner:", error);
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Collection updated successfully.",
      collection: collectionResponse(updated),
    });
  } catch (error) {
    console.error("Update collection error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update collection.",
    });
  }
}
