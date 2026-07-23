import React from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function BundleCTA() {
  return (
    <section className="py-20 px-6 bg-ink text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-harvest mb-3 block">Best Value</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
            Enrol in All 3 Levels & Save
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Complete the full NDIS Support Coordinator pathway from Foundation to Advanced and take your career to the next level.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-display font-bold text-harvest">AUD $1,097</span>
              <span className="text-xl text-white/40 line-through">$1,297</span>
            </div>
            <p className="text-white/50 text-sm mb-6">Save $200 with the full bundle · Lifetime access to all 3 levels</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                "Level 1 — Foundation",
                "Level 2 — Professional",
                "Level 3 — Advanced",
                "All certificates included",
                "Priority support access",
                "Lifetime content updates",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
            <Link to="/services/support-coordination-training#training-pricing">
              <Button className="bg-harvest hover:bg-harvest/90 text-white font-display px-10 py-3 text-base gap-2 w-full">
                Get Full Bundle <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/#contact">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full text-sm">
                Have questions? Contact Us
              </Button>
            </Link>
            <p className="text-center text-xs text-white/30">Call +61 460 003 494</p>
          </div>
        </div>
      </div>
    </section>
  );
}