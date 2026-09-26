import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  TrendUp, TrendDown, CurrencyInr, ChartLineUp, Receipt, Package, Calendar, DownloadSimple
} from "@phosphor-icons/react";

export default function PnLAnalytics() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [summary, setSummary] = useState(null);
  const [invoicesData, setInvoicesData] = useState({ summary: {}, invoices: [] });
  const [productsData, setProductsData] = useState({ summary: {}, products: [] });
  const [monthlyData, setMonthlyData] = useState({ annual_summary: {}, monthly_data: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, invRes, prodRes, monthRes] = await Promise.all([
        api.get("/reports/pl"),
        api.get("/reports/pnl-invoices"),
        api.get("/reports/pnl-products"),
        api.get("/reports/detailed-monthly-pl")
      ]);
      setSummary(sumRes.data);
      setInvoicesData(invRes.data);
      setProductsData(prodRes.data);
      setMonthlyData(monthRes.data);
    } catch (err) {
      console.error("Failed to load P&L analytics data:", err);
      toast.error("Failed to load financial records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInvoices = (invoicesData.invoices || []).filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (i.number && i.number.toLowerCase().includes(q)) ||
           (i.customer_name && i.customer_name.toLowerCase().includes(q));
  });

  const filteredProducts = (productsData.products || []).filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.product_name && p.product_name.toLowerCase().includes(q)) ||
           (p.sku && p.sku.toLowerCase().includes(q)) ||
           (p.category && p.category.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5" data-testid="pnl-analytics-page">
      <PageHeader
        title="Profit & Loss Analytics"
        subtitle="Multi-dimensional financial statement across Invoices, Products, and Monthly Income Statements (Zoho & Tally compliant)."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={loadData}>
              Refresh Statement
            </Button>
          </div>
        }
      />

      {/* Top Executive Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Revenue (Sales)</span>
            <p className="text-xl font-display font-semibold tabular text-foreground">
              {money(summary?.revenue || invoicesData.summary?.total_revenue || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">Total Invoiced Subtotal</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">COGS (Direct Cost)</span>
            <p className="text-xl font-display font-semibold tabular text-slate-700 dark:text-slate-300">
              {money(summary?.cogs || invoicesData.summary?.total_cogs || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">Product Procurement Cost</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border border-emerald-500/20 bg-emerald-500/[0.02]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Gross Profit</span>
              <TrendUp size={16} className="text-emerald-600" />
            </div>
            <p className="text-xl font-display font-semibold tabular text-emerald-600 dark:text-emerald-400">
              {money(summary?.gross_profit || invoicesData.summary?.total_gross_profit || 0)}
            </p>
            <span className="text-[11px] font-medium text-emerald-600">
              Margin: {summary?.gross_margin || invoicesData.summary?.gross_margin_pct || 0}%
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Expenses</span>
            <p className="text-xl font-display font-semibold tabular text-rose-600 dark:text-rose-400">
              {money(summary?.total_expenses || monthlyData.annual_summary?.total_operating_expenses || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">OPEX + Fixed + Freight</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border border-blue-500/20 bg-blue-500/[0.02]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-blue-700 dark:text-blue-400">Net Operating Profit</span>
              <ChartLineUp size={16} className="text-blue-600" />
            </div>
            <p className="text-xl font-display font-semibold tabular text-blue-600 dark:text-blue-400">
              {money(summary?.net_profit || monthlyData.annual_summary?.net_profit || 0)}
            </p>
            <span className="text-[11px] font-medium text-blue-600">
              Net Margin: {summary?.net_margin || monthlyData.annual_summary?.net_margin_pct || 0}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs View */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-[500px]">
            <TabsTrigger value="invoices" className="text-xs font-medium">Invoice-Wise P&L</TabsTrigger>
            <TabsTrigger value="products" className="text-xs font-medium">Product-Wise P&L</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs font-medium">Monthly Statement (Tally)</TabsTrigger>
          </TabsList>
          {activeTab !== "monthly" && (
            <Input name="search" id="pnlanalytics-search"
              placeholder={activeTab === "invoices" ? "Filter by invoice or customer…" : "Filter by product or SKU…"}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 text-xs w-full sm:w-64"
            />
          )}
        </div>

        {/* TAB 1: INVOICE-WISE P&L */}
        <TabsContent value="invoices" className="space-y-3">
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Invoice #</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs text-right">Revenue (₹)</TableHead>
                  <TableHead className="text-xs text-right">COGS Cost (₹)</TableHead>
                  <TableHead className="text-xs text-right font-medium">Gross Profit (₹)</TableHead>
                  <TableHead className="text-xs text-center">Margin %</TableHead>
                  <TableHead className="text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                      No invoice records found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => {
                    const margin = inv.gross_margin_pct || 0;
                    return (
                      <TableRow key={inv.id} className="tbl-row hover:bg-muted/40">
                        <TableCell className="py-2 px-3 font-mono text-xs font-medium">{inv.number}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-muted-foreground">{fmtDate(inv.invoice_date)}</TableCell>
                        <TableCell className="py-2 px-3 font-medium text-xs">{inv.customer_name}</TableCell>
                        <TableCell className="py-2 px-3 text-right tabular text-xs">{money(inv.revenue)}</TableCell>
                        <TableCell className="py-2 px-3 text-right tabular text-xs text-muted-foreground">{money(inv.total_cost)}</TableCell>
                        <TableCell className="py-2 px-3 text-right tabular text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {money(inv.gross_profit)}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular ${
                            margin >= 25 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                            margin >= 10 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                            "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}>
                            {margin.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right text-xs capitalize text-muted-foreground">
                          {inv.status}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
            <span>Showing {filteredInvoices.length} invoices</span>
            <div className="flex gap-4">
              <span>Total Revenue: <strong className="text-foreground">{money(invoicesData.summary?.total_revenue || 0)}</strong></span>
              <span>Total Profit: <strong className="text-emerald-600">{money(invoicesData.summary?.total_gross_profit || 0)}</strong></span>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PRODUCT-WISE P&L */}
        <TabsContent value="products" className="space-y-3">
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">SKU / Category</TableHead>
                  <TableHead className="text-xs text-right">Units Sold</TableHead>
                  <TableHead className="text-xs text-right">Cost Price</TableHead>
                  <TableHead className="text-xs text-right">Sell Price</TableHead>
                  <TableHead className="text-xs text-right">Total Revenue</TableHead>
                  <TableHead className="text-xs text-right font-medium">Gross Profit</TableHead>
                  <TableHead className="text-xs text-center">Margin %</TableHead>
                  <TableHead className="text-xs text-center">Stock Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">
                      No product profitability records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => {
                    const margin = p.gross_margin_pct || 0;
                    return (
                      <TableRow key={p.product_id} className="tbl-row hover:bg-muted/40">
                        <TableCell className="py-2 px-3 font-medium text-xs">{p.product_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-muted-foreground">
                          <span className="font-mono">{p.sku}</span> · {p.category}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right tabular text-xs font-semibold">
                          {p.units_sold.toLocaleString("en-IN")} {p.unit}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right tabular text-xs text-muted-foreground">
                          ₹{p.purchase_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right tabular text-xs">
                          ₹{p.selling_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right tabular text-xs">{money(p.total_revenue)}</TableCell>
                        <TableCell className="py-2 px-3 text-right tabular text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {money(p.gross_profit)}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular ${
                            margin >= 25 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                            margin >= 10 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                            "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}>
                            {margin.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            p.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            p.status === 'DEAD_STOCK' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {p.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 3: MONTHLY INCOME STATEMENT (TALLY / ZOHO STYLE) */}
        <TabsContent value="monthly" className="space-y-4">
          <div className="border border-border rounded-lg bg-card overflow-x-auto">
            <Table className="min-w-[750px]">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold text-foreground w-64">Income Statement Line Items</TableHead>
                  {(monthlyData.monthly_data || []).map((m) => (
                    <TableHead key={m.month} className="text-xs text-right font-semibold text-foreground">
                      {m.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-xs text-right font-bold text-foreground bg-muted/60">YTD Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {/* 1. Operating Revenue */}
                <TableRow className="hover:bg-muted/30 font-medium">
                  <TableCell className="py-2 px-3">1. Gross Operating Revenue (Sales)</TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2 px-3">{money(m.sales_revenue)}</TableCell>
                  ))}
                  <TableCell className="text-right tabular font-bold py-2 px-3 bg-muted/30">
                    {money(monthlyData.annual_summary?.sales_revenue || 0)}
                  </TableCell>
                </TableRow>

                {/* 2. COGS */}
                <TableRow className="hover:bg-muted/30 text-muted-foreground">
                  <TableCell className="py-2 px-3 pl-6">Less: Cost of Goods Sold (COGS)</TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2 px-3">({money(m.cogs)})</TableCell>
                  ))}
                  <TableCell className="text-right tabular font-medium py-2 px-3 bg-muted/30">
                    ({money(monthlyData.annual_summary?.cogs || 0)})
                  </TableCell>
                </TableRow>

                {/* = Gross Profit */}
                <TableRow className="bg-emerald-500/5 font-bold border-y border-border">
                  <TableCell className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">
                    = GROSS PROFIT
                  </TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2.5 px-3 text-emerald-700 dark:text-emerald-400">
                      {money(m.gross_profit)} <span className="text-[10px] font-normal block text-muted-foreground">{m.gross_margin_pct}%</span>
                    </TableCell>
                  ))}
                  <TableCell className="text-right tabular font-bold py-2.5 px-3 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
                    {money(monthlyData.annual_summary?.gross_profit || 0)}
                    <span className="text-[10px] font-normal block text-muted-foreground">{monthlyData.annual_summary?.gross_margin_pct || 0}%</span>
                  </TableCell>
                </TableRow>

                {/* Expenses breakdown */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="py-2 px-3 pl-6">Operating Expenses (OPEX - Utilities, Supplies)</TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2 px-3">{money(m.opex)}</TableCell>
                  ))}
                  <TableCell className="text-right tabular py-2 px-3 bg-muted/30">
                    {money(monthlyData.annual_summary?.opex || 0)}
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-muted/30">
                  <TableCell className="py-2 px-3 pl-6">Fixed Expenses (Warehouse Rent & Payroll)</TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2 px-3">{money(m.fixed_expenses)}</TableCell>
                  ))}
                  <TableCell className="text-right tabular py-2 px-3 bg-muted/30">
                    {money(monthlyData.annual_summary?.fixed_expenses || 0)}
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-muted/30">
                  <TableCell className="py-2 px-3 pl-6">Transportation & Freight Charges</TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2 px-3">{money(m.transportation_cost)}</TableCell>
                  ))}
                  <TableCell className="text-right tabular py-2 px-3 bg-muted/30">
                    {money(monthlyData.annual_summary?.transportation_cost || 0)}
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-muted/30">
                  <TableCell className="py-2 px-3 pl-6">Sales & Marketing (Ads, Expos, Samples)</TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2 px-3">{money(m.sales_marketing)}</TableCell>
                  ))}
                  <TableCell className="text-right tabular py-2 px-3 bg-muted/30">
                    {money(monthlyData.annual_summary?.sales_marketing || 0)}
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-muted/30">
                  <TableCell className="py-2 px-3 pl-6">Administrative & Professional Fees</TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2 px-3">{money(m.admin_expenses)}</TableCell>
                  ))}
                  <TableCell className="text-right tabular py-2 px-3 bg-muted/30">
                    {money(monthlyData.annual_summary?.admin_expenses || 0)}
                  </TableCell>
                </TableRow>

                {/* Total Operating Expenses */}
                <TableRow className="hover:bg-muted/40 font-semibold border-t border-border">
                  <TableCell className="py-2.5 px-3">Total Operating Expenses (OPEX + Fixed + Logistics)</TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-2.5 px-3 text-rose-600">
                      ({money(m.total_operating_expenses)})
                    </TableCell>
                  ))}
                  <TableCell className="text-right tabular font-bold py-2.5 px-3 text-rose-600 bg-muted/30">
                    ({money(monthlyData.annual_summary?.total_operating_expenses || 0)})
                  </TableCell>
                </TableRow>

                {/* NET PROFIT */}
                <TableRow className="bg-blue-500/10 font-bold border-t-2 border-border text-sm">
                  <TableCell className="py-3 px-3 text-blue-700 dark:text-blue-300">
                    = NET OPERATING PROFIT
                  </TableCell>
                  {(monthlyData.monthly_data || []).map(m => (
                    <TableCell key={m.month} className="text-right tabular py-3 px-3 text-blue-700 dark:text-blue-300">
                      {money(m.net_profit)}
                      <span className="text-[10px] font-normal block text-muted-foreground">{m.net_margin_pct}%</span>
                    </TableCell>
                  ))}
                  <TableCell className="text-right tabular font-extrabold py-3 px-3 text-blue-700 dark:text-blue-300 bg-blue-500/20">
                    {money(monthlyData.annual_summary?.net_profit || 0)}
                    <span className="text-[10px] font-normal block text-muted-foreground">{monthlyData.annual_summary?.net_margin_pct || 0}%</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

