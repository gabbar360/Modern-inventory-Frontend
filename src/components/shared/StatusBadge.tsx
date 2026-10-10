"use client";

import { STATUS_COLORS } from "@/lib/constants";
import { fmtStatus } from "@/lib/formatters";

export interface StatusBadgeProps {
  status?: string;
  label?: string;
  className?: string;
}

export default function StatusBadge({ status = "", label, className = "" }: StatusBadgeProps) {
  const normalizedKey = String(status).toLowerCase().replace(/[\s-]+/g, "_");
  const colorClass = STATUS_COLORS[normalizedKey] || "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${colorClass} ${className}`}
      data-testid={`status-badge-${normalizedKey}`}
    >
      {label || fmtStatus(status)}
    </span>
  );
}
