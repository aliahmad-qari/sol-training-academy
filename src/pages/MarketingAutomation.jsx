import React, { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AutomationDashboard from "@/components/marketing/AutomationDashboard";
import SubscriptionsList from "@/components/marketing/SubscriptionsList";
import EmailSequences from "@/components/marketing/EmailSequences";
import AutomationLogs from "@/components/marketing/AutomationLogs";
import { Zap, Users, Mail, Activity } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", Icon: Activity },
  { id: "subscriptions", label: "Subscriptions", Icon: Users },
  { id: "sequences", label: "Email Sequences", Icon: Mail },
  { id: "logs", label: "Automation Logs", Icon: Zap },
];

export default function MarketingAutomation() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-harvest flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl text-ink">Marketing Automation</h1>
                <p className="text-slate_mist text-sm">Manage 300 business subscriptions with automated email sequences</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-chalk border border-border rounded-xl p-1 mb-8 w-fit">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? "bg-white shadow-sm text-ink border border-border/50"
                    : "text-slate_mist hover:text-ink"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "dashboard" && <AutomationDashboard />}
          {activeTab === "subscriptions" && <SubscriptionsList />}
          {activeTab === "sequences" && <EmailSequences />}
          {activeTab === "logs" && <AutomationLogs />}
        </div>
      </div>
      <Footer />
    </div>
  );
}