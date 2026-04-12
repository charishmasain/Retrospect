"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/log", label: "Log Decision", icon: "add_box" },
  { href: "/ask", label: "Ask Agent", icon: "chat_bubble" },
  { href: "/insights", label: "Insights", icon: "insights" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#131318] border-r border-outline-variant/15 flex flex-col z-50">
      <div className="px-6 py-8">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              psychology
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-headline italic text-primary tracking-tight leading-none">
              Retrospect
            </h1>
            <p className="text-[10px] font-label uppercase tracking-[0.2em] text-outline mt-1 font-semibold">
              Digital Curator
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-primary font-bold border-r-2 border-primary bg-surface-container/50"
                    : "text-outline hover:text-primary hover:bg-surface-container/50"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className="font-label text-sm tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 py-8">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-lg">
                person
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-outline uppercase tracking-wider">
                {user?.role || "Founder"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 text-outline hover:text-primary transition-colors w-full"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-xs uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
