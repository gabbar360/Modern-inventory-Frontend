"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@phosphor-icons/react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: Icon;
  trend?: string;
  trendPositive?: boolean;
  loading?: boolean;
  className?: string;
  testId?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: IconComponent,
  trend,
  trendPositive,
  loading = false,
  className = "",
  testId,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={`overflow-hidden border border-border/60 ${className}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-8 w-32 mt-3" />
          <Skeleton className="h-3 w-20 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`overflow-hidden border border-border/60 hover:border-border transition-all duration-200 ${className}`}
      data-testid={testId}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          {IconComponent && (
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <IconComponent size={18} weight="bold" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight text-foreground font-display">{value}</p>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trendPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
