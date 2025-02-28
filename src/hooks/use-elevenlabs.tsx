
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  initializeElevenLabs, 
  getElevenLabsUrl, 
  ELEVENLABS_MODEL_ID, 
  ELEVENLABS_VOICE_ID 
} from "@/lib/elevenlabs";

export function useElevenLabs() {
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(ELEVENLABS_VOICE_ID);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if API key is valid on mount
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      await initializeElevenLabs();
      setApiKeyValid(true);
    } catch (error: any) {
      console.error("API Key validation failed:", error);
      setApiKeyValid(false);
      toast({
        variant: "destructive",
        title: "API Key Error",
        description: error.message || "Please add a valid ElevenLabs API key in Settings",
      });
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
  };

  return {
    apiKeyValid,
    checkApiKey,
    getVoiceUrl: getElevenLabsUrl,
    modelId: ELEVENLABS_MODEL_ID,
    voiceId: selectedVoiceId,
    setVoiceId: handleVoiceChange
  };
}
