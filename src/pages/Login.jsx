import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If coming from Register, the email is pre-filled and a success message is shown.
  const fromRegister = location.state?.registeredEmail ?? "";
  const successMessage = location.state?.message ?? "";

  const [email, setEmail] = useState(fromRegister);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Route by role: admin/team_member → LMS Admin, everyone else → Student Dashboard
      if (result.role === "admin" || result.role === "team_member") {
        navigate("/lms-admin", { replace: true });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
    } else if (result.pendingVerification) {
      // Account exists but the email was never verified — the backend re-sent a
      // code; take the user to the verification screen.
      navigate("/verify-otp", { state: { email: result.email || email } });
    } else {
      setError(result.error || "Invalid email or password. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your SOL account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-harvest font-semibold hover:underline">
            Create one free
          </Link>
        </>
      }
    >
      {/* Success banner — shown after registration */}
      {successMessage && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {successMessage}
        </div>
      )}

      {/* Error banner */}
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
              autoFocus={!fromRegister}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 border-slate-200 focus:border-harvest focus:ring-harvest/20"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
            <Link to="/forgot-password" className="text-xs text-harvest hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              autoFocus={!!fromRegister}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 border-slate-200 focus:border-harvest focus:ring-harvest/20"
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

        <Button
          type="submit"
          className="w-full h-11 bg-harvest hover:bg-harvest/90 text-white font-semibold mt-2 shadow-sm shadow-harvest/20"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
          ) : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
