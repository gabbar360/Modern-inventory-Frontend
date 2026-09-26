import { Table, TableCell } from "@/components/ui/table";
import { money } from "@/lib/api";
import DocList from "./DocList";
export default function Invoices() {
  return <DocList title="Invoices" subtitle="GST invoices with CGST/SGST/IGST automatically calculated."
    endpoint="/invoices" kind="invoice" detailPath={(r)=>`/invoices/${r.id}`}
    extraCols={{
      headers: ["Balance", "e-Way Bill"],
      render: (r) => (
        <>
          <TableCell className="py-1.5 px-3 text-right tabular">{money(r.balance_due)}</TableCell>
          <TableCell className="py-1.5 px-3 text-center">
            {r.eway_bill_number ? (
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                r.eway_bill_status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {r.eway_bill_status === 'cancelled' ? 'CANCELLED' : `EWB: ${r.eway_bill_number.slice(0, 6)}...`}
              </span>
            ) : (
              (r.grand_total || 0) >= 50000 ? (
                <span className="text-[10px] text-amber-600 font-medium bg-amber-50/60 px-1.5 py-0.5 rounded border border-amber-200/50">Req (&gt;₹50k)</span>
              ) : (
                <span className="text-[10px] text-muted-foreground">-</span>
              )
            )}
          </TableCell>
        </>
      ),
    }}
  />;
}
