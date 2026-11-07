import { useState } from "react";

import {
  FaKey,
  FaEnvelope,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimes,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";
import { getToken } from "../../utils/auth";

import "./ChangePassword.css";

function ChangePassword() {
  const [step, setStep] = useState(1);

  const [currentPassword, setCurrentPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function validateCurrentPassword() {
    if (!currentPassword) {
      setError("Please enter your current password.");
      return false;
    }

    return true;
  }

  async function handleRequestOTP() {
    clearMessages();

    if (!validateCurrentPassword()) {
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/auth/change-password/request-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
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
            "Unable to send verification OTP."
        );
      }

      setSuccess(
        result?.message ||
          "Verification OTP has been sent to your email."
      );

      setStep(2);
    } catch (error) {
      console.error(
        "REQUEST CHANGE PASSWORD OTP ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to send verification OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    clearMessages();

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must contain exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/auth/change-password/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            otp,
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
            "Invalid or expired OTP."
        );
      }

      setSuccess(
        result?.message ||
          "OTP verified successfully."
      );

      setStep(3);
    } catch (error) {
      console.error(
        "VERIFY CHANGE PASSWORD OTP ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    clearMessages();

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            newPassword,
            confirmPassword,
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
            "Unable to change password."
        );
      }

      setSuccess(
        result?.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

      setStep(4);
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    clearMessages();

    if (step === 2) {
      setOtp("");
      setStep(1);
      return;
    }

    if (step === 3) {
      setNewPassword("");
      setConfirmPassword("");
      setStep(2);
    }
  }

  function handleStartAgain() {
    clearMessages();

    setCurrentPassword("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");

    setStep(1);
  }

  function renderPasswordInput({
    id,
    value,
    setValue,
    showPassword,
    setShowPassword,
    placeholder,
    autoComplete,
  }) {
    return (
      <div className="change-password-input-wrapper">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={loading}
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              (previous) => !previous
            )
          }
          disabled={loading}
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
    );
  }

  return (
    <div className="change-password-page">
      <div className="change-password-header">
        <div>
          <span className="change-password-eyebrow">
            SECURITY
          </span>

          <h1>Change Password</h1>

          <p>
            Secure your administrator account with
            email OTP verification.
          </p>
        </div>
      </div>

      <div className="change-password-card">
        <div className="change-password-progress">
          <div
            className={`change-password-step ${
              step >= 1 ? "active" : ""
            } ${
              step > 1 ? "completed" : ""
            }`}
          >
            <span>
              {step > 1 ? (
                <FaCheckCircle />
              ) : (
                "1"
              )}
            </span>

            <div>
              <strong>
                Current Password
              </strong>

              <small>
                Verify your account
              </small>
            </div>
          </div>

          <div className="change-password-progress-line" />

          <div
            className={`change-password-step ${
              step >= 2 ? "active" : ""
            } ${
              step > 2 ? "completed" : ""
            }`}
          >
            <span>
              {step > 2 ? (
                <FaCheckCircle />
              ) : (
                "2"
              )}
            </span>

            <div>
              <strong>
                Email OTP
              </strong>

              <small>
                Verify your identity
              </small>
            </div>
          </div>

          <div className="change-password-progress-line" />

          <div
            className={`change-password-step ${
              step >= 3 ? "active" : ""
            } ${
              step > 3 ? "completed" : ""
            }`}
          >
            <span>
              {step > 3 ? (
                <FaCheckCircle />
              ) : (
                "3"
              )}
            </span>

            <div>
              <strong>
                New Password
              </strong>

              <small>
                Set your new password
              </small>
            </div>
          </div>
        </div>

        {error && (
          <div className="change-password-message error">
            <div>
              <strong>
                Something went wrong
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {success && step !== 4 && (
          <div className="change-password-message success">
            <div>
              <strong>
                Verification successful
              </strong>

              <span>{success}</span>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Close success"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="change-password-form">
            <div className="change-password-icon">
              <FaKey />
            </div>

            <h2>
              Verify Current Password
            </h2>

            <p>
              Enter your current password to
              continue. We will send a 6-digit
              verification OTP to your registered
              admin email.
            </p>

            <div className="change-password-field">
              <label htmlFor="current-password">
                Current Password
              </label>

              {renderPasswordInput({
                id: "current-password",
                value: currentPassword,
                setValue: setCurrentPassword,
                showPassword:
                  showCurrentPassword,
                setShowPassword:
                  setShowCurrentPassword,
                placeholder:
                  "Enter your current password",
                autoComplete:
                  "current-password",
              })}
            </div>

            <button
              type="button"
              className="change-password-primary-button"
              onClick={handleRequestOTP}
              disabled={loading}
            >
              {loading
                ? "Sending OTP..."
                : "Send Verification OTP"}

              {!loading && <FaArrowRight />}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="change-password-form">
            <div className="change-password-icon">
              <FaEnvelope />
            </div>

            <h2>
              Verify Email OTP
            </h2>

            <p>
              Enter the 6-digit OTP sent to your
              registered administrator email
              address.
            </p>

            <div className="change-password-field">
              <label htmlFor="change-password-otp">
                Verification OTP
              </label>

              <input
                id="change-password-otp"
                className="change-password-otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="000000"
                autoComplete="one-time-code"
                disabled={loading}
              />

              <small>
                Enter the 6-digit code from your
                email.
              </small>
            </div>

            <div className="change-password-button-row">
              <button
                type="button"
                className="change-password-secondary-button"
                onClick={handleBack}
                disabled={loading}
              >
                <FaArrowLeft />
                Back
              </button>

              <button
                type="button"
                className="change-password-primary-button"
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}

                {!loading && <FaArrowRight />}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="change-password-form">
            <div className="change-password-icon">
              <FaShieldAlt />
            </div>

            <h2>
              Create New Password
            </h2>

            <p>
              Your OTP has been verified. Create
              a new secure password for your
              administrator account.
            </p>

            <div className="change-password-field">
              <label htmlFor="new-password">
                New Password
              </label>

              {renderPasswordInput({
                id: "new-password",
                value: newPassword,
                setValue: setNewPassword,
                showPassword:
                  showNewPassword,
                setShowPassword:
                  setShowNewPassword,
                placeholder:
                  "Enter new password",
                autoComplete:
                  "new-password",
              })}
            </div>

            <div className="change-password-field">
              <label htmlFor="confirm-password">
                Confirm New Password
              </label>

              {renderPasswordInput({
                id: "confirm-password",
                value: confirmPassword,
                setValue: setConfirmPassword,
                showPassword:
                  showConfirmPassword,
                setShowPassword:
                  setShowConfirmPassword,
                placeholder:
                  "Confirm new password",
                autoComplete:
                  "new-password",
              })}
            </div>

            <div className="change-password-requirements">
              <span>
                <FaCheckCircle />
                Minimum 8 characters
              </span>

              <span>
                <FaCheckCircle />
                Both passwords must match
              </span>
            </div>

            <div className="change-password-button-row">
              <button
                type="button"
                className="change-password-secondary-button"
                onClick={handleBack}
                disabled={loading}
              >
                <FaArrowLeft />
                Back
              </button>

              <button
                type="button"
                className="change-password-primary-button"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading
                  ? "Changing..."
                  : "Change Password"}

                {!loading && <FaCheckCircle />}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="change-password-success">
            <div className="change-password-success-icon">
              <FaCheckCircle />
            </div>

            <h2>
              Password Changed Successfully
            </h2>

            <p>
              Your administrator password has been
              changed successfully.
            </p>

            <button
              type="button"
              className="change-password-primary-button"
              onClick={handleStartAgain}
            >
              Change Password Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePassword;
