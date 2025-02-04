import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { chatGPTService } from "@/services/servicesChatgpt";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SpeechToTextModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gptResponse, setGptResponse] = useState<string>("");
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome."
      );
      return;
    }

    recognitionRef.current = new (window as any).webkitSpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");
      setText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await chatGPTService.getGPTResponse(text);
      setGptResponse(response);
      toast({
        title: "Sprachanalyse abgeschlossen",
        description: "Die KI hat Ihre Eingabe verarbeitet.",
      });
    } catch (error) {
      console.error("Fehler beim Senden:", error);
      toast({
        title: "Fehler",
        description: "Die Verarbeitung konnte nicht abgeschlossen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Speech to Text</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <Label>Ihre Spracheingabe</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ihre Sprache wird hier erscheinen..."
                className="min-h-[100px]"
              />
            </div>

            {gptResponse && (
              <div>
                <Label>KI-Antwort</Label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="text-sm">{gptResponse}</div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              onClick={isListening ? stopListening : startListening}
              className="w-full"
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Aufnahme stoppen
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Aufnahme starten
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={isLoading || !text}
              className="w-full"
            >
              {isLoading ? "Wird verarbeitet..." : "Analysieren"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
