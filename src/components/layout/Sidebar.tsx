"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import { NAVIGATION_CONFIG } from "./navigation.config";
import { APP_CONFIG } from "@/lib/constants";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } shrink-0 border-r border-border bg-card transition-all duration-200 hidden md:flex flex-col select-none`}
    >
      <div className="h-14 flex items-center px-3 border-b border-border">
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent text-foreground transition-colors"
          data-testid="sidebar-toggle-btn"
          aria-label="Toggle Sidebar"
        >
          <List size={16} />
        </button>
        {!collapsed && (
          <span className="ml-2 font-display font-semibold tracking-tight text-sm text-foreground">
            {APP_CONFIG.SHORT_NAME}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {NAVIGATION_CONFIG.map((group) => (
          <div key={group.group} className="mb-2">
            {!collapsed && (
              <div className="nav-group-title text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1.5">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.to || pathname?.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.key}
                  href={item.to}
                  className={`nav-link mx-2 flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.key}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} weight={isActive ? "bold" : "regular"} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
