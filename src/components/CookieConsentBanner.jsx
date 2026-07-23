import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "sol_cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "accepted");
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl rounded-2xl border border-white/20 bg-ink/95 p-4 text-white shadow-2xl backdrop-blur md:left-6 md:right-auto md:mx-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-white/80">
          We use essential cookies to keep the website secure and improve your browsing experience. Read our{" "}
          <Link to="/privacy-policy" className="font-semibold text-harvest hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={acceptCookies}
          className="w-full rounded-xl bg-harvest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-harvest/90 sm:w-auto"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
