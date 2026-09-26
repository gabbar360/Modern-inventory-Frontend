"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "in") {
      router.replace("/dashboard");
    } else if (status === "out") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      Loading Vegnar ERP & CRM…
    </div>
  );
}
