"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import DashboardLayout from "@/components/DashboardLayout";

const categories = ["Marketing", "Hiring", "Product", "Finance", "Operations", "Other"];
const outcomes = [
  { label: "Positive", icon: "sentiment_satisfied", color: "border-secondary bg-secondary/10 text-secondary" },
  { label: "Neutral", icon: "sentiment_neutral", color: "border-outline-variant/20 bg-surface-container-lowest text-slate-400 hover:border-amber-400/50" },
  { label: "Negative", icon: "sentiment_dissatisfied", color: "border-outline-variant/20 bg-surface-container-lowest text-slate-400 hover:border-error/50" },
];

export default function LogDecisionPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [decision, setDecision] = useState("");
  const [category, setCategory] = useState("Marketing");
  const [outcome, setOutcome] = useState("Positive");
  const [result, setResult] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRetained, setShowRetained] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision || !result || !date) return;
    setLoading(true);

    try {
      const res = await fetch("/api/decisions/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision, category, outcome, result, date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Show retained animation
      setShowRetained(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (showRetained) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-memory-retained text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto ai-glow">
              <span
                className="material-symbols-outlined text-primary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-headline italic text-on-surface mb-2">
                Memory Retained
              </h3>
              <p className="text-on-surface-variant text-sm">
                by Retrospect
              </p>
            </div>
            <div className="glass-card p-6 rounded-xl max-w-md mx-auto animate-slide-in-up">
              <p className="text-sm text-on-surface font-medium mb-2">
                {decision}
              </p>
              <div className="flex gap-2">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant uppercase tracking-widest">
                  {category}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                    outcome === "Positive"
                      ? "bg-secondary/10 text-secondary border-secondary/20"
                      : outcome === "Negative"
                      ? "bg-error/10 text-error border-error/20"
                      : "bg-outline-variant/10 text-outline border-outline-variant/20"
                  }`}
                >
                  {outcome}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative overflow-hidden min-h-full">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-3xl mx-auto px-8 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container-highest mb-6">
              <span className="material-symbols-outlined text-primary">add</span>
            </div>
            <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-3 italic">
              Log a Decision
            </h2>
            <p className="text-on-surface-variant font-body text-lg">
              Every decision you log makes your agent smarter
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-xl p-10 space-y-10 relative overflow-hidden"
          >
            {/* Ghost gradient */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-40"></div>

            {/* Decision */}
            <div className="space-y-4">
              <label className="block font-label uppercase tracking-widest text-[11px] font-bold text-primary">
                What decision did you make?
              </label>
              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-600 resize-none outline-none"
                placeholder="I decided to run Instagram ads for my product launch..."
                rows={4}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-4">
              <label className="block font-label uppercase tracking-widest text-[11px] font-bold text-primary">
                Category
              </label>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                      category === cat
                        ? "bg-primary text-on-primary-fixed font-semibold hover:brightness-110"
                        : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Outcome */}
            <div className="space-y-4">
              <label className="block font-label uppercase tracking-widest text-[11px] font-bold text-primary">
                Initial Outcome
              </label>
              <div className="grid grid-cols-3 gap-4">
                {outcomes.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setOutcome(o.label)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      outcome === o.label
                        ? o.label === "Positive"
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : o.label === "Negative"
                          ? "border-error bg-error/10 text-error"
                          : "border-amber-400 bg-amber-400/10 text-amber-400"
                        : "border-outline-variant/20 bg-surface-container-lowest text-slate-400"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={
                        outcome === o.label
                          ? { fontVariationSettings: "'FILL' 1" }
                          : undefined
                      }
                    >
                      {o.icon}
                    </span>
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {o.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            <div className="space-y-4">
              <label className="block font-label uppercase tracking-widest text-[11px] font-bold text-primary">
                What happened as a result?
              </label>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-600 resize-none outline-none"
                placeholder="Sales were lower than expected..."
                rows={4}
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-4">
              <label className="block font-label uppercase tracking-widest text-[11px] font-bold text-primary">
                When did this happen?
              </label>
              <div className="relative max-w-xs">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-on-primary-container font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] group shadow-xl shadow-primary/10 disabled:opacity-50"
              >
                <span
                  className="material-symbols-outlined group-hover:rotate-12 transition-transform"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
                {loading ? "Saving..." : "Save to Memory"}
              </button>
              <p className="text-center text-slate-500 font-body text-xs mt-6">
                Hindsight will retain this decision instantly
              </p>
            </div>
          </form>

          {/* Bottom Quote */}
          <div className="mt-20 flex justify-end">
            <div className="max-w-xs text-right opacity-30">
              <p className="font-headline italic text-on-surface-variant text-sm">
                &ldquo;The quality of your life is determined by the quality of
                your decisions.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Thread Visual */}
      <div className="fixed right-12 top-1/4 w-[2px] h-64 bg-gradient-to-b from-primary via-secondary/40 to-transparent -z-10"></div>
      <div className="fixed right-[46px] top-[25%] w-3 h-3 rounded-full bg-primary blur-[2px] -z-10"></div>
    </DashboardLayout>
  );
}
