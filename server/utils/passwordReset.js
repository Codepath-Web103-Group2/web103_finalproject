import crypto from "crypto";
import nodemailer from "nodemailer";

let cachedDevelopmentTransport;

function isProductionEnvironment() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || process.env.CLIENT_APP_URL || "http://localhost:5173";
}

function createDevelopmentResetFallback(email, resetUrl) {
  console.warn(`Password reset email could not be delivered for ${email}. Falling back to development reset URL.`);
  console.log(`Password reset requested for ${email}: ${resetUrl}`);

  return {
    delivered: false,
    previewResetUrl: resetUrl,
  };
}

function shouldSendEmail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function getDevelopmentTransport() {
  if (cachedDevelopmentTransport) {
    return cachedDevelopmentTransport;
  }

  const testAccount = await nodemailer.createTestAccount();

  cachedDevelopmentTransport = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return cachedDevelopmentTransport;
}

export function createPasswordResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetExpiry() {
  return new Date(Date.now() + 60 * 60 * 1000);
}

export function buildPasswordResetUrl({ email, token }) {
  const url = new URL(getAppBaseUrl());

  url.searchParams.set("mode", "reset");
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);

  return url.toString();
}

export async function sendPasswordResetEmail({ email, fullName, resetUrl }) {
  const subject = "Reset your StudyBuddy Planner password";
  const text = [
    `Hi ${fullName || "there"},`,
    "",
    "We received a request to reset your StudyBuddy Planner password.",
    `Use this link to choose a new password: ${resetUrl}`,
    "",
    "This link expires in 1 hour.",
    "If you did not request this reset, you can ignore this email.",
  ].join("\n");

  const transport = shouldSendEmail()
    ? createTransport()
    : isProductionEnvironment()
      ? null
      : await getDevelopmentTransport();

  if (!transport) {
    console.warn("Password reset email was skipped because SMTP is not configured in production.");
    console.log(`Password reset requested for ${email}: ${resetUrl}`);
    return { delivered: false, previewResetUrl: resetUrl };
  }

  try {
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "StudyBuddy Planner <no-reply@studybuddy.dev>",
      to: email,
      subject,
      text,
    });

    return {
      delivered: true,
      previewResetUrl: nodemailer.getTestMessageUrl(info) || undefined,
    };
  } catch (error) {
    if (isProductionEnvironment()) {
      throw error;
    }

    console.warn("SMTP delivery failed during development.", error);
    return createDevelopmentResetFallback(email, resetUrl);
  }
}