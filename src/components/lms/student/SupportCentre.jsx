import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  LifeBuoy, Mail, Phone, MessageSquare, ChevronDown, ChevronUp,
  Send, CheckCircle, Plus, Clock, AlertCircle, X, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const FAQS = [
  { q: "How long do I have access to the course?", a: "You have lifetime access to all course content once enrolled. You can revisit materials, review videos, and retake quizzes at any time." },
  { q: "Can I download my certificate after completing a course?", a: "Yes! Once you complete 100% of a course, your certificate is automatically generated. Go to the Certificates section and click Download PDF." },
  { q: "What happens if I fail a quiz?", a: "You can retake any quiz as many times as you need. There is no limit on retakes. Your best result is used for progress tracking." },
  { q: "Is the training NDIS compliant?", a: "Yes. All course content is aligned with the current NDIS Practice Standards and Code of Conduct, reviewed by qualified NDIS professionals." },
  { q: "How do I contact my trainer?", a: "Submit a support ticket with 'Contact Trainer' as the category and our team will connect you." },
  { q: "Can I enrol in multiple levels at once?", a: "Yes. You can enrol in Level 1, 2 and 3 simultaneously. We recommend completing them in order for the best learning outcome." },
];

const STATUS_COLORS = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-500",
};

// ── Ticket Thread Modal ────────────────────────────────────────────────────────
function TicketThreadModal({ ticket, user, onClose, onUpdated }) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const messages = ticket.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    const newMsg = {
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      sender_role: "student",
      message: reply.trim(),
      created_at: new Date().toISOString(),
    };
    await base44.entities.SupportTicket.update(ticket.id, {
      messages: [...messages, newMsg],
    });
    toast.success("Reply sent.");
    setSending(false);
    setReply("");
    onUpdated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[92dvh] flex flex-col shadow-2xl rounded-t-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/50 bg-slate-50 rounded-t-2xl flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[ticket.status]}`}>
                {ticket.status?.replace("_", " ")}
              </span>
            </div>
            <h3 className="font-display font-bold text-sm text-ink truncate">{ticket.subject}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate_mist flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Original */}
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
              {(user.full_name || "S").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold text-ink">You</span>
                <span className="text-[10px] text-slate_mist">{new Date(ticket.created_date).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="bg-slate-50 border border-border/40 rounded-xl rounded-tl-none p-3">
                <p className="text-sm text-ink leading-relaxed">{ticket.message}</p>
              </div>
            </div>
          </div>

          {messages.map((msg, i) => {
            const isAdmin = msg.sender_role === "admin";
            return (
              <div key={i} className={`flex gap-2 ${isAdmin ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isAdmin ? "bg-harvest/20 text-harvest" : "bg-blue-100 text-blue-600"
                }`}>
                  {(msg.sender_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 flex flex-col ${isAdmin ? "items-end" : ""}`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isAdmin ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold text-ink">{isAdmin ? "Support Team" : "You"}</span>
                    <span className="text-[10px] text-slate_mist">{new Date(msg.created_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                    isAdmin ? "bg-harvest text-white rounded-tr-none" : "bg-slate-50 border border-border/40 text-ink rounded-tl-none"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply */}
        {ticket.status !== "closed" && (
          <div className="px-4 py-3 border-t border-border/50 bg-white rounded-b-2xl flex-shrink-0 space-y-2">
            <Textarea value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Type your reply…" rows={2} className="resize-none text-sm"
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(); }} />
            <div className="flex justify-end">
              <Button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-harvest text-white gap-2 text-sm h-9">
                {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── New Ticket Form ────────────────────────────────────────────────────────────
function NewTicketForm({ user, onSubmitted, onCancel }) {
  const [form, setForm] = useState({ category: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message || !form.category) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    await base44.entities.SupportTicket.create({
      user_id: user.id,
      user_name: user.full_name || "",
      user_email: user.email || "",
      category: form.category,
      subject: form.subject,
      message: form.message,
      status: "open",
      messages: [],
    });
    setLoading(false);
    toast.success("Support ticket submitted! We'll respond within 1 business day.");
    onSubmitted();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-harvest" />
          <h3 className="font-display font-semibold text-ink">Raise a Support Ticket</h3>
        </div>
        <button onClick={onCancel} className="text-slate_mist hover:text-ink transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Category *</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue placeholder="Select a category…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical Issue</SelectItem>
              <SelectItem value="course">Course Content Question</SelectItem>
              <SelectItem value="trainer">Contact Trainer</SelectItem>
              <SelectItem value="certificate">Certificate Request</SelectItem>
              <SelectItem value="billing">Billing / Enrolment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Subject *</Label>
          <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your issue" />
        </div>
        <div>
          <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Message *</Label>
          <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4}
            placeholder="Please describe your issue or question in detail…" />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-harvest hover:bg-harvest/90 text-white gap-2">
            <Send className="w-4 h-4" />{loading ? "Submitting…" : "Submit Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-display font-semibold text-ink">Frequently Asked Questions</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {FAQS.map((faq, i) => (
          <div key={i}>
            <button className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-harvest/5 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}>
              <p className="text-sm font-medium text-ink flex-1">{faq.q}</p>
              {open === i ? <ChevronUp className="w-4 h-4 text-harvest flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed bg-harvest/5">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SupportCentre({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [openTicket, setOpenTicket] = useState(null);

  const loadTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    const tkts = await base44.entities.SupportTicket.filter({ user_id: user.id }, "-created_date");
    setTickets(tkts);
    setLoadingTickets(false);
  };

  useEffect(() => { loadTickets(); }, [user]);

  const handleSubmitted = () => {
    setShowForm(false);
    loadTickets();
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center">
            <LifeBuoy className="w-6 h-6 text-harvest" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">Support Centre</h2>
            <p className="text-white/50 text-sm">We're here to help — Mon–Fri, 9am–5pm AEST</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Mail, label: "Email Support", value: "info@solbusinessconsultant.com.au", href: "mailto:info@solbusinessconsultant.com.au" },
            { icon: Phone, label: "Phone Support", value: "+61 460 003 494", href: "tel:+61460003494" },
            { icon: MessageSquare, label: "AI Assistant", value: "Chat with SOL AI", href: "/ai-assistant" },
          ].map(c => (
            <a key={c.label} href={c.href}
              className="flex items-center gap-3 bg-white/8 hover:bg-white/15 border border-white/10 rounded-xl p-3.5 transition-colors group">
              <c.icon className="w-4 h-4 text-harvest flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-white/40 text-[10px] uppercase tracking-wider">{c.label}</p>
                <p className="text-white text-xs font-medium truncate group-hover:text-harvest transition-colors">{c.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* My Tickets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-ink">My Tickets</h3>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="bg-harvest text-white gap-1.5 h-8 text-xs">
              <Plus className="w-3.5 h-3.5" /> New Ticket
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4">
              <NewTicketForm user={user} onSubmitted={handleSubmitted} onCancel={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {loadingTickets ? (
          <div className="bg-white rounded-2xl border border-border/50 p-8 text-center text-slate_mist text-sm">Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-10 text-center">
            <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate_mist mb-3">No support tickets yet.</p>
            <Button onClick={() => setShowForm(true)} size="sm" className="bg-harvest text-white gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Submit a Request
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map(t => {
              const unread = (t.messages || []).filter(m => m.sender_role === "admin").length;
              return (
                <button key={t.id} onClick={() => setOpenTicket(t)}
                  className="w-full bg-white rounded-xl border border-border/50 p-4 flex items-center gap-4 hover:border-harvest/40 hover:shadow-sm transition-all text-left">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === "open" ? "bg-red-400" : t.status === "in_progress" ? "bg-blue-400" : "bg-emerald-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{t.subject}</p>
                    <p className="text-xs text-slate_mist truncate">{t.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {unread > 0 && (
                      <span className="text-[10px] font-bold bg-harvest text-white px-1.5 py-0.5 rounded-full">{unread} reply</span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>
                      {t.status?.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate_mist">{new Date(t.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <FAQ />

      {openTicket && (
        <TicketThreadModal
          ticket={openTicket} user={user}
          onClose={() => setOpenTicket(null)}
          onUpdated={() => { loadTickets(); setOpenTicket(null); }}
        />
      )}
    </div>
  );
}