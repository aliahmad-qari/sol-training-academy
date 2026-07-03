import React from "react";
import { Phone, MessageSquare } from "lucide-react";

export default function FloatingContactWidget() {
  return (
    <div className="fixed right-4 bottom-28 z-40 flex flex-col gap-3 items-center">
      <a
        href="/#contact"
        title="Send us a message"
        className="w-12 h-12 rounded-full bg-harvest flex items-center justify-center shadow-lg hover:bg-harvest/90 hover:scale-110 transition-all duration-300"
      >
        <MessageSquare className="w-5 h-5 text-white" />
      </a>
      <a
        href="tel:+61460003494"
        title="Call us"
        className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
      >
        <Phone className="w-5 h-5 text-white" />
      </a>
    </div>
  );
}