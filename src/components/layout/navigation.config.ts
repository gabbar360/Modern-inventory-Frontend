import {
  House,
  Users as UsersIcon,
  UsersThree,
  Package,
  FileText,
  ClipboardText,
  Receipt,
  CreditCard,
  Storefront,
  Gear,
  Truck,
  ShoppingCart,
  Factory,
  Warehouse,
  ChartBar,
  FileArrowDown,
  Buildings,
  ShieldCheck,
  Lightning,
  UploadSimple,
  ArrowUUpLeft,
  ArrowsClockwise,
  TrendUp,
  Wallet,
  Icon,
} from "@phosphor-icons/react";

export interface NavItem {
  to: string;
  icon: Icon;
  label: string;
  key: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    group: "Workspace",
    items: [
      { to: "/dashboard", icon: House, label: "Dashboard", key: "dashboard" },
    ],
  },
  {
    group: "CRM",
    items: [
      { to: "/leads", icon: UsersThree, label: "Leads", key: "leads" },
      { to: "/customers", icon: UsersIcon, label: "Customers", key: "customers" },
    ],
  },
  {
    group: "Sales",
    items: [
      { to: "/quotations", icon: FileText, label: "Quotations", key: "quotations" },
      { to: "/sales-orders", icon: ClipboardText, label: "Sales Orders", key: "sales-orders" },
      { to: "/dispatch", icon: Truck, label: "Dispatch", key: "dispatch" },
      { to: "/challans", icon: FileArrowDown, label: "Challans", key: "challans" },
      { to: "/invoices", icon: Receipt, label: "Invoices", key: "invoices" },
      { to: "/payments", icon: CreditCard, label: "Payments", key: "payments" },
      { to: "/credit-notes", icon: ArrowUUpLeft, label: "Credit Notes", key: "credit-notes" },
    ],
  },
  {
    group: "Purchase",
    items: [
      { to: "/vendors", icon: Factory, label: "Vendors", key: "vendors" },
      { to: "/purchase-orders", icon: ShoppingCart, label: "Purchase Orders", key: "purchase-orders" },
      { to: "/vendor-bills", icon: Receipt, label: "Vendor Bills", key: "vendor-bills" },
      { to: "/payments-made", icon: CreditCard, label: "Payments Made", key: "payments-made" },
      { to: "/debit-notes", icon: ArrowUUpLeft, label: "Debit Notes", key: "debit-notes" },
    ],
  },
  {
    group: "Inventory",
    items: [
      { to: "/products", icon: Package, label: "Products", key: "products" },
      { to: "/inventory", icon: Warehouse, label: "Inventory", key: "inventory" },
      { to: "/reorder", icon: ArrowsClockwise, label: "Reorder", key: "reorder" },
      { to: "/warehouses", icon: Buildings, label: "Warehouses", key: "warehouses" },
      { to: "/brands", icon: Storefront, label: "Brands", key: "brands" },
    ],
  },
  {
    group: "Insights",
    items: [
      { to: "/reports", icon: ChartBar, label: "Reports", key: "reports" },
      { to: "/pnl", icon: TrendUp, label: "P&L Analytics", key: "pnl" },
      { to: "/expenses", icon: Wallet, label: "Expenses", key: "expenses" },
      { to: "/accounting", icon: Receipt, label: "Accounting", key: "accounting" },
    ],
  },
  {
    group: "Admin",
    items: [
      { to: "/users", icon: UsersIcon, label: "Users", key: "users" },
      { to: "/templates", icon: FileText, label: "Doc Templates", key: "templates" },
      { to: "/automation", icon: Lightning, label: "Automation", key: "automation" },
      { to: "/import", icon: UploadSimple, label: "Import", key: "import" },
      { to: "/audit", icon: ShieldCheck, label: "Audit Log", key: "audit" },
      { to: "/settings", icon: Gear, label: "Settings", key: "settings" },
    ],
  },
];
