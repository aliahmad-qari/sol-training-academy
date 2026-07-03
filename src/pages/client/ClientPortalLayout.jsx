import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, MessageSquare, FolderOpen,
  Package, Receipt, FileDown, LifeBuoy, LogOut,
  ArrowLeft, Menu, X, ChevronRight, ExternalLink, ClipboardList, CalendarDays
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const NAV_SECTIONS = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard",      href: "/client-portal",                icon: LayoutDashboard, exact: true },
      { label: "New Enquiry",    href: "/client-portal/onboarding",     icon: ClipboardList },
      { label: "Book Consultation", href: "/client-portal/booking",       icon: CalendarDays },
    ],
  },
  {
    group: "My Services",
    items: [
      { label: "NDIS Progress",  href: "/client-portal/ndis-progress",  icon: TrendingUp },
      { label: "Enquiries",      href: "/client-portal/enquiries",       icon: MessageSquare },
      { label: "Documents",      href: "/client-portal/documents",       icon: FolderOpen },
    ],
  },
  {
    group: "Billing",
    items: [
      { label: "Subscriptions",  href: "/client-portal/subscriptions",   icon: Package },
      { label: "Invoices",       href: "/client-portal/invoices",        icon: Receipt },
    ],
  },
  {
    group: "Resources",
    items: [
      { label: "Templates",      href: "/client-portal/templates",       icon: FileDown },
      { label: "Support",        href: "/client-portal/support",         icon: LifeBuoy },
    ],
  },
];

export default function ClientPortalLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const currentPage = NAV_SECTIONS.flatMap(s => s.items).find(n => isActive(n.href, n.exact));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-ink flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex
      `}>

        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-harvest flex items-center justify-center flex-shrink-0">
            <span className="text-white font-display font-bold text-sm">S</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-sm leading-tight">SOL Business</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Client Portal</p>
          </div>
          <button className="lg:hidden p-1 text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-lg bg-harvest/30 flex items-center justify-center flex-shrink-0">
              <span className="text-harvest font-bold text-sm font-display">
                {(user?.full_name || "C")[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user?.full_name || "Client"}</p>
              <p className="text-[11px] text-white/40 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.group}>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-1.5">
                {section.group}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                        active
                          ? "bg-harvest text-white shadow-md shadow-harvest/20"
                          : "text-white/60 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${active ? "text-white" : "text-white/50"}`} />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:bg-white/8 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Website</span>
          </Link>
          <button
            onClick={() => base44.auth.logout("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-5 sticky top-0 z-20 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
            <span className="text-slate-400 hidden sm:inline">Portal</span>
            {currentPage && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />
                <span className="font-semibold text-ink truncate">{currentPage.label}</span>
              </>
            )}
          </div>

          <Link to="/get-started">
            <Button size="sm" className="bg-harvest hover:bg-harvest/90 text-white text-xs h-8 gap-1.5 px-3">
              <ExternalLink className="w-3 h-3" /> New Enquiry
            </Button>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}