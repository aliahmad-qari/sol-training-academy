import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Gift, Copy, Check, Users, Share2, Link2, CheckCircle, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  // Generate a stable referral code from the user ID
  const referralCode = user ? `SOL-${user.id.slice(-8).toUpperCase()}` : "";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  useEffect(() => {
    if (!user) return;
    loadReferrals();
  }, [user]);

  const loadReferrals = async () => {
    setLoading(true);
    const refs = await base44.entities.Referral.filter({ referrer_id: user.id }, "-created_date");
    setReferrals(refs);
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
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

  const totalRegistered = referrals.filter(r => r.status === "registered" || r.status === "enrolled").length;
  const totalEnrolled   = referrals.filter(r => r.status === "enrolled").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1f00] rounded-2xl p-6 relative overflow-hidden">
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
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Referrals", value: referrals.length, color: "text-white" },
              { label: "Registered",      value: totalRegistered,  color: "text-blue-400" },
              { label: "Enrolled",        value: totalEnrolled,    color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/8 border border-white/10 rounded-xl p-3 text-center">
                <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Your Referral Link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 flex items-center gap-2 overflow-hidden">
                <Link2 className="w-4 h-4 text-harvest flex-shrink-0" />
                <p className="text-white/70 text-xs truncate font-mono">{referralLink}</p>
              </div>
              <Button onClick={copyLink} size="sm"
                className={`flex-shrink-0 gap-2 h-10 text-xs font-semibold transition-all ${copied ? "bg-emerald-500 text-white" : "bg-harvest text-white hover:bg-harvest/90"}`}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button onClick={shareLink} size="sm" variant="outline"
                className="flex-shrink-0 gap-2 h-10 text-xs border-white/20 text-white hover:bg-white/10 bg-transparent">
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
        <h3 className="font-display font-semibold text-ink mb-4">How It Works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
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

      {/* Referrals list */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
          <h3 className="font-display font-semibold text-ink flex items-center gap-2">
            <Users className="w-4 h-4 text-harvest" /> My Referrals
          </h3>
          <span className="text-xs text-slate_mist">{referrals.length} total</span>
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
                  className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate_mist">
                      {(ref.referred_name || ref.referred_email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{ref.referred_name || "—"}</p>
                      <p className="text-xs text-slate_mist truncate">{ref.referred_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                    <span className="text-[10px] text-slate_mist">
                      {new Date(ref.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </span>
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