import React from "react";
import FloatingContactWidget from "@/components/FloatingContactWidget";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import LogoCarousel from "@/components/landing/LogoCarousel";
import ServicesSection from "@/components/landing/ServicesSection";
import PricingSection from "@/components/landing/PricingSection";
import ComplianceSection from "@/components/landing/ComplianceSection";
import NDISSection from "@/components/landing/NDISSection";
import AboutSection from "@/components/landing/AboutSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import MarketingPackagesSection from "@/components/landing/MarketingPackagesSection";
import ConsultingPackagesSection from "@/components/landing/ConsultingPackagesSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/SEOHead";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import BackToTopButton from "@/components/BackToTopButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Navbar />
      <HeroSection />
      <LogoCarousel />
      <ServicesSection />
      <ConsultingPackagesSection />
      <PricingSection />
      <ComplianceSection />
      <NDISSection />
      <AboutSection />
      <MarketingPackagesSection />
      <TestimonialSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <FloatingContactWidget />
      <FloatingChatWidget />
      <AccessibilityToolbar />
      <BackToTopButton />
      <CookieConsentBanner />
    </div>
  );
}
