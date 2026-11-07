import prisma from "../config/prisma.js";

import fs from "fs/promises";
import path from "path";

/* =========================================================
   DELETE FILE SAFELY
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
   GET ALL PRODUCTS
========================================================= */

export async function getProducts(req, res) {
  try {
    const {
      category,
      active,
    } = req.query;

    const where = {};

    /* CATEGORY FILTER */

    if (category !== undefined) {
      const normalizedCategory =
        category.trim().toUpperCase();

      if (
        ![
          "GOLD",
          "DIAMOND",
          "POLKI",
        ].includes(
          normalizedCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product category",
        });
      }

      where.category =
        normalizedCategory;
    }

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

    const products =
      await prisma.product.findMany({
        where,

        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch products",
    });
  }
}

/* =========================================================
   GET PRODUCT BY ID
========================================================= */

export async function getProductById(
  req,
  res
) {
  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch product",
    });
  }
}

/* =========================================================
   CREATE PRODUCT
========================================================= */

export async function createProduct(
  req,
  res
) {
  const uploadedFilePaths = [];

  try {
    const {
      category,
      name,
      description,
      type,
      purity,
      weight,
      style,
      displayOrder,
    } = req.body;

    /*
      CREATE PRODUCT SUPPORTS:

      image  -> required
      image2 -> optional
    */

    const imageFile =
      req.files?.image?.[0] || null;

    const image2File =
      req.files?.image2?.[0] || null;

    /* COLLECT UPLOADED FILES FOR CLEANUP */

    if (imageFile) {
      uploadedFilePaths.push(
        imageFile.path
      );
    }

    if (image2File) {
      uploadedFilePaths.push(
        image2File.path
      );
    }

    /* IMAGE REQUIRED */

    if (!imageFile) {
      for (const filePath of uploadedFilePaths) {
        await deleteFileIfExists(
          filePath
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Product image is required",
      });
    }

    /* CATEGORY */

    if (!category) {
      for (const filePath of uploadedFilePaths) {
        await deleteFileIfExists(
          filePath
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Product category is required",
      });
    }

    const normalizedCategory =
      category.trim().toUpperCase();

    if (
      ![
        "GOLD",
        "DIAMOND",
        "POLKI",
      ].includes(
        normalizedCategory
      )
    ) {
      for (const filePath of uploadedFilePaths) {
        await deleteFileIfExists(
          filePath
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Category must be GOLD, DIAMOND or POLKI",
      });
    }

    /* NAME */

    if (!name || !name.trim()) {
      for (const filePath of uploadedFilePaths) {
        await deleteFileIfExists(
          filePath
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Product name is required",
      });
    }

    const trimmedName =
      name.trim();

    /* DESCRIPTION */

    let trimmedDescription = null;

    if (
      description !== undefined &&
      description !== null
    ) {
      trimmedDescription =
        description.trim() ||
        null;
    }

    /* PRODUCT TYPE */

    let trimmedType = null;

    if (
      type !== undefined &&
      type !== null
    ) {
      trimmedType =
        type.trim() || null;
    }

    /* PURITY */

    let trimmedPurity = null;

    if (
      purity !== undefined &&
      purity !== null
    ) {
      trimmedPurity =
        purity.trim() || null;
    }

    /* WEIGHT */

    let trimmedWeight = null;

    if (
      weight !== undefined &&
      weight !== null
    ) {
      trimmedWeight =
        weight.trim() || null;
    }

    /* STYLE */

    let trimmedStyle = null;

    if (
      style !== undefined &&
      style !== null
    ) {
      trimmedStyle =
        style.trim() || null;
    }

    /* DISPLAY ORDER */

    let normalizedDisplayOrder = 0;

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
        for (const filePath of uploadedFilePaths) {
          await deleteFileIfExists(
            filePath
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "Display order must be a non-negative integer",
        });
      }
    }

    /* IMAGE PATHS */

    const image =
      `/uploads/products/${imageFile.filename}`;

    const image2 =
      image2File
        ? `/uploads/products/${image2File.filename}`
        : null;

    /* CREATE PRODUCT */

    const product =
      await prisma.product.create({
        data: {
          category:
            normalizedCategory,

          name:
            trimmedName,

          description:
            trimmedDescription,

          type:
            trimmedType,

          purity:
            trimmedPurity,

          weight:
            trimmedWeight,

          style:
            trimmedStyle,

          image,

          image2,

          active: true,

          displayOrder:
            normalizedDisplayOrder,
        },
      });

    /*
      DATABASE SAVE SUCCESSFUL.
      Prevent cleanup from deleting the files.
    */

    uploadedFilePaths.length = 0;

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    /* CLEANUP UPLOADED FILES */

    for (const filePath of uploadedFilePaths) {
      await deleteFileIfExists(
        filePath
      );
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create product",
    });
  }
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export async function updateProduct(
  req,
  res
) {
  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    const {
      category,
      name,
      description,
      type,
      purity,
      weight,
      style,
      active,
      displayOrder,
      image2,
    } = req.body;

    const data = {};

    /* CATEGORY */

    if (category !== undefined) {
      const normalizedCategory =
        category.trim().toUpperCase();

      if (
        ![
          "GOLD",
          "DIAMOND",
          "POLKI",
        ].includes(
          normalizedCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Category must be GOLD, DIAMOND or POLKI",
        });
      }

      data.category =
        normalizedCategory;
    }

    /* NAME */

    if (name !== undefined) {
      const trimmedName =
        name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message:
            "Product name cannot be empty",
        });
      }

      data.name =
        trimmedName;
    }

    /* DESCRIPTION */

    if (description !== undefined) {
      if (
        description !== null &&
        typeof description !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product description",
        });
      }

      data.description =
        description === null
          ? null
          : description.trim() || null;
    }

    /* PRODUCT TYPE */

    if (type !== undefined) {
      if (
        type !== null &&
        typeof type !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product type",
        });
      }

      data.type =
        type === null
          ? null
          : type.trim() || null;
    }

    /* PURITY */

    if (purity !== undefined) {
      if (
        purity !== null &&
        typeof purity !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product purity",
        });
      }

      data.purity =
        purity === null
          ? null
          : purity.trim() || null;
    }

    /* WEIGHT */

    if (weight !== undefined) {
      if (
        weight !== null &&
        typeof weight !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product weight",
        });
      }

      data.weight =
        weight === null
          ? null
          : weight.trim() || null;
    }

    /* STYLE */

    if (style !== undefined) {
      if (
        style !== null &&
        typeof style !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product style",
        });
      }

      data.style =
        style === null
          ? null
          : style.trim() || null;
    }

    /* IMAGE 2 */

    if (image2 !== undefined) {
      if (
        image2 !== null &&
        typeof image2 !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid second product image",
        });
      }

      data.image2 =
        image2 === null
          ? null
          : image2.trim() || null;
    }

    /* ACTIVE */

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

    /* DISPLAY ORDER */

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

    /* NO CHANGES */

    if (
      Object.keys(data).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No changes were provided",
      });
    }

    /* UPDATE PRODUCT */

    const product =
      await prisma.product.update({
        where: {
          id: productId,
        },

        data,
      });

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update product",
    });
  }
}

/* =========================================================
   REPLACE PRODUCT IMAGE
========================================================= */

export async function replaceProductImage(
  req,
  res
) {
  let uploadedFilePath = null;

  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Product image file is required",
      });
    }

    uploadedFilePath =
      req.file.path;

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!existingProduct) {
      await deleteFileIfExists(
        uploadedFilePath
      );

      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    const newImage =
      `/uploads/products/${req.file.filename}`;

    const product =
      await prisma.product.update({
        where: {
          id: productId,
        },

        data: {
          image: newImage,
        },
      });

    uploadedFilePath = null;

    /* DELETE OLD IMAGE */

    if (
      existingProduct.image &&
      existingProduct.image.startsWith(
        "/uploads/products/"
      )
    ) {
      const oldFilePath =
        path.join(
          process.cwd(),
          existingProduct.image.replace(
            "/uploads/products/",
            "uploads/products/"
          )
        );

      await deleteFileIfExists(
        oldFilePath
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Product image replaced successfully",
      product,
    });
  } catch (error) {
    console.error(
      "REPLACE PRODUCT IMAGE ERROR:",
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
        "Unable to replace product image",
    });
  }
}

/* =========================================================
   REPLACE PRODUCT SECOND IMAGE
========================================================= */

export async function replaceProductImage2(
  req,
  res
) {
  let uploadedFilePath = null;

  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Second product image file is required",
      });
    }

    uploadedFilePath =
      req.file.path;

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!existingProduct) {
      await deleteFileIfExists(
        uploadedFilePath
      );

      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    const newImage2 =
      `/uploads/products/${req.file.filename}`;

    const product =
      await prisma.product.update({
        where: {
          id: productId,
        },

        data: {
          image2: newImage2,
        },
      });

    uploadedFilePath = null;

    /* DELETE OLD SECOND IMAGE */

    if (
      existingProduct.image2 &&
      existingProduct.image2.startsWith(
        "/uploads/products/"
      )
    ) {
      const oldFilePath =
        path.join(
          process.cwd(),
          existingProduct.image2.replace(
            "/uploads/products/",
            "uploads/products/"
          )
        );

      await deleteFileIfExists(
        oldFilePath
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Second product image replaced successfully",
      product,
    });
  } catch (error) {
    console.error(
      "REPLACE PRODUCT SECOND IMAGE ERROR:",
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
        "Unable to replace second product image",
    });
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function deleteProduct(
  req,
  res
) {
  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    /* DELETE FIRST IMAGE */

    if (
      product.image &&
      product.image.startsWith(
        "/uploads/products/"
      )
    ) {
      const filePath =
        path.join(
          process.cwd(),
          product.image.replace(
            "/uploads/products/",
            "uploads/products/"
          )
        );

      await deleteFileIfExists(
        filePath
      );
    }

    /* DELETE SECOND IMAGE */

    if (
      product.image2 &&
      product.image2.startsWith(
        "/uploads/products/"
      )
    ) {
      const filePath =
        path.join(
          process.cwd(),
          product.image2.replace(
            "/uploads/products/",
            "uploads/products/"
          )
        );

      await deleteFileIfExists(
        filePath
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete product",
    });
  }
}

/* =========================================================
   ACTIVATE PRODUCT
========================================================= */

export async function activateProduct(
  req,
  res
) {
  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    const updatedProduct =
      await prisma.product.update({
        where: {
          id: productId,
        },

        data: {
          active: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Product activated successfully",
      product:
        updatedProduct,
    });
  } catch (error) {
    console.error(
      "ACTIVATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to activate product",
    });
  }
}

/* =========================================================
   DEACTIVATE PRODUCT
========================================================= */

export async function deactivateProduct(
  req,
  res
) {
  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    const updatedProduct =
      await prisma.product.update({
        where: {
          id: productId,
        },

        data: {
          active: false,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Product deactivated successfully",
      product:
        updatedProduct,
    });
  } catch (error) {
    console.error(
      "DEACTIVATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to deactivate product",
    });
  }
}