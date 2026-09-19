import DocList, { DocForm } from "./DocList";
import VoiceQuoteButton from "@/components/VoiceQuote";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusPill, EmptyState } from "@/components/Bits";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { money, fmtDate } from "@/lib/api";

export default function Quotations() {
  const [rows, setRows] = useState([]);
  const [prefill, setPrefill] = useState(null);
  const nav = useNavigate();
  const load = async () => { const { data } = await api.get("/quotations"); setRows(data); };
  useEffect(()=>{load();}, []);
  return (
    <div className="space-y-4" data-testid="quotation-page">
      <PageHeader title="Quotations" subtitle="Send priced offers and convert accepted quotes into sales orders." actions={
        <div className="flex gap-2">
          <VoiceQuoteButton onParsed={(d)=>setPrefill(d)} />
          <DocForm kind="quotation" endpoint="/quotations" onCreated={load}
            defaultCustomerId={prefill?.customer_id || ""}
            openControl={prefill ? { open: true, onOpenChange: (v)=>!v && setPrefill(null) } : undefined}
            trigger={<Button size="sm" className="h-8" data-testid="new-quotation-btn"><Plus size={14} className="mr-1"/>New quotation</Button>} />
        </div>
      } />
      {rows.length === 0 ? <EmptyState title="No quotations yet" /> :
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">#</TableHead><TableHead className="text-xs">Customer</TableHead>
            <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs text-right">Total</TableHead>
            <TableHead className="text-xs text-right">Profit (₹)</TableHead>
            <TableHead className="text-xs text-center">Margin %</TableHead>
            <TableHead className="text-xs">Status</TableHead>
          </TableRow></TableHeader><TableBody>
            {rows.map((r) => {
              const profit = r.gross_profit || 0;
              const margin = r.gross_margin_pct || 0;
              return (
                <TableRow key={r.id} className="tbl-row hover:bg-muted/40 cursor-pointer" onClick={()=>nav(`/quotations/${r.id}`)} data-testid={`quotation-row-${r.id}`}>
                  <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
                  <TableCell className="py-1.5 px-3 font-medium">{r.customer_name}</TableCell>
                  <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.quote_date)}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular font-medium">{money(r.grand_total)}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {profit ? money(profit) : "—"}
                  </TableCell>
                  <TableCell className="py-1.5 px-3 text-center">
                    {margin ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tabular ${
                        margin >= 20 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                        margin >= 10 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                        "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                      }`}>
                        {margin.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-1.5 px-3"><StatusPill status={r.status} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody></Table>
        </div>}
    </div>
  );
}
