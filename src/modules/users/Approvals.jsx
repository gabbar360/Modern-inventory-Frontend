import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fmtDate, money } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CheckCircle, XCircle } from "@phosphor-icons/react";

export default function Approvals() {
  const [data, setData] = useState({ quotations: [], purchase_orders: [] });
  
  const load = async () => {
    try {
      const res = await api.get("/approvals/pending");
      setData(res.data);
    } catch (e) {
      toast.error("Failed to load approvals");
    }
  };
  
  useEffect(() => { load(); }, []);

  const handleApprove = async (type, id, status) => {
    try {
      await api.post(`/approvals/document/${type}/${id}`, { status });
      toast.success(`Document ${status}`);
      load();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const totalPending = data.quotations.length + data.purchase_orders.length;

  return (
    <div className="space-y-4" data-testid="approvals-page">
      <PageHeader title="Approvals" subtitle="Pending documents requiring your authorization." />
      
      {totalPending === 0 ? <EmptyState title="No pending approvals" /> : (
        <div className="space-y-6">
          {data.quotations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Quotations</h3>
              <div className="border border-border rounded-lg bg-card overflow-hidden">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Number</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {data.quotations.map(q => (
                      <TableRow key={q.id}>
                        <TableCell className="text-xs font-mono py-2 px-3">{q.number}</TableCell>
                        <TableCell className="text-xs py-2 px-3">{q.customer_name}</TableCell>
                        <TableCell className="text-xs text-right tabular py-2 px-3">{money(q.grand_total)}</TableCell>
                        <TableCell className="py-2 px-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-emerald-600 mr-2" onClick={() => handleApprove('quotation', q.id, 'approved')}><CheckCircle size={16} className="mr-1"/> Approve</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => handleApprove('quotation', q.id, 'rejected')}><XCircle size={16} className="mr-1"/> Reject</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {data.purchase_orders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Purchase Orders</h3>
              <div className="border border-border rounded-lg bg-card overflow-hidden">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Number</TableHead>
                    <TableHead className="text-xs">Vendor</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {data.purchase_orders.map(po => (
                      <TableRow key={po.id}>
                        <TableCell className="text-xs font-mono py-2 px-3">{po.number}</TableCell>
                        <TableCell className="text-xs py-2 px-3">{po.vendor_name}</TableCell>
                        <TableCell className="text-xs text-right tabular py-2 px-3">{money(po.grand_total)}</TableCell>
                        <TableCell className="py-2 px-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-emerald-600 mr-2" onClick={() => handleApprove('purchase_order', po.id, 'approved')}><CheckCircle size={16} className="mr-1"/> Approve</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => handleApprove('purchase_order', po.id, 'rejected')}><XCircle size={16} className="mr-1"/> Reject</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
