"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  decisions: Decision[];
}

export default function DashboardPage() {
  const { token, user } = useAuth();
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

  const getBarColor = (outcome: string) => {
    if (outcome === "Positive") return "bg-primary/20 group-hover:bg-primary";
    if (outcome === "Negative") return "bg-error/20 group-hover:bg-primary";
    return "bg-outline-variant/20 group-hover:bg-primary";
  };

  // Calculate confidence circle dash offset
  const confidence = data?.memoryConfidence || 0;
  const circumference = 2 * Math.PI * 28; // r=28
  const dashOffset = circumference - (confidence / 100) * circumference;

  return (
    <DashboardLayout>
      <div className="px-12 pt-8 pb-24">
        {/* Welcome Header */}
        <div className="mb-10">
          <p className="text-primary font-body uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">
            Current Standing
          </p>
          <h2 className="text-4xl font-headline text-on-surface italic">
            Welcome back, {user?.name?.split(" ")[0] || "Curator"}. Your
            repository has grown.
          </h2>
        </div>

        {/* Row 1: Stat Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Stat 1 */}
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <span
                className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                inventory_2
              </span>
            </div>
            <div className="text-3xl font-headline text-on-surface">
              {loading ? "—" : data?.totalDecisions || 0}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-outline mt-1">
              Decisions Logged
            </div>
          </div>

          {/* Stat 2 */}
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <span
                className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <div className="text-3xl font-headline text-on-surface">
              {loading ? "—" : data?.positiveOutcomes || 0}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-outline mt-1">
              Positive Outcomes
            </div>
          </div>

          {/* Stat 3 */}
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <span
                className="material-symbols-outlined text-tertiary p-2 bg-tertiary/10 rounded-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                hub
              </span>
            </div>
            <div className="text-3xl font-headline text-on-surface">
              {loading ? "—" : data?.patternsFound || 0}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-outline mt-1">
              Patterns Found
            </div>
          </div>

          {/* Stat 4: Confidence */}
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-outline-variant/20"
                  cx="32"
                  cy="32"
                  r="28"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <circle
                  className="text-primary transition-all duration-1000"
                  cx="32"
                  cy="32"
                  r="28"
                  fill="transparent"
                  stroke="currentColor"
                  strokeDasharray={circumference}
                  strokeDashoffset={loading ? circumference : dashOffset}
                  strokeWidth="4"
                />
              </svg>
              <span className="absolute text-[10px] font-bold">
                {loading ? "—" : `${confidence}%`}
              </span>
            </div>
            <div>
              <div className="text-xl font-headline text-on-surface">
                Confidence
              </div>
              <div className="text-[10px] uppercase tracking-wider text-outline">
                Memory Recall Accuracy
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Recent Decisions */}
          <div className="w-full lg:w-2/3">
            <div className="flex items-end justify-between mb-8">
              <h3 className="text-2xl font-headline italic text-on-surface">
                Recent Decisions
              </h3>
              <Link
                href="/insights"
                className="text-[10px] uppercase tracking-widest text-primary border-b border-primary hover:opacity-70 transition-all pb-1"
              >
                View Archive
              </Link>
            </div>
            <div className="space-y-6">
              {loading ? (
                <div className="text-outline text-sm">Loading decisions...</div>
              ) : data?.decisions && data.decisions.length > 0 ? (
                data.decisions.slice(0, 5).map((d) => (
                  <div
                    key={d.id}
                    className="group flex items-center gap-6 p-1 hover:translate-x-2 transition-transform duration-300"
                  >
                    <div
                      className={`w-2 h-10 ${getBarColor(
                        d.outcome
                      )} transition-colors rounded-full`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-on-surface font-medium mb-2 leading-relaxed">
                        {d.decision}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant uppercase tracking-widest">
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
                ))
              ) : (
                <p className="text-outline text-sm">
                  No decisions logged yet.{" "}
                  <Link href="/log" className="text-primary hover:underline">
                    Log your first decision
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Right: Agent Insight */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <div className="glass-panel p-8 rounded-xl border border-primary/30 ai-glow relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/10 blur-[60px] rounded-full"></div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
                    Agent Intelligence
                  </span>
                </div>
                <h4 className="text-2xl font-headline text-on-surface mb-4">
                  Pattern Detected
                </h4>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                  {data && data.totalDecisions > 0 ? (
                    <>
                      Your organic content posts have consistently better
                      outcomes than paid advertising.{" "}
                      <span className="text-primary italic">
                        Content marketing
                      </span>{" "}
                      shows positive results across multiple decisions.
                    </>
                  ) : (
                    "Log some decisions and I'll start finding patterns in your decision history."
                  )}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                  <span className="text-[9px] uppercase tracking-widest text-outline">
                    Based on {data?.totalDecisions || 0} memories
                  </span>
                  <Link
                    href="/ask"
                    className="text-secondary text-xs hover:underline transition-all"
                  >
                    Refine Pattern
                  </Link>
                </div>
              </div>
              {/* Decorative Memory Thread */}
              <div className="mt-8 ml-8">
                <div className="h-24 w-[2px] bg-gradient-to-b from-primary to-transparent opacity-50"></div>
                <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold mt-4">
                  Linked Cognition Node
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB: Log Decision */}
      <Link
        href="/log"
        className="fixed bottom-10 right-10 group flex flex-col items-end z-50"
      >
        <div className="mb-4 py-2 px-4 bg-surface-container-highest text-primary text-[10px] uppercase tracking-widest font-bold rounded-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl border border-outline-variant/10">
          Log Decision
        </div>
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 active:scale-95 transition-all duration-150">
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: "'wght' 600" }}
          >
            add
          </span>
        </div>
      </Link>
    </DashboardLayout>
  );
}
