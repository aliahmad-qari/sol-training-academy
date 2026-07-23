import React from "react";
import { Phone, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function FloatingContactWidget() {
  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col items-center gap-2 sm:bottom-28 sm:gap-3">
      <Link
        to="/#contact"
        title="Send us a message"
        aria-label="Send SOL Business Consultant a message"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-harvest shadow-lg transition-all duration-300 hover:scale-110 hover:bg-harvest/90 sm:h-12 sm:w-12"
      >
        <MessageSquare className="h-5 w-5 text-white" />
      </Link>
      <a
        href="tel:+61460003494"
        title="Call us"
        aria-label="Call SOL Business Consultant"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600 sm:h-12 sm:w-12"
      >
        <Phone className="h-5 w-5 text-white" />
      </a>
    </div>
  );
}
