"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/ask?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#131318]/60 backdrop-blur-xl flex justify-between items-center w-full px-8 py-4 shadow-sm shadow-primary/5">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search memories..."
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-2 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-outline"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Removed notifications and settings as requested */}
      </div>
    </header>
  );
}
