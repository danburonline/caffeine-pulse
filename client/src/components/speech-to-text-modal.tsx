import { useState, useCallback } from "react";
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

export function SpeechToTextModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map(result => result.transcript)
        .join('');
      setText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.stop();
    setIsListening(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Speech to Text</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your speech will appear here..."
            className="h-24"
          />
          <div className="flex justify-center">
            <Button
              variant={isListening ? "destructive" : "default"}
              onClick={isListening ? stopListening : startListening}
              className="w-full"
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Listening
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
