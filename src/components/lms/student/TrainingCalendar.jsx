import React, { useState } from "react";
import { Calendar, Clock, Bell, BookOpen, AlertCircle, Star, ChevronLeft, ChevronRight } from "lucide-react";

const EVENTS = [
  {
    id: 1, date: "2026-06-10", type: "release", color: "bg-blue-500", badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    title: "New Module Released: Crisis Management",
    description: "Level 2 & 3 — New module on Crisis Management & De-escalation goes live. 3 video lessons + quiz included.",
    time: "9:00 AM AEST", pinned: false,
  },
  {
    id: 2, date: "2026-06-15", type: "deadline", color: "bg-red-500", badgeColor: "bg-red-100 text-red-700 border-red-200",
    title: "NDIS Practice Standards — Compliance Deadline",
    description: "Updated NDIS Practice Standards training must be acknowledged by all registered providers. Review the updated content in your courses.",
    time: "11:59 PM AEST", pinned: true,
  },
  {
    id: 3, date: "2026-06-20", type: "webinar", color: "bg-emerald-500", badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    title: "Live Q&A: Support Coordination Best Practices",
    description: "Join SOL Academy trainers for a live online session covering complex case management and participant communication strategies.",
    time: "2:00 PM – 3:30 PM AEST", pinned: false,
  },
  {
    id: 4, date: "2026-07-01", type: "update", color: "bg-amber-500", badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    title: "NDIS Price Guide 2026–27 Effective",
    description: "New NDIS Price Guide takes effect. Updated pricing information will be reflected in Level 3 training content.",
    time: "All Day", pinned: false,
  },
  {
    id: 5, date: "2026-07-10", type: "release", color: "bg-indigo-500", badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    title: "Level 3 — Specialist Module Launch",
    description: "New specialist module on NDIS Appeals & Tribunal Process available for Level 3 students. Includes 4 videos + case study assessment.",
    time: "9:00 AM AEST", pinned: false,
  },
  {
    id: 6, date: "2026-07-20", type: "deadline", color: "bg-rose-500", badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
    title: "Q3 Assessment Completion Recommended",
    description: "We recommend completing all enrolled course assessments and quizzes by end of July to stay on track for certification.",
    time: "Ongoing", pinned: false,
  },
  {
    id: 7, date: "2026-08-05", type: "webinar", color: "bg-violet-500", badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
    title: "Graduation Ceremony — SOL Academy",
    description: "Celebrate your certification achievements! Online graduation event for all students who have completed Level 1, 2 or 3 in 2026.",
    time: "5:00 PM AEST", pinned: false,
  },
];

const TYPE_LABELS = {
  release: "New Content",
  deadline: "Deadline",
  webinar: "Live Event",
  update: "NDIS Update",
};
const TYPE_ICONS = {
  release: BookOpen,
  deadline: AlertCircle,
  webinar: Star,
  update: Bell,
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function TrainingCalendar() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const eventsByDate = {};
  EVENTS.forEach(e => {
    const d = e.date.split("-")[2];
    const m = parseInt(e.date.split("-")[1]) - 1;
    const y = parseInt(e.date.split("-")[0]);
    if (y === viewYear && m === viewMonth) {
      if (!eventsByDate[d]) eventsByDate[d] = [];
      eventsByDate[d].push(e);
    }
  });

  const upcomingEvents = EVENTS
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-harvest" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">Training Calendar</h2>
            <p className="text-white/50 text-sm">Upcoming sessions, new releases, deadlines & NDIS events</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <h3 className="font-display font-semibold text-ink">{FULL_MONTHS[viewMonth]} {viewYear}</h3>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayStr = String(day).padStart(2, "0");
                const dayEvents = eventsByDate[dayStr] || [];
                const isToday = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
                return (
                  <div key={day}
                    className={`min-h-[52px] rounded-xl p-1.5 transition-colors ${
                      isToday ? "bg-harvest/10 border border-harvest/30" : "hover:bg-slate-50"
                    }`}>
                    <p className={`text-xs font-semibold text-center mb-1 w-6 h-6 rounded-full flex items-center justify-center mx-auto
                      ${isToday ? "bg-harvest text-white" : "text-slate-600"}`}>
                      {day}
                    </p>
                    {dayEvents.slice(0, 2).map(e => (
                      <button key={e.id} onClick={() => setSelectedEvent(e)}
                        className={`w-full text-left ${e.color} rounded text-[8px] text-white px-1 py-0.5 mb-0.5 truncate block font-medium`}>
                        {e.title.slice(0, 18)}…
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-[8px] text-slate-400 text-center">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events sidebar */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-ink">Upcoming Events</h3>
          {upcomingEvents.map(event => {
            const IconComp = TYPE_ICONS[event.type] || Bell;
            const eventDate = new Date(event.date);
            return (
              <button key={event.id} onClick={() => setSelectedEvent(event)}
                className="w-full text-left bg-white rounded-xl border border-border/50 p-4 shadow-sm hover:shadow-md hover:border-harvest/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${event.color} text-white`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${event.badgeColor}`}>
                        {TYPE_LABELS[event.type]}
                      </span>
                      {event.pinned && <span className="text-[9px] text-red-500 font-bold">📌</span>}
                    </div>
                    <p className="text-xs font-semibold text-ink leading-snug truncate">{event.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{eventDate.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                      <span>·</span>
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${selectedEvent.color} flex items-center justify-center text-white flex-shrink-0`}>
                {React.createElement(TYPE_ICONS[selectedEvent.type] || Bell, { className: "w-5 h-5" })}
              </div>
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedEvent.badgeColor}`}>
                  {TYPE_LABELS[selectedEvent.type]}
                </span>
                <h3 className="font-display font-bold text-ink mt-1">{selectedEvent.title}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{selectedEvent.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedEvent.date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedEvent.time}</span>
            </div>
            <button onClick={() => setSelectedEvent(null)}
              className="w-full py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}