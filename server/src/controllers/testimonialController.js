import prisma from "../config/prisma.js";

/* =========================================================
   GET ALL TESTIMONIALS
   Public + Admin
========================================================= */

export async function getTestimonials(req, res) {
  try {
    const { active } = req.query;

    const where = {};

    if (active !== undefined) {
      if (active !== "true" && active !== "false") {
        return res.status(400).json({
          success: false,
          message: "Invalid active filter",
        });
      }

      where.active = active === "true";
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    console.error("GET TESTIMONIALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch testimonials",
    });
  }
}

/* =========================================================
   GET SINGLE TESTIMONIAL
========================================================= */

export async function getTestimonialById(req, res) {
  try {
    const testimonialId = Number(req.params.id);

    if (
      !Number.isInteger(testimonialId) ||
      testimonialId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    const testimonial =
      await prisma.testimonial.findUnique({
        where: {
          id: testimonialId,
        },
      });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    return res.status(200).json({
      success: true,
      testimonial,
    });
  } catch (error) {
    console.error("GET TESTIMONIAL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch testimonial",
    });
  }
}

/* =========================================================
   CREATE TESTIMONIAL
========================================================= */

export async function createTestimonial(req, res) {
  try {
    const {
      customerName,
      designation,
      text,
      rating,
      displayOrder,
    } = req.body;

    /* =====================================================
       CUSTOMER NAME VALIDATION
    ===================================================== */

    if (
      typeof customerName !== "string" ||
      !customerName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    /* =====================================================
       TESTIMONIAL TEXT VALIDATION
    ===================================================== */

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Testimonial text is required",
      });
    }

    const trimmedCustomerName =
      customerName.trim();

    const trimmedText =
      text.trim();

    /* =====================================================
       DESIGNATION
    ===================================================== */

    let trimmedDesignation = null;

    if (
      designation !== undefined &&
      designation !== null
    ) {
      if (typeof designation !== "string") {
        return res.status(400).json({
          success: false,
          message: "Designation must be a string",
        });
      }

      trimmedDesignation =
        designation.trim() || null;
    }

    /* =====================================================
       RATING
    ===================================================== */

    let normalizedRating = 5;

    if (rating !== undefined) {
      normalizedRating = Number(rating);

      if (
        !Number.isInteger(normalizedRating) ||
        normalizedRating < 1 ||
        normalizedRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be an integer between 1 and 5",
        });
      }
    }

    /* =====================================================
       DISPLAY ORDER
    ===================================================== */

    let normalizedDisplayOrder = 0;

    if (displayOrder !== undefined) {
      normalizedDisplayOrder =
        Number(displayOrder);

      if (
        !Number.isInteger(normalizedDisplayOrder) ||
        normalizedDisplayOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Display order must be a non-negative integer",
        });
      }
    }

    /* =====================================================
       CREATE
    ===================================================== */

    const testimonial =
      await prisma.testimonial.create({
        data: {
          customerName: trimmedCustomerName,
          designation: trimmedDesignation,
          text: trimmedText,
          rating: normalizedRating,
          displayOrder: normalizedDisplayOrder,
          active: true,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      testimonial,
    });
  } catch (error) {
    console.error(
      "CREATE TESTIMONIAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create testimonial",
    });
  }
}

/* =========================================================
   UPDATE TESTIMONIAL
========================================================= */

export async function updateTestimonial(req, res) {
  try {
    const testimonialId = Number(req.params.id);

    /* =====================================================
       ID VALIDATION
    ===================================================== */

    if (
      !Number.isInteger(testimonialId) ||
      testimonialId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    /* =====================================================
       CHECK EXISTING TESTIMONIAL
    ===================================================== */

    const existingTestimonial =
      await prisma.testimonial.findUnique({
        where: {
          id: testimonialId,
        },
      });

    if (!existingTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const {
      customerName,
      designation,
      text,
      rating,
      active,
      displayOrder,
    } = req.body;

    const data = {};

    /* =====================================================
       CUSTOMER NAME
    ===================================================== */

    if (customerName !== undefined) {
      if (typeof customerName !== "string") {
        return res.status(400).json({
          success: false,
          message: "Customer name must be a string",
        });
      }

      const trimmedName =
        customerName.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message:
            "Customer name cannot be empty",
        });
      }

      data.customerName = trimmedName;
    }

    /* =====================================================
       DESIGNATION

       IMPORTANT:
       null is allowed because the frontend sends null
       when designation is empty.
    ===================================================== */

    if (designation !== undefined) {
      if (
        designation !== null &&
        typeof designation !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Designation must be a string or null",
        });
      }

      data.designation =
        designation === null
          ? null
          : designation.trim() || null;
    }

    /* =====================================================
       TESTIMONIAL TEXT
    ===================================================== */

    if (text !== undefined) {
      if (typeof text !== "string") {
        return res.status(400).json({
          success: false,
          message: "Testimonial text must be a string",
        });
      }

      const trimmedText =
        text.trim();

      if (!trimmedText) {
        return res.status(400).json({
          success: false,
          message:
            "Testimonial text cannot be empty",
        });
      }

      data.text = trimmedText;
    }

    /* =====================================================
       RATING
    ===================================================== */

    if (rating !== undefined) {
      const normalizedRating =
        Number(rating);

      if (
        !Number.isInteger(normalizedRating) ||
        normalizedRating < 1 ||
        normalizedRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be an integer between 1 and 5",
        });
      }

      data.rating = normalizedRating;
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
          message: "Invalid active value",
        });
      }

      data.active =
        active === true ||
        active === "true";
    }

    /* =====================================================
       DISPLAY ORDER
    ===================================================== */

    if (displayOrder !== undefined) {
      const normalizedDisplayOrder =
        Number(displayOrder);

      if (
        !Number.isInteger(normalizedDisplayOrder) ||
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

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were provided",
      });
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    const testimonial =
      await prisma.testimonial.update({
        where: {
          id: testimonialId,
        },
        data,
      });

    return res.status(200).json({
      success: true,
      message:
        "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    console.error(
      "UPDATE TESTIMONIAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update testimonial",
    });
  }
}

/* =========================================================
   DELETE TESTIMONIAL
========================================================= */

export async function deleteTestimonial(req, res) {
  try {
    const testimonialId = Number(req.params.id);

    if (
      !Number.isInteger(testimonialId) ||
      testimonialId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    const testimonial =
      await prisma.testimonial.findUnique({
        where: {
          id: testimonialId,
        },
      });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await prisma.testimonial.delete({
      where: {
        id: testimonialId,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE TESTIMONIAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete testimonial",
    });
  }
}

/* =========================================================
   ACTIVATE TESTIMONIAL
========================================================= */

export async function activateTestimonial(req, res) {
  try {
    const testimonialId = Number(req.params.id);

    if (
      !Number.isInteger(testimonialId) ||
      testimonialId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    const testimonial =
      await prisma.testimonial.findUnique({
        where: {
          id: testimonialId,
        },
      });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const updatedTestimonial =
      await prisma.testimonial.update({
        where: {
          id: testimonialId,
        },
        data: {
          active: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Testimonial activated successfully",
      testimonial: updatedTestimonial,
    });
  } catch (error) {
    console.error(
      "ACTIVATE TESTIMONIAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to activate testimonial",
    });
  }
}

/* =========================================================
   DEACTIVATE TESTIMONIAL
========================================================= */

export async function deactivateTestimonial(
  req,
  res
) {
  try {
    const testimonialId = Number(req.params.id);

    if (
      !Number.isInteger(testimonialId) ||
      testimonialId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    const testimonial =
      await prisma.testimonial.findUnique({
        where: {
          id: testimonialId,
        },
      });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const updatedTestimonial =
      await prisma.testimonial.update({
        where: {
          id: testimonialId,
        },
        data: {
          active: false,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Testimonial deactivated successfully",
      testimonial: updatedTestimonial,
    });
  } catch (error) {
    console.error(
      "DEACTIVATE TESTIMONIAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to deactivate testimonial",
    });
  }
}