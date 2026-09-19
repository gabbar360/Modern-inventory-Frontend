import { useEffect, useState } from "react";
import { api, compactMoney, money } from "@/lib/api";
import { PageHeader } from "@/components/Bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Stat = ({ label, value, hint }) => (
  <Card><CardContent className="p-4">
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-2xl font-display font-semibold tabular mt-1">{value}</p>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </CardContent></Card>
);

export default function Reports() {
  const [gst, setGst] = useState(null);
  const [aging, setAging] = useState(null);
  const [pl, setPl] = useState(null);
  useEffect(() => {
    Promise.all([api.get("/reports/gst-summary"), api.get("/reports/receivables-aging"), api.get("/reports/pl")])
      .then(([g, a, p]) => { setGst(g.data); setAging(a.data); setPl(p.data); })
      .catch((err) => console.warn("Failed to load reports:", err.message));
  }, []);
  if (!gst || !aging || !pl) return <div className="text-sm text-muted-foreground">Loading reports…</div>;
  return (
    <div className="space-y-4" data-testid="reports-page">
      <PageHeader title="Reports" subtitle="Close-the-month numbers: GST, receivables and profit & loss." />
      <Tabs defaultValue="gst">
        <TabsList>
          <TabsTrigger value="gst" data-testid="report-tab-gst">GST Summary</TabsTrigger>
          <TabsTrigger value="aging" data-testid="report-tab-aging">Receivables Aging</TabsTrigger>
          <TabsTrigger value="pl" data-testid="report-tab-pl">P&amp;L</TabsTrigger>
        </TabsList>
        <TabsContent value="gst" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Taxable" value={compactMoney(gst.total_taxable)} />
            <Stat label="CGST" value={compactMoney(gst.cgst)} />
            <Stat label="SGST" value={compactMoney(gst.sgst)} />
            <Stat label="IGST" value={compactMoney(gst.igst)} />
            <Stat label="Total tax" value={compactMoney(gst.total_tax)} />
          </div>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">By rate</CardTitle></CardHeader>
          <CardContent className="p-0"><Table><TableHeader><TableRow>
            <TableHead className="text-xs">GST Rate</TableHead><TableHead className="text-xs text-right">Taxable</TableHead>
            <TableHead className="text-xs text-right">Tax</TableHead></TableRow></TableHeader>
            <TableBody>
              {(gst?.by_rate || []).length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-4">No GST invoice data yet</TableCell></TableRow>
              ) : (
                gst.by_rate.map((r)=>(<TableRow key={r.rate} className="tbl-row">
                  <TableCell className="py-1.5 px-3">{r.rate}%</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular">{money(r.taxable)}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular">{money(r.tax)}</TableCell>
                </TableRow>))
              )}
            </TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="aging" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Current" value={compactMoney(aging?.buckets?.current || 0)} />
            <Stat label="1–30 days" value={compactMoney(aging?.buckets?.["1-30"] || 0)} />
            <Stat label="31–60 days" value={compactMoney(aging?.buckets?.["31-60"] || 0)} />
            <Stat label="61–90 days" value={compactMoney(aging?.buckets?.["61-90"] || 0)} />
            <Stat label="90+ days" value={compactMoney(aging?.buckets?.["90+"] || 0)} hint="High risk" />
          </div>
          <Card><CardContent className="p-0"><Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs text-right">Current</TableHead><TableHead className="text-xs text-right">1–30</TableHead>
              <TableHead className="text-xs text-right">31–60</TableHead><TableHead className="text-xs text-right">61–90</TableHead>
              <TableHead className="text-xs text-right">90+</TableHead><TableHead className="text-xs text-right">Total</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(aging?.customers || []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-4">No overdue customer receivables</TableCell></TableRow>
              ) : (
                aging.customers.map((c)=>(<TableRow key={c.customer} className="tbl-row">
                  <TableCell className="py-1.5 px-3 font-medium">{c.customer}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-xs">{money(c.current)}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-xs">{money(c["1-30"])}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-xs">{money(c["31-60"])}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-xs">{money(c["61-90"])}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-xs text-rose-600">{money(c["90+"])}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular font-medium">{money(c.total)}</TableCell>
                </TableRow>))
              )}
            </TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="pl" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Revenue" value={compactMoney(pl.revenue)} hint="Taxable sales" />
            <Stat label="COGS" value={compactMoney(pl.cogs)} hint="Cost of goods sold" />
            <Stat label="Gross Profit" value={compactMoney(pl.gross_profit)} hint={`${pl.gross_margin}% margin`} />
            <Stat label="Purchases" value={compactMoney(pl.purchase_total)} />
          </div>
          <Card><CardContent className="p-5 text-sm space-y-2">
            <div className="flex justify-between border-b border-border pb-1"><span>Revenue</span><span className="tabular">{money(pl.revenue)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Less: COGS</span><span className="tabular">({money(pl.cogs)})</span></div>
            <div className="flex justify-between font-medium border-t border-border pt-1"><span>Gross Profit</span><span className="tabular">{money(pl.gross_profit)}</span></div>
            <div className="flex justify-between text-muted-foreground text-xs pt-2"><span>Gross Margin</span><span>{pl.gross_margin}%</span></div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
