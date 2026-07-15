import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  GraduationCap,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Trash2,
  Mail,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  account_verified: ShieldCheck,
  student_verified: ShieldCheck,
  course_enrolled: GraduationCap,
  student_enrolled: GraduationCap,
  course_completed: GraduationCap,
  certificate_issued: GraduationCap,
  payment_completed: CreditCard,
  payment_received: CreditCard,
  assignment_submitted: AlertCircle,
  assignment_graded: Check,
  support_ticket_created: LifeBuoy,
  support_ticket_reply: LifeBuoy,
  support_ticket_student_reply: LifeBuoy,
  support_ticket_updated: LifeBuoy,
  announcement_published: Megaphone,
};

const priorityTone = {
  urgent: "border-red-400/40 bg-red-500/10 text-red-200",
  high: "border-amber-400/40 bg-amber-500/10 text-amber-100",
  normal: "border-white/10 bg-white/[0.04] text-white",
  low: "border-white/10 bg-white/[0.03] text-white/70",
};

export default function NotificationCenter({ onSelectTab, className }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/notifications?limit=20");
      setNotifications(Array.isArray(res.data?.data) ? res.data.data : []);
      setUnreadCount(Number(res.data?.meta?.unreadCount || 0));
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 45000);
    return () => window.clearInterval(timer);
  }, []);

  const markOneRead = async (notification) => {
    if (!notification?.isRead) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id || item._id === notification._id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      await apiClient.patch(`/notifications/${notification.id || notification._id}/read`);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    await apiClient.patch("/notifications/read-all");
  };

  const deleteOne = async (event, notification) => {
    // Don't let the click bubble to the card (which would navigate).
    event.stopPropagation();
    const id = notification.id || notification._id;
    const wasUnread = !notification.isRead;
    setNotifications((prev) => prev.filter((item) => (item.id || item._id) !== id));
    if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      // Re-sync from server so the UI doesn't silently drop a record that
      // failed to delete.
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    await markOneRead(notification);
    setOpen(false);

    const tab = notification.metadata?.tab;
    if (tab && onSelectTab) onSelectTab(tab);
    if (notification.action_url) navigate(notification.action_url);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) loadNotifications();
      }}
    >
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative w-9 h-9 rounded-xl border border-border/60 bg-white flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 hover:text-ink transition-colors",
            className
          )}
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="w-[calc(100vw-1.5rem)] max-w-[360px] p-0 border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <p className="font-display font-bold text-sm">Notifications</p>
            <p className="text-[11px] text-white/40">{unreadCount} unread</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            disabled={!unreadCount}
            className="h-8 px-2 text-[11px] text-white/60 hover:text-white hover:bg-white/10"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Read all
          </Button>
        </div>

        <ScrollArea className="h-[420px]">
          {loading && notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-white/45">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-4 h-4 text-harvest" />
              </div>
              <p className="text-sm font-semibold">All caught up</p>
              <p className="text-xs text-white/40 mt-1">New academy updates will appear here.</p>
            </div>
          ) : (
            <div className="p-2 space-y-1.5">
              {notifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] || Bell;
                const tone = priorityTone[notification.priority] || priorityTone.normal;
                return (
                  <div
                    key={notification.id || notification._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => {
                      // Only the card itself should navigate — ignore keys that
                      // bubbled up from the nested delete button.
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleNotificationClick(notification); }
                    }}
                    className={cn(
                      "group relative w-full text-left rounded-lg border p-3 transition-colors hover:bg-white/10 cursor-pointer",
                      tone,
                      notification.isRead ? "opacity-70" : "opacity-100"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-semibold leading-snug text-white pr-6">{notification.title}</p>
                          {!notification.isRead && <span className="mt-1 w-1.5 h-1.5 rounded-full bg-harvest flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-white/55 mt-1 leading-relaxed line-clamp-2">{notification.message}</p>

                        {/* Sender (who triggered this — e.g. the student who submitted) */}
                        {notification.sender_name && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-white/45">
                            <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="font-medium text-white/60">{notification.sender_name}</span>
                            {notification.sender_email && (
                              <span className="truncate">· {notification.sender_email}</span>
                            )}
                          </div>
                        )}

                        <p className="text-[10px] text-white/35 mt-2">
                          {notification.createdAt
                            ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                            : "Just now"}
                        </p>
                      </div>
                    </div>

                    {/* Delete button — appears on hover / focus */}
                    <button
                      type="button"
                      aria-label="Delete notification"
                      onClick={(e) => deleteOne(e, notification)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-red-300 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
