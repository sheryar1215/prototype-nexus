
import { Button } from "@/components/ui/button";

interface AudioErrorMessageProps {
  errorMessage: string;
  onRetry: () => void;
}

export function AudioErrorMessage({ errorMessage, onRetry }: AudioErrorMessageProps) {
  // Format error message for better readability
  const formattedErrorMessage = errorMessage === "detected_unusual_activity" 
    ? "ElevenLabs detected unusual activity with your API key. Please try again or check your account."
    : errorMessage;
    
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
      <p className="text-sm font-medium">Audio playback error: {formattedErrorMessage}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2 bg-red-100 hover:bg-red-200 border-red-300 text-red-800" 
        onClick={onRetry}
      >
        Retry Speech
      </Button>
    </div>
  );
}
