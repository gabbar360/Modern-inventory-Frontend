"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, StatusPill } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, FilePdf, WhatsappLogo, EnvelopeSimple } from "@phosphor-icons/react";
const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function QuotationDetail() {
  const { id } = useParams();
  const [q, setQ] = useState(null);
  const load = async () => { const { data } = await api.get(`/quotations/${id}`); setQ(data); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);
  if (!q) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const setStatus = async (s) => { await api.post(`/quotations/${id}/status`, { status: s }); toast.success("Updated"); load(); };
  const convert = async () => { const { data } = await api.post(`/quotations/${id}/convert`); toast.success(`Sales Order ${data.number} created`); load(); };
  const sendWA = async () => {
    try {
      const { data: cust } = await api.get(`/customers/${q.customer_id}`);
      const to = cust.customer?.mobile;
      if (!to) return toast.error("Customer has no mobile number");
      const msg = `Hi, sharing our quotation ${q.number} for ₹${(q.grand_total||0).toLocaleString("en-IN")}. PDF: ${BACKEND}/api/quotations/${id}/pdf`;
      await api.post("/whatsapp/send", { to, message: msg });
      toast.success("WhatsApp sent");
    } catch (e) {
      const detail = e?.response?.data?.detail || "Failed";
      if (String(detail).includes("not configured")) {
        window.open(`https://wa.me/?text=${encodeURIComponent(`Hi, sharing our quotation ${q.number} for ₹${(q.grand_total||0).toLocaleString("en-IN")}. PDF: ${BACKEND}/api/quotations/${id}/pdf`)}`, "_blank");
      } else { toast.error(String(detail)); }
    }
  };

  return (
    <div className="space-y-4" data-testid="quotation-detail">
      <PageHeader title={`Quotation ${q.number}`} subtitle={`${q.customer_name} · ${fmtDate(q.quote_date)}`} actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8" asChild data-testid="download-quote-pdf">
            <a href={`${BACKEND}/api/quotations/${id}/pdf`} target="_blank" rel="noreferrer"><FilePdf size={14} className="mr-1"/>PDF</a>
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={sendWA} data-testid="whatsapp-quote-btn"><WhatsappLogo size={14} className="mr-1"/>WhatsApp</Button>
          <Button variant="outline" size="sm" className="h-8" onClick={async () => {
            try { const { data } = await api.post(`/quotations/${id}/send-email`); toast.success(`Email sent to ${data.to}`); }
            catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
          }} data-testid="email-quote-btn"><EnvelopeSimple size={14} className="mr-1"/>Email</Button>
          {q.status !== "accepted" && <Button size="sm" className="h-8" onClick={()=>setStatus("accepted")} data-testid="accept-quote-btn">Mark accepted</Button>}
          {!q.sales_order_id && <Button size="sm" className="h-8" onClick={convert} data-testid="convert-to-so-btn">Convert to SO<ArrowRight size={12} className="ml-1"/></Button>}
        </div>
      } />
      <div className="flex items-center gap-2 text-xs">
        <StatusPill status={q.status} />
        <span className="text-muted-foreground">{q.same_state ? "CGST + SGST" : "IGST"}</span>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-xs">Item</TableHead><TableHead className="text-xs">HSN</TableHead>
            <TableHead className="text-xs text-right">Qty</TableHead><TableHead className="text-xs text-right">Rate</TableHead>
            <TableHead className="text-xs text-right">Disc</TableHead><TableHead className="text-xs text-right">Taxable</TableHead>
            <TableHead className="text-xs text-right">GST</TableHead><TableHead className="text-xs text-right">Total</TableHead>
          </TableRow></TableHeader>
          <TableBody>{q.items.map((it, i)=>(
            <TableRow key={i} className="tbl-row"><TableCell className="py-1.5 px-3">{it.name}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs font-mono">{it.hsn}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{it.quantity} {it.unit}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{money(it.rate)}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular text-xs">{it.discount_pct}%</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{money(it.taxable_amount)}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular text-xs">{it.gst_rate}% · {money(it.tax_amount)}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular font-medium">{money(it.amount)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* Internal Profitability Breakdown */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Internal Profitability & Margin (P&L)
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular ${
                (q.gross_margin_pct || 0) >= 20 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                (q.gross_margin_pct || 0) >= 10 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
              }`}>
                {(q.gross_margin_pct || 0).toFixed(1)}% Margin
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block">Revenue (Subtotal)</span>
                <span className="font-medium tabular">{money(q.subtotal)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">COGS (Product Cost)</span>
                <span className="font-medium tabular text-slate-600 dark:text-slate-400">{money(q.total_cost || 0)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Estimated Profit</span>
                <span className="font-bold tabular text-emerald-600 dark:text-emerald-400">
                  {money(q.gross_profit || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular">{money(q.subtotal)}</span></div>
            {q.same_state ? (<>
              <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span className="tabular">{money(q.cgst)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span className="tabular">{money(q.sgst)}</span></div>
            </>) : (
              <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span className="tabular">{money(q.igst)}</span></div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 font-display font-semibold text-base"><span>Grand Total</span><span className="tabular">{money(q.grand_total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
