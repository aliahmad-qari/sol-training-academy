import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Zap, X, Loader2, ChevronDown, Mail, Users } from "lucide-react";
import { toast } from "sonner";
import AddSubscriptionModal from "./AddSubscriptionModal";
import SendSequenceModal from "./SendSequenceModal";

const PLAN_BADGE = {
  starter:    "bg-slate-100 text-slate-700",
  growth:     "bg-amber-100 text-amber-700",
  enterprise: "bg-ink/10 text-ink",
};
const STATUS_BADGE = {
  trial:     "bg-blue-100 text-blue-700",
  active:    "bg-green-100 text-green-700",
  paused:    "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-600",
  expired:   "bg-gray-100 text-gray-600",
};

export default function SubscriptionsList() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [sendTarget, setSendTarget] = useState(null);
  const [selected, setSelected] = useState([]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Subscription.list("-created_date", 300);
    setSubs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = subs.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.business_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.contact_name?.toLowerCase().includes(q);
    const matchPlan = filterPlan === "all" || s.plan === filterPlan;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchQ && matchPlan && matchStatus;
  });

  const toggleSelect = (id) => setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  const selectAll = () => setSelected(filtered.map(s => s.id));
  const clearSelect = () => setSelected([]);

  const handleDelete = async (id) => {
    await base44.entities.Subscription.delete(id);
    toast.success("Subscription removed");
    load();
  };

  const handleStatusChange = async (id, status) => {
    await base44.entities.Subscription.update(id, { status });
    toast.success("Status updated");
    load();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search businesses…" className="pl-9 w-56" />
          </div>
          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Plan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="outline" onClick={() => setSendTarget({ bulk: true, ids: selected })} className="gap-2 text-sm">
              <Mail className="w-4 h-4" /> Send Sequence ({selected.length})
            </Button>
          )}
          <Button onClick={() => setShowAdd(true)} className="bg-harvest hover:bg-harvest/90 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Subscriber
          </Button>
        </div>
      </div>

      {/* Count + select all */}
      <div className="flex items-center gap-3 text-sm text-slate_mist">
        <span>{filtered.length} subscriber{filtered.length !== 1 ? "s" : ""}</span>
        {filtered.length > 0 && (
          <>
            <button onClick={selectAll} className="text-harvest hover:underline text-xs">Select all</button>
            {selected.length > 0 && <button onClick={clearSelect} className="text-xs hover:underline">Clear</button>}
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-harvest" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate_mist">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No subscribers yet</p>
            <p className="text-sm mt-1">Click "Add Subscriber" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-chalk border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left w-8">
                    <input type="checkbox" checked={selected.length === filtered.length} onChange={() => selected.length === filtered.length ? clearSelect() : selectAll()} className="accent-harvest" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate_mist text-xs uppercase tracking-wide">Business</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate_mist text-xs uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate_mist text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate_mist text-xs uppercase tracking-wide">Billing</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate_mist text-xs uppercase tracking-wide">Next Bill</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate_mist text-xs uppercase tracking-wide">Emails</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate_mist text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(sub => (
                  <tr key={sub.id} className={`hover:bg-chalk/50 transition-colors ${selected.includes(sub.id) ? "bg-harvest/5" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(sub.id)} onChange={() => toggleSelect(sub.id)} className="accent-harvest" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{sub.business_name}</p>
                      <p className="text-xs text-slate_mist">{sub.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${PLAN_BADGE[sub.plan]}`}>{sub.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={sub.status} onValueChange={v => handleStatusChange(sub.id, v)}>
                        <SelectTrigger className="h-7 w-28 text-xs border-0 p-0 gap-1">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[sub.status]}`}>{sub.status}</span>
                          <ChevronDown className="w-3 h-3 text-slate_mist" />
                        </SelectTrigger>
                        <SelectContent>
                          {["trial","active","paused","cancelled","expired"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate_mist capitalize">{sub.billing_cycle}</td>
                    <td className="px-4 py-3 text-xs text-slate_mist">{sub.next_billing || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate_mist">{sub.emails_sent || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setSendTarget(sub)} className="h-7 px-2 text-xs text-harvest hover:bg-harvest/10">
                          <Zap className="w-3 h-3 mr-1" /> Automate
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(sub.id)} className="h-7 px-2 text-xs text-red-500 hover:bg-red-50">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddSubscriptionModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
      {sendTarget && <SendSequenceModal target={sendTarget} onClose={() => setSendTarget(null)} onSent={() => { setSendTarget(null); load(); }} />}
    </div>
  );
}