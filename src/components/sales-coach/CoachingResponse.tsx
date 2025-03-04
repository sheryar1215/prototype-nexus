
import { Save, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoachingResponseProps {
  coachingResponse: string;
  isSpeaking: boolean;
  recordedAudio: Blob | null;
  onSaveRecording: () => void;
}

export function CoachingResponse({ 
  coachingResponse, 
  isSpeaking, 
  recordedAudio, 
  onSaveRecording 
}: CoachingResponseProps) {
  if (!coachingResponse && !isSpeaking) return null;
  
  return (
    <>
      {(coachingResponse || isSpeaking) && (
        <div className="mt-6 p-4 bg-background/50 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold mb-2">Coach Feedback:</h3>
              {isSpeaking && (
                <div className="flex items-center text-primary">
                  <Volume2 className="h-4 w-4 animate-pulse mr-1" />
                  <span className="text-xs">Speaking...</span>
                </div>
              )}
            </div>
            {recordedAudio && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1" 
                onClick={onSaveRecording}
              >
                <Save className="h-4 w-4" />
                <span>Save Recording</span>
              </Button>
            )}
          </div>
          <p className={isSpeaking ? "text-primary" : ""}>
            {isSpeaking && !coachingResponse 
              ? "Analyzing your sales pitch..." 
              : coachingResponse}
          </p>
        </div>
      )}
    </>
  );
}
