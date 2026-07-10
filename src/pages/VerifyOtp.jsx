import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { MailCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const RESEND_SECONDS = 60;

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Email is passed via router state from Register / Login. Without it we
  // have nothing to verify against, so send the user back to register.
  const email = location.state?.email ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // Resend countdown.
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const submit = useCallback(
    async (code) => {
      setError("");
      setInfo("");
      setLoading(true);
      const result = await verifyOtp(email, code);
      setLoading(false);

      if (result.success) {
        if (result.role === "admin" || result.role === "team_member") {
          navigate("/lms-admin", { replace: true });
        } else {
          navigate("/student-dashboard", { replace: true });
        }
      } else {
        setError(result.error || "Invalid or expired code. Please try again.");
        setOtp("");
      }
    },
    [email, verifyOtp, navigate]
  );

  // Auto-submit once all 6 digits are entered.
  const handleChange = (value) => {
    setOtp(value);
    if (value.length === 6 && !loading) submit(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6 && !loading) submit(otp);
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    setError("");
    setInfo("");
    const result = await resendOtp(email);
    if (result.success) {
      setInfo("A new code has been sent to your email.");
      setSeconds(RESEND_SECONDS);
    } else {
      setError(result.error || "Could not resend the code. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={email ? `Enter the 6-digit code we sent to ${email}` : "Enter your 6-digit code"}
      footer={
        <>
          Wrong email?{" "}
          <Link to="/register" className="text-harvest font-semibold hover:underline">
            Start over
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {info && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {info}
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-harvest/10 flex items-center justify-center">
          <MailCheck className="w-6 h-6 text-harvest" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={handleChange}
            autoFocus
            disabled={loading}
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="w-12 h-14 text-lg font-semibold rounded-xl border-slate-200"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-harvest hover:bg-harvest/90 text-white font-semibold shadow-sm shadow-harvest/20"
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
          ) : "Verify & continue"}
        </Button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-500">
        Didn't get a code?{" "}
        {seconds > 0 ? (
          <span className="text-slate-400">
            Resend in {seconds}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-harvest font-semibold hover:underline"
          >
            Resend code
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
