import { useEffect, useState } from "react";
import { api, fmtDate } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function AuditLog() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get("/audit-logs")
      .then((r) => setRows(r.data || []))
      .catch((err) => console.warn("Failed to load audit logs:", err.message));
  }, []);
  return (
    <div className="space-y-4" data-testid="audit-page">
      <PageHeader title="Audit Log" subtitle="Every important action, who did it and when." />
      {rows.length === 0 ? <EmptyState title="No audit events yet" hint="Actions like updates and approvals appear here." /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">When</TableHead><TableHead className="text-xs">User</TableHead>
            <TableHead className="text-xs">Module</TableHead><TableHead className="text-xs">Action</TableHead>
            <TableHead className="text-xs">Record</TableHead>
          </TableRow></TableHeader><TableBody>
          {rows.map((a)=>(<TableRow key={a.id} className="tbl-row">
            <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(a.created_at)}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs">{a.user_name}<div className="text-[10px] text-muted-foreground">{a.user_email}</div></TableCell>
            <TableCell className="py-1.5 px-3 text-xs capitalize">{a.module}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs">{a.action}</TableCell>
            <TableCell className="py-1.5 px-3 font-mono text-[11px]">{a.record_id?.slice(0,8) || "—"}</TableCell>
          </TableRow>))}
          </TableBody></Table>
        </div>}
    </div>
  );
}
