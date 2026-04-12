"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import DashboardLayout from "@/components/DashboardLayout";

interface Decision {
  id: number;
  decision: string;
  category: string;
  outcome: string;
  result: string;
  date: string;
}

interface ChatMessage {
  role: "user" | "agent";
  content: string;
  confidence?: string;
  memoriesCount?: number;
}

export default function AskAgentPage() {
  const { token } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [recalledIds, setRecalledIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load decisions for memory feed
  useEffect(() => {
    if (!token) return;
    fetch("/api/decisions/list", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setDecisions(d.decisions || []))
      .catch(console.error);
  }, [token]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle incoming search query from TopBar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setInput(q);
      // Clean up the URL so it doesn't refresh with the query again
      window.history.replaceState({}, "", "/ask");
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/decisions/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRecalledIds(data.recalledIds || []);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.answer,
          confidence: `${data.confidence}%`,
          memoriesCount: data.memoriesCount,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex overflow-hidden h-full">
        {/* LEFT COLUMN: Chat Interface (60%) */}
        <section className="w-[60%] flex flex-col border-r border-outline-variant/5">
          {/* Header */}
          <div className="px-10 py-8 border-b border-outline-variant/5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">
                auto_awesome
              </span>
              <h2 className="text-3xl font-headline font-semibold text-on-surface tracking-tight">
                Ask Retrospect
              </h2>
            </div>
            <p className="mt-2 text-on-surface-variant font-body">
              Your agent recalls your past decisions before every answer
            </p>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <span className="material-symbols-outlined text-6xl text-primary">
                  auto_awesome
                </span>
                <p className="text-on-surface-variant font-headline text-xl italic">
                  Ask about a decision you&apos;re facing...
                </p>
                <p className="text-outline text-sm">
                  I&apos;ll recall your past decisions and give personalized advice
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "user" ? (
                  /* User Bubble */
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-primary-container/20 text-on-surface p-5 rounded-2xl rounded-tr-none border border-primary/20 shadow-xl shadow-primary/5">
                      <p className="font-body leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  /* Agent Bubble */
                  <div className="flex justify-start items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border border-outline-variant/20">
                      <span
                        className="material-symbols-outlined text-primary text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        smart_toy
                      </span>
                    </div>
                    <div className="max-w-[85%] space-y-4">
                      <div className="bg-surface-container-low p-6 rounded-2xl rounded-tl-none border-l-4 border-primary text-on-surface shadow-2xl relative">
                        <div className="absolute inset-0 bg-primary/2 blur-2xl rounded-2xl pointer-events-none"></div>
                        <div className="font-body leading-relaxed relative z-10 whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                      {msg.memoriesCount && (
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-secondary"></span>
                          <p className="text-xs font-label uppercase tracking-widest text-secondary font-semibold">
                            Based on {msg.memoriesCount} recalled memories —
                            confidence {msg.confidence}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border border-outline-variant/20">
                  <span
                    className="material-symbols-outlined text-primary text-sm animate-pulse"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl rounded-tl-none border-l-4 border-primary text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <span className="text-xs text-outline ml-2">
                      Recalling memories...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-8 bg-surface">
            <div className="relative max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-surface-container p-5 pr-16 rounded-2xl border border-outline-variant/10 focus:border-primary/40 focus:ring-0 text-on-surface placeholder:text-zinc-600 transition-all shadow-inner outline-none"
                placeholder="Ask about a decision you're facing..."
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center hover:scale-95 transition-transform disabled:opacity-30"
              >
                <span className="material-symbols-outlined">arrow_upward</span>
              </button>
            </div>
            <p className="text-center mt-3 text-[10px] text-zinc-600 uppercase tracking-widest">
              Shift + Enter for new line
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN: Memory Feed Panel (40%) */}
        <section className="w-[40%] bg-[#0d0d14] flex flex-col">
          {/* Header */}
          <div className="px-8 py-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">
                bolt
              </span>
              <h3 className="text-xl font-headline font-medium">
                Hindsight Memory Feed
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Memories recalled for this query are highlighted
            </p>
          </div>

          {/* Memory List */}
          <div className="flex-1 overflow-y-auto px-8 space-y-6 pb-12">
            {decisions.length === 0 ? (
              <div className="text-center py-12 text-outline text-sm">
                No memories yet. Log some decisions first.
              </div>
            ) : (
              decisions.map((d) => {
                const isRecalled = recalledIds.includes(d.id);
                return (
                  <div
                    key={d.id}
                    className={`group p-5 rounded-xl transition-all relative overflow-hidden ${
                      isRecalled
                        ? "bg-surface-container/60 border border-primary/40 shadow-lg shadow-primary/5"
                        : "bg-surface-container-low/40 border border-outline-variant/10 hover:border-outline-variant/30"
                    }`}
                  >
                    {isRecalled && (
                      <div className="absolute inset-0 bg-primary/5 opacity-40"></div>
                    )}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`text-[10px] font-label uppercase tracking-widest font-bold flex items-center gap-1.5 ${
                            isRecalled ? "text-primary" : "text-zinc-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isRecalled
                                ? "bg-primary animate-pulse"
                                : "border border-zinc-600"
                            }`}
                          ></span>
                          {isRecalled ? "Recalled" : "Stored"}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {formatDate(d.date)}
                        </span>
                      </div>
                      <h4 className="font-body font-semibold text-on-surface mb-2">
                        {d.decision}
                      </h4>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-[10px] text-on-surface-variant font-label uppercase tracking-tight">
                          {d.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-tight ${
                            d.outcome === "Positive"
                              ? "bg-secondary-container/20 text-secondary"
                              : d.outcome === "Negative"
                              ? "bg-error-container/20 text-error"
                              : "bg-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                          {d.outcome}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
