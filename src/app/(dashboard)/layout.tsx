"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, selectAuthStatus, selectIsAuthenticated } from "@/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AppShell from "@/components/layout/AppShell";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (status !== "unauthenticated") {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router, mounted]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AppShell>{children}</AppShell>;
}
