import React, { useRef } from "react";
import { Download, Share2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

const LEVEL_CONFIG = {
  level1: { name: "Foundation",    primary: "#003d7a", hex: [0, 61, 122],  gold: "#d4af37", lightGold: "#e6c547" },
  level2: { name: "Professional",  primary: "#003d7a", hex: [0, 61, 122],  gold: "#d4af37", lightGold: "#e6c547" },
  level3: { name: "Advanced",      primary: "#003d7a", hex: [0, 61, 122],  gold: "#d4af37", lightGold: "#e6c547" },
};

export default function CertificateViewer({ enrollment, user }) {
  const certRef = useRef(null);
  const level = LEVEL_CONFIG[enrollment.course_level] || LEVEL_CONFIG.level1;

  const completedDate = enrollment.completed_date
    ? new Date(enrollment.completed_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  const certNum = `SOL-${enrollment.id?.slice(-8).toUpperCase() || "XXXXXXXX"}`;
  const studentName = user?.full_name || "Student Name";

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = 297; const H = 210;
    const primaryColor = [0, 61, 122];
    const goldColor = [212, 175, 55];

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, H, "F");

    // Dark blue header bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, W, 60, "F");

    // Gold diagonal accent stripe
    doc.setFillColor(...goldColor);
    doc.rect(W - 80, 0, 80, 80, "F");

    // Organization logo/name top left
    doc.setFont("Times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("SOL BUSINESS CONSULTANT", 20, 20, { align: "left" });
    doc.setFontSize(8);
    doc.text("Australian NDIS Training Academy", 20, 26, { align: "left" });

    // Main certificate title
    doc.setFont("Times", "bold");
    doc.setFontSize(56);
    doc.setTextColor(...primaryColor);
    doc.text("CERTIFICATE", W / 2, 75, { align: "center" });

    // Subtitle
    doc.setFont("Times", "normal");
    doc.setFontSize(20);
    doc.setTextColor(...goldColor);
    doc.text("OF ACHIEVEMENT", W / 2, 88, { align: "center" });

    // Decorative lines around subtitle
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(80, 92, 150, 92);
    doc.line(W - 150, 92, W - 80, 92);

    // Recognition text
    doc.setFont("Times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", W / 2, 105, { align: "center" });

    // Student Name
    doc.setFont("Times", "bold");
    doc.setFontSize(32);
    doc.setTextColor(...primaryColor);
    doc.text(studentName.toUpperCase(), W / 2, 122, { align: "center" });

    // Decorative underline for name
    doc.setLineWidth(0.5);
    const nameWidth = doc.getTextWidth(studentName.toUpperCase());
    doc.line(W / 2 - nameWidth / 2 - 10, 126, W / 2 + nameWidth / 2 + 10, 126);

    // Course info
    doc.setFont("Times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`For successful completion of: ${enrollment.course_title || "NDIS Training Course"}`, W / 2, 138, { align: "center" });
    doc.text(`Level: ${level.name} | Date: ${completedDate}`, W / 2, 145, { align: "center" });
    doc.text(`Certificate No: ${certNum}`, W / 2, 151, { align: "center" });

    // Bottom signature and seal area
    doc.setFont("Times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.line(30, 167, 90, 167);
    doc.line(W - 90, 167, W - 30, 167);

    doc.setFont("Times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text("Saf Meo", 60, 173, { align: "center" });
    doc.text("Director", W - 60, 173, { align: "center" });

    // Bottom footer
    doc.setFont("Times", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("www.solbusinessconsultant.com.au | ABN: 20 662 022 522", W / 2, H - 8, { align: "center" });

    doc.save(`SOL_Certificate_${studentName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Certificate Preview */}
      <div ref={certRef} className="relative bg-white" style={{ aspectRatio: "1.413" }}>
        {/* Dark blue header with gold accent */}
        <div className="absolute top-0 left-0 right-0 h-[26%] bg-gradient-to-r from-[#003d7a] to-[#003d7a] overflow-hidden">
          <div className="absolute -right-12 -top-12 w-32 h-32 sm:w-64 sm:h-64 bg-[#d4af37] transform rotate-45 opacity-30" />
          <div className="relative z-10 px-4 pt-2 sm:px-12 sm:pt-6">
            <p className="text-white text-[10px] sm:text-sm font-bold">SOL BUSINESS CONSULTANT</p>
            <p className="text-white/80 text-[8px] sm:text-xs">Australian NDIS Training Academy</p>
          </div>
        </div>

        {/* Main content area */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 pt-12 pb-4 sm:px-16 sm:pt-20 sm:pb-12">
          <h1 className="text-2xl sm:text-6xl font-bold text-[#003d7a] mb-0.5 sm:mb-1">CERTIFICATE</h1>
          <p className="text-sm sm:text-2xl font-serif text-[#d4af37] mb-2 sm:mb-6">OF ACHIEVEMENT</p>

          <div className="flex items-center justify-center gap-3 sm:gap-8 w-full mb-3 sm:mb-8">
            <div className="flex-1 h-0.5 sm:h-1" style={{ backgroundColor: "#003d7a" }} />
            <span className="text-[#d4af37] text-sm sm:text-2xl">●</span>
            <div className="flex-1 h-0.5 sm:h-1" style={{ backgroundColor: "#003d7a" }} />
          </div>

          <p className="text-slate-600 text-[8px] sm:text-sm mb-1 sm:mb-2 tracking-wide text-center">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
          <p className="text-lg sm:text-4xl font-bold text-[#003d7a] mb-1 sm:mb-2 uppercase tracking-wide text-center">{studentName}</p>
          <div className="w-32 sm:w-64 h-0.5 sm:h-1 mb-2 sm:mb-6" style={{ backgroundColor: "#003d7a" }} />

          <p className="text-center text-slate-700 text-[9px] sm:text-sm mb-1 sm:mb-2">
            For successful completion of: <span className="font-semibold">{enrollment.course_title || "NDIS Training Course"}</span>
          </p>
          <p className="text-center text-slate-600 text-[8px] sm:text-xs mb-1 sm:mb-4">
            Level: {level.name} | Date: {completedDate}
          </p>
          <p className="text-center text-slate-600 text-[8px] sm:text-xs mb-2 sm:mb-6">Certificate No: {certNum}</p>

          {/* Signature area */}
          <div className="w-full flex justify-between items-end px-2 sm:px-4 mt-2 sm:mt-6 pt-2 sm:pt-4 border-t border-slate-300">
            <div className="text-center">
              <div className="w-12 sm:w-24 h-px mb-1 sm:mb-2" style={{ backgroundColor: "#003d7a" }} />
              <p className="font-semibold text-[#003d7a] text-[9px] sm:text-sm">Saf Meo</p>
              <p className="text-slate-600 text-[8px] sm:text-xs">CEO Sol Business Consultant  </p>
            </div>
            <div className="text-center">
              <div className="w-12 sm:w-24 h-px mb-1 sm:mb-2" style={{ backgroundColor: "#003d7a" }} />
              <p className="font-semibold text-[#003d7a] text-[9px] sm:text-sm">Verified</p>
              <p className="text-slate-600 text-[8px] sm:text-xs">Official</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[7px] sm:text-xs text-slate-500 mt-2 sm:mt-6 px-2 sm:px-4">
            www.solbusinessconsultant.com.au | ABN: 20 662 022 522
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <Button onClick={handleDownloadPDF} className="w-full sm:w-auto gap-2 text-white bg-[#003d7a] hover:bg-[#002651]">
          <Download className="w-4 h-4" /> Download PDF
        </Button>
        <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => {
          navigator.clipboard.writeText(`${studentName} | ${enrollment.course_title} | ${level.name} Level | Cert No: ${certNum} | ${completedDate}`);
        }}>
          <Share2 className="w-4 h-4" /> Copy to Clipboard
        </Button>
        <div className="flex items-center gap-1.5 sm:ml-auto text-xs font-medium text-[#003d7a]">
          <Shield className="w-3.5 h-3.5" />
          Officially Certified
        </div>
      </div>
    </div>
  );
}