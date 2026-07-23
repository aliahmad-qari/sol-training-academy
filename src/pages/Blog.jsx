import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, Calendar, User } from "lucide-react";

const POSTS = [
  {
    title: "How to Register as an NDIS Provider in Australia",
    excerpt: "A step-by-step guide to navigating the NDIS registration process, from application to audit and certification.",
    author: "SOL Business Team",
    date: "May 2025",
    category: "NDIS",
    color: "bg-harvest/10 text-harvest",
    image: "/images/blog/ndis-provider-registration.webp",
    imageAlt: "Consultants reviewing NDIS provider registration documents",
  },
  {
    title: "Top 5 Bookkeeping Mistakes Small Businesses Make",
    excerpt: "Avoid common bookkeeping pitfalls that can lead to costly tax issues, compliance failures, and cash flow problems.",
    author: "SOL Business Team",
    date: "April 2025",
    category: "Accounting",
    color: "bg-ink/8 text-ink",
    image: "/images/blog/bookkeeping-business-records.webp",
    imageAlt: "Laptop and business papers arranged for bookkeeping work",
  },
  {
    title: "What is Support Coordination? A Complete Guide",
    excerpt: "Understand the role of a Support Coordinator in the NDIS, what they do, and how to become one with the right training.",
    author: "SOL Business Team",
    date: "March 2025",
    category: "Training",
    color: "bg-harvest/10 text-harvest",
    image: "/images/blog/support-coordination-training.webp",
    imageAlt: "Professional trainer presenting to adult learners in a workshop",
  },
  {
    title: "Website Development for NDIS Providers: What You Need",
    excerpt: "Your NDIS provider website needs to meet specific standards. Here's what to include to attract participants and stay compliant.",
    author: "SOL Business Team",
    date: "February 2025",
    category: "Web Development",
    color: "bg-ink/8 text-ink",
    image: "/images/blog/website-project-planning.webp",
    imageAlt: "Team planning an NDIS provider website project",
  },
  {
    title: "How Automation Can Transform Your NDIS Business",
    excerpt: "From document management to compliance tracking, software automation is changing how NDIS providers operate day-to-day.",
    author: "SOL Business Team",
    date: "January 2025",
    category: "Automation",
    color: "bg-harvest/10 text-harvest",
    image: "/images/blog/automation-dashboard.webp",
    imageAlt: "Laptop dashboard representing business automation reporting",
  },
  {
    title: "Understanding BAS Lodgement for Australian Businesses",
    excerpt: "Everything business owners need to know about Business Activity Statements — deadlines, obligations, and how to avoid penalties.",
    author: "SOL Business Team",
    date: "December 2024",
    category: "Accounting",
    color: "bg-ink/8 text-ink",
    image: "/images/blog/bas-lodgement-records.webp",
    imageAlt: "Business documents prepared for BAS lodgement and accounting review",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Insights</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-ink mb-4">Business & NDIS Blog</h1>
            <p className="text-slate_mist max-w-xl text-lg">Expert insights, guides, and updates from the SOL Business Consultant team.</p>
            <div className="w-20 h-[2px] bg-harvest mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post) => (
              <div
                key={post.title}
                className="bg-white rounded-2xl border border-border/60 flex flex-col hover:shadow-lg hover:border-harvest/30 transition-all duration-300 group overflow-hidden"
              >
                {/* Post Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    width="800"
                    height="533"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 31vw, (min-width: 768px) 45vw, 100vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                  <span className={`absolute bottom-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${post.color}`}>
                    {post.category}
                  </span>
                </div>
                {/* Post Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-display font-bold text-base text-ink mb-2 group-hover:text-harvest transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate_mist leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3 text-xs text-slate_mist">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-harvest font-semibold group-hover:gap-2 transition-all">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-harvest/5 border border-harvest/20 rounded-2xl p-10 text-center">
            <h3 className="font-display font-bold text-2xl text-ink mb-2">Have a topic you'd like us to cover?</h3>
            <p className="text-slate_mist mb-6">Get in touch and we'll write it for you.</p>
            <a href="/#contact" className="inline-flex items-center gap-2 bg-harvest text-white font-display font-semibold px-7 py-3 rounded-xl hover:bg-harvest/90 transition-colors">
              Contact Us <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}