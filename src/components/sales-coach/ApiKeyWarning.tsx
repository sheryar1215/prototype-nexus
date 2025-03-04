
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiKeyWarningProps {
  apiKeyValid: boolean;
  onSettingsClick?: () => void;
}

export function ApiKeyWarning({ apiKeyValid, onSettingsClick }: ApiKeyWarningProps) {
  if (apiKeyValid) return null;
  
  return (
    <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md flex items-start gap-2">
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium">
          ElevenLabs API key is required for voice coaching
        </p>
        <p className="text-sm mt-1">
          Please add your API key in the Settings page to enable the voice feedback feature. 
          Without a valid API key, you won't be able to receive verbal coaching feedback.
        </p>
        {onSettingsClick && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 bg-yellow-200 hover:bg-yellow-300 border-yellow-300" 
            onClick={onSettingsClick}
          >
            Go to Settings
          </Button>
        )}
      </div>
    </div>
  );
}
