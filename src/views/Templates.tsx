import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fmtDate } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus } from "@phosphor-icons/react";

export default function Templates() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ document_type: "invoice", header: "", footer: "", html_content: "" });
  
  const upd = (k) => (e) => setF((s)=>({...s, [k]: e.target.value}));
  
  const load = async () => { const { data } = await api.get("/templates"); setRows(data); };
  useEffect(() => { load(); }, []);
  
  const submit = async () => {
    try { await api.post("/templates", f); toast.success("Template created"); setOpen(false); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <div className="space-y-4" data-testid="templates-page">
      <PageHeader title="Document Templates" subtitle="Customize the layout of your generated PDFs." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8"><Plus size={14} className="mr-1"/>New Template</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader><SheetTitle>New Template</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div><Label htmlFor="templates-document_type" className="text-xs">Document Type</Label>
                <select name="document_type" id="templates-document_type" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={f.document_type} onChange={upd("document_type")}>
                  <option value="invoice">Invoice</option>
                  <option value="quotation">Quotation</option>
                  <option value="purchase_order">Purchase Order</option>
                </select>
              </div>
              <div><Label htmlFor="templates-header" className="text-xs">Header HTML</Label><Textarea name="header" id="templates-header" rows={3} value={f.header} onChange={upd("header")} /></div>
              <div><Label htmlFor="templates-html_content" className="text-xs">Body HTML Layout</Label><Textarea name="html_content" id="templates-html_content" rows={6} value={f.html_content} onChange={upd("html_content")} placeholder="Use {{customer_name}} etc." /></div>
              <div><Label htmlFor="templates-footer" className="text-xs">Footer HTML</Label><Textarea name="footer" id="templates-footer" rows={3} value={f.footer} onChange={upd("footer")} /></div>
              <Button className="w-full h-9" onClick={submit}>Save Template</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      {rows.length === 0 ? <EmptyState title="No templates" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Document Type</TableHead>
              <TableHead className="text-xs">Created At</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="py-2 px-3 text-sm capitalize">{(r.document_type || r.type || "template").replace('_', ' ')}</TableCell>
                  <TableCell className="py-2 px-3 text-sm text-muted-foreground">{fmtDate(r.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>}
    </div>
  );
}
