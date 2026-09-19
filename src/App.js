import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AppShell from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Products from "@/pages/Products";
import Quotations from "@/pages/Quotations";
import QuotationDetail from "@/pages/QuotationDetail";
import SalesOrders from "@/pages/SalesOrders";
import Invoices from "@/pages/Invoices";
import InvoiceDetail from "@/pages/InvoiceDetail";
import Payments from "@/pages/Payments";
import Brands from "@/pages/Brands";
import Settings from "@/pages/Settings";
import Vendors from "@/pages/Vendors";
import PurchaseOrders from "@/pages/PurchaseOrders";
import VendorBills from "@/pages/VendorBills";
import PaymentsMade from "@/pages/PaymentsMade";
import Inventory from "@/pages/Inventory";
import Dispatch from "@/pages/Dispatch";
import Challans from "@/pages/Challans";
import Reports from "@/pages/Reports";
import Warehouses from "@/pages/Warehouses";
import Tasks from "@/pages/Tasks";
import Users from "@/pages/Users";
import AuditLog from "@/pages/AuditLog";
import Automation from "@/pages/Automation";
import ImportPage from "@/pages/ImportPage";
import Onboarding from "@/pages/Onboarding";
import { CreditNotes, DebitNotes } from "@/pages/Notes";
import AICopilot from "@/pages/AICopilot";
import Reorder from "@/pages/Reorder";
import CustomerPortal from "@/pages/CustomerPortal";
import Broadcast from "@/pages/Broadcast";
import Approvals from "@/pages/Approvals";
import Templates from "@/pages/Templates";
import Accounting from "@/pages/Accounting";
import PnLAnalytics from "@/pages/PnLAnalytics";
import Expenses from "@/pages/Expenses";

function Gate({ children }) {
  const { status } = useAuth();
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (status === "out") return <Navigate to="/login" replace />;
  return children;
}

function Public({ children }) {
  const { status } = useAuth();
  if (status === "in") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            <Route path="/login" element={<Public><Login /></Public>} />
            <Route path="/register" element={<Public><Register /></Public>} />
            <Route path="/portal/:token" element={<CustomerPortal />} />
            <Route element={<Gate><AppShell /></Gate>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/:id" element={<QuotationDetail />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/dispatch" element={<Dispatch />} />
              <Route path="/challans" element={<Challans />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/vendor-bills" element={<VendorBills />} />
              <Route path="/payments-made" element={<PaymentsMade />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/users" element={<Users />} />
              <Route path="/audit" element={<AuditLog />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/pnl" element={<PnLAnalytics />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/ai" element={<AICopilot />} />
              <Route path="/reorder" element={<Reorder />} />
              <Route path="/broadcast" element={<Broadcast />} />
              <Route path="/credit-notes" element={<CreditNotes />} />
              <Route path="/debit-notes" element={<DebitNotes />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
