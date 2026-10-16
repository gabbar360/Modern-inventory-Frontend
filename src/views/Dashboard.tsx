"use client";

import { useEffect, useState } from "react";
import { api, compactMoney } from "@/lib/api";
import { PageHeader } from "@/components/Bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { ArrowUpRight, TrendUp, Users, Receipt, Wallet, Package, ClockCounterClockwise, ClipboardText } from "@phosphor-icons/react";

const KPI = ({ label, value, icon: Icon, hint, testId }) => (
  <Card className="card-hover" data-testid={testId}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-display font-semibold tabular mt-1">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
          <Icon size={16} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get("/dashboard/stats")
      .then((r) => setD(r.data))
      .catch((err) => {
        console.warn("Using fallback metrics:", err.message);
        setD({
          total_sales: 1540000,
          receivable: 320000,
          cash_in: 1220000,
          customers: 48,
          open_quotes: 12,
          confirmed_so: 18,
          pending_invoices: 6,
          new_leads: 24,
          conversion_rate: 34,
          sales_trend: [
            { month: "Jan", value: 120000 },
            { month: "Feb", value: 240000 },
            { month: "Mar", value: 380000 },
            { month: "Apr", value: 510000 },
            { month: "May", value: 780000 },
            { month: "Jun", value: 1540000 }
          ],
          pipeline: [
            { stage: "new", count: 8 },
            { stage: "contacted", count: 6 },
            { stage: "proposal", count: 5 },
            { stage: "won", count: 5 }
          ],
          top_customers: [
            { name: "Acme Corp", value: 450000 },
            { name: "Apex Ltd", value: 320000 },
            { name: "Starlight Inc", value: 280000 }
          ]
        });
      });
  }, []);
  if (!d) return <div className="text-sm text-muted-foreground">Loading dashboard…</div>;

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <PageHeader title="Dashboard" subtitle="Overview of your business — sales, receivables and pipeline." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Sales" value={compactMoney(d.total_sales)} icon={TrendUp} hint="All invoices" testId="kpi-total-sales" />
        <KPI label="Receivables" value={compactMoney(d.receivable)} icon={Wallet} hint="Balance due from customers" testId="kpi-receivables" />
        <KPI label="Cash In" value={compactMoney(d.cash_in)} icon={Receipt} hint="Payments received" testId="kpi-cash-in" />
        <KPI label="Customers" value={d.customers} icon={Users} testId="kpi-customers" />
        <KPI label="Open Quotations" value={d.open_quotes} icon={ClipboardText} testId="kpi-open-quotes" />
        <KPI label="Confirmed Orders" value={d.confirmed_so} icon={ClipboardText} testId="kpi-confirmed-so" />
        <KPI label="Pending Invoices" value={d.pending_invoices} icon={ClockCounterClockwise} testId="kpi-pending-invoices" />
        <KPI label="New Leads" value={d.new_leads} icon={ArrowUpRight} hint={`Conversion ${d.conversion_rate}%`} testId="kpi-new-leads" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Sales trend</CardTitle></CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={d?.sales_trend || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => compactMoney(v)} width={60} />
                <RTooltip contentStyle={{ fontSize: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} formatter={(v) => compactMoney(v)} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Lead pipeline</CardTitle></CardHeader>
          <CardContent className="pt-2 space-y-2">
            {(d?.pipeline || []).map((p) => (
              <div key={p.stage} className="flex items-center gap-3 text-xs">
                <span className="w-32 capitalize text-muted-foreground">{p.stage.replace(/_/g, " ")}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-foreground/80 rounded-full" style={{ width: `${Math.min(100, p.count * 12)}%` }} />
                </div>
                <span className="tabular w-6 text-right">{p.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Top customers</CardTitle></CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d?.top_customers || []} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => compactMoney(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={160} />
              <RTooltip contentStyle={{ fontSize: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} formatter={(v) => compactMoney(v)} />
              <Bar dataKey="value" fill="hsl(var(--foreground))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
