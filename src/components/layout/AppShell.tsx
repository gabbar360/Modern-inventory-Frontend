"use client";

import { useEffect, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import GlobalSearch from "./GlobalSearch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSidebarCollapsed,
  selectSearchModalOpen,
  toggleSidebar,
  setSearchModalOpen,
} from "@/slices/uiSlice";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector(selectSidebarCollapsed);
  const searchOpen = useAppSelector(selectSearchModalOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch(setSearchModalOpen(!searchOpen));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, searchOpen]);

  return (
    <div className="flex min-h-screen bg-background pb-14 md:pb-0 font-sans text-foreground">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => dispatch(toggleSidebar())}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onSearch={() => dispatch(setSearchModalOpen(true))} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
      <BottomNav onSearch={() => dispatch(setSearchModalOpen(true))} />
      <GlobalSearch
        open={searchOpen}
        setOpen={(open: boolean) => dispatch(setSearchModalOpen(open))}
      />
    </div>
  );
}
