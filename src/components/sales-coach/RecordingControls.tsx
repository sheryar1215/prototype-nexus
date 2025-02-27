
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PlayCircle } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  apiKeyValid: boolean;
  onToggleRecording: () => void;
}

export const RecordingControls = ({
  isRecording,
  isConnecting,
  isSpeaking,
  apiKeyValid,
  onToggleRecording,
}: RecordingControlsProps) => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-4">
      <Button
        size="lg"
        className={isRecording ? "bg-destructive hover:bg-destructive/90" : ""}
        onClick={onToggleRecording}
        disabled={!apiKeyValid || isConnecting}
      >
        {isRecording ? (
          <>
            <MicOff className="mr-2" />
            Stop Practice
          </>
        ) : (
          <>
            <Mic className="mr-2" />
            {isConnecting ? "Connecting..." : "Start Practice"}
          </>
        )}
      </Button>

      {isSpeaking && (
        <div className="mt-6 flex items-center justify-center">
          <div className="glass animate-pulse rounded-full p-4">
            <PlayCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
};
