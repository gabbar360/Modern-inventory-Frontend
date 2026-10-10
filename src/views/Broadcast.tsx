import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PaperPlaneTilt, WhatsappLogo, Users } from "@phosphor-icons/react";

export default function Broadcast() {
  const [f, setF] = useState({ audience: "customers", message: "Hello {name}, we have new pricing effective 1 April. Reply here for details.", filter_state: "", filter_stage: "" });
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const upd = (k) => (v) => setF((s) => ({ ...s, [k]: v?.target ? v.target.value : v }));
  const loadHistory = async () => { const { data } = await api.get("/broadcasts"); setHistory(data); };
  useEffect(() => { loadHistory(); }, []);

  const doPreview = async () => {
    try { const { data } = await api.post("/broadcast/preview", f); setPreview(data); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const doSend = async () => {
    if (!f.message.trim()) return toast.error("Message required");
    if (!preview) { await doPreview(); return; }
    if (!window.confirm(`Send WhatsApp to ${preview.count} recipients?`)) return;
    setBusy(true);
    try { const { data } = await api.post("/broadcast/send", f);
      toast.success(`Sent to ${data.sent} · ${data.failed} failed`); setPreview(null); loadHistory(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4" data-testid="broadcast-page">
      <PageHeader title="WhatsApp Broadcast" subtitle="Send a filtered message to customers or leads in one tap. Requires WhatsApp API configured in Settings." />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><Label htmlFor="broadcast-filter_state" className="text-xs">Audience</Label>
              <Select value={f.audience} onValueChange={upd("audience")}>
                <SelectTrigger name="filter_state" id="broadcast-filter_state" data-testid="broadcast-audience-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                </SelectContent>
              </Select></div>
            <div><Label htmlFor="broadcast-filter_state" className="text-xs">Filter by state (optional)</Label>
              <Input name="filter_state" id="broadcast-filter_state" value={f.filter_state} onChange={upd("filter_state")} placeholder="e.g. Maharashtra" data-testid="broadcast-state-input" /></div>
          </div>
          {f.audience === "leads" && (
            <div><Label htmlFor="broadcast-filter_stage" className="text-xs">Filter by stage (optional)</Label>
              <Input name="filter_stage" id="broadcast-filter_stage" value={f.filter_stage} onChange={upd("filter_stage")} placeholder="e.g. qualified" /></div>
          )}
          <div><Label htmlFor="broadcast-message" className="text-xs">Message · Use {"{name}"} to personalize</Label>
            <Textarea name="message" id="broadcast-message" rows={5} value={f.message} onChange={upd("message")} data-testid="broadcast-message" /></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={doPreview} data-testid="broadcast-preview-btn"><Users size={14} className="mr-1"/>Preview audience</Button>
            <Button size="sm" className="h-9" onClick={doSend} disabled={busy} data-testid="broadcast-send-btn"><PaperPlaneTilt size={14} className="mr-1"/>{busy?"Sending…":"Send blast"}</Button>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Audience preview</p>
          {!preview ? <p className="text-sm text-muted-foreground">Click "Preview audience" to see who will receive this message.</p> :
            <>
              <p className="text-xl font-display font-semibold tabular">{preview.count} recipients</p>
              <p className="text-xs text-muted-foreground mb-3">Out of {preview.total_matched} matched · {preview.total_matched - preview.count} without mobile</p>
              <div className="max-h-64 overflow-y-auto text-xs space-y-1">
                {preview.recipients.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border-b border-border/40 py-1">
                    <span>{r.name}</span><span className="font-mono text-muted-foreground">{r.mobile}</span>
                  </div>
                ))}
                {preview.count > 20 && <p className="text-[11px] text-muted-foreground pt-2">+ {preview.count - 20} more</p>}
              </div>
            </>}
        </CardContent></Card>
      </div>

      {history.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Broadcast history</p>
          <div className="border border-border rounded-lg bg-card">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Audience</TableHead>
              <TableHead className="text-xs">Message</TableHead>
              <TableHead className="text-xs text-right">Sent</TableHead><TableHead className="text-xs text-right">Failed</TableHead>
            </TableRow></TableHeader><TableBody>
              {history.map((b) => (
                <TableRow key={b.id} className="tbl-row">
                  <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(b.created_at)}</TableCell>
                  <TableCell className="py-1.5 px-3 text-xs capitalize">{b.audience}</TableCell>
                  <TableCell className="py-1.5 px-3 text-xs max-w-md truncate">{b.message}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-emerald-600">{b.sent}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-rose-600">{b.failed || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        </div>
      )}
    </div>
  );
}
