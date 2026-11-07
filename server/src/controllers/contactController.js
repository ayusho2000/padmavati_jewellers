import prisma from "../config/prisma.js";


/* =========================================================
   GET ALL CONTACT SUBMISSIONS
========================================================= */

export async function getContactSubmissions(req, res) {
  try {
    const { status } = req.query;

    const where = {};

    if (status !== undefined) {
      const normalizedStatus = status.trim().toUpperCase();

      if (
        ![
          "NEW",
          "READ",
          "REPLIED",
          "ARCHIVED",
        ].includes(normalizedStatus)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact status",
        });
      }

      where.status = normalizedStatus;
    }

    const submissions =
      await prisma.contactSubmission.findMany({
        where,

        orderBy: [
          {
            submittedAt: "desc",
          },
        ],
      });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(
      "GET CONTACT SUBMISSIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch contact submissions",
    });
  }
}


/* =========================================================
   GET CONTACT SUBMISSION BY ID
========================================================= */

export async function getContactSubmissionById(
  req,
  res
) {
  try {
    const submissionId = Number(req.params.id);

    if (
      !Number.isInteger(submissionId) ||
      submissionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact submission ID",
      });
    }

    const submission =
      await prisma.contactSubmission.findUnique({
        where: {
          id: submissionId,
        },
      });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error(
      "GET CONTACT SUBMISSION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch contact submission",
    });
  }
}


/* =========================================================
   CREATE CONTACT SUBMISSION
   PUBLIC
========================================================= */

export async function createContactSubmission(
  req,
  res
) {
  try {
    const {
      name,
      email,
      phone,
      message,
    } = req.body;

    /* NAME */
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    /* EMAIL */
    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    /* PHONE */
    let normalizedPhone = null;

    if (
      phone !== undefined &&
      phone !== null
    ) {
      if (typeof phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number",
        });
      }

      normalizedPhone =
        phone.trim() || null;
    }

    /* MESSAGE */
    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const submission =
      await prisma.contactSubmission.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          message: message.trim(),
          status: "NEW",
        },
      });

    return res.status(201).json({
      success: true,
      message:
        "Contact submission created successfully",
      submission,
    });
  } catch (error) {
    console.error(
      "CREATE CONTACT SUBMISSION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create contact submission",
    });
  }
}


/* =========================================================
   UPDATE CONTACT STATUS
========================================================= */

export async function updateContactSubmissionStatus(
  req,
  res
) {
  try {
    const submissionId = Number(req.params.id);

    if (
      !Number.isInteger(submissionId) ||
      submissionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact submission ID",
      });
    }

    const submission =
      await prisma.contactSubmission.findUnique({
        where: {
          id: submissionId,
        },
      });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found",
      });
    }

    const { status } = req.body;

    if (typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const normalizedStatus =
      status.trim().toUpperCase();

    if (
      ![
        "NEW",
        "READ",
        "REPLIED",
        "ARCHIVED",
      ].includes(normalizedStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact status",
      });
    }

    const updatedSubmission =
      await prisma.contactSubmission.update({
        where: {
          id: submissionId,
        },

        data: {
          status: normalizedStatus,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Contact submission status updated successfully",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error(
      "UPDATE CONTACT STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update contact submission status",
    });
  }
}


/* =========================================================
   DELETE CONTACT SUBMISSION
========================================================= */

export async function deleteContactSubmission(
  req,
  res
) {
  try {
    const submissionId = Number(req.params.id);

    if (
      !Number.isInteger(submissionId) ||
      submissionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact submission ID",
      });
    }

    const submission =
      await prisma.contactSubmission.findUnique({
        where: {
          id: submissionId,
        },
      });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found",
      });
    }

    await prisma.contactSubmission.delete({
      where: {
        id: submissionId,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Contact submission deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE CONTACT SUBMISSION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete contact submission",
    });
  }
}