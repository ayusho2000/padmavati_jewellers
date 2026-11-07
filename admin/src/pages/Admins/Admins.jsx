import { useEffect, useState } from "react";

import {
  FaPlus,
  FaUserShield,
  FaSyncAlt,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaPowerOff,
  FaTrash,
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";
import { getToken } from "../../utils/auth";

import "./Admins.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
};

function Admins() {
  /* =====================================================
     ADMIN LIST
  ===================================================== */

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =====================================================
     ADD / EDIT FORM
  ===================================================== */

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editingAdminId, setEditingAdminId] =
    useState(null);

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [showPassword, setShowPassword] =
    useState(false);

  const [saving, setSaving] = useState(false);

  /* =====================================================
     STATUS
  ===================================================== */

  const [statusChanging, setStatusChanging] =
    useState(null);

  /* =====================================================
     DELETE
  ===================================================== */

  const [deletingAdmin, setDeletingAdmin] =
    useState(null);

  const [deleteError, setDeleteError] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  /* =====================================================
     MESSAGES
  ===================================================== */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  /* =====================================================
     FETCH ADMINS
  ===================================================== */

  async function fetchAdmins(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/admins`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type");

      let result = null;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        result = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to fetch administrators"
        );
      }

      setAdmins(result?.admins || []);
    } catch (error) {
      console.error(
        "FETCH ADMINS ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to fetch administrators"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  /* =====================================================
     CLEAR MESSAGES
  ===================================================== */

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  /* =====================================================
     ADD ADMIN
  ===================================================== */

  function openAddForm() {
    clearMessages();

    setFormMode("add");
    setEditingAdminId(null);
    setFormData(INITIAL_FORM);
    setFormError("");
    setShowPassword(false);
    setShowForm(true);
  }

  /* =====================================================
     EDIT ADMIN
  ===================================================== */

  function openEditForm(admin) {
    clearMessages();

    setFormMode("edit");
    setEditingAdminId(admin.id);

    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
    });

    setFormError("");
    setShowPassword(false);
    setShowForm(true);
  }

  /* =====================================================
     CLOSE ADD / EDIT FORM
  ===================================================== */

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setFormMode("add");
    setEditingAdminId(null);
    setFormData(INITIAL_FORM);
    setFormError("");
    setShowPassword(false);
  }

  /* =====================================================
     FORM INPUT
  ===================================================== */

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  }

  /* =====================================================
     CREATE ADMIN
  ===================================================== */

  async function handleCreateAdmin() {
    const name = formData.name.trim();

    const email = formData.email
      .trim()
      .toLowerCase();

    const password = formData.password;

    if (!name) {
      setFormError(
        "Admin name is required."
      );
      return;
    }

    if (!email) {
      setFormError(
        "Admin email is required."
      );
      return;
    }

    if (!password) {
      setFormError(
        "Admin password is required."
      );
      return;
    }

    if (password.length < 8) {
      setFormError(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/admins`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let result = null;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        result = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to create administrator"
        );
      }

      closeForm();

      setSuccess(
        result?.message ||
          "Administrator created successfully."
      );

      await fetchAdmins(true);
    } catch (error) {
      console.error(
        "CREATE ADMIN ERROR:",
        error
      );

      setFormError(
        error.message ||
          "Unable to create administrator"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     UPDATE ADMIN
  ===================================================== */

  async function handleUpdateAdmin() {
    const name = formData.name.trim();

    const email = formData.email
      .trim()
      .toLowerCase();

    if (!name) {
      setFormError(
        "Admin name is required."
      );
      return;
    }

    if (!email) {
      setFormError(
        "Admin email is required."
      );
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/admins/${editingAdminId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let result = null;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        result = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to update administrator"
        );
      }

      closeForm();

      setSuccess(
        result?.message ||
          "Administrator updated successfully."
      );

      await fetchAdmins(true);
    } catch (error) {
      console.error(
        "UPDATE ADMIN ERROR:",
        error
      );

      setFormError(
        error.message ||
          "Unable to update administrator"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     ACTIVATE / DEACTIVATE ADMIN
  ===================================================== */

  async function handleToggleStatus(admin) {
    clearMessages();

    const isActive =
      admin.status === "ACTIVE";

    const newStatus = isActive
      ? "INACTIVE"
      : "ACTIVE";

    const action = isActive
      ? "deactivate"
      : "activate";

    try {
      setStatusChanging(admin.id);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/admins/${admin.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let result = null;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        result = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Unable to ${action} administrator`
        );
      }

      setSuccess(
        result?.message ||
          `Administrator ${
            isActive
              ? "deactivated"
              : "activated"
          } successfully.`
      );

      await fetchAdmins(true);
    } catch (error) {
      console.error(
        "TOGGLE ADMIN STATUS ERROR:",
        error
      );

      setError(
        error.message ||
          `Unable to ${action} administrator`
      );
    } finally {
      setStatusChanging(null);
    }
  }

  /* =====================================================
     OPEN DELETE CONFIRMATION
  ===================================================== */

  function openDeleteConfirmation(admin) {
    clearMessages();

    setDeleteError("");
    setDeletingAdmin(admin);
  }

  /* =====================================================
     CLOSE DELETE CONFIRMATION
  ===================================================== */

  function closeDeleteConfirmation() {
    if (deleting) return;

    setDeletingAdmin(null);
    setDeleteError("");
  }

  /* =====================================================
     DELETE ADMIN
  ===================================================== */

  async function handleDeleteAdmin() {
    if (!deletingAdmin) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/admins/${deletingAdmin.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type");

      let result = null;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        result = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to delete administrator"
        );
      }

      setDeletingAdmin(null);
      setDeleteError("");

      setSuccess(
        result?.message ||
          "Administrator deleted successfully."
      );

      await fetchAdmins(true);
    } catch (error) {
      console.error(
        "DELETE ADMIN ERROR:",
        error
      );

      setDeleteError(
        error.message ||
          "Unable to delete administrator"
      );
    } finally {
      setDeleting(false);
    }
  }

  /* =====================================================
     FORM SUBMIT
  ===================================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    clearMessages();
    setFormError("");

    if (formMode === "edit") {
      await handleUpdateAdmin();
      return;
    }

    await handleCreateAdmin();
  }

  return (
    <div className="admins-page">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="admins-page-header">
        <div>
          <span className="admins-eyebrow">
            ADMINISTRATION
          </span>

          <h1>Admin Management</h1>

          <p>
            Manage administrators and account
            access for the Padmavati Jewellers
            dashboard.
          </p>
        </div>

        <div className="admins-header-actions">
          <button
            type="button"
            className="admins-refresh-button"
            onClick={() => fetchAdmins(true)}
            disabled={
              refreshing ||
              statusChanging !== null ||
              deleting
            }
          >
            <FaSyncAlt
              className={
                refreshing
                  ? "admins-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="admins-add-button"
            onClick={openAddForm}
            disabled={
              statusChanging !== null ||
              deleting
            }
          >
            <FaPlus />

            Add Admin
          </button>
        </div>
      </div>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {success && (
        <div className="admins-success">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close success message"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =================================================
          PAGE ERROR
      ================================================= */}

      {error && (
        <div className="admins-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error message"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =================================================
          ADMIN TABLE
      ================================================= */}

      <div className="admins-content">
        {loading ? (
          <div className="admins-empty">
            <div className="admins-loader" />

            <p>
              Loading administrators...
            </p>
          </div>
        ) : admins.length === 0 ? (
          <div className="admins-empty">
            <div className="admins-empty-icon">
              <FaUserShield />
            </div>

            <h3>
              No administrators found
            </h3>

            <p>
              There are currently no
              administrators available.
            </p>
          </div>
        ) : (
          <div className="admins-table-wrapper">
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin) => {
                  const isChanging =
                    statusChanging === admin.id;

                  const isActive =
                    admin.status === "ACTIVE";

                  return (
                    <tr key={admin.id}>
                      {/* ADMIN */}
                      <td>
                        <div className="admins-user">
                          <div className="admins-avatar">
                            <FaUserShield />
                          </div>

                          <div>
                            <strong>
                              {admin.name}
                            </strong>

                            <span>
                              #{admin.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td>
                        <span className="admins-email">
                          {admin.email}
                        </span>
                      </td>

                      {/* ROLE */}
                      <td>
                        <span
                          className={`admins-role admins-role-${String(
                            admin.role
                          ).toLowerCase()}`}
                        >
                          {admin.role}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`admins-status admins-status-${String(
                            admin.status
                          ).toLowerCase()}`}
                        >
                          {admin.status}
                        </span>
                      </td>

                      {/* LAST LOGIN */}
                      <td>
                        <span className="admins-date">
                          {admin.lastLogin
                            ? new Date(
                                admin.lastLogin
                              ).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Never"}
                        </span>
                      </td>

                      {/* CREATED */}
                      <td>
                        <span className="admins-date">
                          {admin.createdAt
                            ? new Date(
                                admin.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="admins-actions">
                          {/* EDIT */}
                          <button
                            type="button"
                            className="admins-edit-button"
                            onClick={() =>
                              openEditForm(admin)
                            }
                            disabled={
                              statusChanging !==
                                null ||
                              deleting
                            }
                            title="Edit administrator"
                          >
                            <FaEdit />
                          </button>

                          {/* ACTIVATE / DEACTIVATE */}
                          <button
                            type="button"
                            className={
                              isActive
                                ? "admins-status-button admins-status-deactivate"
                                : "admins-status-button admins-status-activate"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                admin
                              )
                            }
                            disabled={
                              isChanging ||
                              statusChanging !==
                                null ||
                              deleting
                            }
                            title={
                              isActive
                                ? "Deactivate administrator"
                                : "Activate administrator"
                            }
                          >
                            {isChanging ? (
                              <FaSyncAlt className="admins-spin" />
                            ) : (
                              <FaPowerOff />
                            )}
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            className="admins-delete-button"
                            onClick={() =>
                              openDeleteConfirmation(
                                admin
                              )
                            }
                            disabled={
                              statusChanging !==
                                null ||
                              deleting
                            }
                            title="Delete administrator"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (
        <div
          className="admins-modal-overlay"
          onClick={closeForm}
        >
          <div
            className="admins-modal admins-form-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="admins-modal-header">
              <div>
                <span>
                  ADMINISTRATION
                </span>

                <h2>
                  {formMode === "edit"
                    ? "Edit Administrator"
                    : "Add Administrator"}
                </h2>
              </div>

              <button
                type="button"
                className="admins-modal-close"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM ERROR */}
            {formError && (
              <div className="admins-form-error">
                <div>
                  <strong>
                    {formMode === "edit"
                      ? "Unable to update administrator"
                      : "Unable to create administrator"}
                  </strong>

                  <span>{formError}</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormError("")
                  }
                  aria-label="Close form error"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* FORM */}
            <form
              className="admins-form"
              onSubmit={handleSubmit}
            >
              <div className="admins-form-body">
                {/* NAME */}
                <div className="admins-form-group">
                  <label htmlFor="admin-name">
                    Full Name
                  </label>

                  <input
                    id="admin-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter administrator name"
                    autoComplete="name"
                    disabled={saving}
                  />
                </div>

                {/* EMAIL */}
                <div className="admins-form-group">
                  <label htmlFor="admin-email">
                    Email Address
                  </label>

                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter administrator email"
                    autoComplete="email"
                    disabled={saving}
                  />
                </div>

                {/* PASSWORD — ADD ONLY */}
                {formMode === "add" && (
                  <div className="admins-form-group">
                    <label htmlFor="admin-password">
                      Password
                    </label>

                    <div className="admins-password-wrapper">
                      <input
                        id="admin-password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        disabled={saving}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) =>
                              !previous
                          )
                        }
                        disabled={saving}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </div>

                    <small>
                      Password must contain at
                      least 8 characters.
                    </small>
                  </div>
                )}

                {/* EDIT PASSWORD NOTE */}
                {formMode === "edit" && (
                  <div className="admins-edit-note">
                    Password changes are handled
                    separately through OTP
                    verification.
                  </div>
                )}
              </div>

              {/* FORM FOOTER */}
              <div className="admins-form-footer">
                <button
                  type="button"
                  className="admins-form-cancel"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admins-form-submit"
                  disabled={saving}
                >
                  {saving
                    ? formMode === "edit"
                      ? "Updating..."
                      : "Creating..."
                    : formMode === "edit"
                      ? "Update Admin"
                      : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {deletingAdmin && (
        <div
          className="admins-modal-overlay"
          onClick={closeDeleteConfirmation}
        >
          <div
            className="admins-modal admins-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* DELETE ICON */}
            <div className="admins-delete-icon">
              <FaTrash />
            </div>

            {/* TITLE */}
            <h2>
              Delete Administrator?
            </h2>

            {/* MESSAGE */}
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deletingAdmin.name}
              </strong>
              ?
            </p>

            <span className="admins-delete-warning">
              This action cannot be undone.
            </span>

            {/* DELETE ERROR */}
            {deleteError && (
              <div className="admins-delete-error">
                <div>
                  <strong>
                    Unable to delete administrator
                  </strong>

                  <span>
                    {deleteError}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteError("")
                  }
                  disabled={deleting}
                  aria-label="Close delete error"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* DELETE FOOTER */}
            <div className="admins-delete-footer">
              <button
                type="button"
                className="admins-delete-cancel"
                onClick={closeDeleteConfirmation}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admins-delete-confirm"
                onClick={handleDeleteAdmin}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admins;
