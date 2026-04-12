"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  // Staggered animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-on-surface">
      {/* TopNavBar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-xl"
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 py-6">
          <div className="text-2xl font-headline italic text-indigo-300">
            Retrospect
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <a
              className="text-indigo-300 font-semibold border-b-2 border-indigo-300 pb-1 tracking-wide"
              href="#how-it-works"
            >
              How it Works
            </a>
            <a
              className="text-slate-400 font-medium hover:text-indigo-200 transition-colors tracking-wide"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-slate-400 font-medium hover:text-indigo-200 transition-colors tracking-wide"
              href="#get-started"
            >
              Get Started
            </a>
          </div>
          <Link
            href="/signup"
            className="bg-primary text-on-primary-fixed px-6 py-2.5 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 active:scale-95"
          >
            Start Free
          </Link>
        </div>
      </motion.nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-48 pb-32 overflow-hidden">
          <div className="absolute inset-0 hero-glow -z-10"></div>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-7xl mx-auto px-8 text-center"
          >
            <motion.h1 
              variants={item}
              className="text-6xl md:text-8xl font-headline font-medium tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto text-white"
            >
              Your decisions. <br />
              <span className="italic text-primary">Remembered.</span> Learned.
              Improved.
            </motion.h1>
            <motion.p 
              variants={item}
              className="text-xl md:text-2xl text-slate-400 font-body max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              The private gallery for your intellectual legacy. An AI decision
              memory agent that transforms hindsight into foresight.
            </motion.p>
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/signup"
                className="bg-primary text-on-primary-fixed px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition-all active:scale-95"
              >
                Get Started
              </Link>
              <a
                href="#how-it-works"
                className="text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:underline transition-all"
              >
                See How It Works
              </a>
            </motion.div>
          </motion.div>

          {/* Visual Accent */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="mt-24 max-w-5xl mx-auto px-8"
          >
            <div className="glass-card rounded-2xl p-4 relative">
              <div className="w-full h-[300px] md:h-[400px] rounded-xl bg-surface-container-low flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                <div className="text-center relative z-10">
                  <p className="text-xs uppercase tracking-[0.3em] text-outline mb-6">
                    Complex Decisions
                  </p>
                  <div className="flex items-center justify-center gap-8 mb-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ delay: 0.8 + (i * 0.1), duration: 0.5 }}
                        key={i} 
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            i % 2 === 0 ? "bg-primary" : "bg-primary/30"
                          }`}
                        ></div>
                        <div className="w-px h-12 bg-gradient-to-b from-primary/30 to-transparent"></div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    {[
                      "Strategic Planning",
                      "Resource Allocation",
                      "Market Analysis",
                      "Team Decisions",
                    ].map((t, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + (i * 0.1), duration: 0.4 }}
                        key={i}
                        className="flex items-center gap-3 text-sm text-on-surface-variant"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                        <span className="text-xs uppercase tracking-widest">
                          {t}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
            </div>
          </motion.div>
        </section>

        {/* Stats Bar */}
        <section className="bg-surface-container-low py-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-headline text-primary">
                  2,400+
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-label">
                  Decisions Logged
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-headline text-secondary">94%</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-label">
                  Pattern Accuracy
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-headline text-primary">48hr</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-label">
                  Average to First Insight
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-20"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-label mb-4 block">
                The Methodology
              </span>
              <h2 className="text-5xl font-headline text-white max-w-xl">
                A sanctuary for your critical thinking.
              </h2>
            </motion.div>
            
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8" 
              id="features"
            >
              {/* Card 1 */}
              <motion.div variants={item} className="glass-card p-10 rounded-xl group hover:border-primary/30 transition-all duration-500">
                <div className="w-14 h-14 rounded-lg bg-surface-container-highest flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    history_edu
                  </span>
                </div>
                <h3 className="text-2xl font-headline text-white mb-4">
                  Log a Decision
                </h3>
                <p className="text-slate-400 font-body leading-relaxed mb-6">
                  Describe what you decided and what happened. Every nuanced
                  detail matters in your personal archive.
                </p>
                <div className="h-1 w-0 group-hover:w-full bg-primary/40 transition-all duration-700"></div>
              </motion.div>

              {/* Card 2 */}
              <motion.div variants={item} className="glass-card p-10 rounded-xl group hover:border-secondary/30 transition-all duration-500">
                <div className="w-14 h-14 rounded-lg bg-surface-container-highest flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-secondary text-3xl">
                    psychology
                  </span>
                </div>
                <h3 className="text-2xl font-headline text-white mb-4">
                  Agent Remembers
                </h3>
                <p className="text-slate-400 font-body leading-relaxed mb-6">
                  Hindsight retains every decision as memory. No detail is too
                  small for our neural retrieval system.
                </p>
                <div className="h-1 w-0 group-hover:w-full bg-secondary/40 transition-all duration-700"></div>
              </motion.div>

              {/* Card 3 */}
              <motion.div variants={item} className="glass-card p-10 rounded-xl group hover:border-primary/30 transition-all duration-500">
                <div className="w-14 h-14 rounded-lg bg-surface-container-highest flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    auto_awesome
                  </span>
                </div>
                <h3 className="text-2xl font-headline text-white mb-4">
                  Get Smarter Advice
                </h3>
                <p className="text-slate-400 font-body leading-relaxed mb-6">
                  Agent recalls patterns and improves over time, offering
                  suggestions based on your historical outcomes.
                </p>
                <div className="h-1 w-0 group-hover:w-full bg-primary/40 transition-all duration-700"></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Editorial Quote Section */}
        <section className="py-24 max-w-7xl mx-auto px-8 overflow-hidden" id="get-started">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-1/2"
            >
              <div className="rounded-2xl w-full h-[500px] bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container-highest opacity-60 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-secondary/5 transition-opacity duration-700 group-hover:opacity-100 opacity-50"></div>
                <div className="relative z-10 text-center space-y-4 transform group-hover:scale-105 transition-transform duration-700">
                  <span className="material-symbols-outlined text-primary text-6xl opacity-60">
                    auto_awesome
                  </span>
                  <p className="text-xs uppercase tracking-[0.3em] text-outline">
                    Memory Architecture
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full md:w-1/2 space-y-8"
            >
              <blockquote className="text-4xl font-headline italic text-slate-200 leading-snug">
                &ldquo;We don&apos;t just record data; we preserve the intent behind
                every choice, building a bridge between who you were and who you
                are becoming.&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-primary"></div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-label">
                  The Digital Curator Ethos
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-[#131318] py-12 border-t border-white/5 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-8">
          <div className="mb-8 md:mb-0">
            <span className="text-xl font-headline italic text-indigo-300">
              Retrospect
            </span>
            <p className="text-slate-500 text-sm mt-2 font-body">
              © 2024 Retrospect. The Digital Curator.
            </p>
          </div>
          <div className="flex gap-8">
            <a
              className="text-slate-500 hover:text-indigo-200 transition-all duration-200 font-label text-xs uppercase tracking-widest"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-slate-500 hover:text-indigo-200 transition-all duration-200 font-label text-xs uppercase tracking-widest"
              href="#"
            >
              Terms
            </a>
            <a
              className="text-slate-500 hover:text-indigo-200 transition-all duration-200 font-label text-xs uppercase tracking-widest"
              href="#"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
