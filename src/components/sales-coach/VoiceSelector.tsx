
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Voice {
  id: string;
  name: string;
}

const DEFAULT_VOICES: Voice[] = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Default)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam" },
];

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
}

export function VoiceSelector({ 
  selectedVoiceId, 
  onVoiceChange, 
  disabled = false 
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>(DEFAULT_VOICES);
  const selectedVoice = voices.find(voice => voice.id === selectedVoiceId) || voices[0];

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium">Coach Voice</label>
      <DropdownMenu>
        <DropdownMenuTrigger 
          disabled={disabled} 
          className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
        >
          <span>{selectedVoice.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {voices.map((voice) => (
            <DropdownMenuItem
              key={voice.id}
              className="cursor-pointer"
              onClick={() => onVoiceChange(voice.id)}
            >
              {voice.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
