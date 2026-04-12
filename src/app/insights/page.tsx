"use client";

import { useEffect, useState } from "react";
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

interface InsightsData {
  totalDecisions: number;
  positiveOutcomes: number;
  patternsFound: number;
  memoryConfidence: number;
  categoryStats: Record<string, { total: number; positive: number; negative: number }>;
  patterns: string[];
  decisions: Decision[];
  topCategory: string;
  bestCategory: string;
  worstCategory: string;
}

export default function InsightsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/insights", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getOutcomeColor = (outcome: string) => {
    if (outcome === "Positive") return "bg-secondary/10 text-secondary border-secondary/20";
    if (outcome === "Negative") return "bg-error/10 text-error border-error/20";
    return "bg-outline-variant/10 text-outline border-outline-variant/20";
  };

  const getOutcomeBarColor = (outcome: string) => {
    if (outcome === "Positive") return "bg-secondary";
    if (outcome === "Negative") return "bg-error";
    return "bg-outline";
  };

  const confidence = data?.memoryConfidence || 0;

  return (
    <DashboardLayout>
      <div className="px-12 pt-8 pb-24">
        {/* Header */}
        <div className="mb-10">
          <p className="text-primary font-body uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">
            Intelligence Report
          </p>
          <h2 className="text-4xl font-headline text-on-surface italic">
            Patterns in your decision history
          </h2>
        </div>

        {loading ? (
          <div className="text-outline">Loading insights...</div>
        ) : !data ? (
          <div className="text-outline">No data available.</div>
        ) : (
          <>
            {/* Pattern Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {data.patterns.map((pattern, i) => (
                <div
                  key={i}
                  className="glass-panel p-8 rounded-xl border border-outline-variant/10 relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
                >
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 blur-[40px] rounded-full group-hover:bg-primary/10 transition-all"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {i === 0 ? "insights" : i === 1 ? "trending_up" : "warning"}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                      Pattern {i + 1}
                    </span>
                  </div>
                  <p className="text-on-surface font-headline text-lg italic leading-relaxed">
                    {pattern}
                  </p>
                </div>
              ))}
            </div>

            {/* Memory Confidence Bar */}
            <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    psychology
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                    Memory Confidence
                  </span>
                </div>
                <span className="text-2xl font-headline text-on-surface">
                  {confidence}%
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
              <p className="text-xs text-outline mt-3">
                Based on {data.totalDecisions} decisions logged. Log more decisions to increase confidence.
              </p>
            </div>

            {/* Category Breakdown */}
            {Object.keys(data.categoryStats).length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-headline italic text-on-surface mb-6">
                  Category Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(data.categoryStats).map(([cat, stats]) => {
                    const successRate = stats.total > 0
                      ? Math.round((stats.positive / stats.total) * 100)
                      : 0;
                    return (
                      <div
                        key={cat}
                        className="glass-panel p-6 rounded-xl border border-outline-variant/10"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[9px] px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant uppercase tracking-widest font-bold">
                            {cat}
                          </span>
                          <span className="text-lg font-headline text-on-surface">
                            {stats.total}
                          </span>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary rounded-full"
                              style={{
                                width: `${
                                  stats.total > 0
                                    ? (stats.positive / stats.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-outline">
                          <span>{stats.positive} positive</span>
                          <span>{stats.negative} negative</span>
                          <span>{successRate}% success</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Decision Archive */}
            <div>
              <h3 className="text-2xl font-headline italic text-on-surface mb-6">
                Full Decision Archive
              </h3>
              <div className="space-y-4">
                {data.decisions.map((d) => (
                  <div
                    key={d.id}
                    className={`group flex items-center gap-6 p-4 rounded-xl glass-panel border transition-all duration-300 hover:translate-x-1 ${
                      d.outcome === "Positive"
                        ? "border-secondary/10"
                        : d.outcome === "Negative"
                        ? "border-error/10"
                        : "border-outline-variant/10"
                    }`}
                  >
                    <div
                      className={`w-2 h-12 rounded-full ${getOutcomeBarColor(
                        d.outcome
                      )} opacity-40 group-hover:opacity-100 transition-opacity`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-on-surface font-medium mb-1 leading-relaxed">
                        {d.decision}
                      </p>
                      <p className="text-on-surface-variant text-sm mb-2">
                        {d.result}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant uppercase tracking-widest">
                          {d.category}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest border ${getOutcomeColor(
                            d.outcome
                          )}`}
                        >
                          {d.outcome}
                        </span>
                        <span className="text-[10px] text-outline ml-auto">
                          {formatDate(d.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
