import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  FaTachometerAlt,
  FaVideo,
  FaGem,
  FaImages,
  FaStar,
  FaInstagram,
  FaEnvelope,
  FaUsersCog,
  FaKey,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { useEffect, useState } from "react";

import {
  removeToken,
  getToken,
} from "../../utils/auth";

import { API_BASE_URL } from "../../config/api";

import "./DashboardLayout.css";

function DashboardLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [admin, setAdmin] = useState(null);

  const [loadingAdmin, setLoadingAdmin] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchAdmin() {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Authentication failed."
          );
        }

        if (mounted) {
          setAdmin(data.admin);
        }
      } catch (error) {
        console.error(
          "Unable to load admin information:",
          error
        );

        removeToken();

        localStorage.removeItem(
          "padmavati_admin_name"
        );

        localStorage.removeItem(
          "padmavati_admin_email"
        );

        if (mounted) {
          navigate("/login", {
            replace: true,
          });
        }
      } finally {
        if (mounted) {
          setLoadingAdmin(false);
        }
      }
    }

    fetchAdmin();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  function handleLogout() {
    removeToken();

    localStorage.removeItem(
      "padmavati_admin_name"
    );

    localStorage.removeItem(
      "padmavati_admin_email"
    );

    navigate("/login", {
      replace: true,
    });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const adminName =
    admin?.name || "Administrator";

  const adminEmail =
    admin?.email || "Admin";

  const adminRole =
    admin?.role || "ADMIN";

  const adminInitial =
    adminName.charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">

      {/* ==========================================
                  MOBILE OVERLAY
      ========================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* ==========================================
                      SIDEBAR
      ========================================== */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen
            ? "dashboard-sidebar-open"
            : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="sidebar-brand-name">
            PADMAVATI
          </div>

          <div className="sidebar-brand-subtitle">
            JEWELLERS
          </div>

        </div>

        <div className="sidebar-navigation">

          <div className="sidebar-section-title">
            MAIN
          </div>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>

          <div className="sidebar-section-title">
            WEBSITE
          </div>

          <NavLink
            to="/dashboard/hero"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaVideo />
            <span>Hero Video</span>
          </NavLink>

          <NavLink
            to="/dashboard/products"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaGem />
            <span>Products</span>
          </NavLink>


          <NavLink
            to="/dashboard/collections"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaImages />
            <span>Collections</span>
          </NavLink>

          <NavLink
            to="/dashboard/testimonials"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaStar />
            <span>Testimonials</span>
          </NavLink>

          <NavLink
            to="/dashboard/instagram"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaInstagram />
            <span>Instagram</span>
          </NavLink>

          <NavLink
            to="/dashboard/contact"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaEnvelope />
            <span>Contact Submissions</span>
          </NavLink>

          <div className="sidebar-section-title">
            ADMINISTRATION
          </div>

          <NavLink
            to="/dashboard/admins"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaUsersCog />
            <span>Admin Management</span>
          </NavLink>

          <NavLink
            to="/dashboard/change-password"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaKey />
            <span>Change Password</span>
          </NavLink>

        </div>

        {/* ==========================================
                    SIDEBAR FOOTER
        ========================================== */}

        <div className="sidebar-footer">

          <div className="sidebar-admin">

            <div className="sidebar-admin-avatar">
              {loadingAdmin
                ? "..."
                : adminInitial}
            </div>

            <div className="sidebar-admin-info">

              <strong>
                {loadingAdmin
                  ? "Loading..."
                  : adminName}
              </strong>

              <span>
                {loadingAdmin
                  ? "..."
                  : adminEmail}
              </span>

            </div>

          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* ==========================================
                    MAIN AREA
      ========================================== */}

      <div className="dashboard-main">

        {/* ==========================================
                      TOP HEADER
        ========================================== */}

        <header className="dashboard-header">

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen(
                (previous) => !previous
              )
            }
            aria-label={
              sidebarOpen
                ? "Close navigation"
                : "Open navigation"
            }
          >
            {sidebarOpen ? (
              <FaTimes />
            ) : (
              <FaBars />
            )}
          </button>

          <div className="dashboard-header-title">

            <h1>
              Admin Panel
            </h1>

            <p>
              Manage your Padmavati Jewellers
              website
            </p>

          </div>

          <div className="dashboard-header-admin">

            <div className="header-admin-avatar">
              {loadingAdmin
                ? "..."
                : adminInitial}
            </div>

            <div className="header-admin-info">

              <strong>
                {loadingAdmin
                  ? "Loading..."
                  : adminName}
              </strong>

              <span>
                {loadingAdmin
                  ? "..."
                  : `${adminRole} • ${adminEmail}`}
              </span>

            </div>

          </div>

        </header>

        {/* ==========================================
                    PAGE CONTENT
        ========================================== */}

        <main className="dashboard-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;