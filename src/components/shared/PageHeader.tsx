"use client";

import { ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItemData[];
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  children,
  actions,
  className = "",
}: PageHeaderProps) {
  const content = actions || children;

  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 ${className}`}>
      <div>
        {breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-foreground font-medium">{crumb.label}</span>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {content && <div className="flex flex-wrap items-center gap-2 shrink-0">{content}</div>}
    </div>
  );
}
