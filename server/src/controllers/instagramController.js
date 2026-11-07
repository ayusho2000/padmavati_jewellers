import prisma from "../config/prisma.js";
import fs from "fs/promises";
import path from "path";


/* =========================================================
   DELETE FILE HELPER
========================================================= */

async function deleteFileIfExists(filePath) {
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


/* =========================================================
   GET ALL INSTAGRAM POSTS
========================================================= */

export async function getInstagramPosts(
  req,
  res
) {
  try {
    const {
      active,
      mediaType,
    } = req.query;

    const where = {};

    /* ACTIVE FILTER */

    if (active !== undefined) {
      if (
        active !== "true" &&
        active !== "false"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid active filter",
        });
      }

      where.active =
        active === "true";
    }

    /* MEDIA TYPE FILTER */

    if (mediaType !== undefined) {
      const normalizedMediaType =
        mediaType
          .trim()
          .toUpperCase();

      if (
        !["IMAGE", "VIDEO"].includes(
          normalizedMediaType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid media type",
        });
      }

      where.mediaType =
        normalizedMediaType;
    }

    const posts =
      await prisma.instagramPost.findMany({
        where,

        orderBy: [
          {
            displayOrder:
              "asc",
          },
          {
            createdAt:
              "desc",
          },
        ],
      });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error(
      "GET INSTAGRAM POSTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch Instagram posts",
    });
  }
}


/* =========================================================
   GET INSTAGRAM POST BY ID
========================================================= */

export async function getInstagramPostById(
  req,
  res
) {
  try {
    const postId =
      Number(req.params.id);

    if (
      !Number.isInteger(postId) ||
      postId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Instagram post ID",
      });
    }

    const post =
      await prisma.instagramPost.findUnique({
        where: {
          id: postId,
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message:
          "Instagram post not found",
      });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error(
      "GET INSTAGRAM POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch Instagram post",
    });
  }
}


/* =========================================================
   CREATE INSTAGRAM POST
========================================================= */

export async function createInstagramPost(
  req,
  res
) {
  let uploadedFilePath =
    null;

  try {
    const {
      mediaType,
      link,
      caption,
      displayOrder,
    } = req.body;

    /* MEDIA REQUIRED */

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Instagram media file is required",
      });
    }

    uploadedFilePath =
      req.file.path;

    /* MEDIA TYPE REQUIRED */

    if (!mediaType) {
      await deleteFileIfExists(
        uploadedFilePath
      );

      return res.status(400).json({
        success: false,
        message:
          "Media type is required",
      });
    }

    const normalizedMediaType =
      mediaType
        .trim()
        .toUpperCase();

    if (
      !["IMAGE", "VIDEO"].includes(
        normalizedMediaType
      )
    ) {
      await deleteFileIfExists(
        uploadedFilePath
      );

      return res.status(400).json({
        success: false,
        message:
          "Media type must be IMAGE or VIDEO",
      });
    }

    /* VERIFY FILE TYPE */

    const isImage =
      req.file.mimetype.startsWith(
        "image/"
      );

    const isVideo =
      req.file.mimetype.startsWith(
        "video/"
      );

    if (
      normalizedMediaType ===
        "IMAGE" &&
      !isImage
    ) {
      await deleteFileIfExists(
        uploadedFilePath
      );

      return res.status(400).json({
        success: false,
        message:
          "Selected media type is IMAGE but uploaded file is not an image",
      });
    }

    if (
      normalizedMediaType ===
        "VIDEO" &&
      !isVideo
    ) {
      await deleteFileIfExists(
        uploadedFilePath
      );

      return res.status(400).json({
        success: false,
        message:
          "Selected media type is VIDEO but uploaded file is not a video",
      });
    }

    /* LINK */

    let normalizedLink =
      null;

    if (
      link !== undefined &&
      link !== null
    ) {
      normalizedLink =
        link.trim() || null;
    }

    /* CAPTION */

    let normalizedCaption =
      null;

    if (
      caption !== undefined &&
      caption !== null
    ) {
      normalizedCaption =
        caption.trim() || null;
    }

    /* DISPLAY ORDER */

    let normalizedDisplayOrder =
      0;

    if (
      displayOrder !== undefined
    ) {
      normalizedDisplayOrder =
        Number(displayOrder);

      if (
        !Number.isInteger(
          normalizedDisplayOrder
        ) ||
        normalizedDisplayOrder < 0
      ) {
        await deleteFileIfExists(
          uploadedFilePath
        );

        return res.status(400).json({
          success: false,
          message:
            "Display order must be a non-negative integer",
        });
      }
    }

    /* MEDIA PATH */

    const media =
      `/uploads/instagram/${req.file.filename}`;

    const post =
      await prisma.instagramPost.create({
        data: {
          mediaType:
            normalizedMediaType,
          media,
          link:
            normalizedLink,
          caption:
            normalizedCaption,
          displayOrder:
            normalizedDisplayOrder,
          active: true,
        },
      });

    uploadedFilePath = null;

    return res.status(201).json({
      success: true,
      message:
        "Instagram post created successfully",
      post,
    });
  } catch (error) {
    console.error(
      "CREATE INSTAGRAM POST ERROR:",
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
        "Unable to create Instagram post",
    });
  }
}


/* =========================================================
   UPDATE INSTAGRAM POST
========================================================= */

export async function updateInstagramPost(
  req,
  res
) {
  try {
    const postId =
      Number(req.params.id);

    if (
      !Number.isInteger(postId) ||
      postId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Instagram post ID",
      });
    }

    const existingPost =
      await prisma.instagramPost.findUnique({
        where: {
          id: postId,
        },
      });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message:
          "Instagram post not found",
      });
    }

    const {
      mediaType,
      link,
      caption,
      active,
      displayOrder,
    } = req.body;

    const data = {};

    /* =====================================================
       MEDIA TYPE
    ===================================================== */

    if (mediaType !== undefined) {
      if (
        mediaType === null ||
        typeof mediaType !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Media type must be IMAGE or VIDEO",
        });
      }

      const normalizedMediaType =
        mediaType
          .trim()
          .toUpperCase();

      if (
        !["IMAGE", "VIDEO"].includes(
          normalizedMediaType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Media type must be IMAGE or VIDEO",
        });
      }

      data.mediaType =
        normalizedMediaType;
    }

    /* =====================================================
       LINK
       Optional — null/empty string is allowed
    ===================================================== */

    if (link !== undefined) {
      if (
        link === null ||
        (typeof link === "string" &&
          !link.trim())
      ) {
        data.link = null;
      } else if (typeof link === "string") {
        data.link = link.trim();
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Instagram link must be a valid string or null",
        });
      }
    }

    /* =====================================================
       CAPTION
       Optional — null/empty string is allowed
    ===================================================== */

    if (caption !== undefined) {
      if (
        caption === null ||
        (typeof caption === "string" &&
          !caption.trim())
      ) {
        data.caption = null;
      } else if (
        typeof caption === "string"
      ) {
        data.caption =
          caption.trim();
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Instagram caption must be a valid string or null",
        });
      }
    }

    /* =====================================================
       ACTIVE
    ===================================================== */

    if (active !== undefined) {
      if (
        active !== true &&
        active !== false &&
        active !== "true" &&
        active !== "false"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid active value",
        });
      }

      data.active =
        active === true ||
        active === "true";
    }

    /* =====================================================
       DISPLAY ORDER
    ===================================================== */

    if (
      displayOrder !== undefined
    ) {
      const normalizedDisplayOrder =
        Number(displayOrder);

      if (
        !Number.isInteger(
          normalizedDisplayOrder
        ) ||
        normalizedDisplayOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Display order must be a non-negative integer",
        });
      }

      data.displayOrder =
        normalizedDisplayOrder;
    }

    /* =====================================================
       NO CHANGES
    ===================================================== */

    if (
      Object.keys(data).length ===
      0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No changes were provided",
      });
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    const post =
      await prisma.instagramPost.update({
        where: {
          id: postId,
        },
        data,
      });

    return res.status(200).json({
      success: true,
      message:
        "Instagram post updated successfully",
      post,
    });
  } catch (error) {
    console.error(
      "UPDATE INSTAGRAM POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update Instagram post",
    });
  }
}

/* =========================================================
   REPLACE INSTAGRAM MEDIA
========================================================= */

export async function replaceInstagramMedia(
  req,
  res
) {
  let uploadedFilePath =
    null;

  try {
    const postId =
      Number(req.params.id);

    if (
      !Number.isInteger(postId) ||
      postId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Instagram post ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Instagram media file is required",
      });
    }

    uploadedFilePath =
      req.file.path;

    const existingPost =
      await prisma.instagramPost.findUnique({
        where: {
          id: postId,
        },
      });

    if (!existingPost) {
      await deleteFileIfExists(
        uploadedFilePath
      );

      return res.status(404).json({
        success: false,
        message:
          "Instagram post not found",
      });
    }

    const newMediaType =
      req.file.mimetype.startsWith(
        "image/"
      )
        ? "IMAGE"
        : "VIDEO";

    const newMedia =
      `/uploads/instagram/${req.file.filename}`;

    const post =
      await prisma.instagramPost.update({
        where: {
          id: postId,
        },
        data: {
          media:
            newMedia,
          mediaType:
            newMediaType,
        },
      });

    uploadedFilePath = null;

    if (
      existingPost.media &&
      existingPost.media.startsWith(
        "/uploads/instagram/"
      )
    ) {
      const oldFilePath =
        path.join(
          process.cwd(),
          existingPost.media.replace(
            "/uploads/instagram/",
            "uploads/instagram/"
          )
        );

      await deleteFileIfExists(
        oldFilePath
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Instagram media replaced successfully",
      post,
    });
  } catch (error) {
    console.error(
      "REPLACE INSTAGRAM MEDIA ERROR:",
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
        "Unable to replace Instagram media",
    });
  }
}


/* =========================================================
   DELETE INSTAGRAM POST
========================================================= */

export async function deleteInstagramPost(
  req,
  res
) {
  try {
    const postId =
      Number(req.params.id);

    if (
      !Number.isInteger(postId) ||
      postId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Instagram post ID",
      });
    }

    const post =
      await prisma.instagramPost.findUnique({
        where: {
          id: postId,
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message:
          "Instagram post not found",
      });
    }

    await prisma.instagramPost.delete({
      where: {
        id: postId,
      },
    });

    if (
      post.media &&
      post.media.startsWith(
        "/uploads/instagram/"
      )
    ) {
      const filePath =
        path.join(
          process.cwd(),
          post.media.replace(
            "/uploads/instagram/",
            "uploads/instagram/"
          )
        );

      await deleteFileIfExists(
        filePath
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Instagram post deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE INSTAGRAM POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete Instagram post",
    });
  }
}


/* =========================================================
   ACTIVATE INSTAGRAM POST
========================================================= */

export async function activateInstagramPost(
  req,
  res
) {
  try {
    const postId =
      Number(req.params.id);

    if (
      !Number.isInteger(postId) ||
      postId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Instagram post ID",
      });
    }

    const post =
      await prisma.instagramPost.findUnique({
        where: {
          id: postId,
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message:
          "Instagram post not found",
      });
    }

    const updatedPost =
      await prisma.instagramPost.update({
        where: {
          id: postId,
        },
        data: {
          active: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Instagram post activated successfully",
      post:
        updatedPost,
    });
  } catch (error) {
    console.error(
      "ACTIVATE INSTAGRAM POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to activate Instagram post",
    });
  }
}


/* =========================================================
   DEACTIVATE INSTAGRAM POST
========================================================= */

export async function deactivateInstagramPost(
  req,
  res
) {
  try {
    const postId =
      Number(req.params.id);

    if (
      !Number.isInteger(postId) ||
      postId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Instagram post ID",
      });
    }

    const post =
      await prisma.instagramPost.findUnique({
        where: {
          id: postId,
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message:
          "Instagram post not found",
      });
    }

    const updatedPost =
      await prisma.instagramPost.update({
        where: {
          id: postId,
        },
        data: {
          active: false,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Instagram post deactivated successfully",
      post:
        updatedPost,
    });
  } catch (error) {
    console.error(
      "DEACTIVATE INSTAGRAM POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to deactivate Instagram post",
    });
  }
}
