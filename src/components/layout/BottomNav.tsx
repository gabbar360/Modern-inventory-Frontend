"use client";

import { useRouter } from "next/navigation";
import { House, Users as UsersIcon, Gear, MagnifyingGlass, Plus } from "@phosphor-icons/react";

interface BottomNavProps {
  onSearch: () => void;
}

export default function BottomNav({ onSearch }: BottomNavProps) {
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-card/90 backdrop-blur border-t border-border flex items-center justify-around z-40 pb-safe"
      aria-label="Mobile Navigation"
    >
      <button
        onClick={() => router.push("/dashboard")}
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <House size={20} />
        <span className="text-[9px] font-medium">Home</span>
      </button>

      <button
        onClick={onSearch}
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <MagnifyingGlass size={20} />
        <span className="text-[9px] font-medium">Search</span>
      </button>

      <button
        onClick={() => router.push("/quotations")}
        className="flex flex-col items-center gap-1 text-primary"
      >
        <div className="bg-primary/10 p-1.5 rounded-full">
          <Plus size={18} weight="bold" />
        </div>
      </button>

      <button
        onClick={() => router.push("/leads")}
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <UsersIcon size={20} />
        <span className="text-[9px] font-medium">Leads</span>
      </button>

      <button
        onClick={() => router.push("/settings")}
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Gear size={20} />
        <span className="text-[9px] font-medium">Menu</span>
      </button>
    </nav>
  );
}
