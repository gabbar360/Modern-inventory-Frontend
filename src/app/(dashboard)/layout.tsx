"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "out") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (status === "out") {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
