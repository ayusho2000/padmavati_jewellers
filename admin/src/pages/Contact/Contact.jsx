import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaTrash,
  FaTimes,
  FaSyncAlt,
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";
import { getToken } from "../../utils/auth";

import "./Contact.css";


/* =========================================================
   STATUS OPTIONS
========================================================= */

const STATUS_OPTIONS = [
  "ALL",
  "NEW",
  "READ",
  "REPLIED",
  "ARCHIVED",
];


/* =========================================================
   CONTACT PAGE
========================================================= */

function Contact() {

  const [submissions, setSubmissions] =
    useState([]);

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* =======================================================
     FETCH SUBMISSIONS
  ======================================================= */

  async function fetchSubmissions(
    showRefresh = false
  ) {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const query =
        statusFilter === "ALL"
          ? ""
          : `?status=${statusFilter}`;

      const response =
        await fetch(
          `${API_BASE_URL}/contact${query}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let result = null;

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        result = await response.json();
      }

      if (!response.ok) {

        throw new Error(
          result?.message ||
          "Unable to fetch contact submissions"
        );

      }

      setSubmissions(
        result?.submissions || []
      );

    } catch (error) {

      console.error(
        "FETCH CONTACT SUBMISSIONS ERROR:",
        error
      );

      setError(
        error.message ||
        "Unable to fetch contact submissions"
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }


  /* =======================================================
     INITIAL / FILTER FETCH
  ======================================================= */

  useEffect(() => {

    fetchSubmissions();

  }, [statusFilter]);


  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  function clearMessages() {

    setError("");
    setSuccess("");

  }


  /* =======================================================
     VIEW SUBMISSION
  ======================================================= */

  async function handleViewSubmission(
    submission
  ) {

    clearMessages();

    try {

      const token = getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/contact/${submission.id}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let result = null;

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        result = await response.json();
      }

      if (!response.ok) {

        throw new Error(
          result?.message ||
          "Unable to fetch contact submission"
        );

      }

      setSelectedSubmission(
        result.submission
      );

    } catch (error) {

      console.error(
        "VIEW CONTACT SUBMISSION ERROR:",
        error
      );

      setError(
        error.message ||
        "Unable to fetch contact submission"
      );

    }

  }


  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  async function handleStatusChange(
    submissionId,
    newStatus
  ) {

    clearMessages();

    try {

      setUpdatingId(submissionId);

      const token = getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/contact/${submissionId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              status: newStatus,
            }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let result = null;

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        result = await response.json();
      }

      if (!response.ok) {

        throw new Error(
          result?.message ||
          "Unable to update contact status"
        );

      }

      setSubmissions(
        (previous) =>
          previous.map(
            (submission) =>
              submission.id ===
              submissionId
                ? {
                    ...submission,
                    status:
                      result.submission.status,
                    updatedAt:
                      result.submission.updatedAt,
                  }
                : submission
          )
      );

      if (
        selectedSubmission &&
        selectedSubmission.id ===
          submissionId
      ) {

        setSelectedSubmission(
          result.submission
        );

      }

      setSuccess(
        "Contact status updated successfully."
      );

    } catch (error) {

      console.error(
        "UPDATE CONTACT STATUS ERROR:",
        error
      );

      setError(
        error.message ||
        "Unable to update contact status"
      );

    } finally {

      setUpdatingId(null);

    }

  }


  /* =======================================================
     DELETE SUBMISSION
  ======================================================= */

  async function handleDelete(
    submissionId
  ) {

    clearMessages();

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this contact submission?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(submissionId);

      const token = getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/contact/${submissionId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let result = null;

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        result = await response.json();
      }

      if (!response.ok) {

        throw new Error(
          result?.message ||
          "Unable to delete contact submission"
        );

      }

      setSubmissions(
        (previous) =>
          previous.filter(
            (submission) =>
              submission.id !==
              submissionId
          )
      );

      if (
        selectedSubmission &&
        selectedSubmission.id ===
          submissionId
      ) {

        setSelectedSubmission(null);

      }

      setSuccess(
        "Contact submission deleted successfully."
      );

    } catch (error) {

      console.error(
        "DELETE CONTACT SUBMISSION ERROR:",
        error
      );

      setError(
        error.message ||
        "Unable to delete contact submission"
      );

    } finally {

      setDeletingId(null);

    }

  }


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  function formatDate(dateValue) {

    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  }


  /* =======================================================
     STATUS CLASS
  ======================================================= */

  function getStatusClass(status) {

    return (
      `contact-status contact-status-${status.toLowerCase()}`
    );

  }


  /* =======================================================
     CLOSE DETAILS
  ======================================================= */

  function closeDetails() {

    setSelectedSubmission(null);

  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="contact-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="contact-page-header">

        <div>

          <span className="contact-eyebrow">
            CUSTOMER ENQUIRIES
          </span>

          <h1>
            Contact Submissions
          </h1>

          <p>
            View and manage customer enquiries
            received through the website.
          </p>

        </div>

        <button
          type="button"
          className="contact-refresh-button"
          onClick={() =>
            fetchSubmissions(true)
          }
          disabled={refreshing}
        >

          <FaSyncAlt
            className={
              refreshing
                ? "contact-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* ===================================================
          SUCCESS
      =================================================== */}

      {success && (
        <div className="contact-success">

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <FaTimes />
          </button>

        </div>
      )}


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="contact-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <FaTimes />
          </button>

        </div>
      )}


      {/* ===================================================
          STATUS FILTERS
      =================================================== */}

      <div className="contact-filters">

        {STATUS_OPTIONS.map(
          (status) => (

            <button
              key={status}
              type="button"
              className={
                statusFilter === status
                  ? "contact-filter active"
                  : "contact-filter"
              }
              onClick={() => {
                clearMessages();
                setStatusFilter(status);
              }}
            >
              {status}
            </button>

          )
        )}

      </div>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="contact-content">

        {loading ? (

          <div className="contact-empty">

            <div className="contact-loader" />

            <p>
              Loading enquiries...
            </p>

          </div>

        ) : submissions.length === 0 ? (

          <div className="contact-empty">

            <div className="contact-empty-icon">
              <FaEnvelope />
            </div>

            <h3>
              No enquiries found
            </h3>

            <p>
              There are no contact submissions
              matching this filter.
            </p>

          </div>

        ) : (

          <div className="contact-table-wrapper">

            <table className="contact-table">

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Message
                  </th>

                  <th>
                    Submitted
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {submissions.map(
                  (submission) => (

                    <tr
                      key={
                        submission.id
                      }
                    >

                      {/* CUSTOMER */}

                      <td>

                        <div className="contact-customer">

                          <div className="contact-avatar">
                            <FaUser />
                          </div>

                          <div>

                            <strong>
                              {
                                submission.name
                              }
                            </strong>

                            <span>
                              #{submission.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* CONTACT */}

                      <td>

                        <div className="contact-info">

                          <a
                            href={
                              `mailto:${submission.email}`
                            }
                          >
                            <FaEnvelope />
                            {
                              submission.email
                            }
                          </a>

                          {submission.phone && (
                            <a
                              href={
                                `tel:${submission.phone}`
                              }
                            >
                              <FaPhone />
                              {
                                submission.phone
                              }
                            </a>
                          )}

                        </div>

                      </td>


                      {/* MESSAGE */}

                      <td>

                        <div className="contact-message-preview">

                          {
                            submission.message
                          }

                        </div>

                      </td>


                      {/* DATE */}

                      <td>

                        <div className="contact-date">

                          <FaCalendarAlt />

                          <span>
                            {
                              formatDate(
                                submission.submittedAt
                              )
                            }
                          </span>

                        </div>

                      </td>


                      {/* STATUS */}

                      <td>

                        <select
                          className={
                            getStatusClass(
                              submission.status
                            )
                          }
                          value={
                            submission.status
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              submission.id,
                              event.target.value
                            )
                          }
                          disabled={
                            updatingId ===
                            submission.id
                          }
                        >

                          <option value="NEW">
                            NEW
                          </option>

                          <option value="READ">
                            READ
                          </option>

                          <option value="REPLIED">
                            REPLIED
                          </option>

                          <option value="ARCHIVED">
                            ARCHIVED
                          </option>

                        </select>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="contact-actions">

                          <button
                            type="button"
                            className="contact-view-button"
                            onClick={() =>
                              handleViewSubmission(
                                submission
                              )
                            }
                            title="View"
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="contact-delete-button"
                            onClick={() =>
                              handleDelete(
                                submission.id
                              )
                            }
                            disabled={
                              deletingId ===
                              submission.id
                            }
                            title="Delete"
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ===================================================
          DETAILS MODAL
      =================================================== */}

      {selectedSubmission && (

        <div
          className="contact-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="contact-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="contact-modal-header">

              <div>

                <span>
                  ENQUIRY #{selectedSubmission.id}
                </span>

                <h2>
                  {selectedSubmission.name}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="contact-modal-close"
              >
                <FaTimes />
              </button>

            </div>


            <div className="contact-modal-body">

              <div className="contact-detail-item">

                <span>
                  <FaEnvelope />
                  Email
                </span>

                <a
                  href={
                    `mailto:${selectedSubmission.email}`
                  }
                >
                  {selectedSubmission.email}
                </a>

              </div>


              <div className="contact-detail-item">

                <span>
                  <FaPhone />
                  Phone
                </span>

                {selectedSubmission.phone ? (

                  <a
                    href={
                      `tel:${selectedSubmission.phone}`
                    }
                  >
                    {selectedSubmission.phone}
                  </a>

                ) : (

                  <strong>
                    Not provided
                  </strong>

                )}

              </div>


              <div className="contact-detail-item">

                <span>
                  <FaCalendarAlt />
                  Submitted
                </span>

                <strong>
                  {
                    formatDate(
                      selectedSubmission.submittedAt
                    )
                  }
                </strong>

              </div>


              <div className="contact-detail-item">

                <span>
                  Status
                </span>

                <select
                  className={
                    getStatusClass(
                      selectedSubmission.status
                    )
                  }
                  value={
                    selectedSubmission.status
                  }
                  onChange={(event) =>
                    handleStatusChange(
                      selectedSubmission.id,
                      event.target.value
                    )
                  }
                  disabled={
                    updatingId ===
                    selectedSubmission.id
                  }
                >

                  <option value="NEW">
                    NEW
                  </option>

                  <option value="READ">
                    READ
                  </option>

                  <option value="REPLIED">
                    REPLIED
                  </option>

                  <option value="ARCHIVED">
                    ARCHIVED
                  </option>

                </select>

              </div>


              <div className="contact-detail-message">

                <span>
                  Message
                </span>

                <p>
                  {
                    selectedSubmission.message
                  }
                </p>

              </div>

            </div>


            <div className="contact-modal-footer">

              <button
                type="button"
                className="contact-modal-delete"
                onClick={() =>
                  handleDelete(
                    selectedSubmission.id
                  )
                }
                disabled={
                  deletingId ===
                  selectedSubmission.id
                }
              >
                <FaTrash />
                Delete Enquiry
              </button>

              <button
                type="button"
                className="contact-modal-done"
                onClick={closeDetails}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Contact;