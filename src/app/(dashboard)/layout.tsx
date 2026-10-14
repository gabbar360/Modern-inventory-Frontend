"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/store/api/authApi";
import { selectAuthStatus } from "@/store/slices/authSlice";
import { useAppSelector } from "@/store/hooks";
import AppShell from "@/components/layout/AppShell";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  useGetMeQuery();
  const status = useAppSelector(selectAuthStatus);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
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

  if (status === "unauthenticated") return null;

  return <AppShell>{children}</AppShell>;
}
