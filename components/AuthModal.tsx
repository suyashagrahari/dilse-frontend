"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  registerUser,
  loginUser,
  googleLogin,
  verifyOtp,
  resendOtp,
  clearAuthError,
  clearPendingVerification,
} from "@/store/authSlice";
import { fetchFavorites } from "@/store/favoritesSlice";
import { ROOT_DOMAIN, SITE_URL } from "@/lib/config";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "login" | "register";
}

type AuthMode = "login" | "register" | "otp";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AuthModal({ onClose, onSuccess, defaultMode = "login" }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error, pendingVerification } = useAppSelector((s) => s.auth);

  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP state
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpValue = digits.join("");

  // Switch to OTP screen when pendingVerification is set
  useEffect(() => {
    if (pendingVerification?.email) {
      setOtpEmail(pendingVerification.email);
      setMode("otp");
      setDigits(["", "", "", "", "", ""]);
      setValidationError("");
      setOtpError(false);
      startResendCooldown();
      setTimeout(() => digitRefs.current[0]?.focus(), 100);
    }
  }, [pendingVerification]);

  function startResendCooldown() {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const handleDigitChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setOtpError(false);
    dispatch(clearAuthError());
    if (digit && index < 5) {
      setTimeout(() => digitRefs.current[index + 1]?.focus(), 0);
    }
  }, [dispatch]);

  const handleDigitKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigits((prev) => { const n = [...prev]; n[index] = ""; return n; });
      } else if (index > 0) {
        digitRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
    // Enter handled in handleVerifyOtp via button click
  }, [digits]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...pasted.split(""), ...Array(6).fill("")].slice(0, 6) as string[];
    setDigits(next);
    setOtpError(false);
    dispatch(clearAuthError());
    const focusIdx = Math.min(pasted.length, 5);
    setTimeout(() => digitRefs.current[focusIdx]?.focus(), 0);
  }, [dispatch]);

  const switchMode = useCallback(() => {
    setMode((m) => (m === "login" || m === "otp" ? "register" : "login"));
    setValidationError("");
    dispatch(clearAuthError());
    dispatch(clearPendingVerification());
  }, [dispatch]);

  const validate = (): boolean => {
    if (mode === "register" && !name.trim()) {
      setValidationError("Please enter your name");
      return false;
    }
    if (!email.trim()) {
      setValidationError("Please enter your email");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email");
      return false;
    }
    if (!password) {
      setValidationError("Please enter your password");
      return false;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    try {
      const result = mode === "register"
        ? await dispatch(registerUser({ name, email, password })).unwrap()
        : await dispatch(loginUser({ email, password })).unwrap();
      // If requiresVerification, extraReducers already set pendingVerification → useEffect switches to OTP
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((result as any)?.requiresVerification) return;
      dispatch(fetchFavorites());
      onSuccess();
    } catch {
      // Error handled by Redux
    }
  }, [mode, name, email, password, dispatch, onSuccess]);

  const handleVerifyOtp = useCallback(async () => {
    if (otpValue.length !== 6) {
      setOtpError(true);
      setValidationError("Please enter all 6 digits");
      setTimeout(() => setOtpError(false), 600);
      return;
    }
    try {
      await dispatch(verifyOtp({ email: otpEmail, otp: otpValue })).unwrap();
      dispatch(fetchFavorites());
      onSuccess();
    } catch {
      setOtpError(true);
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        setOtpError(false);
        digitRefs.current[0]?.focus();
      }, 600);
    }
  }, [otpValue, otpEmail, dispatch, onSuccess]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;
    try {
      await dispatch(resendOtp({ email: otpEmail })).unwrap();
      startResendCooldown();
      setValidationError("");
    } catch {
      // Error shown via redux error
    }
  }, [otpEmail, resendCooldown, dispatch]);

  // Helper: finish login after we have an access_token (used by both flows)
  const finishGoogleLogin = useCallback(async (accessToken: string) => {
    setGoogleLoading(true);
    try {
      const userInfo = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const profile = await userInfo.json();
      await dispatch(
        googleLogin({
          credential: accessToken,
          profile: {
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            sub: profile.sub,
          },
        })
      ).unwrap();
      dispatch(fetchFavorites());
      onSuccess();
    } catch {
      // Error handled by Redux
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, onSuccess]);

  // Direct Google login — works when origin is on the root domain
  const handleGoogleDirect = useGoogleLogin({
    onSuccess: (tokenResponse) => finishGoogleLogin(tokenResponse.access_token),
    onError: () => setValidationError("Google sign-in failed. Please try again."),
  });

  // When on a subdomain, redirect the current page to the bridge on the root domain
  // so Google OAuth runs there (avoids Google's no-wildcard-origin restriction).
  // After auth, the bridge redirects back here with tokens in the URL hash.
  const handleGoogle = useCallback(() => {
    const isSubdomain =
      ROOT_DOMAIN &&
      typeof window !== "undefined" &&
      window.location.hostname !== ROOT_DOMAIN &&
      window.location.hostname !== `www.${ROOT_DOMAIN}`;

    if (isSubdomain) {
      const returnTo = window.location.href;
      window.location.href = `${SITE_URL}/auth/google-bridge?return_to=${encodeURIComponent(returnTo)}`;
    } else {
      handleGoogleDirect();
    }
  }, [handleGoogleDirect]);

  const displayError = validationError || error;
  const anyLoading = isLoading || googleLoading;
  const maskedEmail = otpEmail
    ? otpEmail.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(1, b.length)) + c)
    : "";
  const CORNER_FILTER =
    "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    paddingLeft: 44,
    paddingRight: 44,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 16,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(61,12,17,0.16)",
    fontSize: 14,
    color: "#2a0a0e",
    outline: "none",
    transition: "all .2s ease",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500]"
        style={{ background: "rgba(42,10,14,0.28)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[510] flex items-end md:items-center md:justify-center pointer-events-none">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "100%", opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          className="w-full rounded-t-[28px] max-h-[96vh] overflow-hidden safe-bottom flex flex-col pointer-events-auto md:max-w-[460px] md:rounded-3xl md:max-h-[88vh]"
          style={{
            position: "relative",
            background: "linear-gradient(180deg,#fbf6f1 0%,#f5ede6 62%,#fbf6f1 100%)",
            border: "1px solid rgba(61,12,17,0.18)",
            boxShadow: "0 26px 68px rgba(61,12,17,0.22)",
          }}
        >
        {/* Ornamental corners */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: 84, height: 84, opacity: 0.3, transform: "scaleY(-1)", filter: CORNER_FILTER, pointerEvents: "none" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, width: 84, height: 84, opacity: 0.3, transform: "scale(-1,-1)", filter: CORNER_FILTER, pointerEvents: "none" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, width: 74, height: 74, opacity: 0.22, filter: CORNER_FILTER, pointerEvents: "none" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "absolute", bottom: 0, right: 0, width: 74, height: 74, opacity: 0.22, transform: "scaleX(-1)", filter: CORNER_FILTER, pointerEvents: "none" }} />

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 rounded-full" style={{ background: "rgba(61,12,17,0.22)" }} />
        </div>

        {/* Floating close button */}
        {/* <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(61,12,17,0.08)", color: "#7a5555", border: "1px solid rgba(61,12,17,0.14)" }}
          aria-label="Close"
        >
          <X size={18} />
        </button> */}

        {/* Header */}
        <div className="px-6 pb-5 pt-1">
          <div className="mb-4 flex justify-center">
            <div className="inline-flex items-center px-4 py-1 rounded-full" style={{ border: "1px solid rgba(201,168,76,0.42)", background: "rgba(201,168,76,0.08)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/indianFestival/logo.webp" alt="SubhSandesh" style={{ width: 40, height: 40, objectFit: "contain" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#7a5555", textTransform: "uppercase" }}>SubhSandesh</span>
            </div>
          </div>
          <div className="mb-1">
            <motion.h3
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, lineHeight: 1.02, fontWeight: 700, color: "#2a0a0e", letterSpacing: "-0.02em" }}
            >
              {mode === "otp" ? "Check Your Email" : mode === "login" ? "Welcome Back" : "Create Account"}
            </motion.h3>
          </div>
          <motion.p
            key={`sub-${mode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: 14, color: "#7a5555" }}
          >
            {mode === "otp"
              ? `We sent a 6-digit code to ${maskedEmail}`
              : mode === "login"
              ? "Sign in to save and personalize your templates"
              : "Join to create beautiful personalized gifts"}
          </motion.p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-8 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "otp" ? 60 : mode === "login" ? -60 : 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 60 : -60 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="space-y-3"
            >
              {/* ── OTP SCREEN ── */}
              {mode === "otp" && (
                <>
                  {/* Decorative icon */}
                  <div className="flex justify-center pt-1 pb-2">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 280, damping: 18 }}
                      className="relative"
                    >
                      <div style={{
                        width: 76, height: 76, borderRadius: 22,
                        background: "linear-gradient(135deg,rgba(201,168,76,0.14) 0%,rgba(201,168,76,0.04) 100%)",
                        border: "2px solid rgba(201,168,76,0.42)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(201,168,76,0.14)",
                      }}>
                        <Mail size={32} style={{ color: "#c9a84c" }} />
                      </div>
                      {/* Verified badge */}
                      <div style={{
                        position: "absolute", bottom: -6, right: -6,
                        width: 26, height: 26, borderRadius: "50%",
                        background: "linear-gradient(135deg,#4d1016,#3d0c11)",
                        border: "2px solid #f5ede6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <ShieldCheck size={12} style={{ color: "#c9a84c" }} />
                      </div>
                    </motion.div>
                  </div>

                  {/* 6 digit boxes */}
                  <motion.div
                    className="flex justify-center gap-2"
                    animate={otpError ? { x: [0, -6, 6, -6, 6, -3, 3, 0] } : {}}
                    transition={{ duration: 0.45 }}
                  >
                    {digits.map((digit, i) => (
                      <motion.input
                        key={i}
                        ref={(el) => { digitRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        onFocus={(e) => e.target.select()}
                        disabled={isLoading}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 22 }}
                        style={{
                          width: 46, height: 58,
                          textAlign: "center",
                          fontSize: 24, fontWeight: 800,
                          borderRadius: 14,
                          background: digit
                            ? "linear-gradient(135deg,rgba(201,168,76,0.1) 0%,rgba(201,168,76,0.04) 100%)"
                            : "rgba(255,255,255,0.92)",
                          border: `2px solid ${
                            otpError
                              ? "rgba(159,49,49,0.5)"
                              : digit
                              ? "rgba(201,168,76,0.65)"
                              : "rgba(61,12,17,0.14)"
                          }`,
                          color: "#2a0a0e",
                          outline: "none",
                          boxShadow: digit && !otpError
                            ? "0 3px 12px rgba(201,168,76,0.18)"
                            : otpError
                            ? "0 3px 12px rgba(159,49,49,0.12)"
                            : "none",
                          transition: "border 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
                          cursor: "text",
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Digit progress dots */}
                  <div className="flex justify-center gap-1.5 pb-1">
                    {digits.map((d, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: d ? 1 : 0.7, opacity: d ? 1 : 0.3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        style={{
                          width: d ? 18 : 6, height: 6,
                          borderRadius: 99,
                          background: otpError ? "rgba(159,49,49,0.5)" : d ? "#c9a84c" : "rgba(61,12,17,0.18)",
                          transition: "width 0.2s ease",
                        }}
                      />
                    ))}
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {displayError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm rounded-xl px-4 py-2.5"
                        style={{ color: "#9f3131", background: "rgba(159,49,49,0.07)", border: "1px solid rgba(159,49,49,0.18)" }}
                      >
                        <span className="shrink-0 font-bold">!</span>
                        <span>{displayError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Verify button */}
                  <motion.button
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otpValue.length !== 6}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{
                      background: otpValue.length === 6
                        ? "linear-gradient(145deg,#4d1016 0%,#3d0c11 60%,#2c090d 100%)"
                        : "linear-gradient(145deg,#8a5a5a 0%,#7a4a4a 100%)",
                      color: "#f5ede6",
                      boxShadow: otpValue.length === 6 ? "0 12px 28px rgba(61,12,17,0.28), inset 0 1px 0 rgba(255,220,160,0.18)" : "none",
                      border: "1px solid rgba(201,168,76,0.35)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {isLoading
                      ? <><Loader2 size={16} className="animate-spin" />Verifying...</>
                      : <><ShieldCheck size={15} />Verify Email</>
                    }
                  </motion.button>

                  {/* Resend with circular timer */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {resendCooldown > 0 ? (
                      <>
                        <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="11" cy="11" r="8.5" fill="none" stroke="rgba(61,12,17,0.1)" strokeWidth="2.5" />
                          <circle
                            cx="11" cy="11" r="8.5" fill="none"
                            stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 8.5}`}
                            strokeDashoffset={`${2 * Math.PI * 8.5 * (resendCooldown / 60)}`}
                            style={{ transition: "stroke-dashoffset 1s linear" }}
                          />
                        </svg>
                        <span style={{ fontSize: 13, color: "#9a7070", fontWeight: 500 }}>
                          Resend in <strong style={{ color: "#7a5555" }}>{resendCooldown}s</strong>
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                        style={{ color: "#c9a84c" }}
                      >
                        <RotateCcw size={13} />
                        Didn&apos;t receive it? Resend code
                      </button>
                    )}
                  </div>

                  {/* Back */}
                  <p className="text-center text-[12px] pb-1" style={{ color: "#9a7070" }}>
                    Wrong account?{" "}
                    <button onClick={switchMode} className="font-semibold underline underline-offset-2" style={{ color: "#7a5555" }}>
                      Back to sign in
                    </button>
                  </p>
                </>
              )}

              {/* ── LOGIN / REGISTER SCREEN ── */}
              {mode !== "otp" && (<>
              {/* Form Fields */}
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#9a7070" }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setValidationError("");
                    }}
                    placeholder="Full name"
                    style={fieldStyle}
                    disabled={anyLoading}
                  />
                </motion.div>
              )}

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#9a7070" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="Email address"
                  style={fieldStyle}
                  disabled={anyLoading}
                />
              </div>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#9a7070" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setValidationError("");
                  }}
                  placeholder={mode === "register" ? "Create password (min 6 chars)" : "Password"}
                  style={fieldStyle}
                  disabled={anyLoading}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition-colors rounded-lg"
                  style={{ color: "#9a7070" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-start gap-2 text-sm rounded-xl px-4 py-2.5"
                    style={{ color: "#9f3131", background: "rgba(159,49,49,0.08)", border: "1px solid rgba(159,49,49,0.2)" }}
                  >
                    <span className="shrink-0 mt-0.5">!</span>
                    <span>{displayError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={anyLoading}
                className="w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-1"
                style={{
                  background: "linear-gradient(145deg,#4d1016 0%,#3d0c11 60%,#2c090d 100%)",
                  color: "#f5ede6",
                  boxShadow: "0 12px 28px rgba(61,12,17,0.25), inset 0 1px 0 rgba(255,220,160,0.18)",
                  border: "1px solid rgba(201,168,76,0.38)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: "1px solid rgba(61,12,17,0.14)" }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[11px] font-medium uppercase tracking-wider" style={{ background: "#f5ede6", color: "#9a7070" }}>
                    or
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <button
                onClick={() => handleGoogle()}
                disabled={anyLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: "1.5px solid rgba(61,12,17,0.16)", background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 12px rgba(61,12,17,0.08)" }}
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin" style={{ color: "#7a5555" }} />
                ) : (
                  <GoogleIcon />
                )}
                <span className="text-sm font-semibold" style={{ color: "#2a0a0e" }}>
                  {googleLoading
                    ? "Connecting..."
                    : mode === "login"
                    ? "Continue with Google"
                    : "Sign up with Google"}
                </span>
              </button>

              {/* Switch mode */}
              <p className="text-center text-[13px] pt-1 pb-2" style={{ color: "#7a5555" }}>
                {mode === "login"
                  ? "Don\u2019t have an account? "
                  : "Already have an account? "}
                <button
                  onClick={switchMode}
                  className="font-semibold transition-colors"
                  style={{ color: "#c9a84c" }}
                  disabled={anyLoading}
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
              </>)}
            </motion.div>
          </AnimatePresence>
        </div>
        </motion.div>
      </div>
    </>
  );
}
