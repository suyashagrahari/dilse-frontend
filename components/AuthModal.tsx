"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  registerUser,
  loginUser,
  googleLogin,
  clearAuthError,
} from "@/store/authSlice";
import { fetchFavorites } from "@/store/favoritesSlice";
import { ROOT_DOMAIN, SITE_URL } from "@/lib/config";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = "login" | "register";

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

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const switchMode = useCallback(() => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setValidationError("");
    dispatch(clearAuthError());
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
      if (mode === "register") {
        await dispatch(registerUser({ name, email, password })).unwrap();
      } else {
        await dispatch(loginUser({ email, password })).unwrap();
      }
      dispatch(fetchFavorites());
      onSuccess();
    } catch {
      // Error handled by Redux
    }
  }, [mode, name, email, password, dispatch, onSuccess]);

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/25 backdrop-blur-md z-[120]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[130] flex items-end md:items-center md:justify-center pointer-events-none">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "100%", opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          className="w-full bg-card rounded-t-[28px] shadow-elevated max-h-[92vh] overflow-hidden safe-bottom flex flex-col pointer-events-auto md:max-w-[460px] md:rounded-3xl md:max-h-[88vh]"
        >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Header */}
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between mb-1">
            <motion.h3
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-foreground"
            >
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </motion.h3>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X size={16} />
            </button>
          </div>
          <motion.p
            key={`sub-${mode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[13px] text-muted-foreground"
          >
            {mode === "login"
              ? "Sign in to save and personalize your templates"
              : "Join to create beautiful personalized gifts"}
          </motion.p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-8 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -60 : 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 60 : -60 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="space-y-3"
            >
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setValidationError("");
                    }}
                    placeholder="Full name"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/60 border-2 border-transparent focus:border-violet-300 focus:bg-white text-sm focus:outline-none transition-all placeholder:text-muted-foreground/50"
                    disabled={anyLoading}
                  />
                </motion.div>
              )}

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/60 border-2 border-transparent focus:border-violet-300 focus:bg-white text-sm focus:outline-none transition-all placeholder:text-muted-foreground/50"
                  disabled={anyLoading}
                />
              </div>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setValidationError("");
                  }}
                  placeholder={mode === "register" ? "Create password (min 6 chars)" : "Password"}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-muted/60 border-2 border-transparent focus:border-violet-300 focus:bg-white text-sm focus:outline-none transition-all placeholder:text-muted-foreground/50"
                  disabled={anyLoading}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/50 hover:text-foreground transition-colors rounded-lg"
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
                    className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100"
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
                className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/25 transition-all active:scale-[0.98] mt-1"
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
                  <div className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                    or
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <button
                onClick={() => handleGoogle()}
                disabled={anyLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-border bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin text-muted-foreground" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="text-sm font-semibold text-gray-700">
                  {googleLoading
                    ? "Connecting..."
                    : mode === "login"
                    ? "Continue with Google"
                    : "Sign up with Google"}
                </span>
              </button>

              {/* Switch mode */}
              <p className="text-center text-[13px] text-muted-foreground pt-1 pb-2">
                {mode === "login"
                  ? "Don\u2019t have an account? "
                  : "Already have an account? "}
                <button
                  onClick={switchMode}
                  className="text-violet-500 font-semibold hover:text-violet-600 transition-colors"
                  disabled={anyLoading}
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        </motion.div>
      </div>
    </>
  );
}
