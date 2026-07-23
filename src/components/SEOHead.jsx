import { useEffect } from "react";

const DEFAULT_TITLE = "SOL Business Consultant | NDIS Registration & Compliance Support Australia";
const DEFAULT_DESCRIPTION =
  "Australian-owned NDIS registration, Easy Compliance, support coordination training, bookkeeping, and business consulting support from Glenroy VIC.";
const DEFAULT_URL = "https://www.solbusinessconsultant.com.au/";
const DEFAULT_IMAGE = "https://www.solbusinessconsultant.com.au/og-image.jpg";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export default function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical = DEFAULT_URL,
  image = DEFAULT_IMAGE,
}) {
  useEffect(() => {
    document.title = title;
    upsertLink("canonical", canonical);
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });

    let script = document.getElementById("sol-organization-jsonld");
    if (!script) {
      script = document.createElement("script");
      script.id = "sol-organization-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "SOL Business Consultant",
      url: DEFAULT_URL,
      telephone: "+61460003494",
      email: "info@solbusinessconsultant.com.au",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Glenroy",
        addressRegion: "VIC",
        postalCode: "3046",
        addressCountry: "AU",
      },
      areaServed: "Australia",
      serviceType: [
        "NDIS Registration Support",
        "NDIS Compliance Consulting",
        "Support Coordination Training",
        "Bookkeeping and BAS",
        "Business Consulting",
      ],
    });
  }, [canonical, description, image, title]);

  return null;
}
