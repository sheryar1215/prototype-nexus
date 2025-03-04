
import { Button } from "@/components/ui/button";

interface AudioErrorMessageProps {
  errorMessage: string;
  onRetry: () => void;
}

export function AudioErrorMessage({ errorMessage, onRetry }: AudioErrorMessageProps) {
  return (
    <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
      <p className="text-sm font-medium">Audio playback error: {errorMessage}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2 bg-red-200 hover:bg-red-300 border-red-300" 
        onClick={onRetry}
      >
        Retry Speech
      </Button>
    </div>
  );
}
