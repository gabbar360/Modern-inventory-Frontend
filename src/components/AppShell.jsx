import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  House, Users as UsersIcon, UsersThree, Package, FileText, ClipboardText,
  Receipt, CreditCard, Storefront, Gear, MagnifyingGlass, Sun, Moon,
  SignOut, Plus, List, Truck, ShoppingCart, Factory, Warehouse, ChartBar, Bell, FileArrowDown,
  CheckSquare, Buildings, ShieldCheck, Lightning, UploadSimple, ArrowUUpLeft, Sparkle, ArrowsClockwise, Megaphone,
  TrendUp, Wallet
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV = [
  { group: "Workspace", items: [
    { to: "/dashboard", icon: House, label: "Dashboard", key: "dashboard" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks", key: "tasks" },
    { to: "/approvals", icon: CheckSquare, label: "Approvals", key: "approvals" },
    { to: "/ai", icon: Sparkle, label: "AI Copilot", key: "ai" },
  ]},
  { group: "CRM", items: [
    { to: "/leads", icon: UsersThree, label: "Leads", key: "leads" },
    { to: "/customers", icon: UsersIcon, label: "Customers", key: "customers" },
    { to: "/broadcast", icon: Megaphone, label: "Broadcast", key: "broadcast" },
  ]},
  { group: "Sales", items: [
    { to: "/quotations", icon: FileText, label: "Quotations", key: "quotations" },
    { to: "/sales-orders", icon: ClipboardText, label: "Sales Orders", key: "sales-orders" },
    { to: "/dispatch", icon: Truck, label: "Dispatch", key: "dispatch" },
    { to: "/challans", icon: FileArrowDown, label: "Challans", key: "challans" },
    { to: "/invoices", icon: Receipt, label: "Invoices", key: "invoices" },
    { to: "/payments", icon: CreditCard, label: "Payments", key: "payments" },
    { to: "/credit-notes", icon: ArrowUUpLeft, label: "Credit Notes", key: "credit-notes" },
  ]},
  { group: "Purchase", items: [
    { to: "/vendors", icon: Factory, label: "Vendors", key: "vendors" },
    { to: "/purchase-orders", icon: ShoppingCart, label: "Purchase Orders", key: "purchase-orders" },
    { to: "/vendor-bills", icon: Receipt, label: "Vendor Bills", key: "vendor-bills" },
    { to: "/payments-made", icon: CreditCard, label: "Payments Made", key: "payments-made" },
    { to: "/debit-notes", icon: ArrowUUpLeft, label: "Debit Notes", key: "debit-notes" },
  ]},
  { group: "Inventory", items: [
    { to: "/products", icon: Package, label: "Products", key: "products" },
    { to: "/inventory", icon: Warehouse, label: "Inventory", key: "inventory" },
    { to: "/reorder", icon: ArrowsClockwise, label: "Reorder", key: "reorder" },
    { to: "/warehouses", icon: Buildings, label: "Warehouses", key: "warehouses" },
    { to: "/brands", icon: Storefront, label: "Brands", key: "brands" },
  ]},
  { group: "Insights", items: [
    { to: "/reports", icon: ChartBar, label: "Reports", key: "reports" },
    { to: "/pnl", icon: TrendUp, label: "P&L Analytics", key: "pnl" },
    { to: "/expenses", icon: Wallet, label: "Expenses", key: "expenses" },
    { to: "/accounting", icon: Receipt, label: "Accounting", key: "accounting" },
  ]},
  { group: "Admin", items: [
    { to: "/users", icon: UsersIcon, label: "Users", key: "users" },
    { to: "/templates", icon: FileText, label: "Doc Templates", key: "templates" },
    { to: "/automation", icon: Lightning, label: "Automation", key: "automation" },
    { to: "/import", icon: UploadSimple, label: "Import", key: "import" },
    { to: "/audit", icon: ShieldCheck, label: "Audit Log", key: "audit" },
    { to: "/settings", icon: Gear, label: "Settings", key: "settings" },
  ]},
];

function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  return (
    <aside className={`${collapsed ? "w-16" : "w-60"} shrink-0 border-r border-border bg-card transition-all duration-200 hidden md:flex flex-col`}>
      <div className="h-14 flex items-center px-3 border-b border-border">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent"
          data-testid="sidebar-toggle-btn"
        >
          <List size={16} />
        </button>
        {!collapsed && <span className="ml-2 font-display font-semibold tracking-tight text-sm">Vegnar ERP</span>}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((g) => (
          <div key={g.group}>
            {!collapsed && <div className="nav-group-title">{g.group}</div>}
            {g.items.map((it) => (
              <Link
                key={it.key}
                href={it.to}
                className={`nav-link mx-2 ${pathname === it.to ? "active" : ""}`}
                data-testid={`nav-${it.key}`}
              >
                <it.icon size={16} weight="regular" />
                {!collapsed && <span>{it.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function GlobalSearch({ open, setOpen }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!q || q.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try { const { data } = await api.get(`/search`, { params: { q } }); setResults(data.results || []); }
      catch { setResults([]); }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const go = (r) => {
    setOpen(false);
    const map = {
      "Lead": `/leads`, "Customer": `/customers/${r.id}`, "Product": `/products`,
      "Quotation": `/quotations/${r.id}`, "Sales Order": `/sales-orders`, "Invoice": `/invoices/${r.id}`,
    };
    router.push(map[r.type] || "/dashboard");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search leads, customers, invoices, products… " value={q} onValueChange={setQ} data-testid="global-search-input" />
      <CommandList>
        <CommandEmpty>{q.length < 2 ? "Type at least 2 characters" : "No matches"}</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((r, i) => (
              <CommandItem key={`${r.type}-${r.id}-${i}`} onSelect={() => go(r)} data-testid={`search-result-${i}`}>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground w-20">{r.type}</span>
                <span className="flex-1">{r.title}</span>
                <span className="text-xs text-muted-foreground">{r.subtitle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

function NotificationBell() {
  const [items, setItems] = useState([]);
  const load = async () => { try { const { data } = await api.get("/notifications"); setItems(data); } catch {} };
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  const unread = items.filter((n) => !n.read).length;
  const markAll = async () => { await Promise.all(items.filter(n=>!n.read).map(n => api.post(`/notifications/${n.id}/read`))); load(); };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center" data-testid="notif-btn">
          <Bell size={16} />
          {unread > 0 && <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-medium flex items-center justify-center">{unread}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && <button className="text-[11px] text-muted-foreground hover:text-foreground" onClick={markAll}>Mark all read</button>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications</div>
        ) : items.slice(0, 10).map((n) => (
          <div key={n.id} className={`px-3 py-2 text-xs border-b border-border/40 ${!n.read ? "bg-muted/30" : ""}`} data-testid={`notif-item-${n.id}`}>
            <p className="font-medium">{n.title}</p>
            <p className="text-muted-foreground text-[11px] mt-0.5">{n.message}</p>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Topbar({ onSearch }) {
  const { user, org, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const initials = useMemo(() => (user?.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase(), [user]);
  return (
    <header className="h-14 border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30 flex items-center gap-3 px-4">
      <button
        onClick={onSearch}
        className="flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background text-sm text-muted-foreground w-72 hover:bg-accent transition-colors"
        data-testid="open-search-btn"
      >
        <MagnifyingGlass size={14} />
        <span>Search…</span>
        <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 border border-border rounded">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8" data-testid="quick-add-btn"><Plus size={14} className="mr-1" />New</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/leads")} data-testid="quick-new-lead">New Lead</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/customers")}>New Customer</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/quotations")}>New Quotation</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/sales-orders")}>New Sales Order</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/invoices")}>New Invoice</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/payments")}>Receive Payment</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/products")}>New Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <NotificationBell />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} data-testid="theme-toggle-btn">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-8 px-1 rounded-md hover:bg-accent" data-testid="user-menu-btn">
              <Avatar className="h-7 w-7"><AvatarFallback className="text-[11px]">{initials}</AvatarFallback></Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{org?.name}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} data-testid="logout-btn"><SignOut size={14} className="mr-2" />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function BottomNav({ onSearch }) {
  const router = useRouter();
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-card border-t border-border flex items-center justify-around z-40 pb-safe">
      <button onClick={() => router.push("/dashboard")} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
        <House size={20} />
        <span className="text-[9px] font-medium">Home</span>
      </button>
      <button onClick={onSearch} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
        <MagnifyingGlass size={20} />
        <span className="text-[9px] font-medium">Search</span>
      </button>
      <button onClick={() => router.push("/quotations")} className="flex flex-col items-center gap-1 text-emerald-600">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full"><Plus size={18} /></div>
      </button>
      <button onClick={() => router.push("/leads")} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
        <UsersIcon size={20} />
        <span className="text-[9px] font-medium">Leads</span>
      </button>
      <button onClick={() => router.push("/settings")} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
        <Gear size={20} />
        <span className="text-[9px] font-medium">Menu</span>
      </button>
    </div>
  );
}

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="flex min-h-screen bg-background pb-14 md:pb-0">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onSearch={() => setSearchOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <BottomNav onSearch={() => setSearchOpen(true)} />
      <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
    </div>
  );
}
