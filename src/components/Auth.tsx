import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthProps {
  onSuccess: (token: string, user: any) => void;
  onCancel: () => void;
}

export default function Auth({ onSuccess, onCancel }: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "verify">("login");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pwdStrength, setPwdStrength] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (index: number, val: string) => {
    if (val && !/^[0-9]$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newDigits = [...otpDigits];
      if (!otpDigits[index] && index > 0) {
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        prevInput?.focus();
      } else {
        newDigits[index] = "";
        setOtpDigits(newDigits);
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const code = otpDigits.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected verification error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification code.");
      }
      setSuccessMessage(data.message || "A fresh code has been sent.");
      if (data.devMode && data.devOtp) {
        setDevOtp(data.devOtp);
      } else {
        setDevOtp(null);
      }
      setResendTimer(60);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during resending.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Guest login failed.");
      }
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during guest bypass.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStrength = (val: string) => {
    let score = 0;
    if (val.length >= 6) score += 25;
    if (/[A-Z]/.test(val)) score += 25;
    if (/[0-9]/.test(val)) score += 25;
    if (/[^A-Za-z0-9]/.test(val)) score += 25;
    setPwdStrength(score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Authentication failed.");
        }
        onSuccess(data.token, data.user);
      } else if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed.");
        }
        setSuccessMessage(data.message || "Verification code sent to your email.");
        if (data.devMode && data.devOtp) {
          setDevOtp(data.devOtp);
        } else {
          setDevOtp(null);
        }
        setOtpDigits(Array(6).fill(""));
        setMode("verify");
        setResendTimer(60);
      } else {
        // forgot
        const res = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Password reset failed.");
        }
        setSuccessMessage(data.instruction || data.message || "Password reset link sent.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#09090BB2] flex items-center justify-center p-4 backdrop-blur-md"
    >
      
      {/* Absolute ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,_rgba(91,110,245,0.06)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      <motion.div
        id="auth-panel-container"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="glass-panel w-full max-w-4xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 grain"
      >
        
        {/* Left column - Cinematic branding */}
        <div className="bg-[#0C0C10]/40 p-10 flex flex-col justify-between relative overflow-hidden hidden md:flex border-r border-white/[0.04]">
          <div className="space-y-4 relative z-10">
            <span className="text-xs font-mono text-zinc-500 tracking-[0.2em] uppercase">WELCOME BACK</span>
            <h2 className="text-2xl font-light leading-tight text-white tracking-tight">
              Track your habits, <br />
              <span className="font-serif italic font-normal text-zinc-300">quiet your mind.</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-light mt-4">
              LifePilot helps you build healthy daily routines, deconstruct starting anxiety, and organize your life with simple, beautiful habits.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>100% SECURE & PRIVATE LOCAL STORAGE</span>
          </div>
        </div>

        {/* Right column - Form */}
        <div className="p-8 sm:p-10 bg-[#0C0C10]/15 flex flex-col justify-center relative">
          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 text-zinc-500 hover:text-white text-xs font-mono uppercase tracking-widest cursor-pointer"
          >
            CLOSE [ESC]
          </button>

          {(errorMessage || successMessage) && (
            <div className="space-y-2 mb-4">
              {errorMessage && (
                <div className="p-3.5 rounded bg-red-950/20 border border-red-500/20 text-red-200 text-xs font-light leading-relaxed">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 text-xs font-light leading-relaxed">
                  {successMessage}
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login-form-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">Sign In</h3>
                  <p className="text-sm text-zinc-400 mt-1 font-light">Enter your details to sign in to your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-9 pr-4 py-2 bg-[#050507] border border-white/[0.04] rounded text-sm text-white focus:outline-none focus:border-white/20 transition-all font-light"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setMode("forgot")}
                        className="text-xs font-mono text-zinc-400 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-4 py-2 bg-[#050507] border border-white/[0.04] rounded text-sm text-white focus:outline-none focus:border-white/20 transition-all font-light"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-login-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-accent w-full py-2.5 mt-2 shadow disabled:opacity-50"
                  >
                    <span>{loading ? "Signing In..." : "Sign In"}</span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </form>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-white/[0.04]" />
                  <span className="px-3 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">OR</span>
                  <div className="flex-1 border-t border-white/[0.04]" />
                </div>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="w-full py-2.5 rounded border border-white/10 hover:bg-white/[0.02] text-zinc-300 hover:text-white font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                >
                  <span>Explore in Demo Mode (Guest)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                <div className="text-center">
                  <span className="text-xs text-zinc-400 font-light">
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setMode("signup")}
                      className="text-zinc-200 font-semibold hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </span>
                </div>
              </motion.div>
            )}

            {mode === "signup" && (
              <motion.div
                key="signup-form-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">Create Account</h3>
                  <p className="text-sm text-zinc-400 mt-1 font-light">Create your account to get started.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-4 py-2 bg-[#050507] border border-white/[0.04] rounded text-sm text-white focus:outline-none focus:border-white/20 transition-all font-light"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-9 pr-4 py-2 bg-[#050507] border border-white/[0.04] rounded text-sm text-white focus:outline-none focus:border-white/20 transition-all font-light"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          calculateStrength(e.target.value);
                        }}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-4 py-2 bg-[#050507] border border-white/[0.04] rounded text-sm text-white focus:outline-none focus:border-white/20 transition-all font-light"
                      />
                    </div>
                    {/* Security Strength metrics bar */}
                    <div className="mt-2 space-y-1 font-mono">
                      <div className="flex justify-between items-center text-[9px] text-zinc-500 uppercase">
                        <span>Password Strength</span>
                        <span className="text-zinc-300 font-bold">{pwdStrength}%</span>
                      </div>
                      <div className="w-full bg-white/[0.01] h-1 rounded flex gap-0.5 overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${pwdStrength >= 25 ? 'bg-zinc-600' : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-300 ${pwdStrength >= 50 ? 'bg-zinc-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-300 ${pwdStrength >= 75 ? 'bg-zinc-400' : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-300 ${pwdStrength >= 100 ? 'bg-zinc-100' : 'bg-transparent'}`} style={{ width: '25%' }} />
                      </div>
                    </div>
                  </div>

                  <button
                    id="btn-signup-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-accent w-full py-2.5 mt-2 shadow disabled:opacity-50"
                  >
                    <span>{loading ? "Creating Account..." : "Create Account"}</span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </form>

                <div className="text-center">
                  <span className="text-xs text-zinc-400 font-light">
                    Already have an account?{" "}
                    <button 
                      onClick={() => setMode("login")}
                      className="text-zinc-200 font-semibold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </span>
                </div>
              </motion.div>
            )}

            {mode === "forgot" && (
              <motion.div
                key="forgot-form-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">Forgot Password</h3>
                  <p className="text-sm text-zinc-400 mt-1 font-light">Enter your email address to receive a password reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-9 pr-4 py-2 bg-[#050507] border border-white/[0.04] rounded text-sm text-white focus:outline-none focus:border-white/20 transition-all font-light"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-forgot-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-accent w-full py-2.5 mt-2 shadow disabled:opacity-50"
                  >
                    <span>{loading ? "Sending reset link..." : "Send Reset Link"}</span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </form>

                <div className="text-center">
                  <button 
                    onClick={() => setMode("login")}
                    className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-widest hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}

            {mode === "verify" && (
              <motion.div
                key="verify-form-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">Verify Your Email</h3>
                  <p className="text-sm text-zinc-400 mt-1 font-light">
                    We've sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>.
                  </p>
                </div>

                {devOtp && (
                  <div className="p-3.5 rounded bg-blue-950/20 border border-blue-500/20 text-blue-200 text-xs font-mono flex items-center justify-between">
                    <span>[Dev Mode] Verification Code:</span>
                    <span className="font-bold tracking-widest text-sm text-white select-all">{devOtp}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex justify-between items-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center bg-[#050507] border border-white/[0.04] rounded text-lg font-semibold text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      />
                    ))}
                  </div>

                  <button
                    id="btn-verify-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-accent w-full py-2.5 shadow disabled:opacity-50"
                  >
                    <span>{loading ? "Verifying..." : "Verify & Access Cockpit"}</span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </form>

                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs text-zinc-400 font-light">
                    Didn't receive the email?{" "}
                    {resendTimer > 0 ? (
                      <span className="text-zinc-500 font-mono">Resend in {resendTimer}s</span>
                    ) : (
                      <button 
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-zinc-200 font-semibold hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Resend Code
                      </button>
                    )}
                  </span>

                  <button 
                    onClick={() => {
                      setMode("signup");
                      setOtpDigits(Array(6).fill(""));
                      setDevOtp(null);
                    }}
                    className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-widest hover:underline cursor-pointer mt-1"
                  >
                    Change Email / Go Back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </motion.div>
  );
}
