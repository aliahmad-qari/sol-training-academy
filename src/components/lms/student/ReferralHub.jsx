import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Gift, Copy, Check, Users, Share2, Link2, CheckCircle, Clock, BookOpen,
  UserPlus, Mail, Trash2, RefreshCw, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700",   icon: Clock },
  registered: { label: "Registered", color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  enrolled:   { label: "Enrolled",   color: "bg-emerald-100 text-emerald-700", icon: BookOpen },
};

export default function ReferralHub({ user }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(false);
  const [inviteName, setInviteName]   = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting]       = useState(false);
  const [deletingId, setDeletingId]   = useState(null);

  // Generate a stable referral code from the user ID. Guard against a missing or
  // short id so this never throws on `.slice()` of undefined.
  const rawId = user?.id ? String(user.id) : "";
  const referralCode = rawId ? `SOL-${rawId.slice(-8).toUpperCase()}` : "";
  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`
    : "";

  useEffect(() => {
    if (!user?.id) return;
    loadReferrals();
  }, [user?.id]);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const refs = await base44.entities.Referral.filter({ referrer_id: user.id }, "-created_date");
      setReferrals(Array.isArray(refs) ? refs : []);
    } catch (err) {
      console.error("Failed to load referrals:", err);
      setReferrals([]);
      toast.error("Couldn't load your referrals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      // navigator.clipboard is only available in secure (HTTPS) contexts.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        // Fallback for insecure contexts / older browsers.
        const ta = document.createElement("textarea");
        ta.value = referralLink;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      toast.error("Couldn't copy the link. Please copy it manually.");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join SOL Training Academy",
          text: `Hey! I'm learning NDIS support coordination at SOL Training Academy. Join me using my referral link:`,
          url: referralLink,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const sendInvite = async (e) => {
    e?.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }
    // Basic email shape check before hitting the API.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (email === user?.email?.toLowerCase()) {
      toast.error("You can't refer yourself.");
      return;
    }
    if (referrals.some(r => (r.referred_email || "").toLowerCase() === email)) {
      toast.error("You've already invited this person.");
      return;
    }

    setInviting(true);
    try {
      await base44.entities.Referral.create({
        referred_name: inviteName.trim() || undefined,
        referred_email: email,
        referral_code: referralCode || undefined,
      });
      toast.success("Invite logged! We'll track them once they sign up with your link.");
      setInviteName("");
      setInviteEmail("");
      await loadReferrals();
    } catch (err) {
      console.error("Failed to create referral:", err);
      toast.error(err?.response?.data?.message || "Couldn't log that invite. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const deleteReferral = async (referral) => {
    if (!referral?.id) return;
    // Only pending, self-logged invites should be removable — a person who has
    // already registered/enrolled is a real, earned referral.
    setDeletingId(referral.id);
    try {
      await base44.entities.Referral.delete(referral.id);
      setReferrals(prev => prev.filter(r => r.id !== referral.id));
      toast.success("Invite removed.");
    } catch (err) {
      console.error("Failed to delete referral:", err);
      toast.error(err?.response?.data?.message || "Couldn't remove that invite.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPending    = referrals.filter(r => r.status === "pending").length;
  const totalRegistered = referrals.filter(r => r.status === "registered" || r.status === "enrolled").length;
  const totalEnrolled   = referrals.filter(r => r.status === "enrolled").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1f00] rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #D97706 0%, transparent 50%), radial-gradient(circle at 20% 80%, #f59e0b 0%, transparent 50%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-harvest" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg">Refer a Friend</h2>
              <p className="text-white/50 text-sm">Share SOL Academy with colleagues and friends</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            {[
              { label: "Total Referrals", value: referrals.length, color: "text-white" },
              { label: "Registered",      value: totalRegistered,  color: "text-blue-400" },
              { label: "Enrolled",        value: totalEnrolled,    color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/8 border border-white/10 rounded-xl p-2.5 sm:p-3 text-center">
                <p className={`font-display font-bold text-xl sm:text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>


          {/* Status at a glance */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG.pending.color.split(" ")[0]}`} />
              Pending: {totalPending}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-white text-xs">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG.registered.color.split(" ")[0]}`} />
              Registered: {totalRegistered}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-white text-xs">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG.enrolled.color.split(" ")[0]}`} />
              Enrolled: {totalEnrolled}
            </span>
          </div>

          {/* Referral link */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Your Referral Link</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 flex items-center gap-2 overflow-hidden min-w-0">
                <Link2 className="w-4 h-4 text-harvest flex-shrink-0" />
                <p className="text-white/70 text-xs truncate font-mono">{referralLink}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyLink} size="sm"
                  className={`flex-1 sm:flex-shrink-0 gap-2 h-10 text-xs font-semibold transition-all ${copied ? "bg-emerald-500 text-white" : "bg-harvest text-white hover:bg-harvest/90"}`}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button onClick={shareLink} size="sm" variant="outline"
                  className="flex-1 sm:flex-shrink-0 gap-2 h-10 text-xs border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 sm:p-5">
        <h3 className="font-display font-semibold text-ink mb-4">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Share Your Link", desc: "Copy your unique referral link and share it with colleagues or friends.", icon: Share2, color: "bg-blue-100 text-blue-600" },
            { step: "2", title: "They Register",   desc: "When they click your link and create an account, they're tracked as your referral.", icon: Users, color: "bg-purple-100 text-purple-600" },
            { step: "3", title: "They Enrol",      desc: "Once your referral enrols in a course, their status upgrades to Enrolled.", icon: BookOpen, color: "bg-emerald-100 text-emerald-600" },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink mb-0.5">Step {s.step}: {s.title}</p>
                <p className="text-xs text-slate_mist leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite by email */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 sm:p-5">
        <h3 className="font-display font-semibold text-ink flex items-center gap-2 mb-1">
          <UserPlus className="w-4 h-4 text-harvest" /> Invite by Email
        </h3>
        <p className="text-xs text-slate_mist mb-4">
          Log someone you've invited. They'll move to <strong>Registered</strong> automatically once
          they sign up with your link, then to <strong>Enrolled</strong> when they join a course.
        </p>
        <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-2">
          <Input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Name (optional)"
            className="h-10 sm:max-w-[200px]"
            autoComplete="name"
          />
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="h-10 pl-9 w-full"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={inviting}
            className="h-10 gap-2 bg-harvest text-white hover:bg-harvest/90 flex-shrink-0 w-full sm:w-auto">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {inviting ? "Adding…" : "Add Invite"}
          </Button>
        </form>
      </div>

      {/* Referrals list */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
          <h3 className="font-display font-semibold text-ink flex items-center gap-2">
            <Users className="w-4 h-4 text-harvest" /> My Referrals
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate_mist">{referrals.length} total</span>
            <button
              onClick={loadReferrals}
              disabled={loading}
              title="Refresh"
              className="text-slate_mist hover:text-harvest transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate_mist text-sm">Loading…</div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate_mist text-sm">No referrals yet.</p>
            <p className="text-slate_mist/70 text-xs mt-1">Share your link to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {referrals.map((ref, i) => {
              const cfg = STATUS_CONFIG[ref.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <motion.div key={ref.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate_mist">
                      {(ref.referred_name || ref.referred_email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{ref.referred_name || "—"}</p>
                      <p className="text-xs text-slate_mist truncate">{ref.referred_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                    <span className="text-[10px] text-slate_mist w-12 text-right">
                      {ref.created_date
                        ? new Date(ref.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })
                        : "—"}
                    </span>
                    {ref.status === "pending" && (
                      <button
                        onClick={() => deleteReferral(ref)}
                        disabled={deletingId === ref.id}
                        title="Remove invite"
                        className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deletingId === ref.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}