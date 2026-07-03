import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight, Loader2, User, Phone, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { format, addDays, startOfDay, isBefore, isWeekend, addWeeks, startOfWeek } from "date-fns";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM",
  "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM",
  "03:30 PM", "04:00 PM", "04:30 PM",
];

const CONSULTATION_TYPES = [
  { value: "initial_registration",  label: "Initial NDIS Registration",    duration: "60 min", description: "Full consultation to assess eligibility and begin the registration process." },
  { value: "registration_review",   label: "Registration Review",           duration: "45 min", description: "Review progress on an existing registration and address any gaps." },
  { value: "compliance_audit",      label: "Compliance Audit Preparation",  duration: "60 min", description: "Prepare your organisation for an upcoming NDIS audit." },
  { value: "general_enquiry",       label: "General Enquiry",               duration: "30 min", description: "Quick Q&A session for general NDIS questions." },
];

function buildCalendarWeeks(baseDate) {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  return Array.from({ length: 5 }, (_, i) => addDays(start, i)); // Mon–Fri
}

export default function PortalBooking() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1=type, 2=date/time, 3=details, 4=confirmed
  const [consultType, setConsultType] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookedRef, setBookedRef] = useState(null);

  const today = startOfDay(new Date());
  const weekDays = buildCalendarWeeks(addWeeks(today, weekOffset));
  const minDate = addDays(today, 1);

  const isDateDisabled = (d) => isBefore(d, minDate) || isWeekend(d);

  const handleBook = async () => {
    if (!phone.trim()) return toast.error("Please enter your phone number.");
    setSubmitting(true);

    const typeLabel = CONSULTATION_TYPES.find(t => t.value === consultType)?.label;
    const ref = `BK-${Date.now().toString(36).toUpperCase()}`;

    await base44.entities.Enquiry.create({
      full_name: user.full_name,
      email: user.email,
      phone,
      service_type: "ndis_registration",
      message: `CONSULTATION BOOKING\nType: ${typeLabel}\nDate: ${format(selectedDate, "EEEE d MMMM yyyy")}\nTime: ${selectedTime}\nNotes: ${notes || "None"}`,
      status: "new",
      source: "client_portal_booking",
      booking_ref: ref,
      booking_date: format(selectedDate, "yyyy-MM-dd"),
      booking_time: selectedTime,
      booking_type: consultType,
    });

    setBookedRef(ref);
    setSubmitting(false);
    setStep(4);
  };

  // Step 1 — Consultation Type
  if (step === 1) return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink mb-1">Book a Consultation</h1>
        <p className="text-slate-500 text-sm">Select the type of NDIS consultation you need.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {CONSULTATION_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => { setConsultType(t.value); setStep(2); }}
            className="text-left p-5 border-2 border-slate-200 rounded-xl hover:border-harvest hover:bg-harvest/5 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-semibold text-ink text-sm group-hover:text-harvest transition-colors">{t.label}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex-shrink-0">{t.duration}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2 — Date & Time
  if (step === 2) return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => setStep(1)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink mb-0.5">Choose a Date & Time</h1>
          <p className="text-slate-500 text-sm">{CONSULTATION_TYPES.find(t => t.value === consultType)?.label}</p>
        </div>
      </div>

      {/* Week navigation */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-ink">
            {format(weekDays[0], "d MMM")} – {format(weekDays[4], "d MMM yyyy")}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {weekDays.map(d => {
            const disabled = isDateDisabled(d);
            const active = selectedDate && format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            return (
              <button
                key={d.toString()}
                disabled={disabled}
                onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                  active ? "border-harvest bg-harvest text-white shadow-md shadow-harvest/20" :
                  disabled ? "border-transparent bg-slate-50 text-slate-300 cursor-not-allowed" :
                  "border-slate-200 hover:border-harvest/50 hover:bg-harvest/5 text-ink"
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-wide ${active ? "text-white/80" : disabled ? "text-slate-300" : "text-slate-400"}`}>
                  {format(d, "EEE")}
                </span>
                <span className="text-base mt-0.5">{format(d, "d")}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Time slots */}
      {selectedDate && (
        <Card className="p-5">
          <p className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-harvest" />
            Available times for {format(selectedDate, "EEEE, d MMMM")}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TIME_SLOTS.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`py-2 px-1 rounded-lg border text-xs font-semibold transition-all ${
                  selectedTime === t
                    ? "border-harvest bg-harvest text-white shadow-sm"
                    : "border-slate-200 hover:border-harvest/50 hover:bg-harvest/5 text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Button
        onClick={() => setStep(3)}
        disabled={!selectedDate || !selectedTime}
        className="bg-harvest hover:bg-harvest/90 text-white gap-2"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );

  // Step 3 — Contact Details
  if (step === 3) return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <button onClick={() => setStep(2)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink mb-0.5">Confirm Your Booking</h1>
          <p className="text-slate-500 text-sm">Review your appointment details below.</p>
        </div>
      </div>

      {/* Summary card */}
      <Card className="p-5 bg-harvest/5 border-harvest/20">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Type</span>
            <span className="font-semibold text-ink">{CONSULTATION_TYPES.find(t => t.value === consultType)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-semibold text-ink">{format(selectedDate, "EEEE, d MMMM yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Time</span>
            <span className="font-semibold text-ink">{selectedTime} AEST</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Duration</span>
            <span className="font-semibold text-ink">{CONSULTATION_TYPES.find(t => t.value === consultType)?.duration}</span>
          </div>
        </div>
      </Card>

      {/* Contact fields */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
            <User className="w-3 h-3 inline mr-1" />Your Name
          </label>
          <input
            value={user?.full_name || ""}
            disabled
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
            <Phone className="w-3 h-3 inline mr-1" />Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="04XX XXX XXX"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-harvest/30 focus:border-harvest"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
            <MessageSquare className="w-3 h-3 inline mr-1" />Additional Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Anything you'd like us to know before the consultation…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-harvest/30 focus:border-harvest resize-none"
          />
        </div>
      </div>

      <Button
        onClick={handleBook}
        disabled={submitting || !phone.trim()}
        className="w-full bg-harvest hover:bg-harvest/90 text-white gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
        {submitting ? "Confirming…" : "Confirm Booking"}
      </Button>
    </div>
  );

  // Step 4 — Confirmed
  return (
    <div className="max-w-md mx-auto text-center space-y-6 pt-8">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>
      <div>
        <h1 className="font-display font-bold text-2xl text-ink mb-2">Booking Confirmed!</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Your consultation has been submitted. Our team will send a calendar invite to <strong>{user?.email}</strong> within 1 business day to confirm the time.
        </p>
      </div>
      <Card className="p-5 text-left bg-emerald-50 border-emerald-200">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Reference</span>
            <span className="font-mono font-bold text-emerald-700">{bookedRef}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type</span>
            <span className="font-semibold text-ink">{CONSULTATION_TYPES.find(t => t.value === consultType)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date & Time</span>
            <span className="font-semibold text-ink">{format(selectedDate, "d MMM yyyy")} · {selectedTime}</span>
          </div>
        </div>
      </Card>
      <Button variant="outline" onClick={() => { setStep(1); setConsultType(null); setSelectedDate(null); setSelectedTime(null); setPhone(""); setNotes(""); }}>
        Book Another Consultation
      </Button>
    </div>
  );
}