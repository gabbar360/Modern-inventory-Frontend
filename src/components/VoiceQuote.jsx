import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Microphone, MicrophoneSlash, Sparkle } from "@phosphor-icons/react";

export default function VoiceQuoteButton({ onParsed }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);
  const recRef = useRef(null);

  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = () => {
    if (!SR) return toast.error("Voice recognition not supported in this browser (try Chrome/Edge)");
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-IN";
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + " ";
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => { setListening(false); toast.error(`Voice error: ${e.error}`); };
    recRef.current = rec; rec.start(); setListening(true);
  };
  const stop = () => { recRef.current?.stop(); setListening(false); };

  const parse = async () => {
    if (!transcript.trim()) return toast.error("Nothing to parse — dictate first");
    setBusy(true);
    try {
      const { data } = await api.post("/ai/parse-order", { transcript });
      if (!data.items.length) toast.error("Couldn't match products. Try again or edit manually.");
      else toast.success(`Parsed ${data.items.length} line items${data.customer_name ? ` for ${data.customer_name}` : ""}`);
      onParsed?.(data);
      setOpen(false); setTranscript("");
    } catch (e) { toast.error(e?.response?.data?.detail || "AI failed"); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v && listening) stop(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8" data-testid="voice-quote-btn"><Sparkle size={14} className="mr-1" weight="fill"/>Voice quote</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Microphone size={16}/>Dictate a quotation</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Say something like: <em>"Quote for Green Cafe: five thousand 7 inch plates and two thousand bagasse bowls"</em>
          </p>
          <div className="flex items-center gap-2">
            {!listening
              ? <Button size="sm" onClick={start} data-testid="voice-start-btn"><Microphone size={14} className="mr-1"/>Start listening</Button>
              : <Button size="sm" variant="destructive" onClick={stop} data-testid="voice-stop-btn"><MicrophoneSlash size={14} className="mr-1"/>Stop</Button>}
            {listening && <span className="text-xs text-rose-600 animate-pulse">● Recording…</span>}
          </div>
          <Textarea name="transcript" id="voicequote-transcript" rows={5} value={transcript} onChange={(e)=>setTranscript(e.target.value)}
            placeholder="Your dictation will appear here — or type it in." data-testid="voice-transcript" />
          <Button className="w-full h-9" onClick={parse} disabled={busy || !transcript.trim()} data-testid="voice-parse-btn">
            {busy ? "AI parsing…" : "Parse to draft quotation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
