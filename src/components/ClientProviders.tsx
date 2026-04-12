"use client";

import { AuthProvider } from "@/components/AuthProvider";
import ClickSpark from "@/components/ClickSpark";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ClickSpark
        sparkColor="#c4c0ff"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={10}
        duration={500}
      >
        {children}
      </ClickSpark>
    </AuthProvider>
  );
}
