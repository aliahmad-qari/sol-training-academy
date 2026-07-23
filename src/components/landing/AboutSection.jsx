import React from "react";
import { motion } from "framer-motion";

const ABOUT_IMAGE = "/Images/about/trainer-student-discussion.webp";

const values = [
  { num: "01", title: "Precision", desc: "Every policy, document, and system is prepared with careful attention to business context and compliance detail." },
  { num: "02", title: "Partnership", desc: "We work beside you at each milestone, from first enquiry through implementation and follow-up." },
  { num: "03", title: "Practical Innovation", desc: "We use cloud tools, automation, and clear workflows to reduce manual administration where it makes sense." },
  { num: "04", title: "Integrity", desc: "Transparent pricing, honest guidance, and no unsupported guarantees about audit or registration outcomes." },
];

const focusAreas = [
  { value: "NDIS", label: "Registration & Compliance" },
  { value: "BAS", label: "Bookkeeping & Reporting" },
  { value: "CRM", label: "Systems & Automation" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
            About Sol
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-ink max-w-2xl leading-tight">
            The Foundation<br />of Your Growth
          </h2>
          <div className="w-20 h-[2px] bg-harvest mt-6" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src={ABOUT_IMAGE}
              alt="Consultant guiding a client through business planning on a laptop"
              width="1200"
              height="800"
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="w-full h-[320px] sm:h-[400px] object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed text-slate_mist">
              SOL Business Consultant supports Australian businesses with NDIS registration guidance, compliance preparation, bookkeeping, digital systems, websites, and growth services.
            </p>
            <p className="text-lg leading-relaxed text-slate_mist">
              With Easy Compliance in our ecosystem, we help providers organise documents, prepare operational evidence, and build workflows that are easier to maintain. We focus on practical systems, clear advice, and responsible claims.
            </p>
            <div className="flex flex-wrap gap-8 pt-4">
              {focusAreas.map((item) => (
                <div key={item.label}>
                  <div className="font-display font-bold text-3xl text-harvest">{item.value}</div>
                  <div className="text-xs text-slate_mist mt-1 uppercase tracking-wide">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 border-t-2 border-harvest/30 hover:border-harvest transition-colors duration-300"
            >
              <span className="font-display text-5xl font-bold text-border/40">{v.num}</span>
              <h4 className="font-display font-bold text-lg text-ink mt-4 mb-2">{v.title}</h4>
              <p className="text-sm text-slate_mist leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
