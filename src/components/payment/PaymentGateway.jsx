import React, { useState } from "react";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function PaymentGateway({ paymentMethod, coursePrice, courseTitle, courseId, userId, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const handleInputChange = (field, value) => {
    // Format card number with spaces
    if (field === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
    }
    // Format expiry date
    if (field === "expiryDate") {
      value = value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
      }
    }
    // Limit CVV to 4 digits
    if (field === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = async () => {
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
      toast.error("Please fill in all card details");
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke("processPayment", {
        paymentMethod,
        courseId,
        courseTitle,
        coursePrice,
        userId,
        cardDetails: {
          ...cardDetails,
          cardNumber: cardDetails.cardNumber.replace(/\s/g, ""),
        },
      });

      if (response.data.success) {
        onPaymentSuccess(response.data.transactionId);
        toast.success("Payment processed successfully");
      } else {
        toast.error(response.data.error || "Payment failed");
      }
    } catch (error) {
      toast.error("Payment processing error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      processPayment();
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <Lock className="w-4 h-4 text-blue-600" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      <div>
        <Label className="text-sm font-semibold text-ink mb-2 block">Cardholder Name</Label>
        <Input
          placeholder="John Smith"
          value={cardDetails.cardholderName}
          onChange={(e) => handleInputChange("cardholderName", e.target.value)}
          disabled={loading}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-ink mb-2 block">Card Number</Label>
        <Input
          placeholder="4242 4242 4242 4242"
          value={cardDetails.cardNumber}
          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
          maxLength="19"
          disabled={loading}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-ink mb-2 block">Expiry Date</Label>
          <Input
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
            maxLength="5"
            disabled={loading}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-ink mb-2 block">CVV</Label>
          <Input
            placeholder="123"
            type="password"
            value={cardDetails.cvv}
            onChange={(e) => handleInputChange("cvv", e.target.value)}
            maxLength="4"
            disabled={loading}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      <Button
        onClick={processPayment}
        disabled={loading}
        className="w-full bg-harvest hover:bg-harvest/90 text-white font-bold py-3 rounded-lg gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay A$${coursePrice.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        By proceeding, you agree to our Terms of Service and Privacy Policy
      </p>
    </Card>
  );
}