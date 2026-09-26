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
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";

export default function Vendors() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const initialForm = {
    company_name: "",
    contact_person: "",
    mobile: "",
    email: "",
    gstin: "",
    state: "",
    address: "",
    bank_name: "",
    account_number: "",
    ifsc: "",
    payment_terms: "Net 30"
  };

  const [f, setF] = useState(initialForm);

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));

  const load = async () => {
    const { data } = await api.get("/vendors");
    setRows(data);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setF(initialForm);
    setOpen(true);
  };

  const openEdit = (v, e) => {
    if (e) e.stopPropagation();
    setEditingId(v.id);
    setF({
      company_name: v.company_name || "",
      contact_person: v.contact_person || "",
      mobile: v.mobile || "",
      email: v.email || "",
      gstin: v.gstin || "",
      state: v.state || "",
      address: v.address || "",
      bank_name: v.bank_name || "",
      account_number: v.account_number || "",
      ifsc: v.ifsc || "",
      payment_terms: v.payment_terms || "Net 30"
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!f.company_name.trim()) return toast.error("Company name is required");
    setBusy(true);
    try {
      if (editingId) {
        await api.patch(`/vendors/${editingId}`, f);
        toast.success("Vendor updated successfully");
      } else {
        await api.post("/vendors", f);
        toast.success("Vendor added successfully");
      }
      setOpen(false);
      setEditingId(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteVendor = async (v, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete vendor "${v.company_name}"?`)) return;
    try {
      await api.delete(`/vendors/${v.id}`);
      toast.success(`Vendor "${v.company_name}" deleted`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to delete vendor");
    }
  };

  return (
    <div className="space-y-4" data-testid="vendors-page">
      <PageHeader
        title="Vendors"
        subtitle="Suppliers of raw material, packaging and services."
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <Button size="sm" className="h-8" onClick={openNew} data-testid="new-vendor-btn">
              <Plus size={14} className="mr-1" />New vendor
            </Button>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{editingId ? "Edit Vendor" : "New Vendor"}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <Label htmlFor="vendors-company_name" className="text-xs">Company Name *</Label>
                  <Input name="company_name" id="vendors-company_name" value={f.company_name} onChange={upd("company_name")} placeholder="e.g. Rawpack Solutions" data-testid="vendor-company-input" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label htmlFor="vendors-contact_person" className="text-xs">Contact Person</Label><Input name="contact_person" id="vendors-contact_person" value={f.contact_person} onChange={upd("contact_person")} /></div>
                  <div><Label htmlFor="vendors-mobile" className="text-xs">Mobile</Label><Input name="mobile" id="vendors-mobile" value={f.mobile} onChange={upd("mobile")} /></div>
                </div>
                <div><Label htmlFor="vendors-email" className="text-xs">Email</Label><Input name="email" id="vendors-email" type="email" value={f.email} onChange={upd("email")} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label htmlFor="vendors-gstin" className="text-xs">GSTIN</Label><Input name="gstin" id="vendors-gstin" value={f.gstin} onChange={upd("gstin")} /></div>
                  <div><Label htmlFor="vendors-state" className="text-xs">State</Label><Input name="state" id="vendors-state" value={f.state} onChange={upd("state")} /></div>
                </div>
                <div><Label htmlFor="vendors-address" className="text-xs">Address</Label><Textarea name="address" id="vendors-address" rows={2} value={f.address} onChange={upd("address")} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label htmlFor="vendors-bank_name" className="text-xs">Bank Name</Label><Input name="bank_name" id="vendors-bank_name" value={f.bank_name} onChange={upd("bank_name")} /></div>
                  <div><Label htmlFor="vendors-account_number" className="text-xs">Account No</Label><Input name="account_number" id="vendors-account_number" value={f.account_number} onChange={upd("account_number")} /></div>
                  <div><Label htmlFor="vendors-ifsc" className="text-xs">IFSC</Label><Input name="ifsc" id="vendors-ifsc" value={f.ifsc} onChange={upd("ifsc")} /></div>
                </div>
                <div><Label htmlFor="vendors-payment_terms" className="text-xs">Payment Terms</Label><Input name="payment_terms" id="vendors-payment_terms" value={f.payment_terms} onChange={upd("payment_terms")} placeholder="Net 30" /></div>
                <Button className="w-full h-9 mt-2" onClick={submit} disabled={busy} data-testid="save-vendor-btn">
                  {busy ? "Saving…" : (editingId ? "Update Vendor" : "Create Vendor")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />
      {rows.length === 0 ? <EmptyState title="No vendors yet" /> :
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Company</TableHead>
              <TableHead className="text-xs">Contact</TableHead>
              <TableHead className="text-xs">GSTIN</TableHead>
              <TableHead className="text-xs">Bank</TableHead>
              <TableHead className="text-xs">Terms</TableHead>
              <TableHead className="text-xs text-right w-24">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="tbl-row hover:bg-muted/40" data-testid={`vendor-row-${r.id}`}>
                  <TableCell className="py-2 px-3 font-medium text-foreground">{r.company_name}</TableCell>
                  <TableCell className="py-2 px-3 text-xs text-muted-foreground">{r.contact_person}<br/>{r.mobile}</TableCell>
                  <TableCell className="py-2 px-3 font-mono text-xs">{r.gstin || "—"}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">{r.bank_name} <span className="text-muted-foreground font-mono">{r.account_number}</span></TableCell>
                  <TableCell className="py-2 px-3 text-xs">{r.payment_terms}</TableCell>
                  <TableCell className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Edit vendor"
                        onClick={(e) => openEdit(r, e)}
                        data-testid={`edit-vendor-${r.id}`}
                      >
                        <PencilSimple size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Delete vendor"
                        onClick={(e) => deleteVendor(r, e)}
                        data-testid={`delete-vendor-${r.id}`}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>}
    </div>
  );
}
