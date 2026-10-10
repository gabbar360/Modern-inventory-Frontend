import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fmtDate, money } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export default function Accounting() {
  const [journals, setJournals] = useState([]);
  
  const load = async () => {
    try {
      const res = await api.get("/journal-entries");
      setJournals(Array.isArray(res.data) ? res.data : []);
    } catch(e) {}
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4" data-testid="accounting-page">
      <PageHeader title="Accounting & Ledger" subtitle="Double-entry journal records (auto-generated)." />
      
      {(!journals || journals.length === 0) ? <EmptyState title="No journal entries yet" /> : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Reference</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Account</TableHead>
                <TableHead className="text-xs text-right">Debit</TableHead>
                <TableHead className="text-xs text-right">Credit</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(journals || []).flatMap((j, i) => 
                  (j.lines || []).map((l, li) => (
                    <TableRow key={`${j.id}-${li}`} className={li === j.lines.length - 1 ? "border-b-2 border-border" : "border-b-0"}>
                      <TableCell className="py-2 px-3 text-xs">{li === 0 ? fmtDate(j.date) : ''}</TableCell>
                      <TableCell className="py-2 px-3 text-xs capitalize">{li === 0 ? j.reference_type : ''}</TableCell>
                      <TableCell className="py-2 px-3 text-xs">{li === 0 ? j.description : ''}</TableCell>
                      <TableCell className="py-2 px-3 text-xs font-medium">{l.account_id}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-right tabular">{l.debit > 0 ? money(l.debit) : ''}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-right tabular">{l.credit > 0 ? money(l.credit) : ''}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
