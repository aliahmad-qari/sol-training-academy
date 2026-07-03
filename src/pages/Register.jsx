import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const refCode = new URLSearchParams(window.location.search).get("ref") || "";

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      if (refCode) {
        const me = await base44.auth.me();
        const allUsers = await base44.entities.User.list();
        const referrer = allUsers.find(u => `SOL-${u.id.slice(-8).toUpperCase()}` === refCode);
        if (referrer && referrer.id !== me?.id) {
          await base44.entities.Referral.create({
            referrer_id: referrer.id,
            referrer_name: referrer.full_name || "",
            referrer_email: referrer.email || "",
            referred_email: email,
            referred_name: me?.full_name || "",
            referred_user_id: me?.id || "",
            status: "registered",
            referral_code: refCode,
          });
        }
      }
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code resent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    }
  };

  // ── OTP Verification Screen ──
  if (showOtp) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We sent a 6-digit code to ${email}`}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-harvest/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-harvest" />
          </div>
          <p className="text-xs text-slate-500">Enter the code below to verify your account.</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          className="w-full h-11 bg-harvest hover:bg-harvest/90 text-white font-semibold shadow-sm shadow-harvest/20"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify & Continue"}
        </Button>

        <p className="text-center text-sm text-slate-500 mt-4">
          Didn't receive it?{" "}
          <button onClick={handleResend} className="text-harvest font-semibold hover:underline">
            Resend code
          </button>
        </p>
      </AuthLayout>
    );
  }

  // ── Registration Form ──
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of NDIS providers using SOL"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-harvest font-semibold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {/* Google */}
      <Button
        variant="outline"
        type="button"
        className="w-full h-11 text-sm font-medium border-slate-200 hover:bg-slate-50 gap-2.5"
        onClick={() => base44.auth.loginWithProvider("google", "/")}
      >
        <GoogleIcon className="w-4 h-4" />
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400 uppercase tracking-wider">or register with email</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 border-slate-200 focus:border-harvest focus:ring-harvest/20"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 border-slate-200 focus:border-harvest focus:ring-harvest/20"
              required
            />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirm" className="text-slate-700 font-medium">Confirm password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`pl-10 pr-10 h-11 border-slate-200 focus:ring-harvest/20 transition-colors ${
                passwordsMismatch ? "border-red-400 focus:border-red-400" :
                passwordsMatch ? "border-emerald-400 focus:border-emerald-400" : ""
              }`}
              required
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {passwordsMatch && (
              <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
            )}
          </div>
          {passwordsMismatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-harvest hover:bg-harvest/90 text-white font-semibold mt-2 shadow-sm shadow-harvest/20"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
          ) : "Create account"}
        </Button>

        <p className="text-xs text-slate-400 text-center leading-relaxed">
          By creating an account you agree to our{" "}
          <Link to="/terms-and-conditions" className="text-harvest hover:underline">Terms</Link>
          {" "}and{" "}
          <Link to="/privacy-policy" className="text-harvest hover:underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}