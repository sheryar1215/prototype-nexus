
import { Volume2 } from "lucide-react";

export function SpeakingIndicator() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute animate-ping rounded-full bg-primary/30 h-12 w-12"></div>
        <div className="glass rounded-full p-4 mb-2 z-10 bg-primary/10">
          <Volume2 className="h-6 w-6 text-primary" />
        </div>
      </div>
      <p className="text-sm font-medium text-primary mt-2">Coach is speaking...</p>
    </div>
  );
}
