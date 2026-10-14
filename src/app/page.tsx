"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/store/api/authApi";
import { selectAuthStatus } from "@/store/slices/authSlice";
import { useAppSelector } from "@/store/hooks";

export default function HomePage() {
  useGetMeQuery();
  const router = useRouter();
  const status = useAppSelector(selectAuthStatus);

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
