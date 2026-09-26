import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fmtDate } from "@/lib/api";
import { PageHeader, StatusPill, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, CheckCircle } from "@phosphor-icons/react";

export default function Tasks() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title:"", due_date:new Date().toISOString().slice(0,10), priority:"medium", status:"open", notes:"" });
  const upd = (k)=>(v)=>setF((s)=>({...s, [k]: v?.target ? v.target.value : v}));
  const load = async () => { const { data } = await api.get("/tasks"); setRows(data); };
  useEffect(()=>{load();}, []);
  const submit = async () => {
    if (!f.title) return toast.error("Title required");
    try { await api.post("/tasks", f); toast.success("Task added"); setOpen(false); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const done = async (t) => { await api.patch(`/tasks/${t.id}`, { status: "done" }); load(); };

  const today = new Date().toISOString().slice(0,10);
  const isOverdue = (t) => t.status !== "done" && t.due_date && t.due_date.slice(0,10) < today;
  const buckets = {
    today: rows.filter(t => t.status !== "done" && t.due_date && t.due_date.slice(0,10) === today),
    overdue: rows.filter(isOverdue),
    upcoming: rows.filter(t => t.status !== "done" && t.due_date && t.due_date.slice(0,10) > today),
    done: rows.filter(t => t.status === "done"),
  };

  const List = ({ items }) => items.length === 0 ? <EmptyState title="Nothing here" /> :
    <div className="border border-border rounded-lg bg-card">
      <Table><TableHeader><TableRow>
        <TableHead className="text-xs w-6"></TableHead><TableHead className="text-xs">Task</TableHead>
        <TableHead className="text-xs">Priority</TableHead><TableHead className="text-xs">Due</TableHead>
        <TableHead className="text-xs">Status</TableHead>
      </TableRow></TableHeader><TableBody>
      {items.map((t)=>(<TableRow key={t.id} className="tbl-row" data-testid={`task-row-${t.id}`}>
        <TableCell className="py-1.5 px-3">
          <button onClick={()=>done(t)} className="h-5 w-5 rounded-full border border-border hover:bg-emerald-100" data-testid={`task-done-${t.id}`}>
            {t.status === "done" && <CheckCircle size={16} className="text-emerald-600" />}
          </button></TableCell>
        <TableCell className="py-1.5 px-3"><span className={t.status==="done"?"line-through text-muted-foreground":""}>{t.title}</span>
          {t.notes && <p className="text-[11px] text-muted-foreground">{t.notes}</p>}</TableCell>
        <TableCell className="py-1.5 px-3"><StatusPill status={t.priority}/></TableCell>
        <TableCell className={`py-1.5 px-3 text-xs ${isOverdue(t)?"text-rose-600":"text-muted-foreground"}`}>{fmtDate(t.due_date)}</TableCell>
        <TableCell className="py-1.5 px-3"><StatusPill status={t.status}/></TableCell>
      </TableRow>))}
      </TableBody></Table>
    </div>;

  return (
    <div className="space-y-4" data-testid="tasks-page">
      <PageHeader title="Tasks" subtitle="Follow-ups and to-dos across leads, orders and customers." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-task-btn"><Plus size={14} className="mr-1"/>New task</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>New task</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div><Label htmlFor="tasks-title" className="text-xs">Title</Label><Input name="title" id="tasks-title" value={f.title} onChange={upd("title")} data-testid="task-title-input" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="tasks-due_date" className="text-xs">Due date</Label><Input name="due_date" id="tasks-due_date" type="date" value={f.due_date} onChange={upd("due_date")} /></div>
                <div><Label htmlFor="tasks-notes" className="text-xs">Priority</Label>
                  <Select value={f.priority} onValueChange={upd("priority")}>
                    <SelectTrigger name="notes" id="tasks-notes"><SelectValue /></SelectTrigger>
                    <SelectContent>{["low","medium","high"].map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select></div>
              </div>
              <div><Label htmlFor="tasks-notes" className="text-xs">Notes</Label><Textarea name="notes" id="tasks-notes" rows={2} value={f.notes} onChange={upd("notes")} /></div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-task-btn">Save</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today" data-testid="task-tab-today">Today <span className="ml-1 text-[10px] text-muted-foreground">{buckets.today.length}</span></TabsTrigger>
          <TabsTrigger value="overdue" data-testid="task-tab-overdue">Overdue <span className="ml-1 text-[10px] text-rose-600">{buckets.overdue.length}</span></TabsTrigger>
          <TabsTrigger value="upcoming" data-testid="task-tab-upcoming">Upcoming <span className="ml-1 text-[10px] text-muted-foreground">{buckets.upcoming.length}</span></TabsTrigger>
          <TabsTrigger value="done" data-testid="task-tab-done">Done <span className="ml-1 text-[10px] text-muted-foreground">{buckets.done.length}</span></TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4"><List items={buckets.today}/></TabsContent>
        <TabsContent value="overdue" className="mt-4"><List items={buckets.overdue}/></TabsContent>
        <TabsContent value="upcoming" className="mt-4"><List items={buckets.upcoming}/></TabsContent>
        <TabsContent value="done" className="mt-4"><List items={buckets.done}/></TabsContent>
      </Tabs>
    </div>
  );
}
