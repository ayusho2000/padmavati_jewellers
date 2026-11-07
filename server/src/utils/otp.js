import crypto from "crypto";

export function generateOTP() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

export function getOTPExpiry() {
  const expiry = new Date();

  expiry.setMinutes(
    expiry.getMinutes() + 10
  );

  return expiry;
}

export function hashOTP(otp) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}