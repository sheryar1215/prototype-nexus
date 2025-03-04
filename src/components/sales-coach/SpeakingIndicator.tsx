
import { Volume2 } from "lucide-react";

export function SpeakingIndicator() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center">
      <div className="glass animate-pulse rounded-full p-4 mb-2">
        <Volume2 className="h-6 w-6 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Coach is speaking...</p>
    </div>
  );
}
