"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Sun, Moon, SignOut, Plus } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationBell from "./NotificationBell";

interface TopbarProps {
  onSearch: () => void;
}

export default function Topbar({ onSearch }: TopbarProps) {
  const { user, org, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const initials = useMemo(() => {
    return (user?.name || "U")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  return (
    <header className="h-14 border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30 flex items-center gap-3 px-4">
      <button
        onClick={onSearch}
        className="flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background text-sm text-muted-foreground w-64 md:w-72 hover:bg-accent transition-colors"
        data-testid="open-search-btn"
        aria-label="Search records"
      >
        <MagnifyingGlass size={14} />
        <span>Search…</span>
        <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 border border-border rounded">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 font-medium"
              data-testid="quick-add-btn"
            >
              <Plus size={14} weight="bold" />
              <span>New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-lg">
            <DropdownMenuItem
              onClick={() => router.push("/leads")}
              data-testid="quick-new-lead"
            >
              New Lead
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/customers")}>
              New Customer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/quotations")}>
              New Quotation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/sales-orders")}>
              New Sales Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/invoices")}>
              New Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/payments")}>
              Receive Payment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/products")}>
              New Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationBell />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          data-testid="theme-toggle-btn"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 h-8 px-1 rounded-md hover:bg-accent transition-colors"
              data-testid="user-menu-btn"
              aria-label="User Account"
            >
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-lg">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
                {org?.name && (
                  <span className="text-[10px] font-medium text-primary uppercase tracking-wider mt-1">
                    {org.name}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              data-testid="logout-btn"
              className="text-rose-600 focus:text-rose-600"
            >
              <SignOut size={14} className="mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
