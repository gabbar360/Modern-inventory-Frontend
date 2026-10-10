"use client";

import { Package, Icon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: Icon;
  title?: string;
  description?: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTestId?: string;
  className?: string;
}

export default function EmptyState({
  icon: IconComponent = Package,
  title = "No data found",
  description,
  hint,
  actionLabel,
  onAction,
  actionTestId,
  className = "",
}: EmptyStateProps) {
  const subtitle = description || hint || "Get started by creating your first entry.";

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-lg border border-dashed border-border bg-card/30 ${className}`}
    >
      <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
        <IconComponent size={24} />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{subtitle}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4" data-testid={actionTestId}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
