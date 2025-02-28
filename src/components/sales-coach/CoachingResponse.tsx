
import { Volume2 } from "lucide-react";

interface CoachingResponseProps {
  coachingResponse: string;
  isSpeaking: boolean;
}

export function CoachingResponse({ coachingResponse, isSpeaking }: CoachingResponseProps) {
  if (!coachingResponse && !isSpeaking) return null;
  
  return (
    <>
      {isSpeaking && (
        <div className="mt-6 flex items-center justify-center">
          <div className="glass animate-pulse rounded-full p-4">
            <Volume2 className="h-6 w-6 text-primary" />
          </div>
        </div>
      )}
      
      {coachingResponse && (
        <div className="mt-6 p-4 bg-background/50 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Coach Feedback:</h3>
          <p>{coachingResponse}</p>
        </div>
      )}
    </>
  );
}
