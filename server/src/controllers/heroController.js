import prisma from "../config/prisma.js";

import fs from "fs/promises";
import path from "path";


/* =====================================================
   DELETE FILE SAFELY
===================================================== */

async function deleteFileIfExists(
  filePath
) {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "FILE DELETE ERROR:",
        error
      );
    }
  }
}


/* =====================================================
   GET ACTIVE HERO
===================================================== */

export async function getActiveHero(
  req,
  res
) {
  try {
    const hero =
      await prisma.hero.findFirst({
        where: {
          active: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message:
          "No active hero video found",
      });
    }

    return res.status(200).json({
      success: true,
      hero,
    });
  } catch (error) {
    console.error(
      "GET ACTIVE HERO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch hero video",
    });
  }
}


/* =====================================================
   GET HERO FOR ADMIN
===================================================== */

export async function getHero(
  req,
  res
) {
  try {
    const hero =
      await prisma.hero.findFirst({
        orderBy: {
          updatedAt: "desc",
        },
      });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message:
          "Hero video not found",
      });
    }

    return res.status(200).json({
      success: true,
      hero,
    });
  } catch (error) {
    console.error(
      "GET HERO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch hero video",
    });
  }
}


/* =====================================================
   CREATE HERO
===================================================== */

export async function createHero(
  req,
  res
) {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Hero video file is required",
      });
    }

    uploadedFilePath =
      req.file.path;

    const existingHero =
      await prisma.hero.findFirst();

    if (existingHero) {
      await deleteFileIfExists(
        uploadedFilePath
      );

      return res.status(409).json({
        success: false,
        message:
          "A hero video already exists. Use replace instead",
      });
    }

    const video =
      `/uploads/hero/${req.file.filename}`;

    const hero =
      await prisma.hero.create({
        data: {
          video,
          active: true,
        },
      });

    return res.status(201).json({
      success: true,
      message:
        "Hero video uploaded successfully",
      hero,
    });
  } catch (error) {
    console.error(
      "CREATE HERO ERROR:",
      error
    );

    if (uploadedFilePath) {
      await deleteFileIfExists(
        uploadedFilePath
      );
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to upload hero video",
    });
  }
}


/* =====================================================
   REPLACE HERO
===================================================== */

export async function replaceHero(
  req,
  res
) {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Hero video file is required",
      });
    }

    uploadedFilePath =
      req.file.path;

    const existingHero =
      await prisma.hero.findFirst();

    const video =
      `/uploads/hero/${req.file.filename}`;

    if (!existingHero) {
      const hero =
        await prisma.hero.create({
          data: {
            video,
            active: true,
          },
        });

      return res.status(201).json({
        success: true,
        message:
          "Hero video uploaded successfully",
        hero,
      });
    }

    const oldVideo =
      existingHero.video;

    const hero =
      await prisma.hero.update({
        where: {
          id: existingHero.id,
        },
        data: {
          video,
          active: true,
        },
      });

    uploadedFilePath = null;

    if (
      oldVideo &&
      oldVideo.startsWith(
        "/uploads/hero/"
      )
    ) {
      const oldFilePath =
        path.join(
          process.cwd(),
          oldVideo.replace(
            "/uploads/hero/",
            "uploads/hero/"
          )
        );

      await deleteFileIfExists(
        oldFilePath
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Hero video replaced successfully",
      hero,
    });
  } catch (error) {
    console.error(
      "REPLACE HERO ERROR:",
      error
    );

    if (uploadedFilePath) {
      await deleteFileIfExists(
        uploadedFilePath
      );
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to replace hero video",
    });
  }
}


/* =====================================================
   REMOVE HERO
===================================================== */

export async function removeHero(
  req,
  res
) {
  try {
    const existingHero =
      await prisma.hero.findFirst();

    if (!existingHero) {
      return res.status(404).json({
        success: false,
        message:
          "Hero video not found",
      });
    }

    await prisma.hero.delete({
      where: {
        id: existingHero.id,
      },
    });

    if (
      existingHero.video &&
      existingHero.video.startsWith(
        "/uploads/hero/"
      )
    ) {
      const filePath =
        path.join(
          process.cwd(),
          existingHero.video.replace(
            "/uploads/hero/",
            "uploads/hero/"
          )
        );

      await deleteFileIfExists(
        filePath
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Hero video removed successfully",
    });
  } catch (error) {
    console.error(
      "REMOVE HERO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove hero video",
    });
  }
}


/* =====================================================
   ACTIVATE HERO
===================================================== */

export async function activateHero(
  req,
  res
) {
  try {
    const existingHero =
      await prisma.hero.findFirst();

    if (!existingHero) {
      return res.status(404).json({
        success: false,
        message:
          "Hero video not found",
      });
    }

    const hero =
      await prisma.hero.update({
        where: {
          id: existingHero.id,
        },
        data: {
          active: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Hero video activated successfully",
      hero,
    });
  } catch (error) {
    console.error(
      "ACTIVATE HERO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to activate hero video",
    });
  }
}


/* =====================================================
   DEACTIVATE HERO
===================================================== */

export async function deactivateHero(
  req,
  res
) {
  try {
    const existingHero =
      await prisma.hero.findFirst();

    if (!existingHero) {
      return res.status(404).json({
        success: false,
        message:
          "Hero video not found",
      });
    }

    const hero =
      await prisma.hero.update({
        where: {
          id: existingHero.id,
        },
        data: {
          active: false,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Hero video deactivated successfully",
      hero,
    });
  } catch (error) {
    console.error(
      "DEACTIVATE HERO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to deactivate hero video",
    });
  }
}