import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bot, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const QUICK_QUESTIONS = [
  "How does NDIS registration work?",
  "What training courses do you offer?",
  "Tell me about your pricing",
  "I need help with bookkeeping",
];

function TypingIndicator() {
  return (
    <div className="flex gap-2 justify-start">
      <div className="w-6 h-6 rounded-full bg-harvest/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-harvest" />
      </div>
      <div className="bg-white border border-border rounded-2xl px-4 py-3">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const initConversation = async () => {
    if (conversation) return;
    setStarting(true);
    const conv = await base44.agents.createConversation({
      agent_name: "sol_assistant",
      metadata: { name: "Widget Chat" },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
      if (!open) setUnread((n) => n + 1);
    });
    setStarting(false);
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    initConversation();
  };

  const handleClose = () => setOpen(false);

  useEffect(() => {
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading || !conversation) return;
    setInput("");
    setLoading(true);
    await base44.agents.addMessage(conversation, { role: "user", content: msg });
    setLoading(false);
  };

  const panelH = expanded ? "h-[600px]" : "h-[460px]";
  const panelW = expanded ? "w-[420px]" : "w-[360px]";

  return (
    <div className="fixed right-4 bottom-8 z-50 flex flex-col items-end gap-3">

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`${panelW} ${panelH} bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-ink flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-harvest flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-display font-semibold text-white text-sm leading-tight">SOL Assistant</p>
                  <p className="text-white/50 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Online · Replies instantly
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setExpanded((e) => !e)} className="text-white/40 hover:text-white transition-colors">
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
              {starting ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-5 h-5 border-2 border-harvest border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-2">
                  <div className="w-12 h-12 rounded-2xl bg-harvest/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-harvest" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink text-sm mb-1">Hi! I'm the SOL Assistant 👋</p>
                    <p className="text-slate_mist text-xs">Ask me anything about our services or pick a question below:</p>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 w-full">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-left text-xs text-ink border border-border rounded-xl px-3 py-2 hover:border-harvest hover:text-harvest transition-colors bg-white"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isUser = msg.role === "user";
                    return (
                      <div key={i} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full bg-harvest/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-harvest" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${isUser ? "bg-ink text-white" : "bg-white border border-border text-ink"}`}>
                          {isUser ? (
                            <p>{msg.content}</p>
                          ) : (
                            <ReactMarkdown
                              className="prose prose-xs max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                              components={{
                                p: ({ children }) => <p className="my-0.5">{children}</p>,
                                ul: ({ children }) => <ul className="my-1 ml-3 list-disc">{children}</ul>,
                                li: ({ children }) => <li className="my-0">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-harvest underline">{children}</a>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {loading && <TypingIndicator />}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-border bg-white flex-shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-xs text-ink placeholder:text-slate_mist focus:outline-none focus:border-harvest focus:ring-1 focus:ring-harvest transition-colors"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading || starting}
                  className="w-9 h-9 rounded-xl bg-ink hover:bg-harvest disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <p className="text-center text-[9px] text-slate_mist mt-1.5">
                Powered by SOL AI · <a href="tel:+61460003494" className="hover:text-harvest">+61 460 003 494</a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <div className="relative">
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10">
            {unread}
          </span>
        )}
        <span className="absolute inset-0 rounded-full bg-ink animate-ping opacity-20" />
        <button
          onClick={open ? handleClose : handleOpen}
          className="relative w-14 h-14 rounded-full bg-ink hover:bg-harvest flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
          title="Chat with AI Assistant"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-6 h-6 text-white" />
              </motion.span>
            ) : (
              <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Bot className="w-6 h-6 text-white" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}