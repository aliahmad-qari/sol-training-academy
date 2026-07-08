import React, { useState, useEffect, useRef } from "react";
import { runChatAssistant } from "@/api/aiClient";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import MessageBubble from "@/components/agent/MessageBubble";
import { Send, Bot, Sparkles, RefreshCw } from "lucide-react";

const FALLBACK_ERROR =
  "Sorry — I couldn't respond just now. Please try again, or call us on +61 460 003 494.";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /** Reset to a fresh conversation (stateless — just clears local history). */
  const startConversation = () => {
    setMessages([]);
    setInput("");
    setLoading(false);
  };

  /**
   * Stateless chat: keep the running history in state and send the recent turns
   * to the backend, which forwards them to Groq and returns one reply. No
   * base44.agents dependency, and every failure is caught so the input never
   * locks up.
   */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextHistory = [...messages, { role: "user", content: text }];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const reply = await runChatAssistant(
        nextHistory.map(({ role, content }) => ({ role, content }))
      );
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setMessages((prev) => [...prev, { role: "assistant", content: apiMsg || FALLBACK_ERROR }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK_QUESTIONS = [
    "How do I register as an NDIS provider?",
    "What training courses do you offer?",
    "I need help with bookkeeping",
    "Tell me about your website packages",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-harvest/10 text-harvest text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Assistant
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-ink mb-3">
              How Can We Help You Today?
            </h1>
            <p className="text-slate_mist text-base max-w-xl mx-auto">
              Ask anything about NDIS registration, training courses, accountancy, or any of our services. Available 24/7.
            </p>
          </div>

          {/* Chat Window */}
          <div className="bg-white rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col" style={{ height: "560px" }}>

            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-ink">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-harvest flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-semibold text-white text-sm">SOL Assistant</p>
                  <p className="text-white/50 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Online · Typically replies instantly
                  </p>
                </div>
              </div>
              <button
                onClick={startConversation}
                className="text-white/40 hover:text-white transition-colors"
                title="Start new conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-harvest/10 flex items-center justify-center">
                    <Bot className="w-7 h-7 text-harvest" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink mb-1">Hi! I'm the SOL Assistant 👋</p>
                    <p className="text-slate_mist text-sm">Ask me anything about our services or try one of these:</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-left text-xs text-ink border border-border rounded-xl px-3 py-2.5 hover:border-harvest hover:text-harvest transition-colors bg-chalk"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))
              )}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border bg-chalk">
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question here..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate_mist focus:outline-none focus:border-harvest focus:ring-1 focus:ring-harvest transition-colors"
                  style={{ maxHeight: "120px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-ink hover:bg-harvest disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate_mist mt-2">
                For urgent matters call <a href="tel:+61460003494" className="hover:text-harvest transition-colors">+61 460 003 494</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}