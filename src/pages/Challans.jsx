import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fmtDate } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FilePdf, Truck } from "@phosphor-icons/react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function Challans() {
  const [rows, setRows] = useState([]);
  const load = async () => { const { data } = await api.get("/challans"); setRows(data); };
  useEffect(()=>{load();}, []);
  const genEway = async (id) => {
    try { const { data } = await api.post(`/challans/${id}/generate-eway-bill`);
      toast.success(`E-Way Bill ${data.ewb_no} · valid until ${fmtDate(data.valid_until)}`); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  return (
    <div className="space-y-4" data-testid="challans-page">
      <PageHeader title="Delivery Challans" subtitle="Goods dispatched with LR / e-way bill and auto stock reduction." />
      {rows.length === 0 ? <EmptyState title="No challans yet" hint="Create a challan from any dispatch card." /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">Challan #</TableHead><TableHead className="text-xs">Customer</TableHead>
            <TableHead className="text-xs">SO #</TableHead><TableHead className="text-xs">Vehicle</TableHead>
            <TableHead className="text-xs">E-Way Bill</TableHead>
            <TableHead className="text-xs">Date</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>{rows.map((r)=>(<TableRow key={r.id} className="tbl-row" data-testid={`challan-row-${r.id}`}>
            <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
            <TableCell className="py-1.5 px-3">{r.customer_name}</TableCell>
            <TableCell className="py-1.5 px-3 font-mono text-xs">{r.sales_order_number}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs">{r.vehicle || "—"} {r.transporter && `· ${r.transporter}`}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs">
              {r.eway_bill
                ? <span className="font-mono">{r.eway_bill}<div className="text-[10px] text-muted-foreground">Valid {fmtDate(r.eway_valid_until)}</div></span>
                : <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={()=>genEway(r.id)} data-testid={`gen-eway-${r.id}`}><Truck size={12} className="mr-1"/>Generate</Button>}
            </TableCell>
            <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.challan_date)}</TableCell>
            <TableCell className="py-1.5 px-3">
              <Button variant="ghost" size="sm" className="h-7" asChild>
                <a href={`${BACKEND}/api/challans/${r.id}/pdf`} target="_blank" rel="noreferrer"><FilePdf size={12} className="mr-1"/>PDF</a>
              </Button>
            </TableCell>
          </TableRow>))}</TableBody></Table>
        </div>}
    </div>
  );
}
