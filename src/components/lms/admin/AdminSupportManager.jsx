import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { LifeBuoy, MessageSquare, Send, CheckCircle, Clock, AlertCircle, X, User, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const STATUS_COLORS = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-500",
};

const CATEGORY_LABELS = {
  technical: "Technical",
  course: "Course Content",
  trainer: "Contact Trainer",
  certificate: "Certificate",
  billing: "Billing",
  other: "Other",
};

function TicketThread({ ticket, admin, onUpdated, onClose }) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const bottomRef = useRef(null);

  const messages = ticket.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    const newMsg = {
      sender_id: admin?.id || "admin",
      sender_name: admin?.full_name || "Admin",
      sender_role: "admin",
      message: reply.trim(),
      created_at: new Date().toISOString(),
    };
    const updatedMessages = [...messages, newMsg];
    await base44.entities.SupportTicket.update(ticket.id, {
      messages: updatedMessages,
      status: status === "open" ? "in_progress" : status,
    });
    toast.success("Reply sent.");
    setSending(false);
    setReply("");
    onUpdated();
  };

  const updateStatus = async (newStatus) => {
    setStatus(newStatus);
    await base44.entities.SupportTicket.update(ticket.id, { status: newStatus });
    toast.success(`Ticket marked as ${newStatus.replace("_", " ")}.`);
    onUpdated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/50 bg-slate-50 rounded-t-2xl flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                {status.replace("_", " ")}
              </span>
              <span className="text-[10px] text-slate_mist bg-slate-100 px-2 py-0.5 rounded-full">
                {CATEGORY_LABELS[ticket.category] || ticket.category}
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-ink truncate">{ticket.subject}</h3>
            <p className="text-xs text-slate_mist mt-0.5 flex items-center gap-1">
              <User className="w-3 h-3" /> {ticket.user_name || ticket.user_email}
              <span className="mx-1">·</span>
              {new Date(ticket.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={status} onValueChange={updateStatus}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate_mist">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Original message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
              {(ticket.user_name || "S").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold text-ink">{ticket.user_name || ticket.user_email}</span>
                <span className="text-[10px] text-slate_mist">{new Date(ticket.created_date).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Student</span>
              </div>
              <div className="bg-slate-50 border border-border/40 rounded-xl rounded-tl-none p-3">
                <p className="text-sm text-ink leading-relaxed">{ticket.message}</p>
              </div>
            </div>
          </div>

          {/* Threaded replies */}
          {messages.map((msg, i) => {
            const isAdmin = msg.sender_role === "admin";
            return (
              <div key={i} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isAdmin ? "bg-harvest/20 text-harvest" : "bg-blue-100 text-blue-600"
                }`}>
                  {(msg.sender_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 ${isAdmin ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isAdmin ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold text-ink">{msg.sender_name}</span>
                    <span className="text-[10px] text-slate_mist">{new Date(msg.created_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isAdmin ? "bg-harvest/10 text-harvest" : "bg-blue-50 text-blue-600"}`}>
                      {isAdmin ? "Admin" : "Student"}
                    </span>
                  </div>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                    isAdmin
                      ? "bg-harvest text-white rounded-tr-none"
                      : "bg-slate-50 border border-border/40 text-ink rounded-tl-none"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply Box */}
        {status !== "closed" && (
          <div className="px-5 py-4 border-t border-border/50 bg-white rounded-b-2xl space-y-2">
            <Textarea
              value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Type your reply to the student…"
              rows={3} className="resize-none text-sm"
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(); }}
            />
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate_mist">Ctrl+Enter to send</p>
              <Button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-harvest text-white gap-2 text-sm h-9">
                {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminSupportManager() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openTicket, setOpenTicket] = useState(null);
  const [admin, setAdmin] = useState(null);

  const load = async () => {
    setLoading(true);
    const [tkts, me] = await Promise.all([
      base44.entities.SupportTicket.list("-created_date", 200),
      base44.auth.me(),
    ]);
    setTickets(tkts);
    setAdmin(me);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = tickets.filter(t => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchSearch = !search ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Support Tickets</h2>
          <p className="text-sm text-slate_mist">Review and reply to student support requests.</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2 text-xs self-start">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Open", value: openCount, color: "text-red-600 bg-red-50", icon: AlertCircle },
          { label: "In Progress", value: inProgressCount, color: "text-blue-600 bg-blue-50", icon: Clock },
          { label: "Resolved", value: tickets.filter(t => t.status === "resolved").length, color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
          { label: "Total Tickets", value: tickets.length, color: "text-slate-600 bg-slate-100", icon: LifeBuoy },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink">{s.value}</p>
              <p className="text-[10px] text-slate_mist">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject or student…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <LifeBuoy className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate_mist text-sm">No support tickets found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border/30">
                {["Student", "Subject", "Category", "Status", "Replies", "Date", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => (
                <tr key={ticket.id} className="border-b border-border/20 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setOpenTicket(ticket)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-blue-600">
                        {(ticket.user_name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ink">{ticket.user_name || "—"}</p>
                        <p className="text-[10px] text-slate_mist">{ticket.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-ink truncate max-w-[180px]">{ticket.subject}</p>
                    <p className="text-[10px] text-slate_mist truncate max-w-[180px]">{ticket.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] bg-slate-100 text-slate_mist px-2 py-0.5 rounded-full font-medium">
                      {CATEGORY_LABELS[ticket.category] || ticket.category || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[ticket.status] || "bg-slate-100 text-slate_mist"}`}>
                      {ticket.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-slate_mist">
                      <MessageSquare className="w-3 h-3" />
                      {(ticket.messages || []).length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate_mist">
                    {new Date(ticket.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <MessageSquare className="w-3 h-3" /> Reply
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openTicket && (
        <TicketThread
          ticket={openTicket} admin={admin}
          onClose={() => setOpenTicket(null)}
          onUpdated={() => { load(); setOpenTicket(null); }}
        />
      )}
    </div>
  );
}