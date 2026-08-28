import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";

dotenv.config();

export const authRouter = Router();

// ─────────────────────────────────────────────
// File-Backed Persistent Stores
// ─────────────────────────────────────────────
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roleTitle: string;
  plan: "Starter" | "Pro Architect" | "Team & Org";
  weeklyHours: number;
  streakDays: number;
  createdAt: string;
  emailVerified: boolean;
}

interface OTPRecord {
  otp: string;
  email: string;
  purpose: "verify" | "login" | "reset";
  expiresAt: number;
  attempts: number;
}

const DATA_DIR = path.join(process.cwd(), "server", "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function ensureStoreFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify({ users: {}, sessions: {} }, null, 2), "utf8");
    }
  } catch (err) {
    console.error("[AuthStore] Failed to initialize store file:", err);
  }
}

function loadStore(): { users: Record<string, StoredUser>; sessions: Record<string, string> } {
  ensureStoreFile();
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || {},
      sessions: parsed.sessions || {},
    };
  } catch (err) {
    return { users: {}, sessions: {} };
  }
}

function saveStore(usersObj: Record<string, StoredUser>, sessionsObj: Record<string, string>) {
  ensureStoreFile();
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ users: usersObj, sessions: sessionsObj }, null, 2), "utf8");
  } catch (err) {
    console.error("[AuthStore] Failed to write store file:", err);
  }
}

// In-memory maps synced with disk
const initialStore = loadStore();
const userStore = new Map<string, StoredUser>(Object.entries(initialStore.users));
const sessionStore = new Map<string, string>(Object.entries(initialStore.sessions));
const otpStore = new Map<string, OTPRecord>(); // OTPs stay ephemeral

function syncStoreToDisk() {
  const usersObj: Record<string, StoredUser> = {};
  for (const [k, v] of userStore.entries()) {
    usersObj[k] = v;
  }
  const sessionsObj: Record<string, string> = {};
  for (const [k, v] of sessionStore.entries()) {
    sessionsObj[k] = v;
  }
  saveStore(usersObj, sessionsObj);
}

// Automatic cleanup of expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

// ─────────────────────────────────────────────
// Helpers (PBKDF2 Password Hashing)
// ─────────────────────────────────────────────
function hashPassword(password: string): string {
  const salt = "auralearn_secure_salt_v2";
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function makeUserPublic(u: StoredUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    roleTitle: u.roleTitle,
    plan: u.plan,
    weeklyHours: u.weeklyHours,
    streakDays: u.streakDays,
    createdAt: u.createdAt,
    emailVerified: u.emailVerified,
  };
}

// ─────────────────────────────────────────────
// Nodemailer transporter (SMTP)
// ─────────────────────────────────────────────
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null; // SMTP not configured
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function sendOTPEmail(email: string, otp: string, purpose: string): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    // Dev mode: just log the OTP to server console if SMTP is not configured
    console.log(`\n╔══════════════════════════════════════╗`);
    console.log(`║  [AuraLearn OTP — DEV MODE]          ║`);
    console.log(`║  Email   : ${email.padEnd(28)}║`);
    console.log(`║  OTP     : ${otp.padEnd(28)}║`);
    console.log(`║  Purpose : ${purpose.padEnd(28)}║`);
    console.log(`╚══════════════════════════════════════╝\n`);
    return true;
  }

  const fromName = "AuraLearn";
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const purposeLabel =
    purpose === "verify"
      ? "Email Verification"
      : purpose === "reset"
      ? "Password Reset"
      : "Sign-In OTP";

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;margin-bottom:12px;">
                <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">🔮 AuraLearn</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">${purposeLabel}</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Your secure one-time verification code</p>
            </td>
          </tr>
          <!-- OTP Block -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
                Use this OTP to complete your ${purposeLabel.toLowerCase()}. This code expires in <strong>10 minutes</strong> and can only be used once.
              </p>
              <div style="background:#f8fafc;border:2px dashed #bfdbfe;border-radius:16px;padding:28px 40px;display:inline-block;margin-bottom:24px;">
                <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#1e40af;font-family:monospace;">${otp}</div>
              </div>
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                AuraLearn · AI-Powered Personalized Learning · 
                <a href="#" style="color:#3b82f6;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `${otp} — Your AuraLearn ${purposeLabel} Code`,
      html: htmlBody,
      text: `Your AuraLearn ${purposeLabel} OTP is: ${otp}\n\nThis code expires in 10 minutes.`,
    });
    return true;
  } catch (err) {
    console.error("[AuthRoutes] Failed to send OTP email:", err);
    return false;
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password, roleTitle? }
// ─────────────────────────────────────────────
authRouter.post("/auth/register", async (req: Request, res: Response) => {
  const { name, email, password, roleTitle } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ success: false, error: "Name, email, and password are required." });
  }
  if (!email.includes("@")) {
    return res.status(400).json({ success: false, error: "Please enter a valid email address." });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
  }
  if (userStore.has(email.toLowerCase())) {
    return res.status(409).json({ success: false, error: "An account with this email already exists. Please sign in." });
  }

  const otp = generateOTP();
  otpStore.set(email.toLowerCase(), {
    otp,
    email: email.toLowerCase(),
    purpose: "verify",
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });

  // Temporarily stash the user data in the OTP payload until they verify
  const pendingUser: StoredUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    roleTitle: roleTitle?.trim() || "Software Engineer",
    plan: "Pro Architect",
    weeklyHours: 10,
    streakDays: 0,
    createdAt: new Date().toISOString(),
    emailVerified: false,
  };
  // Use a temporary key so we don't mark them as fully registered
  userStore.set(`pending:${email.toLowerCase()}`, pendingUser);

  const sent = await sendOTPEmail(email, otp, "verify");
  if (!sent) {
    return res.status(500).json({ success: false, error: "Failed to send verification email. Please try again." });
  }

  return res.json({ success: true, message: "OTP sent to your email. Please verify to complete registration." });
});

// ─────────────────────────────────────────────
// POST /api/auth/verify-otp
// Body: { email, otp }
// ─────────────────────────────────────────────
authRouter.post("/auth/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: "Email and OTP are required." });
  }

  const normalizedEmail = email.toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({ success: false, error: "No OTP found for this email. Please request a new one." });
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ success: false, error: "OTP has expired. Please request a new one." });
  }
  if (record.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return res.status(429).json({ success: false, error: "Too many attempts. Please request a new OTP." });
  }
  if (record.otp !== otp.toString()) {
    record.attempts += 1;
    return res.status(401).json({ success: false, error: `Incorrect OTP. ${5 - record.attempts} attempt(s) remaining.` });
  }

  // OTP valid — complete registration or login
  otpStore.delete(normalizedEmail);

  if (record.purpose === "verify") {
    // Finalize registration
    const pendingUser = userStore.get(`pending:${normalizedEmail}`);
    if (!pendingUser) {
      return res.status(400).json({ success: false, error: "Registration session expired. Please register again." });
    }
    pendingUser.emailVerified = true;
    userStore.delete(`pending:${normalizedEmail}`);
    userStore.set(normalizedEmail, pendingUser);

    const token = generateToken();
    sessionStore.set(token, normalizedEmail);
    syncStoreToDisk();

    return res.json({
      success: true,
      token,
      user: makeUserPublic(pendingUser),
      isNewUser: true,
      message: "Account created and verified successfully! Welcome to AuraLearn.",
    });
  }

  if (record.purpose === "login") {
    const user = userStore.get(normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, error: "Account not found." });
    }
    const token = generateToken();
    sessionStore.set(token, normalizedEmail);
    syncStoreToDisk();
    return res.json({ success: true, token, user: makeUserPublic(user), isNewUser: false });
  }

  if (record.purpose === "reset") {
    // Return a temporary reset token in the OTP confirm step
    const resetToken = generateToken();
    // Store temporarily so /auth/reset-password can use it
    sessionStore.set(`reset:${resetToken}`, normalizedEmail);
    return res.json({ success: true, resetToken, message: "OTP verified. You can now set a new password." });
  }

  return res.status(400).json({ success: false, error: "Unknown OTP purpose." });
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────────
authRouter.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }

  const normalizedEmail = email.toLowerCase();
  const user = userStore.get(normalizedEmail);

  if (!user) {
    return res.status(401).json({ success: false, error: "No account found with this email. Please create an account." });
  }

  if (user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ success: false, error: "Incorrect password. Please try again." });
  }

  const token = generateToken();
  sessionStore.set(token, normalizedEmail);
  syncStoreToDisk();

  return res.json({ success: true, token, user: makeUserPublic(user), isNewUser: false });
});

// ─────────────────────────────────────────────
// POST /api/auth/send-otp-login
// Body: { email }  — sends a login OTP (passwordless sign-in)
// ─────────────────────────────────────────────
authRouter.post("/auth/send-otp-login", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "A valid email address is required." });
  }

  const normalizedEmail = email.toLowerCase();
  const user = userStore.get(normalizedEmail);
  if (!user) {
    return res.status(404).json({ success: false, error: "No account found with this email. Please create an account first." });
  }

  const otp = generateOTP();
  otpStore.set(normalizedEmail, {
    otp,
    email: normalizedEmail,
    purpose: "login",
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  const sent = await sendOTPEmail(email, otp, "login");
  if (!sent) {
    return res.status(500).json({ success: false, error: "Failed to send OTP. Please try again." });
  }

  return res.json({ success: true, message: "OTP sent! Check your inbox." });
});

// ─────────────────────────────────────────────
// POST /api/auth/send-otp-reset
// Body: { email }  — sends a password reset OTP
// ─────────────────────────────────────────────
authRouter.post("/auth/send-otp-reset", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "A valid email address is required." });
  }

  const normalizedEmail = email.toLowerCase();
  const user = userStore.get(normalizedEmail);
  if (!user) {
    // Don't reveal if email exists or not (security best practice)
    return res.json({ success: true, message: "If an account exists, you'll receive a reset OTP." });
  }

  const otp = generateOTP();
  otpStore.set(normalizedEmail, {
    otp,
    email: normalizedEmail,
    purpose: "reset",
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  await sendOTPEmail(email, otp, "reset");
  return res.json({ success: true, message: "If an account exists, you'll receive a reset OTP." });
});

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// Body: { resetToken, newPassword }
// ─────────────────────────────────────────────
authRouter.post("/auth/reset-password", async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ success: false, error: "Reset token and new password are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
  }

  const email = sessionStore.get(`reset:${resetToken}`);
  if (!email) {
    return res.status(400).json({ success: false, error: "Invalid or expired reset token. Please request a new OTP." });
  }

  const user = userStore.get(email);
  if (!user) {
    return res.status(404).json({ success: false, error: "Account not found." });
  }

  user.passwordHash = hashPassword(newPassword);
  sessionStore.delete(`reset:${resetToken}`);
  syncStoreToDisk();

  return res.json({ success: true, message: "Password reset successfully. You can now sign in." });
});

// ─────────────────────────────────────────────
// GET /api/auth/me
// Header: Authorization: Bearer <token>
// ─────────────────────────────────────────────
authRouter.get("/auth/me", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided." });
  }

  const email = sessionStore.get(token);
  if (!email) {
    return res.status(401).json({ success: false, error: "Invalid or expired session." });
  }

  const user = userStore.get(email);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found." });
  }

  return res.json({ success: true, user: makeUserPublic(user) });
});

// ─────────────────────────────────────────────
// POST /api/auth/logout
// Header: Authorization: Bearer <token>
// ─────────────────────────────────────────────
authRouter.post("/auth/logout", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (token) {
    sessionStore.delete(token);
    syncStoreToDisk();
  }
  return res.json({ success: true, message: "Logged out successfully." });
});
