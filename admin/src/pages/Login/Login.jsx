import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import "./Login.css";

import { API_BASE_URL } from "../../config/api";
import { saveToken } from "../../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [resetData, setResetData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function clearMessages() {
    setError("");
    setMessage("");
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleResetChange(event) {
    const { name, value } = event.target;

    setResetData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* ==========================================
                    LOGIN
  ========================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    clearMessages();

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Login failed. Please check your credentials."
        );
        return;
      }

      const token =
        data.token ||
        data.accessToken;

      if (!token) {
        setError(
          "Login succeeded but no authentication token was received."
        );
        return;
      }

      saveToken(token);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      console.error(
        "Login error:",
        requestError
      );

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================
              FORGOT PASSWORD
  ========================================== */

  async function handleForgotPassword(event) {
    event.preventDefault();

    clearMessages();

    if (!formData.email.trim()) {
      setError("Please enter your admin email.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to process password reset request."
        );
        return;
      }

      setMessage(
        data.message ||
          "If an account exists with this email, a verification code has been sent."
      );

      setMode("reset");
    } catch (requestError) {
      console.error(
        "Forgot password error:",
        requestError
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================
              RESET PASSWORD
  ========================================== */

  async function handleResetPassword(event) {
    event.preventDefault();

    clearMessages();

    if (
      !formData.email.trim() ||
      !resetData.otp ||
      !resetData.newPassword ||
      !resetData.confirmPassword
    ) {
      setError(
        "Please enter the OTP, new password and confirmation password."
      );
      return;
    }

    const otp = resetData.otp.trim();

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the 6-digit OTP sent to your email."
      );
      return;
    }

    if (resetData.newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (
      resetData.newPassword !==
      resetData.confirmPassword
    ) {
      setError(
        "New password and confirmation password do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            otp,
            newPassword: resetData.newPassword,
            confirmPassword:
              resetData.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reset password."
        );
        return;
      }

      setMessage(
        data.message ||
          "Password reset successfully. You can now sign in."
      );

      setResetData({
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });

      setFormData((previous) => ({
        ...previous,
        password: "",
      }));

      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setMode("login");
    } catch (requestError) {
      console.error(
        "Reset password error:",
        requestError
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================
              BACK TO LOGIN
  ========================================== */

  function handleBackToLogin() {
    clearMessages();

    setMode("login");

    setResetData({
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  return (
    <main className="login-page">

      <div className="login-card">

        <div className="login-header">

          <p className="login-eyebrow">
            PADMAVATI JEWELLERS
          </p>

          {mode === "login" && (
            <>
              <h1>
                Admin Login
              </h1>

              <p>
                Sign in to manage your jewellery
                website.
              </p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h1>
                Forgot Password
              </h1>

              <p>
                Enter your admin email to receive
                a verification code.
              </p>
            </>
          )}

          {mode === "reset" && (
            <>
              <h1>
                Reset Password
              </h1>

              <p>
                Enter the 6-digit OTP sent to your
                email and create a new password.
              </p>
            </>
          )}

        </div>

        {/* ==========================================
                    LOGIN FORM
        ========================================== */}

        {mode === "login" && (
          <form onSubmit={handleSubmit}>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                className="login-success"
                role="status"
              >
                {message}
              </div>
            )}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={handleLoginChange}
                autoComplete="email"
                disabled={loading}
              />

            </div>

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

            <button
              type="button"
              className="forgot-password-button"
              onClick={() => {
                clearMessages();
                setMode("forgot");
              }}
              disabled={loading}
            >
              Forgot Password?
            </button>

          </form>
        )}

        {/* ==========================================
                FORGOT PASSWORD FORM
        ========================================== */}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword}>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                className="login-success"
                role="status"
              >
                {message}
              </div>
            )}

            <div className="form-group">

              <label htmlFor="forgot-email">
                Admin Email
              </label>

              <input
                id="forgot-email"
                type="email"
                name="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={handleLoginChange}
                autoComplete="email"
                disabled={loading}
              />

            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send OTP"}
            </button>

            <button
              type="button"
              className="forgot-password-button"
              onClick={handleBackToLogin}
              disabled={loading}
            >
              Back to Login
            </button>

          </form>
        )}

        {/* ==========================================
                  RESET PASSWORD FORM
        ========================================== */}

        {mode === "reset" && (
          <form onSubmit={handleResetPassword}>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                className="login-success"
                role="status"
              >
                {message}
              </div>
            )}

            <div className="form-group">

              <label htmlFor="reset-otp">
                Verification Code
              </label>

              <input
                id="reset-otp"
                type="text"
                name="otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={resetData.otp}
                onChange={handleResetChange}
                autoComplete="one-time-code"
                disabled={loading}
              />

            </div>

            <div className="form-group">

              <label htmlFor="new-password">
                New Password
              </label>

              <div className="password-wrapper">

                <input
                  id="new-password"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  placeholder="Enter new password"
                  value={resetData.newPassword}
                  onChange={handleResetChange}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowNewPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>

            <div className="form-group">

              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <div className="password-wrapper">

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={resetData.confirmPassword}
                  onChange={handleResetChange}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

            <button
              type="button"
              className="forgot-password-button"
              onClick={handleBackToLogin}
              disabled={loading}
            >
              Back to Login
            </button>

          </form>
        )}

      </div>

    </main>
  );
}

export default Login;
