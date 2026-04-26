import crypto from "crypto";
import nodemailer from "nodemailer";

let cachedDevelopmentTransport;

function isProductionEnvironment() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

function getAppBaseUrl() {
  return (
    process.env.APP_BASE_URL ||
    process.env.CLIENT_APP_URL ||
    "http://localhost:5173"
  );
}

function createDevelopmentResetFallback(email, resetUrl) {
  console.warn(
    `Password reset email could not be delivered for ${email}. Falling back to development reset URL.`,
  );
  console.log(`Password reset requested for ${email}: ${resetUrl}`);

  return {
    delivered: false,
    previewResetUrl: resetUrl,
  };
}

function shouldSendEmail() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
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

function buildEmailHtml({ fullName, resetUrl }) {
  const name = fullName || "there";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo / App name -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="display:inline-block;background:#000000;border-radius:14px;width:48px;height:48px;text-align:center;line-height:48px;">
                <span style="color:#ffffff;font-size:22px;">📚</span>
              </div>
              <p style="margin:10px 0 0;color:#1d1d1f;font-size:13px;font-weight:600;letter-spacing:0.5px;">
                StudyBuddy Planner
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:18px;padding:48px;box-shadow:0 2px 20px rgba(0,0,0,0.08);">

              <!-- Title -->
              <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:700;letter-spacing:-0.5px;line-height:1.2;">
                Reset Your Password
              </h1>
              <p style="margin:0 0 32px;color:#6e6e73;font-size:15px;line-height:1.6;">
                Hi ${name}, we received a request to reset your StudyBuddy Planner password.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e5e5ea;margin:0 0 32px;" />

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 40px;border-radius:980px;letter-spacing:-0.1px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry notice -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background:#f5f5f7;border-radius:10px;padding:16px 20px;">
                    <p style="margin:0;color:#6e6e73;font-size:13px;line-height:1.6;">
                      <strong style="color:#1d1d1f;">This link expires in 1 hour.</strong>
                      If it expires, you can request a new one from the login page.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;color:#aeaeb2;font-size:12px;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="margin:0;color:#aeaeb2;font-size:12px;line-height:1.8;">
                © ${new Date().getFullYear()} StudyBuddy Planner
              </p>
              <p style="margin:0;color:#c7c7cc;font-size:11px;">
                Private study planning for every semester sprint.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText({ fullName, resetUrl }) {
  const name = fullName || "there";
  return [
    `Hi ${name},`,
    "",
    "We received a request to reset your StudyBuddy Planner password.",
    `Use this link to choose a new password: ${resetUrl}`,
    "",
    "This link expires in 1 hour.",
    "If you did not request this reset, you can ignore this email.",
  ].join("\n");
}

export async function sendPasswordResetEmail({ email, fullName, resetUrl }) {
  const transport = shouldSendEmail()
    ? createTransport()
    : isProductionEnvironment()
      ? null
      : await getDevelopmentTransport();

  if (!transport) {
    console.warn(
      "Password reset email was skipped because SMTP is not configured in production.",
    );
    console.log(`Password reset requested for ${email}: ${resetUrl}`);
    return { delivered: false, previewResetUrl: resetUrl };
  }

  try {
    const info = await transport.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "StudyBuddy Planner <no-reply@studybuddy.dev>",
      to: email,
      subject: "Reset your StudyBuddy Planner password",
      text: buildEmailText({ fullName, resetUrl }),
      html: buildEmailHtml({ fullName, resetUrl }),
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
