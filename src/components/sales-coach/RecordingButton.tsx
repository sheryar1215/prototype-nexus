
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff } from "lucide-react";

interface RecordingButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  apiKeyValid: boolean;
  onToggleRecording: () => void;
}

export function RecordingButton({ 
  isRecording, 
  isProcessing, 
  isSpeaking, 
  apiKeyValid, 
  onToggleRecording 
}: RecordingButtonProps) {
  return (
    <div className="mt-6 flex justify-center">
      <Button
        size="lg"
        onClick={onToggleRecording}
        disabled={!apiKeyValid || isProcessing || isSpeaking}
        className={isRecording ? "bg-destructive hover:bg-destructive/90" : ""}
      >
        {isRecording ? (
          <>
            <MicOff className="mr-2" />
            Stop Recording
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Mic className="mr-2" />
            Start Speaking
          </>
        )}
      </Button>
    </div>
  );
}
