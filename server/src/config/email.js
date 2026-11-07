import "dotenv/config";

import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM_NAME,
  SMTP_FROM_EMAIL,
} = process.env;

if (
  !SMTP_HOST ||
  !SMTP_PORT ||
  !SMTP_USER ||
  !SMTP_PASSWORD ||
  !SMTP_FROM_NAME ||
  !SMTP_FROM_EMAIL
) {
  throw new Error(
    "SMTP configuration is incomplete. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_NAME and SMTP_FROM_EMAIL in .env"
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,

  family: 4,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function verifyEmailConnection() {
  await transporter.verify();

  console.log("EMAIL SMTP CONNECTION VERIFIED");
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}) {
  return transporter.sendMail({
    from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
}