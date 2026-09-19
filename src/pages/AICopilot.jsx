import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkle, PaperPlaneTilt, Copy } from "@phosphor-icons/react";

const KINDS = [
  { id: "chat", label: "Ask anything", placeholder: "e.g. Summarise this month's sales performance" },
  { id: "draft_quote", label: "Draft quotation", placeholder: "Draft a quote for Green Cafe, 5000 units of 7 Inch Plate at ₹5.5" },
  { id: "followup", label: "WhatsApp follow-up", placeholder: "Follow-up with Priya about pending payment of ₹1L" },
  { id: "monthly_report", label: "Monthly report", placeholder: "Give me the executive monthly summary" },
];

export default function AICopilot() {
  const [kind, setKind] = useState("chat");
  const [prompt, setPrompt] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/ai/history")
      .then(r => setMsgs(r.data.reverse().flatMap(m => [
        { role: "user", text: m.prompt, ts: m.created_at, kind: m.kind },
        { role: "assistant", text: m.response, ts: m.created_at, kind: m.kind },
      ])))
      .catch(err => console.warn("Failed to load AI history:", err.message));
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!prompt.trim()) return;
    const p = prompt; setPrompt(""); setBusy(true);
    setMsgs(m => [...m, { role: "user", text: p, ts: new Date().toISOString(), kind }]);
    try {
      const { data } = await api.post("/ai/chat", { prompt: p, kind });
      setMsgs(m => [...m, { role: "assistant", text: data.response, ts: new Date().toISOString(), kind }]);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "AI failed");
    } finally { setBusy(false); }
  };
  const copy = (t) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <div className="space-y-4" data-testid="ai-copilot-page">
      <PageHeader title={<><Sparkle size={18} className="inline mb-0.5 mr-1.5" weight="fill" />Sales Copilot</>} subtitle="Draft quotations, follow-ups and reports with your business context." />
      <Tabs value={kind} onValueChange={setKind}>
        <TabsList>
          {KINDS.map(k => <TabsTrigger key={k.id} value={k.id} data-testid={`ai-kind-${k.id}`}>{k.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <Card className="min-h-[420px] flex flex-col">
        <CardContent className="flex-1 p-5 overflow-y-auto max-h-[520px] space-y-4">
          {msgs.length === 0 && (
            <div className="text-center py-16">
              <Sparkle size={32} className="mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Ask anything about your business or draft a message.</p>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-foreground text-background" : "bg-muted"}`} data-testid={`msg-${m.role}-${i}`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.role === "assistant" && (
                  <button onClick={() => copy(m.text)} className="text-[10px] opacity-60 hover:opacity-100 mt-1.5 inline-flex items-center gap-1"><Copy size={10}/>Copy</button>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>
        <div className="border-t border-border p-3 flex items-end gap-2">
          <Textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={KINDS.find(k => k.id === kind)?.placeholder}
            className="text-sm min-h-[44px]" data-testid="ai-prompt-input" />
          <Button onClick={send} disabled={busy || !prompt.trim()} className="h-11" data-testid="ai-send-btn">
            {busy ? "…" : <><PaperPlaneTilt size={16} weight="fill"/></>}
          </Button>
        </div>
      </Card>
    </div>
  );
}
