import React from "react";
import { CreditCard, Landmark, Wallet, Apple, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

const PAYMENT_METHODS = [
  {
    id: "stripe",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
    badge: "Secure",
    color: "text-blue-600",
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    description: "Fast and secure payment",
    icon: Apple,
    badge: "Apple",
    color: "text-gray-800",
  },
  {
    id: "google_pay",
    name: "Google Pay",
    description: "Fast and secure payment",
    icon: Wallet,
    badge: "Google",
    color: "text-blue-600",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal account",
    icon: DollarSign,
    badge: "PayPal",
    color: "text-blue-700",
  },
  {
    id: "eway",
    name: "eWAY",
    description: "Australian secure payment gateway",
    icon: CreditCard,
    badge: "Australia",
    color: "text-green-600",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank transfer (BPAY)",
    icon: Landmark,
    badge: "Australia",
    color: "text-slate-700",
  },
];

export default function PaymentMethodSelector({ selected, onChange }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-ink text-lg">Select Payment Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PAYMENT_METHODS.map(method => {
          const Icon = method.icon;
          const isSelected = selected === method.id;
          return (
            <button
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`text-left p-4 sm:p-5 rounded-lg border-2 transition-all active:scale-95 ${
                isSelected
                  ? "border-harvest bg-harvest/5 shadow-md"
                  : "border-slate-200 hover:border-harvest/50 hover:bg-slate-50 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                  isSelected ? "text-harvest" : method.color
                }`} />
                <span className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${
                  isSelected
                    ? "bg-harvest text-white"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {method.badge}
                </span>
              </div>
              <p className={`font-semibold text-sm sm:text-base transition-colors ${
                isSelected ? "text-harvest" : "text-ink"
              }`}>
                {method.name}
              </p>
              <p className="text-xs text-slate-600 mt-1">{method.description}</p>
              {isSelected && (
                <div className="mt-3 flex items-center text-harvest text-xs font-semibold">
                  ✓ Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}