import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail, Lock, User, Loader2, AlertCircle,
  Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const referralCode = new URLSearchParams(location.search).get('ref')?.trim() || '';

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    const result = await register(fullName, email, password, undefined, referralCode);
    setLoading(false);

    if (result.success) {
      // Account created but unverified — send to the OTP screen with the email
      // so the user can enter the code we just emailed them.
      navigate("/verify-otp", { state: { email: result.email || email } });
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  };

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
      {error && (
        <div className="mb-4 sm:mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Full name */}
        <div>
          <Label htmlFor="full_name" className="text-slate-700 font-medium">Full name</Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="full_name"
              type="text"
              autoComplete="name"
              autoFocus
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 h-11 border-slate-200 focus:border-harvest focus:ring-harvest/20"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 h-11 border-slate-200 focus:border-harvest focus:ring-harvest/20"
              required
            />
          </div>
        </div>

        {/* Password */}
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
              className="w-full pl-10 pr-10 h-11 border-slate-200 focus:border-harvest focus:ring-harvest/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
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
              className={`w-full pl-10 pr-10 h-11 border-slate-200 focus:ring-harvest/20 transition-colors ${
                passwordsMismatch
                  ? "border-red-400 focus:border-red-400"
                  : passwordsMatch
                  ? "border-emerald-400 focus:border-emerald-400"
                  : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
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
