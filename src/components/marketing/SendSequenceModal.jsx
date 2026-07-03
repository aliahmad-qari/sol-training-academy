import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Zap, Mail } from "lucide-react";
import { toast } from "sonner";

export default function SendSequenceModal({ target, onClose, onSent }) {
  const [sequences, setSequences] = useState([]);
  const [selectedSeq, setSelectedSeq] = useState("");
  const [sending, setSending] = useState(false);
  const isBulk = !!target?.bulk;

  useEffect(() => {
    base44.entities.EmailSequence.filter({ status: "active" }).then(setSequences);
  }, []);

  const handleSend = async () => {
    if (!selectedSeq) { toast.error("Select a sequence"); return; }
    setSending(true);

    const seq = sequences.find(s => s.id === selectedSeq);
    if (!seq) return;

    const targets = isBulk
      ? await Promise.all(target.ids.map(id => base44.entities.Subscription.filter({ id })))
      : [target];

    const flat = isBulk ? targets.flat() : targets;

    for (const sub of flat) {
      const body = (seq.body || "")
        .replace(/\{\{contact_name\}\}/g, sub.contact_name || sub.business_name)
        .replace(/\{\{business_name\}\}/g, sub.business_name)
        .replace(/\{\{plan\}\}/g, sub.plan?.charAt(0).toUpperCase() + sub.plan?.slice(1));

      const subject = (seq.subject || "")
        .replace(/\{\{contact_name\}\}/g, sub.contact_name || sub.business_name)
        .replace(/\{\{business_name\}\}/g, sub.business_name)
        .replace(/\{\{plan\}\}/g, sub.plan?.charAt(0).toUpperCase() + sub.plan?.slice(1));

      await base44.integrations.Core.SendEmail({ to: sub.email, subject, body }).catch(() => {});

      await base44.entities.AutomationLog.create({
        subscription_id: sub.id,
        business_name: sub.business_name,
        sequence_name: seq.name,
        trigger: seq.trigger,
        email_sent_to: sub.email,
        subject,
        status: "sent",
      });

      await base44.entities.Subscription.update(sub.id, {
        emails_sent: (sub.emails_sent || 0) + 1,
        last_email_sequence: seq.name,
      });
    }

    // Update sequence sent count
    await base44.entities.EmailSequence.update(selectedSeq, {
      sent_count: (seq.sent_count || 0) + flat.length,
    });

    toast.success(`Email sent to ${flat.length} subscriber${flat.length !== 1 ? "s" : ""}!`);
    setSending(false);
    onSent();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-harvest" />
            <h3 className="font-display font-bold text-lg text-ink">
              {isBulk ? `Send Sequence to ${target.ids.length} subscribers` : `Automate: ${target?.business_name}`}
            </h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate_mist" /></button>
        </div>
        <div className="p-6 space-y-4">
          {!isBulk && (
            <div className="bg-chalk rounded-xl p-3 text-sm">
              <p className="font-semibold text-ink">{target?.business_name}</p>
              <p className="text-slate_mist text-xs">{target?.email} · {target?.plan} · {target?.status}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate_mist">Select Email Sequence</label>
            <Select value={selectedSeq} onValueChange={setSelectedSeq}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a sequence…" />
              </SelectTrigger>
              <SelectContent>
                {sequences.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSeq && (() => {
            const s = sequences.find(x => x.id === selectedSeq);
            return s ? (
              <div className="bg-harvest/5 border border-harvest/20 rounded-xl p-4 text-xs space-y-1">
                <p className="font-semibold text-ink">{s.subject}</p>
                <p className="text-slate_mist line-clamp-3 whitespace-pre-wrap">{s.body?.substring(0, 200)}…</p>
              </div>
            ) : null;
          })()}
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSend} disabled={sending || !selectedSeq} className="flex-1 bg-harvest hover:bg-harvest/90 text-white gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {sending ? "Sending…" : "Send Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}