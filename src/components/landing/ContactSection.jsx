import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", company: "", service: "", message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Thank you! We'll be in touch within 24 hours.");
    setFormData({ name: "", email: "", phone: "", company: "", service: "", message: "" });
    setLoading(false);
  };

  return (
    <section id="contact" className="py-32 bg-chalk relative overflow-hidden">
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full border border-harvest/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
              Get In Touch
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight mb-6">
              Ready to Build<br />Your Foundation?
            </h2>
            <p className="text-lg text-slate_mist leading-relaxed mb-10 max-w-md">
              Book a free, no-obligation consultation. We'll discuss your situation 
              and create a clear path forward.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-harvest" />
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Email</p>
                  <a href="mailto:info@solbusinessconsultant.com.au" className="font-display font-semibold text-ink hover:text-harvest transition-colors">info@solbusinessconsultant.com.au</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-harvest" />
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Phone</p>
                  <a href="tel:+61460003494" className="font-display font-semibold text-ink hover:text-harvest transition-colors">+61 460 003 494</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-harvest" />
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Location</p>
                  <p className="font-display font-semibold text-ink">Glenroy VIC 3046 — Australia-wide</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <span className="text-harvest font-bold text-xs">WWW</span>
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Website</p>
                  <a href="https://www.solbusinessconsultant.com.au" target="_blank" rel="noopener noreferrer" className="font-display font-semibold text-ink hover:text-harvest transition-colors">www.solbusinessconsultant.com.au</a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-border/50 shadow-lg space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Full Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Email</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0400 000 000"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Service Needed</Label>
                <Select value={formData.service} onValueChange={(val) => setFormData({ ...formData, service: val })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ndis">NDIS Registration Support</SelectItem>
                    <SelectItem value="compliance">Easy Compliance Setup</SelectItem>
                    <SelectItem value="bookkeeping">Bookkeeping & BAS</SelectItem>
                    <SelectItem value="training">Support Coordination Training</SelectItem>
                    <SelectItem value="company">Company Registration</SelectItem>
                    <SelectItem value="website">Website Development</SelectItem>
                    <SelectItem value="payroll">Payroll Services</SelectItem>
                    <SelectItem value="other">Other / Multiple Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your business needs..."
                  rows={4}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-harvest hover:bg-harvest/90 text-white font-display text-base py-6 gap-2 group"
              >
                {loading ? "Sending..." : "Book Free Consultation"}
                {!loading && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
              </Button>
              <p className="text-xs text-center text-slate_mist">
                No pressure, no obligations. We'll respond within 24 hours.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}