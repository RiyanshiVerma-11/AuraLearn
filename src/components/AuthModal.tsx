import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Briefcase,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { AuthUser } from "../types";
import { apiService, authToken, AuthUserData } from "../services/apiService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, isNewRegistration?: boolean) => void;
  initialMode?: "signin" | "signup";
}

type FlowStep =
  | "form"        // initial email/password form
  | "otp"         // OTP verification (after register OR magic login)
  | "reset-email" // enter email for password reset
  | "reset-otp"   // verify reset OTP
  | "reset-pass"; // set new password

function toAuthUser(u: AuthUserData): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    roleTitle: u.roleTitle,
    plan: u.plan,
    weeklyHours: u.weeklyHours,
    streakDays: u.streakDays,
    createdAt: u.createdAt,
  };
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "signin",
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [flowStep, setFlowStep] = useState<FlowStep>("form");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleTitle, setRoleTitle] = useState("Generative AI & Systems Engineer");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      resetAll();
    }
  }, [isOpen, initialMode]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  function resetAll() {
    setFlowStep("form");
    setName("");
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setResetToken("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(false);
    setShowPassword(false);
    setResendCooldown(0);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
  }

  function startResendCooldown() {
    setResendCooldown(RESEND_COOLDOWN);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(resendTimerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function handleLoginSuccess(user: AuthUserData, token: string, isNew: boolean) {
    if (rememberMe || isNew) {
      authToken.set(token);
    }
    onLoginSuccess(toAuthUser(user), isNew);
  }

  // ── OTP input handlers ──────────────────────────────────────────
  function handleOtpChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const digits = [...otpDigits];
    // Handle paste
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, "").slice(0, OTP_LENGTH);
      const arr = Array(OTP_LENGTH).fill("");
      for (let i = 0; i < pasted.length; i++) arr[i] = pasted[i];
      setOtpDigits(arr);
      otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    digits[idx] = val;
    setOtpDigits(digits);
    if (val && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  const otpValue = otpDigits.join("");
  const isOtpComplete = otpValue.length === OTP_LENGTH;

  // ── Demo 1-Click Login ──────────────────────────────────────────
  const demoAccounts = [
    { name: "Alex Chen", email: "alex.chen@example.com", role: "Full-Stack → Staff AI Engineer", plan: "Pro Architect" as const, streak: 12, hours: 12 },
    { name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Backend Dev → Distributed Systems Arch", plan: "Pro Architect" as const, streak: 7, hours: 15 },
    { name: "Marcus Vance", email: "marcus.v@example.com", role: "Junior Dev → Cloud DevOps Specialist", plan: "Starter" as const, streak: 4, hours: 8 },
  ];

  function handleDemoLogin(demo: typeof demoAccounts[0]) {
    setIsLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      const fakeToken = `demo-${Date.now()}`;
      authToken.set(fakeToken);
      const user: AuthUser = {
        id: `demo-${Date.now()}`,
        name: demo.name,
        email: demo.email,
        roleTitle: demo.role,
        plan: demo.plan,
        weeklyHours: demo.hours,
        streakDays: demo.streak,
        createdAt: new Date().toISOString(),
      };
      setIsLoading(false);
      onLoginSuccess(user);
    }, 450);
  }

  // ── Submit Handlers ──────────────────────────────────────────────

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim()) return setErrorMsg("Please enter your full name.");
    if (!email.includes("@")) return setErrorMsg("Please enter a valid email address.");
    if (password.length < 6) return setErrorMsg("Password must be at least 6 characters.");

    setIsLoading(true);
    try {
      const res = await apiService.register({ name, email, password, roleTitle });
      if (!res.success) throw new Error(res.error || "Registration failed.");
      setSuccessMsg(res.message || "OTP sent! Check your inbox.");
      setFlowStep("otp");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      startResendCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!email.includes("@")) return setErrorMsg("Please enter a valid email address.");
    if (password.length < 6) return setErrorMsg("Password must be at least 6 characters.");

    setIsLoading(true);
    try {
      const res = await apiService.login(email, password);
      if (!res.success || !res.token || !res.user) throw new Error(res.error || "Sign in failed.");
      handleLoginSuccess(res.user, res.token, false);
    } catch (err: any) {
      setErrorMsg(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMagicLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!email.includes("@")) return setErrorMsg("Please enter a valid email address.");

    setIsLoading(true);
    try {
      const res = await apiService.sendOtpLogin(email);
      if (!res.success) throw new Error(res.error || "Failed to send OTP.");
      setSuccessMsg(res.message || "OTP sent! Check your inbox.");
      setFlowStep("otp");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      startResendCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!isOtpComplete) return;
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await apiService.verifyOtp(email, otpValue);
      if (!res.success) throw new Error(res.error || "OTP verification failed.");

      if (res.resetToken) {
        // Password reset flow
        setResetToken(res.resetToken);
        setFlowStep("reset-pass");
        setSuccessMsg("OTP verified! Set your new password below.");
      } else if (res.token && res.user) {
        // Login / Registration complete
        handleLoginSuccess(res.user, res.token, res.isNewUser ?? false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP. Please try again.");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setErrorMsg("");
    setIsLoading(true);
    try {
      const isReset = flowStep === "reset-otp";
      const res = isReset
        ? await apiService.sendOtpReset(email)
        : mode === "signup"
        ? await apiService.register({ name, email, password, roleTitle })
        : await apiService.sendOtpLogin(email);
      if (!res.success) throw new Error(res.error);
      setSuccessMsg("New OTP sent! Check your inbox.");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
      startResendCooldown();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendResetOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!email.includes("@")) return setErrorMsg("Please enter a valid email address.");
    setIsLoading(true);
    try {
      const res = await apiService.sendOtpReset(email);
      if (!res.success) throw new Error(res.error);
      setSuccessMsg(res.message || "If an account exists, an OTP was sent.");
      setFlowStep("reset-otp");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      startResendCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (newPassword.length < 6) return setErrorMsg("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setErrorMsg("Passwords don't match.");
    setIsLoading(true);
    try {
      const res = await apiService.resetPassword(resetToken, newPassword);
      if (!res.success) throw new Error(res.error || "Failed to reset password.");
      setSuccessMsg("Password reset successfully! You can now sign in.");
      setTimeout(() => {
        setFlowStep("form");
        setMode("signin");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccessMsg("");
        setErrorMsg("");
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render helpers ──────────────────────────────────────────────

  const renderOtpBoxes = () => (
    <div className="flex gap-2 justify-center">
      {otpDigits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { otpRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={d}
          onChange={(e) => handleOtpChange(i, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-12 text-center text-lg font-bold border rounded-xl transition-all outline-none
            ${d ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-200 bg-slate-50 text-slate-900"}
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
        />
      ))}
    </div>
  );

  const getHeaderText = () => {
    if (flowStep === "otp" || flowStep === "reset-otp") return "Enter Verification Code";
    if (flowStep === "reset-email") return "Forgot Password";
    if (flowStep === "reset-pass") return "Set New Password";
    return mode === "signin" ? "Welcome back" : "Create your account";
  };

  const getSubheaderText = () => {
    if (flowStep === "otp") return `We sent a 6-digit code to ${email}`;
    if (flowStep === "reset-otp") return `Password reset code sent to ${email}`;
    if (flowStep === "reset-email") return "Enter your email to receive a reset code";
    if (flowStep === "reset-pass") return "Choose a strong new password";
    return mode === "signin"
      ? "Sign in to access your adaptive learning paths"
      : "Start your AI-powered learning journey today";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              AL
            </div>
            <span className="text-sm font-bold text-slate-900">AuraLearn</span>
            <span className="ml-1 text-[10px] uppercase tracking-widest font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
              AI Platform
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{getHeaderText()}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{getSubheaderText()}</p>
        </div>

        {/* Mode switcher — only on form step */}
        {flowStep === "form" && (
          <div className="px-6 pb-2">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setErrorMsg(""); setSuccessMsg(""); }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === m ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Alert messages */}
        <div className="px-6">
          {errorMsg && (
            <div className="mb-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* ── SIGN-UP FORM ─────────────────────── */}
        {flowStep === "form" && mode === "signup" && (
          <form onSubmit={handleSignUp} className="px-6 pb-5 space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  id="auth-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
              <div className="relative mb-1.5">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Generative AI & Systems Engineer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {["Generative AI Engineer", "Full-Stack AI Lead", "DevOps & Cloud Architect"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleTitle(r)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      roleTitle === r ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  id="auth-email-signup"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="auth-password-signup"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              id="auth-create-account-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Account & Send OTP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ── SIGN-IN FORM ─────────────────────── */}
        {flowStep === "form" && mode === "signin" && (
          <form onSubmit={handleSignIn} className="px-6 pb-2 space-y-3">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  id="auth-email-signin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => { setFlowStep("reset-email"); setErrorMsg(""); setSuccessMsg(""); }}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="auth-password-signin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5 focus:ring-0"
              />
              <span className="text-xs text-slate-600 select-none">Remember this device</span>
            </label>

            <button
              id="auth-signin-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Or sign in with OTP
                </span>
              </div>
            </div>

            {/* Magic OTP sign-in */}
            <form onSubmit={handleMagicLogin}>
              <button
                id="auth-magic-login-btn"
                type="submit"
                disabled={isLoading || !email.includes("@")}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Send Magic OTP to {email || "my email"}</span>
              </button>
            </form>

            {/* Demo accounts */}
            <div>
              <div className="relative mb-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    1-Click Demo Accounts
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                {demoAccounts.map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDemoLogin(demo)}
                    disabled={isLoading}
                    className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                        {demo.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">{demo.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{demo.role}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded flex-shrink-0">
                      1-Click
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="pb-3" />
          </form>
        )}

        {/* ── OTP VERIFICATION ─────────────────────── */}
        {(flowStep === "otp" || flowStep === "reset-otp") && (
          <form onSubmit={handleVerifyOtp} className="px-6 pb-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 mb-2">
                <KeyRound className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500">
                Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{email}</span>
              </p>
            </div>

            {renderOtpBoxes()}

            <button
              id="auth-verify-otp-btn"
              type="submit"
              disabled={isLoading || !isOtpComplete}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-500">Didn't receive it?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="text-blue-600 font-semibold hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setFlowStep("form"); setErrorMsg(""); setSuccessMsg(""); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700 py-1"
            >
              ← Back
            </button>
          </form>
        )}

        {/* ── FORGOT PASSWORD — Enter Email ─────────────────────── */}
        {flowStep === "reset-email" && (
          <form onSubmit={handleSendResetOtp} className="px-6 pb-6 space-y-4">
            <div className="text-center space-y-1 pb-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 mb-2">
                <KeyRound className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-xs text-slate-500">We'll send a secure one-time code to your email address.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  id="auth-reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <button
              id="auth-send-reset-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <><KeyRound className="w-3.5 h-3.5" /> Send Reset OTP</>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setFlowStep("form"); setErrorMsg(""); setSuccessMsg(""); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700 py-1"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* ── RESET NEW PASSWORD ─────────────────────── */}
        {flowStep === "reset-pass" && (
          <form onSubmit={handleResetPassword} className="px-6 pb-6 space-y-4">
            <div className="text-center pb-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 mb-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500">OTP verified! Choose a strong new password.</p>
            </div>
            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="auth-new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {/* Confirm */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="password"
                  id="auth-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className={`w-full bg-slate-50 border rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">Passwords don't match</p>
              )}
            </div>
            <button
              id="auth-reset-password-btn"
              type="submit"
              disabled={isLoading || newPassword !== confirmPassword}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <><ShieldCheck className="w-3.5 h-3.5" /> Reset Password</>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit SSL • Secure Auth</span>
          </div>
          <span>Terms & Privacy</span>
        </div>
      </div>
    </div>
  );
};
