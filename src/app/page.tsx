"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, selectAuthStatus } from "@/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector(selectAuthStatus);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      Loading Vegnar ERP & CRM…
    </div>
  );
}
