"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0f] font-body text-on-surface min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Global glow */}
      <div className="fixed inset-0 glow-center pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        {/* Login Card */}
        <div className="glass-card w-full max-w-[480px] rounded-[16px] p-8 md:p-12 shadow-2xl transition-all duration-500 border border-[#1e1e2e]">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">
                psychology
              </span>
            </div>
            <h1 className="text-2xl font-headline italic text-primary tracking-tight">
              Retrospect
            </h1>
          </div>

          {/* Typography */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-headline font-bold text-on-surface mb-3 tracking-tight">
              Welcome back, curator
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto">
              Your agent is waiting with new insights
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-label font-bold tracking-widest text-slate-500 uppercase ml-1"
                  htmlFor="email"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elias@retrospect.ai"
                  className="w-full px-5 py-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary/50 text-on-surface placeholder:text-slate-600 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-label font-bold tracking-widest text-slate-500 uppercase ml-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary/50 text-on-surface placeholder:text-slate-600 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-error text-sm text-center">{error}</p>
            )}

            {/* CTA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-[0_8px_30px_rgb(196,192,255,0.15)] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-semibold hover:underline ml-1"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Visual Memory Threads */}
      <div className="absolute top-0 left-1/4 w-[1px] h-32 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/3 w-[1px] h-48 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>

      {/* Footer */}
      <footer className="flex flex-col items-center w-full px-8 py-10 max-w-7xl mx-auto gap-4 z-10">
        <p className="text-[10px] font-label tracking-widest text-slate-600 uppercase">
          © 2024 Retrospect AI. Private Gallery of Thought.
        </p>
      </footer>
    </div>
  );
}
